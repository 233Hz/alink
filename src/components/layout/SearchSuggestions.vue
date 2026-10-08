<template>
  <div
    v-if="isOpen && totalItemCount > 0"
    class="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-black border-2 border-black dark:border-white rounded-none shadow-none z-50 max-h-[65vh] sm:max-h-[460px] overflow-y-auto select-none"
  >
    <!-- 1. 输入内容为空时：展示搜索历史（或常用快捷网址） -->
    <template v-if="!query.trim()">
      <!-- 搜索历史 -->
      <div v-if="historyList.length > 0">
        <div
          class="px-3 py-1.5 bg-gray-100 dark:bg-[#161616] text-[10px] font-mono font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center justify-between border-b border-black/15 dark:border-white/15"
        >
          <div class="flex items-center gap-1.5">
            <History class="w-3 h-3" />
            <span>搜索历史</span>
          </div>
          <button
            type="button"
            @click.stop="emit('clear-history')"
            class="hover:text-black dark:hover:text-white hover:underline transition-colors cursor-pointer"
          >
            清空历史
          </button>
        </div>

        <div class="divide-y divide-black/10 dark:divide-white/10">
          <div
            v-for="(item, idx) in historyList"
            :key="'hist-' + item"
            @click="emit('select-query', item)"
            @mouseenter="emit('set-highlight', idx)"
            class="px-3 py-2 flex items-center justify-between gap-2 text-xs sm:text-sm cursor-pointer transition-colors"
            :class="[
              highlightedIndex === idx
                ? 'bg-black text-white dark:bg-white dark:text-black'
                : 'hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black',
            ]"
          >
            <div class="flex items-center gap-2 min-w-0 flex-1">
              <History class="w-3.5 h-3.5 flex-shrink-0 opacity-60" />
              <span class="truncate font-medium">{{ item }}</span>
            </div>
            <button
              type="button"
              @click.stop="emit('delete-history', item)"
              class="p-1 opacity-60 hover:opacity-100 hover:text-[#ff3366] transition-opacity flex-shrink-0"
              title="删除此条记录"
            >
              <X class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <!-- 如果没有历史记录：展示站内快捷直达 -->
      <div v-else-if="quickSites.length > 0">
        <div
          class="px-3 py-1.5 bg-gray-100 dark:bg-[#161616] text-[10px] font-mono font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center justify-between border-b border-black/15 dark:border-white/15"
        >
          <div class="flex items-center gap-1.5">
            <Globe class="w-3 h-3" />
            <span>快捷直达 · 常用网址</span>
          </div>
          <span>共 {{ quickSites.length }} 个</span>
        </div>

        <div class="divide-y divide-black/10 dark:divide-white/10">
          <div
            v-for="(site, idx) in quickSites"
            :key="'quick-' + site.id"
            @click="emit('select-website', site)"
            @mouseenter="emit('set-highlight', idx)"
            class="px-3 py-2 flex items-center justify-between gap-2 text-xs sm:text-sm cursor-pointer transition-colors"
            :class="[
              highlightedIndex === idx
                ? 'bg-black text-white dark:bg-white dark:text-black'
                : 'hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black',
            ]"
          >
            <div class="flex items-center gap-2.5 min-w-0 flex-1">
              <WebsiteIcon
                :url="site.url"
                :icon-url="site.icon_url"
                :title="site.title"
                icon-class="w-4 h-4 flex-shrink-0"
                img-class="w-4 h-4 object-contain"
              />
              <span class="font-bold truncate">{{ site.title }}</span>
              <span class="text-[11px] font-mono opacity-60 truncate hidden sm:inline">
                {{ formatSiteDomain(site.url) }}
              </span>
            </div>
            <div class="flex items-center gap-2 flex-shrink-0">
              <span
                v-if="site.categoryName"
                class="text-[10px] font-mono px-1 py-0.5 border border-current uppercase opacity-70"
              >
                {{ site.categoryName }}
              </span>
              <ExternalLink class="w-3.5 h-3.5 opacity-60" />
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- 2. 输入内容非空时：展示匹配结果与联想词 -->
    <template v-else>
      <!-- 站内匹配网址 -->
      <div v-if="matchedWebsites.length > 0">
        <div
          class="px-3 py-1.5 bg-gray-100 dark:bg-[#161616] text-[10px] font-mono font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center justify-between border-b border-black/15 dark:border-white/15"
        >
          <div class="flex items-center gap-1.5">
            <Globe class="w-3 h-3" />
            <span>站内网址直达</span>
          </div>
          <span class="text-[10px] font-mono">匹配 {{ matchedWebsites.length }} 项</span>
        </div>

        <div class="divide-y divide-black/10 dark:divide-white/10">
          <div
            v-for="(site, idx) in matchedWebsites"
            :key="'site-' + site.id"
            @click="emit('select-website', site)"
            @mouseenter="emit('set-highlight', idx)"
            class="px-3 py-2 flex items-center justify-between gap-2 text-xs sm:text-sm cursor-pointer transition-colors"
            :class="[
              highlightedIndex === idx
                ? 'bg-black text-white dark:bg-white dark:text-black'
                : 'hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black',
            ]"
          >
            <div class="flex items-center gap-2.5 min-w-0 flex-1">
              <WebsiteIcon
                :url="site.url"
                :icon-url="site.icon_url"
                :title="site.title"
                icon-class="w-4 h-4 flex-shrink-0"
                img-class="w-4 h-4 object-contain"
              />
              <span class="font-bold truncate">{{ site.title }}</span>
              <span class="text-[11px] font-mono opacity-60 truncate hidden sm:inline">
                {{ formatSiteDomain(site.url) }}
              </span>
            </div>
            <div class="flex items-center gap-2 flex-shrink-0">
              <span
                v-if="site.categoryName"
                class="text-[10px] font-mono px-1 py-0.5 border border-current uppercase opacity-70"
              >
                {{ site.categoryName }}
              </span>
              <ExternalLink class="w-3.5 h-3.5 opacity-60" />
            </div>
          </div>
        </div>
      </div>

      <!-- 站内匹配分类 -->
      <div v-if="matchedCategories.length > 0">
        <div
          class="px-3 py-1.5 bg-gray-100 dark:bg-[#161616] text-[10px] font-mono font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center justify-between border-b border-black/15 dark:border-white/15"
          :class="{ 'border-t-2 border-black dark:border-white': matchedWebsites.length > 0 }"
        >
          <div class="flex items-center gap-1.5">
            <Folder class="w-3 h-3" />
            <span>分类筛选</span>
          </div>
          <span class="text-[10px] font-mono">直达分类</span>
        </div>

        <div class="divide-y divide-black/10 dark:divide-white/10">
          <div
            v-for="(cat, idx) in matchedCategories"
            :key="'cat-' + cat.id"
            @click="emit('select-category', cat)"
            @mouseenter="emit('set-highlight', matchedWebsites.length + idx)"
            class="px-3 py-2 flex items-center justify-between gap-2 text-xs sm:text-sm cursor-pointer transition-colors"
            :class="[
              highlightedIndex === matchedWebsites.length + idx
                ? 'bg-black text-white dark:bg-white dark:text-black'
                : 'hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black',
            ]"
          >
            <div class="flex items-center gap-2 min-w-0 flex-1">
              <Folder class="w-3.5 h-3.5 flex-shrink-0 opacity-70" />
              <span class="font-bold truncate">{{ cat.name }}</span>
              <span class="text-[11px] font-mono opacity-60">({{ cat.count }} 个网址)</span>
            </div>
            <span class="text-[10px] font-mono px-1.5 py-0.5 border border-current uppercase opacity-70">
              切换分类
            </span>
          </div>
        </div>
      </div>

      <!-- 搜索引擎联想建议 -->
      <div v-if="webSuggestions.length > 0">
        <div
          class="px-3 py-1.5 bg-gray-100 dark:bg-[#161616] text-[10px] font-mono font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center justify-between border-b border-black/15 dark:border-white/15"
          :class="{
            'border-t-2 border-black dark:border-white':
              matchedWebsites.length > 0 || matchedCategories.length > 0,
          }"
        >
          <div class="flex items-center gap-1.5">
            <Search class="w-3 h-3" />
            <span>搜索联想 · {{ engineName }}</span>
          </div>
          <span class="text-[10px] font-mono">实时联想</span>
        </div>

        <div class="divide-y divide-black/10 dark:divide-white/10">
          <div
            v-for="(text, idx) in webSuggestions"
            :key="'web-' + text"
            @click="emit('select-query', text)"
            @mouseenter="
              emit('set-highlight', matchedWebsites.length + matchedCategories.length + idx)
            "
            class="px-3 py-2 flex items-center justify-between gap-2 text-xs sm:text-sm cursor-pointer transition-colors"
            :class="[
              highlightedIndex === matchedWebsites.length + matchedCategories.length + idx
                ? 'bg-black text-white dark:bg-white dark:text-black'
                : 'hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black',
            ]"
          >
            <div class="flex items-center gap-2 min-w-0 flex-1">
              <Search class="w-3.5 h-3.5 flex-shrink-0 opacity-60" />
              <span class="font-medium truncate">{{ text }}</span>
            </div>
            <button
              type="button"
              @click.stop="emit('fill-query', text)"
              class="p-1 opacity-50 hover:opacity-100 transition-opacity flex-shrink-0"
              title="填入搜索框"
            >
              <CornerDownLeft class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- 底部操作提示 -->
    <div
      class="px-3 py-1.5 bg-gray-50 dark:bg-[#111] border-t-2 border-black dark:border-white flex items-center justify-between text-[10px] font-mono text-gray-500 dark:text-gray-400"
    >
      <div class="flex items-center gap-2 sm:gap-3">
        <span><kbd class="font-bold">↑↓</kbd> 选择</span>
        <span><kbd class="font-bold">Enter</kbd> 直达/搜索</span>
        <span><kbd class="font-bold">Esc</kbd> 关闭</span>
      </div>
      <span class="hidden sm:inline font-mono">ALink 智能联想</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
  History,
  Globe,
  Folder,
  Search,
  X,
  ExternalLink,
  CornerDownLeft,
} from '@lucide/vue';
import WebsiteIcon from '../common/WebsiteIcon.vue';
import { extractDomain } from '../../utils';
import type {
  MatchedSiteSuggestion,
  MatchedCategorySuggestion,
  SuggestionItem,
} from '../../utils/searchSuggestions';

