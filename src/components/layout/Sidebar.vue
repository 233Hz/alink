<template>
  <aside
    :class="[
      'h-full flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800/80 select-none transition-all duration-200',
      isCollapsed ? 'w-16' : 'w-64',
    ]"
  >
    <!-- Sidebar Header / Collapse Toggle -->
    <div class="p-3 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
      <div v-if="!isCollapsed" class="flex items-center gap-2 px-2">
        <FolderTree class="w-4 h-4 text-brand-600 dark:text-brand-400" />
        <span class="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          分类导航
        </span>
      </div>
      <button
        @click="isCollapsed = !isCollapsed"
        class="p-1.5 mx-auto rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        :title="isCollapsed ? '展开侧边栏' : '收起侧边栏'"
      >
        <ChevronLeft v-if="!isCollapsed" class="w-4 h-4" />
        <ChevronRight v-else class="w-4 h-4" />
      </button>
    </div>

    <!-- Navigation Items List -->
    <div class="flex-1 overflow-y-auto p-2 space-y-1">
      <!-- ALL Bookmarks -->
      <button
        @click="navStore.activeCategoryId = 'ALL'"
        :class="[
          'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all text-left group',
          navStore.activeCategoryId === 'ALL'
            ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-400 font-semibold'
            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60',
        ]"
        title="全部网址"
      >
        <LayoutGrid class="w-4 h-4 flex-shrink-0" />
        <span v-if="!isCollapsed" class="flex-1 truncate">全部网址</span>
        <span
          v-if="!isCollapsed"
          class="text-[11px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
        >
          {{ navStore.totalWebsitesCount }}
        </span>
      </button>

      <!-- UNCATEGORIZED -->
      <button
        v-if="navStore.uncategorizedCount > 0 || !isCollapsed"
        @click="navStore.activeCategoryId = 'UNCATEGORIZED'"
        :class="[
          'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all text-left group',
          navStore.activeCategoryId === 'UNCATEGORIZED'
            ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-400 font-semibold'
            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60',
        ]"
        title="未分类"
      >
        <Bookmark class="w-4 h-4 text-amber-500 flex-shrink-0" />
        <span v-if="!isCollapsed" class="flex-1 truncate">未分类</span>
        <span
          v-if="!isCollapsed"
          class="text-[11px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400"
        >
          {{ navStore.uncategorizedCount }}
        </span>
      </button>

      <!-- Category Divider -->
      <div v-if="!isCollapsed" class="pt-3 pb-1 px-3 flex items-center justify-between">
        <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          自定义分类 ({{ navStore.sortedCategories.length }})
        </span>
        <button
          @click="emit('add-category')"
          class="text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 p-0.5"
          title="新建分类"
        >
          <Plus class="w-3.5 h-3.5" />
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
            'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer group',
            navStore.activeCategoryId === cat.id
              ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-400 font-semibold'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60',
          ]"
          :title="cat.name"
        >
          <DynamicIcon :icon="cat.icon" :size="16" custom-class="w-4 h-4 flex-shrink-0 text-brand-500" />
          <span v-if="!isCollapsed" class="flex-1 truncate">{{ cat.name }}</span>

          <!-- Website Count Badge (Hidden when hovered if expanded) -->
          <span
            v-if="!isCollapsed"
            :class="[
              'text-[11px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400',
              'group-hover/item:hidden',
            ]"
          >
            {{ cat.website_count }}
          </span>

          <!-- Hover Action Buttons (Visible on hover if expanded) -->
          <div
            v-if="!isCollapsed"
            class="hidden group-hover/item:flex items-center gap-0.5"
            @click.stop
          >
            <button
              @click.stop="navStore.moveCategoryUp(cat.id)"
              :disabled="idx === 0"
              class="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20"
              title="向上移动"
            >
              <ArrowUp class="w-3 h-3" />
            </button>
            <button
              @click.stop="navStore.moveCategoryDown(cat.id)"
              :disabled="idx === navStore.categoriesWithCounts.length - 1"
              class="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20"
              title="向下移动"
            >
              <ArrowDown class="w-3 h-3" />
            </button>
            <button
              @click.stop="emit('edit-category', cat)"
              class="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              title="编辑分类"
            >
              <Pencil class="w-3 h-3" />
            </button>
            <button
              @click.stop="emit('delete-category', cat)"
              class="p-1 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
              title="删除分类"
            >
              <Trash2 class="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Sidebar Bottom: Add Category Button -->
    <div class="p-3 border-t border-slate-100 dark:border-slate-800/80">
      <button
        @click="emit('add-category')"
        class="w-full py-2 px-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:border-brand-300 dark:hover:border-brand-700 flex items-center justify-center gap-1.5 transition-colors"
        :title="isCollapsed ? '新建分类' : ''"
      >
        <Plus class="w-3.5 h-3.5" />
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
