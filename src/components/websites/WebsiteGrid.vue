<template>
  <div class="space-y-8 pb-16">
    <!-- Searching or Specific Category View -->
    <div v-if="isFilteredView">
      <!-- Section Header -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2.5">
          <div
            v-if="currentCategory"
            class="w-8 h-8 rounded-lg bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center"
          >
            <DynamicIcon :icon="currentCategory.icon" :size="18" custom-class="w-4 h-4" />
          </div>
          <div
            v-else-if="navStore.activeCategoryId === 'UNCATEGORIZED'"
            class="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center"
          >
            <Bookmark class="w-4 h-4" />
          </div>
          <div>
            <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{{ headerTitle }}</span>
              <span class="text-xs font-normal text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                {{ navStore.filteredWebsites.length }}
              </span>
            </h2>
            <p v-if="headerSubtitle" class="text-xs text-slate-400 mt-0.5">
              {{ headerSubtitle }}
            </p>
          </div>
        </div>

        <!-- Add Button for this category -->
        <button
          v-if="!navStore.searchQuery"
          @click="emit('add-website', navStore.activeCategoryId === 'UNCATEGORIZED' ? null : navStore.activeCategoryId)"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40 hover:bg-brand-100 dark:hover:bg-brand-900/50 rounded-lg transition-colors"
        >
          <Plus class="w-3.5 h-3.5" />
          <span>添加网址</span>
        </button>
      </div>

      <!-- Websites Grid -->
      <div
        v-if="navStore.filteredWebsites.length > 0"
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5"
      >
        <WebsiteCard
          v-for="(site, idx) in navStore.filteredWebsites"
          :key="site.id"
          :website="site"
          :is-first="idx === 0"
          :is-last="idx === navStore.filteredWebsites.length - 1"
          @edit="emit('edit-website', $event)"
          @delete="emit('delete-website', $event)"
          @move-up="emit('move-up-website', $event)"
          @move-down="emit('move-down-website', $event)"
        />
      </div>

      <!-- Empty Filter State -->
      <div
        v-else
        class="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800"
      >
        <div class="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
          <SearchX v-if="navStore.searchQuery" class="w-6 h-6" />
          <FolderOpen v-else class="w-6 h-6" />
        </div>
        <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-200">
          {{ navStore.searchQuery ? '没有找到匹配的网址' : '该分类下暂无网址' }}
        </h3>
        <p class="text-xs text-slate-400 mt-1 max-w-sm">
          {{ navStore.searchQuery ? '请尝试更换关键词，或者清除搜索' : '点击下方按钮为该分类添加第一个网址链接吧' }}
        </p>
        <div class="mt-4 flex gap-2">
          <button
            v-if="navStore.searchQuery"
            @click="navStore.searchQuery = ''"
            class="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
          >
            清除搜索
          </button>
          <button
            v-else
            @click="emit('add-website', navStore.activeCategoryId === 'UNCATEGORIZED' ? null : navStore.activeCategoryId)"
            class="inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-medium text-white bg-brand-600 hover:bg-brand-500 rounded-lg shadow-sm transition-colors"
          >
            <Plus class="w-3.5 h-3.5" />
            <span>添加网址</span>
          </button>
        </div>
      </div>
    </div>

    <!-- "ALL" View Grouped by Categories -->
    <div v-else class="space-y-10">
      <!-- Category Sections -->
      <div
        v-for="group in navStore.groupedCategoriesWithWebsites"
        :key="group.category ? group.category.id : 'uncategorized'"
        class="space-y-3.5"
      >
        <!-- Category Section Header -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div
              class="w-7 h-7 rounded-lg bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center"
            >
              <DynamicIcon
                v-if="group.category"
                :icon="group.category.icon"
                :size="16"
                custom-class="w-4 h-4"
              />
              <Bookmark v-else class="w-4 h-4 text-amber-500" />
            </div>
            <h2 class="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <span>{{ group.category ? group.category.name : '未分类' }}</span>
              <span class="text-[11px] font-normal text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                {{ group.websites.length }}
              </span>
            </h2>
          </div>

          <button
            @click="emit('add-website', group.category && group.category.id !== 'UNCATEGORIZED' ? group.category.id : null)"
            class="text-xs font-medium text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 flex items-center gap-1 transition-colors"
          >
            <Plus class="w-3.5 h-3.5" />
            <span>添加</span>
          </button>
        </div>

        <!-- Cards in this category -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5">
          <WebsiteCard
            v-for="(site, idx) in group.websites"
            :key="site.id"
            :website="site"
            :is-first="idx === 0"
            :is-last="idx === group.websites.length - 1"
            @edit="emit('edit-website', $event)"
            @delete="emit('delete-website', $event)"
            @move-up="emit('move-up-website', $event)"
            @move-down="emit('move-down-website', $event)"
          />
        </div>
      </div>

      <!-- Completely empty state if no categories and no websites -->
      <div
        v-if="navStore.groupedCategoriesWithWebsites.length === 0"
        class="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800"
      >
        <FolderOpen class="w-12 h-12 text-slate-400 mb-3" />
        <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-200">
          导航站还是空的
        </h3>
        <p class="text-xs text-slate-400 mt-1">
          立即创建分类并添加你常用的网址吧！
        </p>
        <div class="mt-4 flex gap-2">
          <button
            @click="emit('add-category')"
            class="inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <FolderPlus class="w-3.5 h-3.5" />
            <span>新建分类</span>
          </button>
          <button
            @click="emit('add-website')"
            class="inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-medium text-white bg-brand-600 hover:bg-brand-500 rounded-lg shadow-sm transition-colors"
          >
            <Plus class="w-3.5 h-3.5" />
            <span>添加网址</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Plus, SearchX, FolderOpen, FolderPlus, Bookmark } from '@lucide/vue';
import { useNavStore } from '../../stores/nav';
import WebsiteCard from './WebsiteCard.vue';
import DynamicIcon from '../common/DynamicIcon.vue';
import type { Website } from '../../types';

const emit = defineEmits<{
  (e: 'add-website', categoryId?: string | null): void;
  (e: 'add-category'): void;
  (e: 'edit-website', website: Website): void;
  (e: 'delete-website', website: Website): void;
  (e: 'move-up-website', website: Website): void;
  (e: 'move-down-website', website: Website): void;
}>();

const navStore = useNavStore();

const isFilteredView = computed(() => {
  return !!navStore.searchQuery.trim() || navStore.activeCategoryId !== 'ALL';
});

const currentCategory = computed(() => {
  if (navStore.activeCategoryId === 'ALL' || navStore.activeCategoryId === 'UNCATEGORIZED') {
    return null;
  }
  return navStore.categories.find(c => c.id === navStore.activeCategoryId) || null;
});

const headerTitle = computed(() => {
  if (navStore.searchQuery.trim()) {
    return `搜索：“${navStore.searchQuery}”`;
  }
  if (navStore.activeCategoryId === 'UNCATEGORIZED') {
    return '未分类';
  }
  if (currentCategory.value) {
    return currentCategory.value.name;
  }
  return '全部网址';
});

const headerSubtitle = computed(() => {
  if (navStore.searchQuery.trim()) {
    return `匹配到 ${navStore.filteredWebsites.length} 个结果`;
  }
  return '';
});
</script>