const props = withDefaults(
  defineProps<{
    isOpen: boolean;
    query: string;
    engineName: string;
    historyList?: string[];
    quickSites?: MatchedSiteSuggestion[];
    matchedWebsites?: MatchedSiteSuggestion[];
    matchedCategories?: MatchedCategorySuggestion[];
    webSuggestions?: string[];
    highlightedIndex: number;
  }>(),
  {
    isOpen: false,
    query: '',
    engineName: '必应',
    historyList: () => [],
    quickSites: () => [],
    matchedWebsites: () => [],
    matchedCategories: () => [],
    webSuggestions: () => [],
    highlightedIndex: -1,
  }
);

const emit = defineEmits<{
  (e: 'select-website', site: MatchedSiteSuggestion): void;
  (e: 'select-category', category: MatchedCategorySuggestion): void;
  (e: 'select-query', query: string): void;
  (e: 'fill-query', query: string): void;
  (e: 'delete-history', query: string): void;
  (e: 'clear-history'): void;
  (e: 'set-highlight', index: number): void;
}>();

function formatSiteDomain(url: string): string {
  return extractDomain(url);
}

/**
 * 展平所有可键盘高亮交互的条目列表
 */
const flattenedItems = computed<SuggestionItem[]>(() => {
  if (!props.query.trim()) {
    if (props.historyList.length > 0) {
      return props.historyList.map((q) => ({ type: 'history' as const, query: q }));
    }
    return props.quickSites;
  }

  const items: SuggestionItem[] = [];
  items.push(...props.matchedWebsites);
  items.push(...props.matchedCategories);
  props.webSuggestions.forEach((q) => items.push({ type: 'web' as const, query: q }));
  return items;
});

const totalItemCount = computed(() => flattenedItems.value.length);

function getSelectedItem(): SuggestionItem | null {
  if (props.highlightedIndex < 0 || props.highlightedIndex >= flattenedItems.value.length) {
    return null;
  }
  return flattenedItems.value[props.highlightedIndex];
}

function getItemCount(): number {
  return flattenedItems.value.length;
}

defineExpose({
  getSelectedItem,
  getItemCount,
});
</script>
