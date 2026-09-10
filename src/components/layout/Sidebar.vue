<template>
  <aside
    :class="[
      'h-full flex flex-col bg-white dark:bg-black text-black dark:text-white border-r-2 border-black dark:border-white select-none transition-all duration-200',
      isCollapsed ? 'w-16' : 'w-64',
    ]"
  >
    <!-- Sidebar Header -->
    <div class="p-3 border-b-2 border-black dark:border-white flex items-center justify-between">
      <div v-if="!isCollapsed" class="flex items-center gap-2 px-2">
        <FolderTree class="w-4 h-4" />
        <span class="text-xs font-black uppercase tracking-wider">
          分类导航
        </span>
      </div>
      <button
        @click="isCollapsed = !isCollapsed"
        class="p-1 mx-auto border border-black dark:border-white rounded-none hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
        :title="isCollapsed ? '展开' : '收起'"
      >
        <ChevronLeft v-if="!isCollapsed" class="w-4 h-4" />
        <ChevronRight v-else class="w-4 h-4" />
      </button>
    </div>

    <!-- Navigation Items List -->
    <div class="flex-1 overflow-y-auto p-2 space-y-1.5">
      <!-- ALL Bookmarks -->
      <button
        @click="navStore.activeCategoryId = 'ALL'"
        :class="[
          'w-full flex items-center gap-3 px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-none transition-colors border-2 text-left',
          navStore.activeCategoryId === 'ALL'
            ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
            : 'border-transparent hover:border-black dark:hover:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black',
        ]"
        title="全部网址"
      >
        <LayoutGrid class="w-4 h-4 flex-shrink-0" />
        <span v-if="!isCollapsed" class="flex-1 truncate">全部网址</span>
        <span
          v-if="!isCollapsed"
          class="text-xs font-mono font-normal"
        >
          {{ navStore.totalWebsitesCount }}
        </span>
      </button>

      <!-- UNCATEGORIZED -->
      <button
        v-if="navStore.uncategorizedCount > 0 || !isCollapsed"
        @click="navStore.activeCategoryId = 'UNCATEGORIZED'"
        :class="[
          'w-full flex items-center gap-3 px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-none transition-colors border-2 text-left',
          navStore.activeCategoryId === 'UNCATEGORIZED'
            ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
            : 'border-transparent hover:border-black dark:hover:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black',
        ]"
        title="未分类"
      >
        <Bookmark class="w-4 h-4 flex-shrink-0" />
        <span v-if="!isCollapsed" class="flex-1 truncate">未分类</span>
        <span
          v-if="!isCollapsed"
          class="text-xs font-mono font-normal"
        >
          {{ navStore.uncategorizedCount }}
        </span>
      </button>

      <!-- Category Divider -->
      <div v-if="!isCollapsed" class="pt-4 pb-2 px-3 flex items-center justify-between border-t-2 border-black dark:border-white mt-3">
        <span class="text-[11px] font-black uppercase tracking-wider text-gray-500">
          分类 ({{ navStore.sortedCategories.length }})
        </span>
        <button
          @click="emit('add-category')"
          class="p-0.5 hover:text-[#ff3366]"
          title="新建分类"
        >
          <Plus class="w-4 h-4" />
        </button>
      </div>

      <!-- User Categories -->
      <div
        v-for="(cat, idx) in navStore.categoriesWithCounts"
        :key="cat.id"
        class="group/item relative"
      >
        <div
          @click="navStore.activeCategoryId = cat.id"
          :class="[
            'w-full flex items-center gap-3 px-3 py-2 text-xs font-bold rounded-none transition-colors cursor-pointer border-2',
            navStore.activeCategoryId === cat.id
              ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
              : 'border-transparent hover:border-black dark:hover:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black',
          ]"
          :title="cat.name"
        >
          <DynamicIcon :icon="cat.icon" :size="16" custom-class="w-4 h-4 flex-shrink-0" />
          <span v-if="!isCollapsed" class="flex-1 truncate">{{ cat.name }}</span>

          <!-- Website Count Badge -->
          <span
            v-if="!isCollapsed"
            class="text-xs font-mono font-normal group-hover/item:hidden"
          >
            {{ cat.website_count }}
          </span>

          <!-- Action Buttons on hover -->
          <div
            v-if="!isCollapsed"
            class="hidden group-hover/item:flex items-center gap-1"
            @click.stop
          >
            <button
              @click.stop="navStore.moveCategoryUp(cat.id)"
              :disabled="idx === 0"
              class="p-0.5 hover:text-[#ff3366] disabled:opacity-20"
              title="上移"
            >
              <ArrowUp class="w-3.5 h-3.5" />
            </button>
            <button
              @click.stop="navStore.moveCategoryDown(cat.id)"
              :disabled="idx === navStore.categoriesWithCounts.length - 1"
              class="p-0.5 hover:text-[#ff3366] disabled:opacity-20"
              title="下移"
            >
              <ArrowDown class="w-3.5 h-3.5" />
            </button>
            <button
              @click.stop="emit('edit-category', cat)"
              class="p-0.5 hover:text-[#ff3366]"
              title="编辑分类"
            >
              <Pencil class="w-3.5 h-3.5" />
            </button>
            <button
              @click.stop="emit('delete-category', cat)"
              class="p-0.5 text-[#ff3366]"
              title="删除分类"
            >
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Sidebar Bottom: Add Category Button -->
    <div class="p-3 border-t-2 border-black dark:border-white">
      <button
        @click="emit('add-category')"
        class="w-full py-2.5 px-3 border-2 border-black dark:border-white bg-black text-white dark:bg-white dark:text-black hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 rounded-none transition-colors duration-200"
        :title="isCollapsed ? '新建分类' : ''"
      >
        <Plus class="w-4 h-4" />
        <span v-if="!isCollapsed">新建分类</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  LayoutGrid,
  Bookmark,
  Plus,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  FolderTree,
  ChevronLeft,
  ChevronRight,
} from '@lucide/vue';
import { useNavStore } from '../../stores/nav';
import type { Category } from '../../types';
import DynamicIcon from '../common/DynamicIcon.vue';

const emit = defineEmits<{
  (e: 'add-category'): void;
  (e: 'edit-category', category: Category): void;
  (e: 'delete-category', category: Category): void;
}>();

const navStore = useNavStore();
const isCollapsed = ref(false);
</script>
