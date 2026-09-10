<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150"
    @click.self="close"
  >
    <div
      class="w-full max-w-xl max-h-[85vh] flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-150"
    >
      <!-- Modal Header -->
      <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <ArrowUpDown class="w-5 h-5 text-brand-600 dark:text-brand-400" />
          <h3 class="text-base font-semibold text-slate-800 dark:text-slate-100">
            排序管理中心
          </h3>
        </div>
        <button
          @click="close"
          class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Tab Switcher -->
      <div class="flex border-b border-slate-100 dark:border-slate-800 px-6 pt-3 gap-6 bg-slate-50/50 dark:bg-slate-900/50">
        <button
          @click="activeTab = 'categories'"
          :class="[
            'pb-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5',
            activeTab === 'categories'
              ? 'border-brand-500 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200',
          ]"
        >
          <Folder class="w-4 h-4" />
          <span>分类排序 ({{ localCategories.length }})</span>
        </button>
        <button
          @click="activeTab = 'websites'"
          :class="[
            'pb-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5',
            activeTab === 'websites'
              ? 'border-brand-500 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200',
          ]"
        >
          <Globe class="w-4 h-4" />
          <span>网址排序</span>
        </button>
      </div>

      <!-- Tab Content Area -->
      <div class="flex-1 overflow-y-auto p-6 space-y-4">
        <!-- TAB 1: Categories Sorting -->
        <div v-if="activeTab === 'categories'" class="space-y-3">
          <p class="text-xs text-slate-400">
            可通过右侧按钮上下移动，或直接在输入框中修改序号（数字越小越靠前）：
          </p>

          <div v-if="localCategories.length > 0" class="space-y-2">
            <div
              v-for="(cat, index) in localCategories"
              :key="cat.id"
              class="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 gap-3"
            >
              <!-- Icon & Name -->
              <div class="flex items-center gap-3 min-w-0 flex-1">
                <div class="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center text-brand-600 dark:text-brand-400 flex-shrink-0">
                  <DynamicIcon :icon="cat.icon" :size="16" custom-class="w-4 h-4" />
                </div>
                <div class="min-w-0 flex-1">
                  <h4 class="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {{ cat.name }}
                  </h4>
                </div>
              </div>

              <!-- Order Index Input & Action Buttons -->
              <div class="flex items-center gap-2">
                <div class="flex items-center gap-1">
                  <label class="text-[11px] text-slate-400">序号</label>
                  <input
                    v-model.number="cat.order_index"
                    type="number"
                    min="0"
                    class="w-16 px-2 py-1 text-center text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div class="flex items-center gap-1">
                  <button
                    type="button"
                    @click="moveCategoryItem(index, -1)"
                    :disabled="index === 0"
                    class="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 disabled:opacity-30 disabled:hover:bg-transparent"
                    title="上移"
                  >
                    <ArrowUp class="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    @click="moveCategoryItem(index, 1)"
                    :disabled="index === localCategories.length - 1"
                    class="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 disabled:opacity-30 disabled:hover:bg-transparent"
                    title="下移"
                  >
                    <ArrowDown class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8 text-xs text-slate-400">
            暂无自定义分类
          </div>
        </div>

        <!-- TAB 2: Websites Sorting -->
        <div v-else class="space-y-4">
          <!-- Category Filter inside Website Sorting -->
          <div class="flex items-center gap-2">
            <label class="text-xs font-medium text-slate-700 dark:text-slate-300">
              选择分类：
            </label>
            <select
              v-model="selectedWebsiteCatId"
              class="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
            >
              <option value="__ALL__">全部网址</option>
              <option value="__UNCAT__">未分类</option>
              <option
                v-for="c in navStore.sortedCategories"
                :key="c.id"
                :value="c.id"
              >
                {{ c.name }}
              </option>
            </select>
          </div>

          <div v-if="filteredLocalWebsites.length > 0" class="space-y-2">
            <div
              v-for="(site, index) in filteredLocalWebsites"
              :key="site.id"
              class="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 gap-3"
            >
              <div class="flex items-center gap-3 min-w-0 flex-1">
                <div class="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-500 overflow-hidden flex-shrink-0">
                  <img
                    v-if="site.icon_url"
                    :src="site.icon_url"
                    class="w-4 h-4 object-contain"
                    @error="site.icon_url = ''"
                  />
                  <span v-else>{{ site.title.charAt(0) }}</span>
                </div>
                <div class="min-w-0 flex-1">
                  <h4 class="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {{ site.title }}
                  </h4>
                  <p class="text-[11px] text-slate-400 truncate">{{ site.url }}</p>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <div class="flex items-center gap-1">
                  <label class="text-[11px] text-slate-400">序号</label>
                  <input
                    v-model.number="site.order_index"
                    type="number"
                    min="0"
                    class="w-16 px-2 py-1 text-center text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div class="flex items-center gap-1">
                  <button
                    type="button"
                    @click="moveWebsiteItem(index, -1)"
                    :disabled="index === 0"
                    class="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 disabled:opacity-30 disabled:hover:bg-transparent"
                    title="上移"
                  >
                    <ArrowUp class="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    @click="moveWebsiteItem(index, 1)"
                    :disabled="index === filteredLocalWebsites.length - 1"
                    class="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 disabled:opacity-30 disabled:hover:bg-transparent"
                    title="下移"
                  >
                    <ArrowDown class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8 text-xs text-slate-400">
            当前分类下暂无网址
          </div>
        </div>

        <!-- Success or error message -->
        <div v-if="statusMsg" class="p-3 text-xs rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400">
          {{ statusMsg }}
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
        <button
          type="button"
          @click="autoReindex"
          class="text-xs text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 underline"
        >
          按当前列表重置为连续序号 (0, 1, 2...)
        </button>

        <div class="flex items-center gap-3">
          <button
            type="button"
            @click="close"
            class="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            关闭
          </button>
          <button
            type="button"
            @click="saveChanges"
            :disabled="saving"
            class="px-5 py-2 text-xs font-medium text-white bg-brand-600 hover:bg-brand-500 disabled:opacity-50 rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Loader2 v-if="saving" class="w-3.5 h-3.5 animate-spin" />
            <span>保存排序</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { ArrowUpDown, X, Folder, Globe, ArrowUp, ArrowDown, Loader2 } from '@lucide/vue';
