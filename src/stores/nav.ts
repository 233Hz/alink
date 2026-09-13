import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { supabase } from '../lib/supabase';
import type { Category, Website, CategoryFormData, WebsiteFormData } from '../types';
import { useAuthStore } from './auth';
import {
  readNavCache,
  writeNavCache,
  clearNavCache,
  readActiveCategoryId,
  writeActiveCategoryId,
} from '../lib/persistence';

export const useNavStore = defineStore('nav', () => {
  const categories = ref<Category[]>([]);
  const websites = ref<Website[]>([]);
  const activeCategoryId = ref<string>(readActiveCategoryId() || 'ALL');
  const searchQuery = ref<string>('');
  // 初始即为 true：应用刚启动、尚未拿到任何数据（缓存或网络），
  // 避免首帧误判为「没有内容」而闪现空状态。
  const loading = ref<boolean>(true);
  const error = ref<string | null>(null);

  // --- 本地缓存相关状态 ---
  /** 内存中的数据是否来自/已写入本地缓存（即首屏无需等待网络） */
  const hydratedFromCache = ref<boolean>(false);
  /** 缓存归属的用户 ID，用于多账号切换时判定是否串号 */
  const cachedUserId = ref<string | null>(null);
  /** 最近一次成功同步时间戳 */
  const lastSyncedAt = ref<number | null>(null);
  /** 后台静默校验中（不影响界面交互） */
  const isRevalidating = ref<boolean>(false);

  const authStore = useAuthStore();

  // Sort categories by order_index ascending
  const sortedCategories = computed(() => {
    return [...categories.value].sort((a, b) => a.order_index - b.order_index);
  });

  // Sort websites by order_index ascending
  const sortedWebsites = computed(() => {
    return [...websites.value].sort((a, b) => a.order_index - b.order_index);
  });

  // Calculate website counts per category
  const categoriesWithCounts = computed(() => {
    return sortedCategories.value.map(cat => {
      const count = websites.value.filter(w => w.category_id === cat.id).length;
      return {
        ...cat,
        website_count: count,
      };
    });
  });

  const uncategorizedCount = computed(() => {
    return websites.value.filter(w => !w.category_id).length;
  });

  const totalWebsitesCount = computed(() => websites.value.length);

  /** 是否已有可渲染的内容（无论来自缓存还是网络），用于决定是否展示首屏骨架 */
  const hasContent = computed(() => categories.value.length > 0 || websites.value.length > 0);

  // 记住用户最后停留的分类，下次打开直接恢复
  watch(activeCategoryId, (id) => {
    writeActiveCategoryId(id);
  });

  // Filtered websites based on activeCategory and searchQuery
  const filteredWebsites = computed(() => {
    let list = sortedWebsites.value;

    // Filter by category
    if (activeCategoryId.value === 'UNCATEGORIZED') {
      list = list.filter(w => !w.category_id);
    } else if (activeCategoryId.value !== 'ALL') {
      list = list.filter(w => w.category_id === activeCategoryId.value);
    }

    // Filter by search query
    const q = searchQuery.value.trim().toLowerCase();
    if (q) {
      list = list.filter(w => {
        const titleMatch = w.title.toLowerCase().includes(q);
        const urlMatch = w.url.toLowerCase().includes(q);
        const descMatch = (w.description || '').toLowerCase().includes(q);
        return titleMatch || urlMatch || descMatch;
      });
    }

    return list;
  });

  // Grouped websites for the "ALL" view when not searching
  const groupedCategoriesWithWebsites = computed(() => {
    if (searchQuery.value.trim() || activeCategoryId.value !== 'ALL') {
      return [];
    }

    const groups: { category: Category | null; websites: Website[] }[] = [];

    sortedCategories.value.forEach(cat => {
      const sites = sortedWebsites.value.filter(w => w.category_id === cat.id);
      groups.push({ category: cat, websites: sites });
    });

    // Add uncategorized if any exist
    const uncategorized = sortedWebsites.value.filter(w => !w.category_id);
    if (uncategorized.length > 0) {
      groups.push({
        category: {
          id: 'UNCATEGORIZED',
          user_id: '',
          name: '未分类',
          icon: 'Bookmark',
          order_index: 9999,
          created_at: '',
          updated_at: '',
        },
        websites: uncategorized,
      });
    }

    return groups;
  });

  /** 判定错误是否源于会话失效 / RLS 拒绝 */
  function isSessionError(err: any): boolean {
    return (
      err?.message?.includes('violates row-level security') ||
      err?.code === '42501' ||
      err?.status === 401 ||
      err?.statusCode === '401'
    );
  }

  function handleDbError(err: any): never {
    console.error('Database operation failed:', err);
    if (isSessionError(err)) {
      throw new Error('登录凭证已失效或未生效，请重新登录后再试');
    }
    throw err;
  }

  const LEGACY_GUEST_KEYS = ['alink_guest_categories', 'alink_guest_websites'];

  function dropLegacyGuestStorage() {
    try {
      LEGACY_GUEST_KEYS.forEach((key) => localStorage.removeItem(key));
    } catch {
      /* 忽略 */
    }
  }

  /** 缓存里记着的分类可能已被删除，避免恢复出一个空白页面 */
  function reconcileActiveCategory() {
    const id = activeCategoryId.value;
    if (id === 'ALL' || id === 'UNCATEGORIZED') return;
    if (!categories.value.some((c) => c.id === id)) {
      activeCategoryId.value = 'ALL';
    }
  }

  /**
   * 用本地缓存同步填充内存数据 —— 同步执行、零网络、零等待。
   * 返回是否成功恢复了可用内容。
   */
  function hydrateFromCache(): boolean {
    dropLegacyGuestStorage();
    if (hydratedFromCache.value) return hasContent.value;

    const cached = readNavCache();
    if (!cached) return false;

    categories.value = cached.categories;
    websites.value = cached.websites;
    cachedUserId.value = cached.userId;
    lastSyncedAt.value = cached.updatedAt || null;
    hydratedFromCache.value = true;
    reconcileActiveCategory();
    return hasContent.value;
  }

  /** 把当前内存数据落盘，供下次冷启动秒开 */
  function persistCache() {
    const userId = authStore.user?.id;
    if (!userId) return;
    if (writeNavCache(userId, categories.value, websites.value)) {
      cachedUserId.value = userId;
      lastSyncedAt.value = Date.now();
    }
  }

  /** 登出 / 切换账号时彻底清空，防止上一个账号的数据残留 */
  function resetNavState() {
    categories.value = [];
    websites.value = [];
    hydratedFromCache.value = false;
    cachedUserId.value = null;
    lastSyncedAt.value = null;
    clearNavCache();
  }

  let inflightFetch: Promise<void> | null = null;

  /**
   * 拉取数据：先同步命中缓存让界面立即可用，再在后台静默重新校验。
   * 并发调用会自动复用同一个进行中的请求。
   */
  async function fetchData(): Promise<void> {
    // 1) 首屏：本地缓存直接渲染，不等网络
    hydrateFromCache();

    // 2) 已有请求在飞行中则复用，避免重复拉取
    if (inflightFetch) return inflightFetch;

    inflightFetch = (async () => {
      // 只有「完全没东西可展示」时才让用户看到加载态
      loading.value = !hasContent.value;
      isRevalidating.value = true;
      error.value = null;

      try {
        if (authStore.user && !authStore.session) {
          await authStore.ensureSession();
        }

        if (!authStore.isAuthenticated || !authStore.user) {
          resetNavState();
          return;
        }

        // 缓存属于其他账号：先丢弃，避免短暂串号展示
        if (cachedUserId.value && cachedUserId.value !== authStore.user.id) {
          categories.value = [];
          websites.value = [];
        }

        // 两张表并行拉取，缩短网络往返
        const [catRes, webRes] = await Promise.all([
          supabase.from('categories').select('*').order('order_index', { ascending: true }),
          supabase.from('websites').select('*').order('order_index', { ascending: true }),
        ]);

        if (catRes.error) throw catRes.error;
        if (webRes.error) throw webRes.error;

        categories.value = catRes.data || [];
        websites.value = webRes.data || [];
        reconcileActiveCategory();

        hydratedFromCache.value = true;
        persistCache();
      } catch (err: any) {
        console.error('Error fetching navigation data:', err);
        // 网络失败时保留缓存数据继续可用，仅以横幅提示同步失败
        error.value = isSessionError(err) ? '登录凭证已失效，请重新登录' : err?.message || '获取数据失败';
      } finally {
        loading.value = false;
        isRevalidating.value = false;
        inflightFetch = null;
      }
    })();

    return inflightFetch;
  }

  // --- Category Actions ---
  async function createCategory(data: CategoryFormData) {
    if (authStore.user && !authStore.session) {
      await authStore.ensureSession();
    }

    if (!authStore.isAuthenticated || !authStore.user) {
      throw new Error('请先登录后再进行此操作');
    }

    const maxOrder = categories.value.reduce((max, c) => Math.max(max, c.order_index), -1);
    const order_index = data.order_index ?? (maxOrder + 1);

    const { data: newCat, error: err } = await supabase
      .from('categories')
      .insert({
        user_id: authStore.user.id,
        name: data.name.trim(),
        icon: data.icon || 'Folder',
        order_index,
      })
      .select()
      .single();

    if (err) handleDbError(err);
    if (newCat) {
      categories.value.push(newCat);
      persistCache();
    }
    return newCat;
  }

  async function updateCategory(id: string, data: Partial<CategoryFormData>) {
    if (authStore.user && !authStore.session) {
      await authStore.ensureSession();
    }

    if (!authStore.isAuthenticated || !authStore.user) {
      throw new Error('请先登录后再进行此操作');
    }

    const updatePayload: any = {};
    if (data.name !== undefined) updatePayload.name = data.name.trim();
    if (data.icon !== undefined) updatePayload.icon = data.icon;
    if (data.order_index !== undefined) updatePayload.order_index = data.order_index;

    const { data: updated, error: err } = await supabase
      .from('categories')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (err) handleDbError(err);
    const idx = categories.value.findIndex(c => c.id === id);
    if (idx !== -1 && updated) {
      categories.value[idx] = updated;
      persistCache();
    }
    return updated;
  }

  async function deleteCategory(id: string, deleteWebsites: boolean) {
    if (authStore.user && !authStore.session) {
      await authStore.ensureSession();
    }

    if (!authStore.isAuthenticated || !authStore.user) {
      throw new Error('请先登录后再进行此操作');
    }

    if (!deleteWebsites) {
      // Move websites to uncategorized (category_id = null)
      const { error: webErr } = await supabase.from('websites').update({ category_id: null }).eq('category_id', id);
      if (webErr) handleDbError(webErr);
      websites.value.forEach(w => {
        if (w.category_id === id) {
          w.category_id = null;
        }
      });
    } else {
      // Cascade delete websites
      const { error: webErr } = await supabase.from('websites').delete().eq('category_id', id);
      if (webErr) handleDbError(webErr);
      websites.value = websites.value.filter(w => w.category_id !== id);
    }

    // Delete the category itself
    const { error: err } = await supabase.from('categories').delete().eq('id', id);
    if (err) handleDbError(err);

    categories.value = categories.value.filter(c => c.id !== id);
    if (activeCategoryId.value === id) {
      activeCategoryId.value = 'ALL';
    }
    persistCache();
  }

  async function moveCategoryUp(id: string) {
    const sorted = [...sortedCategories.value];
    const index = sorted.findIndex(c => c.id === id);
    if (index <= 0) return;

    const current = sorted[index];
    const prev = sorted[index - 1];

    const tempOrder = current.order_index;
    current.order_index = prev.order_index;
    prev.order_index = tempOrder;

    if (current.order_index === prev.order_index) {
      current.order_index = index - 1;
      prev.order_index = index;
    }

    await saveBatchCategoriesOrder([current, prev]);
  }

  async function moveCategoryDown(id: string) {
    const sorted = [...sortedCategories.value];
    const index = sorted.findIndex(c => c.id === id);
    if (index === -1 || index >= sorted.length - 1) return;

    const current = sorted[index];
    const next = sorted[index + 1];

    const tempOrder = current.order_index;
    current.order_index = next.order_index;
    next.order_index = tempOrder;

    if (current.order_index === next.order_index) {
      current.order_index = index + 1;
      next.order_index = index;
    }

    await saveBatchCategoriesOrder([current, next]);
  }

  async function saveBatchCategoriesOrder(catsToUpdate: Category[]) {
    if (authStore.user && !authStore.session) {
      await authStore.ensureSession();
    }

    if (!authStore.isAuthenticated || !authStore.user) {
      return;
    }

    for (const c of catsToUpdate) {
      const { error: err } = await supabase.from('categories').update({ order_index: c.order_index }).eq('id', c.id);
      if (err) console.error('Error updating category order:', err);
    }
    persistCache();
  }

  async function reorderCategories(orderedIds: string[]) {
    const updated: Category[] = [];
    orderedIds.forEach((id, newIndex) => {
      const cat = categories.value.find(c => c.id === id);
      if (cat) {
        cat.order_index = newIndex;
        updated.push(cat);
      }
    });
    await saveBatchCategoriesOrder(updated);
  }

  // --- Website Actions ---
  async function createWebsite(data: WebsiteFormData) {
    const targetCategoryId = data.category_id || null;
    const sameCategorySites = websites.value.filter(w => w.category_id === targetCategoryId);
    const maxOrder = sameCategorySites.reduce((max, w) => Math.max(max, w.order_index), -1);
    const order_index = data.order_index ?? (maxOrder + 1);

    if (authStore.user && !authStore.session) {
      await authStore.ensureSession();
    }

    if (!authStore.isAuthenticated || !authStore.user) {
      throw new Error('请先登录后再进行此操作');
    }

    const { data: newWeb, error: err } = await supabase
      .from('websites')
      .insert({
        user_id: authStore.user.id,
        category_id: targetCategoryId,
        title: data.title.trim(),
        url: data.url.trim(),
        description: data.description.trim(),
        icon_url: data.icon_url.trim(),
        order_index,
      })
      .select()
      .single();

    if (err) handleDbError(err);
    if (newWeb) {
      websites.value.push(newWeb);
      persistCache();
    }
    return newWeb;
  }

  async function updateWebsite(id: string, data: Partial<WebsiteFormData>) {
    if (authStore.user && !authStore.session) {
      await authStore.ensureSession();
    }

    if (!authStore.isAuthenticated || !authStore.user) {
      throw new Error('请先登录后再进行此操作');
    }

    const updatePayload: any = {};
    if (data.title !== undefined) updatePayload.title = data.title.trim();
    if (data.url !== undefined) updatePayload.url = data.url.trim();
    if (data.description !== undefined) updatePayload.description = data.description.trim();
    if (data.icon_url !== undefined) updatePayload.icon_url = data.icon_url.trim();
    if (data.category_id !== undefined) updatePayload.category_id = data.category_id || null;
    if (data.order_index !== undefined) updatePayload.order_index = data.order_index;

    const { data: updated, error: err } = await supabase
      .from('websites')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (err) handleDbError(err);
    const idx = websites.value.findIndex(w => w.id === id);
    if (idx !== -1 && updated) {
      websites.value[idx] = updated;
      persistCache();
    }
    return updated;
  }

  async function deleteWebsite(id: string) {
    if (authStore.user && !authStore.session) {
      await authStore.ensureSession();
    }

    if (!authStore.isAuthenticated || !authStore.user) {
      throw new Error('请先登录后再进行此操作');
    }

    const { error: err } = await supabase.from('websites').delete().eq('id', id);
    if (err) handleDbError(err);
    websites.value = websites.value.filter(w => w.id !== id);
    persistCache();
  }

  async function moveWebsiteUp(id: string) {
    const target = websites.value.find(w => w.id === id);
    if (!target) return;

    // Sibling websites in the same category
    const siblings = websites.value
      .filter(w => w.category_id === target.category_id)
      .sort((a, b) => a.order_index - b.order_index);

    const index = siblings.findIndex(w => w.id === id);
    if (index <= 0) return;

    const current = siblings[index];
    const prev = siblings[index - 1];

    const tempOrder = current.order_index;
    current.order_index = prev.order_index;
    prev.order_index = tempOrder;

    if (current.order_index === prev.order_index) {
      current.order_index = index - 1;
      prev.order_index = index;
    }

    await saveBatchWebsitesOrder([current, prev]);
  }

  async function moveWebsiteDown(id: string) {
    const target = websites.value.find(w => w.id === id);
    if (!target) return;

    const siblings = websites.value
      .filter(w => w.category_id === target.category_id)
      .sort((a, b) => a.order_index - b.order_index);

    const index = siblings.findIndex(w => w.id === id);
    if (index === -1 || index >= siblings.length - 1) return;

    const current = siblings[index];
    const next = siblings[index + 1];

    const tempOrder = current.order_index;
    current.order_index = next.order_index;
    next.order_index = tempOrder;

    if (current.order_index === next.order_index) {
      current.order_index = index + 1;
      next.order_index = index;
    }

    await saveBatchWebsitesOrder([current, next]);
  }

  async function saveBatchWebsitesOrder(sitesToUpdate: Website[]) {
    if (authStore.user && !authStore.session) {
      await authStore.ensureSession();
    }

    if (!authStore.isAuthenticated || !authStore.user) {
      return;
    }

    for (const w of sitesToUpdate) {
      const { error: err } = await supabase.from('websites').update({ order_index: w.order_index }).eq('id', w.id);
      if (err) console.error('Error updating website order:', err);
    }
    persistCache();
  }

  async function reorderWebsites(_categoryId: string | null, orderedIds: string[]) {
    const updated: Website[] = [];
    orderedIds.forEach((id, newIndex) => {
      const site = websites.value.find(w => w.id === id);
      if (site) {
        site.order_index = newIndex;
        updated.push(site);
      }
    });
    await saveBatchWebsitesOrder(updated);
  }

  return {
    categories,
    websites,
    activeCategoryId,
    searchQuery,
    loading,
    error,
    hydratedFromCache,
    lastSyncedAt,
    isRevalidating,
    hasContent,
    sortedCategories,
    sortedWebsites,
    categoriesWithCounts,
    uncategorizedCount,
    totalWebsitesCount,
    filteredWebsites,
    groupedCategoriesWithWebsites,
    hydrateFromCache,
    resetNavState,
    fetchData,
    createCategory,
    updateCategory,
    deleteCategory,
    moveCategoryUp,
    moveCategoryDown,
    reorderCategories,
    createWebsite,
    updateWebsite,
    deleteWebsite,
    moveWebsiteUp,
    moveWebsiteDown,
    reorderWebsites,
  };
});
