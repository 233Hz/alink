<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 md:hidden flex"
  >
    <!-- Solid Backdrop (No blur per Minimalist Flat rules) -->
    <div
      class="fixed inset-0 bg-black/80 transition-opacity"
      @click="emit('close')"
    ></div>

    <!-- Drawer Panel -->
    <div
      class="relative w-4/5 max-w-xs h-full bg-white dark:bg-black text-black dark:text-white border-r-2 border-black dark:border-white flex flex-col z-10"
    >
      <!-- Header -->
      <div class="p-4 border-b-2 border-black dark:border-white flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 border-2 border-black dark:border-white bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-black text-xs">
            A
          </div>
          <span class="text-sm font-black uppercase tracking-wider">分类导航</span>
        </div>
        <button
          @click="emit('close')"
          class="p-1 border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Categories List -->
      <div class="flex-1 overflow-y-auto p-3 space-y-2">
        <!-- ALL -->
        <button
          @click="selectCategory('ALL')"
          :class="[
            'w-full flex items-center gap-3 px-3 py-2 text-xs font-bold uppercase tracking-wider border-2 text-left transition-colors',
            navStore.activeCategoryId === 'ALL'
              ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
              : 'border-transparent hover:border-black dark:hover:border-white hover:bg-black hover:text-white',
          ]"
        >
          <LayoutGrid class="w-4 h-4 flex-shrink-0" />
          <span class="flex-1 truncate">全部网址</span>
          <span class="font-mono text-xs">
            {{ navStore.totalWebsitesCount }}
          </span>
        </button>

        <!-- UNCATEGORIZED -->
        <button
          v-if="navStore.uncategorizedCount > 0"
          @click="selectCategory('UNCATEGORIZED')"
          :class="[
            'w-full flex items-center gap-3 px-3 py-2 text-xs font-bold uppercase tracking-wider border-2 text-left transition-colors',
            navStore.activeCategoryId === 'UNCATEGORIZED'
              ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
              : 'border-transparent hover:border-black dark:hover:border-white hover:bg-black hover:text-white',
          ]"
        >
          <Bookmark class="w-4 h-4 flex-shrink-0" />
          <span class="flex-1 truncate">未分类</span>
          <span class="font-mono text-xs">
            {{ navStore.uncategorizedCount }}
          </span>
        </button>

        <div class="pt-3 pb-1 px-3 border-t-2 border-black dark:border-white mt-2">
          <span class="text-[10px] font-black uppercase tracking-wider text-gray-500">
            分类 ({{ navStore.sortedCategories.length }})
          </span>
        </div>

        <!-- Category Items -->
        <div
          v-for="(cat, idx) in navStore.categoriesWithCounts"
          :key="cat.id"
          class="flex items-center justify-between border-2 border-transparent hover:border-black dark:hover:border-white p-1"
        >
          <button
            @click="selectCategory(cat.id)"
            :class="[
              'flex-1 flex items-center gap-2.5 px-2 py-1.5 text-xs font-bold text-left truncate',
              navStore.activeCategoryId === cat.id
                ? 'text-[#ff3366]'
                : '',
            ]"
          >
            <DynamicIcon :icon="cat.icon" :size="16" custom-class="w-4 h-4 flex-shrink-0" />
            <span class="truncate">{{ cat.name }}</span>
            <span class="font-mono text-[10px] ml-auto">({{ cat.website_count }})</span>
          </button>

          <!-- Mobile Action Menu buttons for category -->
          <div class="flex items-center gap-1 px-1">
            <button
              @click="navStore.moveCategoryUp(cat.id)"
              :disabled="idx === 0"
              class="p-0.5 hover:text-[#ff3366] disabled:opacity-20"
              title="上移"
            >
              <ArrowUp class="w-3.5 h-3.5" />
            </button>
            <button
              @click="navStore.moveCategoryDown(cat.id)"
              :disabled="idx === navStore.categoriesWithCounts.length - 1"
              class="p-0.5 hover:text-[#ff3366] disabled:opacity-20"
              title="下移"
            >
              <ArrowDown class="w-3.5 h-3.5" />
            </button>
            <button
              @click="emit('edit-category', cat); emit('close');"
              class="p-0.5 hover:text-[#ff3366]"
              title="编辑"
            >
              <Pencil class="w-3.5 h-3.5" />
            </button>
            <button
              @click="emit('delete-category', cat); emit('close');"
              class="p-0.5 text-[#ff3366]"
              title="删除"
            >
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <!-- Drawer Footer -->
      <div class="p-3 border-t-2 border-black dark:border-white space-y-2">
        <button
          @click="emit('add-category'); emit('close');"
          class="w-full py-2.5 px-3 border-2 border-black dark:border-white bg-white text-black dark:bg-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 rounded-none transition-colors"
        >
          <Plus class="w-3.5 h-3.5" />
          <span>新建分类</span>
        </button>

        <button
          @click="emit('add-website'); emit('close');"
          class="w-full py-2.5 px-3 border-2 border-black dark:border-white bg-black text-white dark:bg-white dark:text-black hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 rounded-none transition-colors"
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
