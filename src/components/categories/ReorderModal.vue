<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
    @click.self="close"
  >
    <div
      class="w-full max-w-2xl max-h-[85vh] flex flex-col bg-white dark:bg-black text-black dark:text-white border-2 border-black dark:border-white rounded-none overflow-hidden"
    >
      <!-- Modal Header -->
      <div class="px-6 py-4 border-b-2 border-black dark:border-white flex items-center justify-between">
        <div class="flex items-center gap-2">
          <ArrowUpDown class="w-5 h-5" />
          <h3 class="text-base font-bold tracking-tight uppercase">
            排序管理中心
          </h3>
        </div>
        <button
          @click="close"
          class="p-1 border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Tab Switcher -->
      <div class="flex border-b-2 border-black dark:border-white px-6 pt-4 gap-4 bg-white dark:bg-black">
        <button
          @click="activeTab = 'categories'"
          :class="[
            'px-5 py-2 text-xs font-bold uppercase tracking-wider border-2 border-b-0 rounded-none transition-colors flex items-center gap-2 -mb-[2px]',
            activeTab === 'categories'
              ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
              : 'border-transparent text-gray-500 hover:text-black dark:hover:text-white',
          ]"
        >
          <Folder class="w-4 h-4" />
          <span>分类排序 ({{ localCategories.length }})</span>
        </button>
        <button
          @click="activeTab = 'websites'"
          :class="[
            'px-5 py-2 text-xs font-bold uppercase tracking-wider border-2 border-b-0 rounded-none transition-colors flex items-center gap-2 -mb-[2px]',
            activeTab === 'websites'
              ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
              : 'border-transparent text-gray-500 hover:text-black dark:hover:text-white',
          ]"
        >
          <Globe class="w-4 h-4" />
          <span>网址排序</span>
        </button>
      </div>

      <!-- Tab Content Area -->
      <div class="flex-1 overflow-y-auto p-6 space-y-4">
        <!-- TAB 1: Categories Sorting -->
        <div v-if="activeTab === 'categories'" class="space-y-4">
          <p class="text-xs font-mono text-gray-500">
            可通过按钮上下移动，或直接修改序号调整顺序（数字越小越靠前）：
          </p>

          <div v-if="localCategories.length > 0" class="space-y-2">
            <div
              v-for="(cat, index) in localCategories"
              :key="cat.id"
              class="flex items-center justify-between p-3 border-2 border-black dark:border-white bg-white dark:bg-black gap-3 rounded-none"
            >
              <!-- Icon & Name -->
              <div class="flex items-center gap-3 min-w-0 flex-1">
                <div class="w-8 h-8 border border-black dark:border-white flex items-center justify-center rounded-none flex-shrink-0">
                  <DynamicIcon :icon="cat.icon" :size="16" custom-class="w-4 h-4" />
                </div>
                <div class="min-w-0 flex-1">
                  <h4 class="text-sm font-bold truncate">
                    {{ cat.name }}
                  </h4>
                </div>
              </div>

              <!-- Order Index Input & Action Buttons -->
              <div class="flex items-center gap-2 flex-shrink-0">
                <div class="flex items-center gap-1.5">
                  <label class="text-[11px] font-mono text-gray-500 uppercase">序号</label>
                  <input
                    v-model.number="cat.order_index"
                    type="number"
                    min="0"
                    class="w-14 sm:w-16 px-1.5 sm:px-2 py-1 text-center text-xs border-2 border-black dark:border-white bg-transparent rounded-none focus:outline-none focus:border-[#ff3366]"
                  />
                </div>

                <div class="flex items-center gap-1">
                  <button
                    type="button"
                    @click="moveCategoryItem(index, -1)"
                    :disabled="index === 0"
                    class="p-1 border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black disabled:opacity-20 transition-colors"
                    title="上移"
                  >
                    <ArrowUp class="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    @click="moveCategoryItem(index, 1)"
                    :disabled="index === localCategories.length - 1"
                    class="p-1 border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black disabled:opacity-20 transition-colors"
                    title="下移"
                  >
                    <ArrowDown class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8 text-xs font-mono text-gray-500">
            暂无自定义分类
          </div>
        </div>

        <!-- TAB 2: Websites Sorting -->
        <div v-else class="space-y-4">
          <!-- Category Filter inside Website Sorting -->
          <div class="flex items-center gap-3">
            <label class="text-xs font-bold uppercase tracking-wider">
              选择分类：
            </label>
            <select
              v-model="selectedWebsiteCatId"
              class="border-2 border-black dark:border-white px-3 py-1.5 text-xs bg-transparent rounded-none focus:outline-none focus:border-[#ff3366]"
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
              class="flex items-center justify-between p-3 border-2 border-black dark:border-white bg-white dark:bg-black gap-3 rounded-none"
            >
              <div class="flex items-center gap-3 min-w-0 flex-1">
                <div class="w-8 h-8 border border-black dark:border-white flex items-center justify-center overflow-hidden flex-shrink-0 bg-white">
                  <img
                    v-if="site.icon_url"
                    :src="site.icon_url"
                    class="w-5 h-5 object-contain"
                    @error="site.icon_url = ''"
                  />
                  <GeneratedIcon
                    v-else
                    :seed="site.title + ' ' + (site.url || site.id)"
                    custom-class="w-5 h-5"
                  />
                </div>
                <div class="min-w-0 flex-1">
                  <h4 class="text-xs font-bold truncate">
                    {{ site.title }}
                  </h4>
                  <p class="text-[11px] font-mono text-gray-500 truncate">{{ site.url }}</p>
                </div>
              </div>

              <div class="flex items-center gap-2 flex-shrink-0">
                <div class="flex items-center gap-1.5">
                  <label class="text-[11px] font-mono text-gray-500 uppercase">序号</label>
                  <input
                    v-model.number="site.order_index"
                    type="number"
                    min="0"
                    class="w-14 sm:w-16 px-1.5 sm:px-2 py-1 text-center text-xs border-2 border-black dark:border-white bg-transparent rounded-none focus:outline-none focus:border-[#ff3366]"
                  />
                </div>

                <div class="flex items-center gap-1">
                  <button
                    type="button"
                    @click="moveWebsiteItem(index, -1)"
                    :disabled="index === 0"
                    class="p-1 border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black disabled:opacity-20 transition-colors"
                    title="上移"
                  >
                    <ArrowUp class="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    @click="moveWebsiteItem(index, 1)"
                    :disabled="index === filteredLocalWebsites.length - 1"
                    class="p-1 border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black disabled:opacity-20 transition-colors"
                    title="下移"
                  >
                    <ArrowDown class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8 text-xs font-mono text-gray-500">
            当前分类下暂无网址
          </div>
        </div>

        <!-- Success or error message -->
        <div v-if="statusMsg" class="p-3 text-xs font-mono font-bold text-white bg-black dark:bg-white dark:text-black border-2 border-black dark:border-white rounded-none">
          {{ statusMsg }}
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="px-4 sm:px-6 py-3 sm:py-4 border-t-2 border-black dark:border-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-black">
        <div class="flex items-center gap-2.5 text-xs font-mono self-start sm:self-center">
          <button
            type="button"
            @click="autoReindex"
            class="underline hover:text-[#ff3366] transition-colors whitespace-nowrap"
          >
            连续重置 (0, 1, 2...)
          </button>
          <span class="text-gray-400 dark:text-gray-600">/</span>
          <button
            type="button"
            @click="sortByInputOrder"
            class="underline hover:text-[#ff3366] transition-colors whitespace-nowrap"
          >
            按输入序号重排
          </button>
        </div>

        <div class="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          <button
            type="button"
            @click="close"
            class="flex-1 sm:flex-initial border-2 border-black dark:border-white px-4 py-2 sm:px-6 sm:py-2.5 text-xs font-bold uppercase tracking-wider bg-white text-black dark:bg-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors rounded-none whitespace-nowrap text-center"
          >
            关闭
          </button>
          <button
            type="button"
            @click="saveChanges"
            :disabled="saving"
            class="flex-1 sm:flex-initial border-2 border-black dark:border-white px-4 py-2 sm:px-6 sm:py-2.5 text-xs font-bold uppercase tracking-wider bg-black text-white dark:bg-white dark:text-black hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white disabled:opacity-50 transition-colors rounded-none flex items-center justify-center gap-2 whitespace-nowrap text-center"
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
import GeneratedIcon from '../common/GeneratedIcon.vue';

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

  let currentOrder = current.order_index;
  let siblingOrder = sibling.order_index;

  if (currentOrder === siblingOrder) {
    if (direction === -1) {
      currentOrder = Math.max(0, siblingOrder - 1);
    } else {
      currentOrder = siblingOrder + 1;
    }
  } else {
    const temp = currentOrder;
    currentOrder = siblingOrder;
    siblingOrder = temp;
  }

  current.order_index = currentOrder;
  sibling.order_index = siblingOrder;

  const newCategories = [...localCategories.value];
  newCategories[index] = sibling;
  newCategories[target] = current;
  localCategories.value = newCategories;
}

