<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 md:hidden flex"
  >
    <!-- Backdrop -->
    <div
      class="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
      @click="emit('close')"
    ></div>

    <!-- Drawer Panel -->
    <div
      class="relative w-4/5 max-w-xs h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200"
    >
      <!-- Header -->
      <div class="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-brand-500/20">
            A
          </div>
          <span class="text-sm font-bold text-slate-800 dark:text-slate-100">分类导航</span>
        </div>
        <button
          @click="emit('close')"
          class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Categories List -->
      <div class="flex-1 overflow-y-auto p-3 space-y-1">
        <!-- ALL -->
        <button
          @click="selectCategory('ALL')"
          :class="[
            'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all text-left',
            navStore.activeCategoryId === 'ALL'
              ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-400 font-semibold'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800',
          ]"
        >
          <LayoutGrid class="w-4 h-4 flex-shrink-0" />
          <span class="flex-1 truncate">全部网址</span>
          <span class="text-[11px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
            {{ navStore.totalWebsitesCount }}
          </span>
        </button>

        <!-- UNCATEGORIZED -->
        <button
          v-if="navStore.uncategorizedCount > 0"
          @click="selectCategory('UNCATEGORIZED')"
          :class="[
            'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all text-left',
            navStore.activeCategoryId === 'UNCATEGORIZED'
              ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-400 font-semibold'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800',
          ]"
        >
          <Bookmark class="w-4 h-4 text-amber-500 flex-shrink-0" />
          <span class="flex-1 truncate">未分类</span>
          <span class="text-[11px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
            {{ navStore.uncategorizedCount }}
          </span>
        </button>

        <div class="pt-3 pb-1 px-3 flex items-center justify-between">
          <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            分类 ({{ navStore.sortedCategories.length }})
          </span>
        </div>

        <!-- Category Items -->
        <div
          v-for="(cat, idx) in navStore.categoriesWithCounts"
          :key="cat.id"
          class="flex items-center justify-between p-1 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40"
        >
          <button
            @click="selectCategory(cat.id)"
            :class="[
              'flex-1 flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all text-left truncate',
              navStore.activeCategoryId === cat.id
                ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-400 font-semibold'
                : 'text-slate-600 dark:text-slate-300',
            ]"
          >
            <DynamicIcon :icon="cat.icon" :size="16" custom-class="w-4 h-4 text-brand-500 flex-shrink-0" />
            <span class="truncate">{{ cat.name }}</span>
            <span class="text-[10px] text-slate-400 ml-auto">({{ cat.website_count }})</span>
          </button>

          <!-- Mobile Action Menu buttons for category -->
          <div class="flex items-center gap-0.5 px-1">
            <button
              @click="navStore.moveCategoryUp(cat.id)"
              :disabled="idx === 0"
              class="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20"
              title="上移"
            >
              <ArrowUp class="w-3.5 h-3.5" />
            </button>
            <button
              @click="navStore.moveCategoryDown(cat.id)"
              :disabled="idx === navStore.categoriesWithCounts.length - 1"
              class="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20"
              title="下移"
            >
              <ArrowDown class="w-3.5 h-3.5" />
            </button>
            <button
              @click="emit('edit-category', cat); emit('close');"
              class="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              title="编辑"
            >
              <Pencil class="w-3.5 h-3.5" />
            </button>
            <button
              @click="emit('delete-category', cat); emit('close');"
              class="p-1 text-slate-400 hover:text-rose-500"
              title="删除"
            >
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <!-- Drawer Footer -->
      <div class="p-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
        <button
          @click="emit('add-category'); emit('close');"
          class="w-full py-2 px-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 flex items-center justify-center gap-1.5"
        >
          <Plus class="w-3.5 h-3.5" />
          <span>新建分类</span>
        </button>

        <button
          @click="emit('add-website'); emit('close');"
          class="w-full py-2 px-3 rounded-xl bg-brand-600 text-xs font-medium text-white flex items-center justify-center gap-1.5 shadow-sm"
        >
          <Plus class="w-3.5 h-3.5" />
          <span>添加新网址</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  X,
  LayoutGrid,
  Bookmark,
  Plus,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
} from '@lucide/vue';
import { useNavStore } from '../../stores/nav';
import type { Category } from '../../types';
import DynamicIcon from '../common/DynamicIcon.vue';

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'add-category'): void;
  (e: 'add-website'): void;
  (e: 'edit-category', category: Category): void;
  (e: 'delete-category', category: Category): void;
}>();

const navStore = useNavStore();

function selectCategory(id: string) {
  navStore.activeCategoryId = id;
  emit('close');
}
</script>
