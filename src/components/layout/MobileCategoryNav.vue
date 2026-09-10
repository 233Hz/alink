<template>
  <div class="md:hidden sticky top-16 z-30 bg-white dark:bg-black border-b-2 border-black dark:border-white px-4 py-2.5 overflow-x-auto no-scrollbar flex items-center gap-2">
    <!-- ALL Pill -->
    <button
      @click="navStore.activeCategoryId = 'ALL'"
      :class="[
        'flex-shrink-0 px-3 py-1 border-2 border-black dark:border-white text-xs font-bold uppercase tracking-wider rounded-none transition-colors flex items-center gap-1.5',
        navStore.activeCategoryId === 'ALL'
          ? 'bg-black text-white dark:bg-white dark:text-black'
          : 'bg-white text-black dark:bg-black dark:text-white hover:bg-black hover:text-white',
      ]"
    >
      <LayoutGrid class="w-3.5 h-3.5" />
      <span>全部</span>
      <span class="font-mono text-[10px]">({{ navStore.totalWebsitesCount }})</span>
    </button>

    <!-- UNCATEGORIZED Pill -->
    <button
      v-if="navStore.uncategorizedCount > 0"
      @click="navStore.activeCategoryId = 'UNCATEGORIZED'"
      :class="[
        'flex-shrink-0 px-3 py-1 border-2 border-black dark:border-white text-xs font-bold uppercase tracking-wider rounded-none transition-colors flex items-center gap-1.5',
        navStore.activeCategoryId === 'UNCATEGORIZED'
          ? 'bg-black text-white dark:bg-white dark:text-black'
          : 'bg-white text-black dark:bg-black dark:text-white hover:bg-black hover:text-white',
      ]"
    >
      <Bookmark class="w-3.5 h-3.5" />
      <span>未分类</span>
      <span class="font-mono text-[10px]">({{ navStore.uncategorizedCount }})</span>
    </button>

    <!-- Categories Pills -->
    <button
      v-for="cat in navStore.categoriesWithCounts"
      :key="cat.id"
      @click="navStore.activeCategoryId = cat.id"
      :class="[
        'flex-shrink-0 px-3 py-1 border-2 border-black dark:border-white text-xs font-bold uppercase tracking-wider rounded-none transition-colors flex items-center gap-1.5',
        navStore.activeCategoryId === cat.id
          ? 'bg-black text-white dark:bg-white dark:text-black'
          : 'bg-white text-black dark:bg-black dark:text-white hover:bg-black hover:text-white',
      ]"
    >
      <DynamicIcon :icon="cat.icon" :size="14" custom-class="w-3.5 h-3.5" />
      <span>{{ cat.name }}</span>
      <span class="font-mono text-[10px]">({{ cat.website_count }})</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { LayoutGrid, Bookmark } from '@lucide/vue';
import { useNavStore } from '../../stores/nav';
import DynamicIcon from '../common/DynamicIcon.vue';

const navStore = useNavStore();
</script>
