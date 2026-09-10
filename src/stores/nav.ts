import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '../lib/supabase';
import type { Category, Website, CategoryFormData, WebsiteFormData } from '../types';
import { useAuthStore } from './auth';

export const useNavStore = defineStore('nav', () => {
  const categories = ref<Category[]>([]);
  const websites = ref<Website[]>([]);
  const activeCategoryId = ref<string>('ALL');
  const searchQuery = ref<string>('');
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);

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

  function handleDbError(err: any): never {
    console.error('Database operation failed:', err);
    if (
      err?.message?.includes('violates row-level security') ||
      err?.code === '42501' ||
      err?.status === 401 ||
      err?.statusCode === '401'
    ) {
      throw new Error('登录凭证已失效或未生效，请重新登录后再试');
    }
    throw err;
  }

  // Fetch all data for current user
  async function fetchData() {
    loading.value = true;
    error.value = null;

    try {
      // Clean up legacy guest localStorage if present
      localStorage.removeItem('alink_guest_categories');
      localStorage.removeItem('alink_guest_websites');

      if (authStore.user && !authStore.session) {
        await authStore.ensureSession();
      }

      if (authStore.isAuthenticated && authStore.user) {
        // 1. Fetch categories
        const { data: catData, error: catError } = await supabase
          .from('categories')
          .select('*')
          .order('order_index', { ascending: true });

        if (catError) throw catError;

        // 2. Fetch websites
        const { data: webData, error: webError } = await supabase
          .from('websites')
          .select('*')
          .order('order_index', { ascending: true });

        if (webError) throw webError;

        categories.value = catData || [];
        websites.value = webData || [];
      } else {
        categories.value = [];
        websites.value = [];
      }
    } catch (err: any) {
      console.error('Error fetching navigation data:', err);
      if (
        err?.message?.includes('violates row-level security') ||
        err?.code === '42501' ||
        err?.status === 401
      ) {
        error.value = '登录凭证已失效，请重新登录';
      } else {
        error.value = err.message || '获取数据失败';
      }
    } finally {
      loading.value = false;
    }
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
    sortedCategories,
    sortedWebsites,
    categoriesWithCounts,
    uncategorizedCount,
    totalWebsitesCount,
    filteredWebsites,
    groupedCategoriesWithWebsites,
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
