<template>
  <div class="md:hidden sticky top-16 z-30 bg-white/95 dark:bg-slate-950/95 backdrop-blur border-b border-slate-200/80 dark:border-slate-800/80 px-4 py-2.5 overflow-x-auto no-scrollbar flex items-center gap-2">
    <!-- ALL Pill -->
    <button
      @click="navStore.activeCategoryId = 'ALL'"
      :class="[
        'flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5',
        navStore.activeCategoryId === 'ALL'
          ? 'bg-brand-600 text-white shadow-sm'
          : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200',
      ]"
    >
      <LayoutGrid class="w-3.5 h-3.5" />
      <span>全部</span>
      <span class="text-[10px] opacity-80">({{ navStore.totalWebsitesCount }})</span>
    </button>

    <!-- UNCATEGORIZED Pill -->
    <button
      v-if="navStore.uncategorizedCount > 0"
      @click="navStore.activeCategoryId = 'UNCATEGORIZED'"
      :class="[
        'flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5',
        navStore.activeCategoryId === 'UNCATEGORIZED'
          ? 'bg-amber-500 text-white shadow-sm'
          : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200',
      ]"
    >
      <Bookmark class="w-3.5 h-3.5" />
      <span>未分类</span>
      <span class="text-[10px] opacity-80">({{ navStore.uncategorizedCount }})</span>
    </button>

    <!-- Categories Pills -->
    <button
      v-for="cat in navStore.categoriesWithCounts"
      :key="cat.id"
      @click="navStore.activeCategoryId = cat.id"
      :class="[
        'flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5',
        navStore.activeCategoryId === cat.id
          ? 'bg-brand-600 text-white shadow-sm'
          : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200',
      ]"
    >
      <DynamicIcon :icon="cat.icon" :size="14" custom-class="w-3.5 h-3.5" />
      <span>{{ cat.name }}</span>
      <span class="text-[10px] opacity-80">({{ cat.website_count }})</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { LayoutGrid, Bookmark } from '@lucide/vue';
import { useNavStore } from '../../stores/nav';
import DynamicIcon from '../common/DynamicIcon.vue';

const navStore = useNavStore();
</script>
