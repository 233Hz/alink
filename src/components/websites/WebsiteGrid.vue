<template>
  <div class="space-y-12 md:space-y-16 pb-24">
    <!-- Searching or Specific Category View -->
    <div v-if="isFilteredView">
      <!-- Section Header -->
      <div class="flex items-center justify-between gap-3 border-b-2 border-black dark:border-white pb-3 sm:pb-4 mb-6 sm:mb-8">
        <div class="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
          <div
            v-if="currentCategory"
            class="w-8 h-8 sm:w-10 sm:h-10 border-2 border-black dark:border-white bg-black text-white dark:bg-white dark:text-black flex items-center justify-center rounded-none flex-shrink-0"
          >
            <DynamicIcon :icon="currentCategory.icon" :size="18" custom-class="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div
            v-else-if="navStore.activeCategoryId === 'UNCATEGORIZED'"
            class="w-8 h-8 sm:w-10 sm:h-10 border-2 border-black dark:border-white bg-black text-white dark:bg-white dark:text-black flex items-center justify-center rounded-none flex-shrink-0"
          >
            <Bookmark class="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2 min-w-0">
              <h2 class="text-base sm:text-2xl md:text-3xl font-bold tracking-tight truncate whitespace-nowrap">
                {{ headerTitle }}
              </h2>
              <span class="text-xs font-mono font-normal border-2 border-black dark:border-white px-1.5 sm:px-2 py-0.5 rounded-none whitespace-nowrap flex-shrink-0">
                {{ navStore.filteredWebsites.length }}<span class="hidden sm:inline"> ITEMS</span>
              </span>
            </div>
            <p v-if="headerSubtitle" class="text-xs font-mono text-gray-500 mt-0.5 truncate">
              {{ headerSubtitle }}
            </p>
          </div>
        </div>

        <!-- Add Button for this category -->
        <button
          v-if="!navStore.searchQuery"
          @click="emit('add-website', navStore.activeCategoryId === 'UNCATEGORIZED' ? null : navStore.activeCategoryId)"
          class="border-2 border-black dark:border-white px-2.5 py-1.5 sm:px-4 sm:py-2 text-xs font-bold uppercase tracking-wider bg-black text-white dark:bg-white dark:text-black hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white transition-colors duration-200 rounded-none inline-flex items-center gap-1.5 whitespace-nowrap flex-shrink-0"
        >
          <Plus class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>添加网址</span>
        </button>
      </div>

      <!-- Websites Grid -->
      <div
        v-if="navStore.filteredWebsites.length > 0"
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-5 md:gap-6"
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
        class="border-2 border-black dark:border-white p-6 sm:p-10 md:p-16 text-center bg-white dark:bg-black rounded-none"
      >
        <h3 class="text-xl font-bold tracking-tight">
          {{ navStore.searchQuery ? '没有找到匹配的网址' : '该分类下暂无网址' }}
        </h3>
        <p class="text-xs sm:text-sm text-gray-500 mt-2 font-mono">
          {{ navStore.searchQuery ? '请尝试更换关键词，或者清除搜索' : '点击下方按钮为该分类添加第一个网址链接' }}
        </p>
        <div class="mt-6 flex flex-wrap justify-center items-center gap-3">
          <button
            v-if="navStore.searchQuery"
            @click="navStore.searchQuery = ''"
            class="border-2 border-black dark:border-white px-4 py-2 sm:px-5 sm:py-2.5 text-xs font-bold uppercase tracking-wider bg-white text-black dark:bg-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors duration-200 rounded-none whitespace-nowrap flex-shrink-0"
          >
            清除搜索
          </button>
          <button
            v-else
            @click="emit('add-website', navStore.activeCategoryId === 'UNCATEGORIZED' ? null : navStore.activeCategoryId)"
            class="border-2 border-black dark:border-white px-4 py-2 sm:px-5 sm:py-2.5 text-xs font-bold uppercase tracking-wider bg-black text-white dark:bg-white dark:text-black hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white transition-colors duration-200 rounded-none inline-flex items-center gap-1.5 whitespace-nowrap flex-shrink-0"
          >
            <Plus class="w-3.5 h-3.5" />
            <span>添加网址</span>
          </button>
        </div>
      </div>
    </div>

    <!-- "ALL" View Grouped by Categories -->
    <div v-else class="space-y-16">
      <!-- Category Sections -->
      <div
        v-for="group in navStore.groupedCategoriesWithWebsites"
        :key="group.category ? group.category.id : 'uncategorized'"
        class="space-y-6"
      >
        <!-- Category Section Header -->
        <div class="flex items-center justify-between border-b-2 border-black dark:border-white pb-3 gap-2 sm:gap-4">
          <div class="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
            <div
              class="w-7 h-7 sm:w-8 sm:h-8 border-2 border-black dark:border-white bg-black text-white dark:bg-white dark:text-black flex items-center justify-center rounded-none flex-shrink-0"
            >
              <DynamicIcon
                v-if="group.category"
                :icon="group.category.icon"
                :size="15"
                custom-class="w-3.5 h-3.5"
              />
              <Bookmark v-else class="w-3.5 h-3.5" />
            </div>
            <div class="flex items-center gap-2 min-w-0">
              <h2 class="text-base sm:text-xl md:text-2xl font-bold tracking-tight truncate whitespace-nowrap">
                {{ group.category ? group.category.name : '未分类' }}
              </h2>
              <span class="text-xs font-mono border border-black dark:border-white px-1.5 py-0.5 rounded-none font-normal whitespace-nowrap flex-shrink-0">
                {{ group.websites.length }}
              </span>
            </div>
          </div>

          <button
            @click="emit('add-website', group.category && group.category.id !== 'UNCATEGORIZED' ? group.category.id : null)"
            class="border-2 border-black dark:border-white px-2.5 py-1 sm:px-3 sm:py-1 text-xs font-bold uppercase tracking-wider hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors duration-200 rounded-none flex items-center gap-1 whitespace-nowrap flex-shrink-0"
          >
            <Plus class="w-3.5 h-3.5" />
            <span>添加网址</span>
          </button>
        </div>

        <!-- Cards in this category -->
        <div
          v-if="group.websites.length > 0"
          class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-5 md:gap-6"
        >
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
        <div
          v-else
          class="border-2 border-dashed border-black dark:border-white p-6 sm:p-8 text-center bg-white dark:bg-black rounded-none"
        >
          <p class="text-xs font-mono text-gray-500 mb-2">该分类下暂无网址</p>
          <button
            @click="emit('add-website', group.category && group.category.id !== 'UNCATEGORIZED' ? group.category.id : null)"
            class="border-2 border-black dark:border-white px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider bg-black text-white dark:bg-white dark:text-black hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white transition-colors duration-200 rounded-none inline-flex items-center gap-1.5"
          >
            <Plus class="w-3.5 h-3.5" />
            <span>添加第一个网址</span>
          </button>
        </div>
      </div>

      <!-- Completely empty state -->
      <div
        v-if="navStore.groupedCategoriesWithWebsites.length === 0"
        class="border-2 border-black dark:border-white p-6 sm:p-10 md:p-16 text-center bg-white dark:bg-black rounded-none"
      >
        <h3 class="text-xl sm:text-2xl font-bold tracking-tight">
          聚合站暂无内容
        </h3>
        <p class="text-xs sm:text-sm text-gray-500 mt-2 font-mono">
          立即创建分类并添加你的常用网址
        </p>
        <div class="mt-6 sm:mt-8 flex flex-wrap justify-center items-center gap-3 sm:gap-4">
          <button
            @click="emit('add-category')"
            class="border-2 border-black dark:border-white px-4 py-2 sm:px-5 sm:py-2.5 text-xs font-bold uppercase tracking-wider bg-white text-black dark:bg-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors duration-200 rounded-none inline-flex items-center gap-1.5 whitespace-nowrap flex-shrink-0"
          >
            <FolderPlus class="w-3.5 h-3.5" />
            <span>新建分类</span>
          </button>
          <button
            @click="emit('add-website')"
            class="border-2 border-black dark:border-white px-4 py-2 sm:px-5 sm:py-2.5 text-xs font-bold uppercase tracking-wider bg-black text-white dark:bg-white dark:text-black hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white transition-colors duration-200 rounded-none inline-flex items-center gap-1.5 whitespace-nowrap flex-shrink-0"
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
import { Plus, FolderPlus, Bookmark } from '@lucide/vue';
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
    return `匹配到 ${navStore.filteredWebsites.length} 个项目`;
  }
  return '';
});
</script>
