<template>
  <div class="space-y-12 md:space-y-16 pb-24">
    <!-- Searching or Specific Category View -->
    <div v-if="isFilteredView">
      <!-- Section Header -->
      <div class="flex items-center justify-between border-b-2 border-black dark:border-white pb-4 mb-8">
        <div class="flex items-center gap-3">
          <div
            v-if="currentCategory"
            class="w-10 h-10 border-2 border-black dark:border-white bg-black text-white dark:bg-white dark:text-black flex items-center justify-center rounded-none"
          >
            <DynamicIcon :icon="currentCategory.icon" :size="20" custom-class="w-5 h-5" />
          </div>
          <div
            v-else-if="navStore.activeCategoryId === 'UNCATEGORIZED'"
            class="w-10 h-10 border-2 border-black dark:border-white bg-black text-white dark:bg-white dark:text-black flex items-center justify-center rounded-none"
          >
            <Bookmark class="w-5 h-5" />
          </div>
          <div>
            <h2 class="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
              <span>{{ headerTitle }}</span>
              <span class="text-xs font-mono font-normal border-2 border-black dark:border-white px-2 py-0.5 rounded-none">
                {{ navStore.filteredWebsites.length }} ITEMS
              </span>
            </h2>
            <p v-if="headerSubtitle" class="text-xs font-mono text-gray-500 mt-1">
              {{ headerSubtitle }}
            </p>
          </div>
        </div>

        <!-- Add Button for this category -->
        <button
          v-if="!navStore.searchQuery"
          @click="emit('add-website', navStore.activeCategoryId === 'UNCATEGORIZED' ? null : navStore.activeCategoryId)"
          class="border-2 border-black dark:border-white px-4 py-2 text-xs font-bold uppercase tracking-wider bg-black text-white dark:bg-white dark:text-black hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white transition-colors duration-200 rounded-none inline-flex items-center gap-2"
        >
          <Plus class="w-4 h-4" />
          <span>添加网址</span>
        </button>
      </div>

      <!-- Websites Grid -->
      <div
        v-if="navStore.filteredWebsites.length > 0"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8"
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
        class="border-2 border-black dark:border-white p-12 md:p-16 text-center bg-white dark:bg-black rounded-none"
      >
        <h3 class="text-xl font-bold tracking-tight">
          {{ navStore.searchQuery ? '没有找到匹配的网址' : '该分类下暂无网址' }}
        </h3>
        <p class="text-sm text-gray-500 mt-2 font-mono">
          {{ navStore.searchQuery ? '请尝试更换关键词，或者清除搜索' : '点击下方按钮为该分类添加第一个网址链接' }}
        </p>
        <div class="mt-6 flex justify-center gap-4">
          <button
            v-if="navStore.searchQuery"
            @click="navStore.searchQuery = ''"
            class="border-2 border-black dark:border-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider bg-white text-black dark:bg-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors duration-200 rounded-none"
          >
            清除搜索
          </button>
          <button
            v-else
            @click="emit('add-website', navStore.activeCategoryId === 'UNCATEGORIZED' ? null : navStore.activeCategoryId)"
            class="border-2 border-black dark:border-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider bg-black text-white dark:bg-white dark:text-black hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white transition-colors duration-200 rounded-none inline-flex items-center gap-2"
          >
            <Plus class="w-4 h-4" />
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
        <div class="flex items-center justify-between border-b-2 border-black dark:border-white pb-3">
          <div class="flex items-center gap-3">
            <div
              class="w-8 h-8 border-2 border-black dark:border-white bg-black text-white dark:bg-white dark:text-black flex items-center justify-center rounded-none"
            >
              <DynamicIcon
                v-if="group.category"
                :icon="group.category.icon"
                :size="16"
                custom-class="w-4 h-4"
              />
              <Bookmark v-else class="w-4 h-4" />
            </div>
            <h2 class="text-xl md:text-2xl font-bold tracking-tight flex items-center gap-3">
              <span>{{ group.category ? group.category.name : '未分类' }}</span>
              <span class="text-xs font-mono border border-black dark:border-white px-2 py-0.5 rounded-none font-normal">
                {{ group.websites.length }}
              </span>
            </h2>
          </div>

          <button
            @click="emit('add-website', group.category && group.category.id !== 'UNCATEGORIZED' ? group.category.id : null)"
            class="border-2 border-black dark:border-white px-3 py-1 text-xs font-bold uppercase tracking-wider hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors duration-200 rounded-none flex items-center gap-1"
          >
            <Plus class="w-3.5 h-3.5" />
            <span>添加网址</span>
          </button>
        </div>

        <!-- Cards in this category -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
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

      <!-- Completely empty state -->
      <div
        v-if="navStore.groupedCategoriesWithWebsites.length === 0"
        class="border-2 border-black dark:border-white p-16 text-center bg-white dark:bg-black rounded-none"
      >
        <h3 class="text-2xl font-bold tracking-tight">
          聚合站暂无内容
        </h3>
        <p class="text-sm text-gray-500 mt-2 font-mono">
          立即创建分类并添加你的常用网址
        </p>
        <div class="mt-8 flex justify-center gap-4">
          <button
            @click="emit('add-category')"
            class="border-2 border-black dark:border-white px-6 py-3 text-xs font-bold uppercase tracking-wider bg-white text-black dark:bg-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors duration-200 rounded-none inline-flex items-center gap-2"
          >
            <FolderPlus class="w-4 h-4" />
            <span>新建分类</span>
          </button>
          <button
            @click="emit('add-website')"
            class="border-2 border-black dark:border-white px-6 py-3 text-xs font-bold uppercase tracking-wider bg-black text-white dark:bg-white dark:text-black hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white transition-colors duration-200 rounded-none inline-flex items-center gap-2"
          >
            <Plus class="w-4 h-4" />
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
