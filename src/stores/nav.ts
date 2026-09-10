import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '../lib/supabase';
import type { Category, Website, CategoryFormData, WebsiteFormData } from '../types';
import { getFaviconUrl } from '../utils';
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

  // Fetch all data for current user or load guest demo data
  async function fetchData() {
    loading.value = true;
    error.value = null;

    try {
      if (authStore.user) {
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
        // Guest mode fallback from localStorage or memory
        loadGuestData();
      }
    } catch (err: any) {
      console.error('Error fetching navigation data:', err);
      error.value = err.message || '获取数据失败';
    } finally {
      loading.value = false;
    }
  }

  function loadGuestData() {
    const localCat = localStorage.getItem('alink_guest_categories');
    const localWeb = localStorage.getItem('alink_guest_websites');

    // Clean up any legacy built-in guest demo seed data
    if (localCat && (localCat.includes('guest_cat_') || localCat.includes('常用搜索'))) {
      localStorage.removeItem('alink_guest_categories');
      localStorage.removeItem('alink_guest_websites');
      categories.value = [];
      websites.value = [];
      return;
    }

    if (localCat && localWeb) {
      try {
        categories.value = JSON.parse(localCat);
        const parsedWeb: Website[] = JSON.parse(localWeb);
        // Normalize any outdated /favicon.ico URLs to Google high-res favicon service
        websites.value = parsedWeb.map((w: Website) => {
          if (!w.icon_url || w.icon_url.endsWith('/favicon.ico')) {
            return { ...w, icon_url: getFaviconUrl(w.url) };
          }
          return w;
        });
        return;
      } catch (e) {
        categories.value = [];
        websites.value = [];
      }
    } else {
      categories.value = [];
      websites.value = [];
    }
  }

  function saveGuestData() {
    if (!authStore.user) {
      localStorage.setItem('alink_guest_categories', JSON.stringify(categories.value));
      localStorage.setItem('alink_guest_websites', JSON.stringify(websites.value));
    }
  }

  // --- Category Actions ---
  async function createCategory(data: CategoryFormData) {
    if (authStore.user) {
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

      if (err) throw err;
      if (newCat) {
        categories.value.push(newCat);
      }
      return newCat;
    } else {
      const maxOrder = categories.value.reduce((max, c) => Math.max(max, c.order_index), -1);
      const newCat: Category = {
        id: 'guest_cat_' + Date.now(),
        user_id: 'guest',
        name: data.name.trim(),
        icon: data.icon || 'Folder',
        order_index: data.order_index ?? (maxOrder + 1),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      categories.value.push(newCat);
      saveGuestData();
      return newCat;
    }
  }

  async function updateCategory(id: string, data: Partial<CategoryFormData>) {
    if (authStore.user) {
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

      if (err) throw err;
      const idx = categories.value.findIndex(c => c.id === id);
      if (idx !== -1 && updated) {
        categories.value[idx] = updated;
      }
      return updated;
    } else {
      const idx = categories.value.findIndex(c => c.id === id);
      if (idx !== -1) {
        categories.value[idx] = {
          ...categories.value[idx],
          ...data,
          updated_at: new Date().toISOString(),
        };
        saveGuestData();
      }
    }
  }

  async function deleteCategory(id: string, deleteWebsites: boolean) {
    if (authStore.user) {
      if (!deleteWebsites) {
        // Move websites to uncategorized (category_id = null)
        await supabase.from('websites').update({ category_id: null }).eq('category_id', id);
        websites.value.forEach(w => {
          if (w.category_id === id) {
            w.category_id = null;
          }
        });
      } else {
        // Cascade delete websites
        await supabase.from('websites').delete().eq('category_id', id);
        websites.value = websites.value.filter(w => w.category_id !== id);
      }

      // Delete the category itself
      const { error: err } = await supabase.from('categories').delete().eq('id', id);
      if (err) throw err;

      categories.value = categories.value.filter(c => c.id !== id);
      if (activeCategoryId.value === id) {
        activeCategoryId.value = 'ALL';
      }
    } else {
      if (!deleteWebsites) {
        websites.value.forEach(w => {
          if (w.category_id === id) {
            w.category_id = null;
          }
        });
      } else {
        websites.value = websites.value.filter(w => w.category_id !== id);
      }
      categories.value = categories.value.filter(c => c.id !== id);
      if (activeCategoryId.value === id) {
        activeCategoryId.value = 'ALL';
      }
      saveGuestData();
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
    if (authStore.user) {
      for (const c of catsToUpdate) {
        await supabase.from('categories').update({ order_index: c.order_index }).eq('id', c.id);
      }
    } else {
      saveGuestData();
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

    if (authStore.user) {
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

      if (err) throw err;
      if (newWeb) {
        websites.value.push(newWeb);
      }
      return newWeb;
    } else {
      const newWeb: Website = {
        id: 'guest_web_' + Date.now(),
        user_id: 'guest',
        category_id: targetCategoryId,
        title: data.title.trim(),
        url: data.url.trim(),
        description: data.description.trim(),
        icon_url: data.icon_url.trim(),
        order_index,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      websites.value.push(newWeb);
      saveGuestData();
      return newWeb;
    }
  }

  async function updateWebsite(id: string, data: Partial<WebsiteFormData>) {
    if (authStore.user) {
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

      if (err) throw err;
      const idx = websites.value.findIndex(w => w.id === id);
      if (idx !== -1 && updated) {
        websites.value[idx] = updated;
      }
      return updated;
    } else {
      const idx = websites.value.findIndex(w => w.id === id);
      if (idx !== -1) {
        websites.value[idx] = {
          ...websites.value[idx],
          ...data,
          category_id: data.category_id !== undefined ? (data.category_id || null) : websites.value[idx].category_id,
          updated_at: new Date().toISOString(),
        };
        saveGuestData();
      }
    }
  }

  async function deleteWebsite(id: string) {
    if (authStore.user) {
      const { error: err } = await supabase.from('websites').delete().eq('id', id);
      if (err) throw err;
      websites.value = websites.value.filter(w => w.id !== id);
    } else {
      websites.value = websites.value.filter(w => w.id !== id);
      saveGuestData();
    }
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
    if (authStore.user) {
      for (const w of sitesToUpdate) {
        await supabase.from('websites').update({ order_index: w.order_index }).eq('id', w.id);
      }
    } else {
      saveGuestData();
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