import { useNavStore } from '../../stores/nav';
import type { Category, Website } from '../../types';
import DynamicIcon from '../common/DynamicIcon.vue';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const navStore = useNavStore();
const activeTab = ref<'categories' | 'websites'>('categories');
const selectedWebsiteCatId = ref<string>('__ALL__');
const saving = ref(false);
const statusMsg = ref('');

const localCategories = ref<Category[]>([]);
const localWebsites = ref<Website[]>([]);

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      statusMsg.value = '';
      localCategories.value = JSON.parse(JSON.stringify(navStore.sortedCategories));
      localWebsites.value = JSON.parse(JSON.stringify(navStore.sortedWebsites));
    }
  }
);

const filteredLocalWebsites = computed(() => {
  if (selectedWebsiteCatId.value === '__ALL__') {
    return localWebsites.value;
  }
  if (selectedWebsiteCatId.value === '__UNCAT__') {
    return localWebsites.value.filter(w => !w.category_id);
  }
  return localWebsites.value.filter(w => w.category_id === selectedWebsiteCatId.value);
});

function moveCategoryItem(index: number, direction: -1 | 1) {
  const target = index + direction;
  if (target < 0 || target >= localCategories.value.length) return;

  const current = localCategories.value[index];
  const sibling = localCategories.value[target];

  // Swap order_index
  const temp = current.order_index;
  current.order_index = sibling.order_index;
  sibling.order_index = temp;

  // Swap array elements
  localCategories.value[index] = sibling;
  localCategories.value[target] = current;
}

function moveWebsiteItem(index: number, direction: -1 | 1) {
  const list = filteredLocalWebsites.value;
  const target = index + direction;
  if (target < 0 || target >= list.length) return;

  const current = list[index];
  const sibling = list[target];

  const temp = current.order_index;
  current.order_index = sibling.order_index;
  sibling.order_index = temp;

  // Find index in main localWebsites
  const curIdxInAll = localWebsites.value.findIndex(w => w.id === current.id);
  const sibIdxInAll = localWebsites.value.findIndex(w => w.id === sibling.id);

  if (curIdxInAll !== -1 && sibIdxInAll !== -1) {
    localWebsites.value[curIdxInAll].order_index = current.order_index;
    localWebsites.value[sibIdxInAll].order_index = sibling.order_index;
  }
}

function autoReindex() {
  if (activeTab.value === 'categories') {
    localCategories.value.forEach((cat, i) => {
      cat.order_index = i;
    });
  } else {
    filteredLocalWebsites.value.forEach((site, i) => {
      site.order_index = i;
      const original = localWebsites.value.find(w => w.id === site.id);
      if (original) original.order_index = i;
    });
  }
  statusMsg.value = '序号已重置，请点击“保存排序”';
}

async function saveChanges() {
  try {
    saving.value = true;
    statusMsg.value = '';

    if (activeTab.value === 'categories') {
      // Sort and save
      localCategories.value.sort((a, b) => a.order_index - b.order_index);
      for (const cat of localCategories.value) {
        await navStore.updateCategory(cat.id, { order_index: cat.order_index });
      }
      statusMsg.value = '分类排序已成功保存！';
    } else {
      localWebsites.value.sort((a, b) => a.order_index - b.order_index);
      for (const site of localWebsites.value) {
        await navStore.updateWebsite(site.id, { order_index: site.order_index });
      }
      statusMsg.value = '网址排序已成功保存！';
    }

    setTimeout(() => {
      statusMsg.value = '';
    }, 2000);
  } catch (err: any) {
    statusMsg.value = '保存排序出错: ' + err.message;
  } finally {
    saving.value = false;
  }
}

function close() {
  emit('close');
}
</script>