function moveWebsiteItem(index: number, direction: -1 | 1) {
  const list = filteredLocalWebsites.value;
  const target = index + direction;
  if (target < 0 || target >= list.length) return;

  const current = list[index];
  const sibling = list[target];

  const curIdxInAll = localWebsites.value.findIndex(w => w.id === current.id);
  const sibIdxInAll = localWebsites.value.findIndex(w => w.id === sibling.id);

  if (curIdxInAll === -1 || sibIdxInAll === -1) return;

  let currentOrder = current.order_index;
  let siblingOrder = sibling.order_index;

  if (currentOrder === siblingOrder) {
    if (direction === -1) {
      currentOrder = Math.max(0, siblingOrder - 1);
    } else {
      currentOrder = siblingOrder + 1;
    }
  } else {
    const temp = currentOrder;
    currentOrder = siblingOrder;
    siblingOrder = temp;
  }

  current.order_index = currentOrder;
  sibling.order_index = siblingOrder;

  // Crucial: Swap the actual elements in localWebsites.value so the rows visually move
  const newWebsites = [...localWebsites.value];
  newWebsites[curIdxInAll] = sibling;
  newWebsites[sibIdxInAll] = current;
  localWebsites.value = newWebsites;
}

function sortByInputOrder() {
  if (activeTab.value === 'categories') {
    localCategories.value = [...localCategories.value].sort((a, b) => a.order_index - b.order_index);
  } else {
    localWebsites.value = [...localWebsites.value].sort((a, b) => a.order_index - b.order_index);
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
    statusMsg.value = '保存出错: ' + err.message;
  } finally {
    saving.value = false;
  }
}

function close() {
  emit('close');
}
</script>
