<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
    @click.self="close"
  >
    <div
      class="w-full max-w-2xl h-[82vh] sm:h-[85vh] max-h-[660px] sm:max-h-[720px] min-h-[460px] flex flex-col bg-white dark:bg-black text-black dark:text-white border-2 border-black dark:border-white rounded-none overflow-hidden"
    >
      <!-- Modal Header -->
      <div class="px-4 sm:px-6 py-3.5 sm:py-4 border-b-2 border-black dark:border-white flex items-center justify-between flex-shrink-0">
        <div class="flex items-center gap-2">
          <ArrowUpDown class="w-5 h-5" />
          <h3 class="text-base font-bold tracking-tight uppercase">
            排序管理中心
          </h3>
        </div>
        <button
          @click="close"
          class="p-1 border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
          title="关闭"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Tab Switcher -->
      <div class="flex border-b-2 border-black dark:border-white px-4 sm:px-6 pt-3 sm:pt-4 gap-3 sm:gap-4 bg-white dark:bg-black flex-shrink-0">
        <button
          @click="activeTab = 'categories'"
          :class="[
            'px-4 sm:px-5 py-2 text-xs font-bold uppercase tracking-wider border-2 border-b-0 rounded-none transition-colors flex items-center gap-2 -mb-[2px]',
            activeTab === 'categories'
              ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
              : 'border-transparent text-gray-500 hover:text-black dark:hover:text-white',
          ]"
        >
          <Folder class="w-4 h-4" />
          <span>分类拖拽排序 ({{ localCategories.length }})</span>
        </button>
        <button
          @click="activeTab = 'websites'"
          :class="[
            'px-4 sm:px-5 py-2 text-xs font-bold uppercase tracking-wider border-2 border-b-0 rounded-none transition-colors flex items-center gap-2 -mb-[2px]',
            activeTab === 'websites'
              ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
              : 'border-transparent text-gray-500 hover:text-black dark:hover:text-white',
          ]"
        >
          <Globe class="w-4 h-4" />
          <span>网址拖拽排序</span>
        </button>
      </div>

      <!-- Pinned Notification Banner -->
      <div
        v-if="statusMsg"
        class="px-4 sm:px-6 py-2.5 bg-black text-white dark:bg-white dark:text-black font-bold font-mono text-xs border-b-2 border-black dark:border-white flex items-center justify-between z-20 flex-shrink-0"
      >
        <div class="flex items-center gap-2 min-w-0">
          <CheckCircle2 v-if="!isErrorStatus" class="w-4 h-4 text-[#ff3366] flex-shrink-0" />
          <AlertCircle v-else class="w-4 h-4 text-[#ff3366] flex-shrink-0" />
          <span class="truncate">{{ statusMsg }}</span>
        </div>
        <button
          type="button"
          @click="statusMsg = ''"
          class="p-0.5 hover:text-[#ff3366] transition-colors ml-2"
          title="关闭提示"
        >
          <X class="w-3.5 h-3.5" />
        </button>
      </div>

      <!-- Category Filter Bar (Websites Tab Only) -->
      <div
        v-if="activeTab === 'websites'"
        class="px-4 sm:px-6 py-2.5 sm:py-3 border-b-2 border-black dark:border-white bg-gray-50 dark:bg-neutral-900 flex items-center justify-between gap-3 flex-shrink-0 relative z-30"
      >
        <div class="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <label class="text-xs font-bold uppercase tracking-wider flex-shrink-0">
            选择分类：
          </label>
          <div class="relative" ref="catDropdownRef">
            <button
              type="button"
              @click.stop="isCatDropdownOpen = !isCatDropdownOpen"
              class="border-2 border-black dark:border-white bg-white dark:bg-black text-black dark:text-white px-3 py-1.5 text-xs font-bold flex items-center justify-between gap-3 min-w-[140px] sm:min-w-[190px] rounded-none transition-colors select-none focus:outline-none"
              :class="{ 'bg-black text-white dark:bg-white dark:text-black': isCatDropdownOpen }"
            >
              <div class="flex items-center gap-2 min-w-0 truncate">
                <DynamicIcon
                  v-if="currentSelectedCategory"
                  :icon="currentSelectedCategory.icon"
                  :size="14"
                  custom-class="w-3.5 h-3.5 flex-shrink-0"
                />
                <span class="truncate">
                  {{ currentSelectedCategory ? currentSelectedCategory.name : '暂无分类' }}
                </span>
              </div>
              <ChevronDown
                class="w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200"
                :class="{ 'rotate-180': isCatDropdownOpen }"
              />
            </button>

            <!-- Invisible backdrop -->
            <div
              v-if="isCatDropdownOpen"
              class="fixed inset-0 z-40 bg-transparent"
              @click="isCatDropdownOpen = false"
              @touchstart.passive="isCatDropdownOpen = false"
            />

            <!-- Dropdown Menu -->
            <div
              v-if="isCatDropdownOpen"
              @click.stop
              class="absolute left-0 top-full mt-1.5 w-full min-w-[180px] sm:min-w-[210px] max-h-60 overflow-y-auto bg-white dark:bg-black text-black dark:text-white border-2 border-black dark:border-white rounded-none z-50 py-1 shadow-none"
            >
              <button
                v-for="c in navStore.sortedCategories"
                :key="c.id"
                type="button"
                @click="selectCategory(c.id)"
                :class="[
                  'w-full px-3 py-2 text-left text-xs font-bold flex items-center justify-between gap-2 transition-colors duration-150',
                  c.id === selectedWebsiteCatId
                    ? 'bg-black text-white dark:bg-white dark:text-black'
                    : 'hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black',
                ]"
              >
                <div class="flex items-center gap-2 min-w-0 truncate">
                  <DynamicIcon :icon="c.icon" :size="14" custom-class="w-3.5 h-3.5 flex-shrink-0" />
                  <span class="truncate">{{ c.name }}</span>
                </div>
                <Check v-if="c.id === selectedWebsiteCatId" class="w-3.5 h-3.5 flex-shrink-0 text-[#ff3366]" />
              </button>
              <div v-if="navStore.sortedCategories.length === 0" class="px-3 py-2 text-xs font-mono text-gray-500 text-center">
                暂无自定义分类
              </div>
            </div>
          </div>
        </div>

        <span class="text-xs font-mono text-gray-500 flex-shrink-0">
          共 {{ filteredLocalWebsites.length }} 项
        </span>
      </div>

      <!-- Tab Content Area -->
      <div class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        <!-- TAB 1: Categories Drag Sorting -->
        <div v-if="activeTab === 'categories'" class="space-y-4">
          <p class="text-xs font-mono text-gray-500">
            按住左侧把手拖动可调整分类顺序，支持 PC 鼠标与移动端触摸：
          </p>

          <div v-if="localCategories.length > 0" ref="categoriesListRef" class="space-y-2">
            <div
              v-for="(cat, index) in localCategories"
              :key="cat.id"
              :data-id="cat.id"
              class="group flex items-center justify-between p-2.5 sm:p-3 border-2 border-black dark:border-white bg-white dark:bg-black gap-2 sm:gap-3 rounded-none transition-colors"
            >
              <!-- Left: Drag Handle, Number Badge, Icon, Name -->
              <div class="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
                <div
                  class="drag-handle cursor-grab active:cursor-grabbing p-1.5 border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black rounded-none flex items-center justify-center flex-shrink-0 transition-colors touch-none"
                  title="按住拖拽调整顺序"
                >
                  <GripVertical class="w-4 h-4" />
                </div>

                <span
                  class="text-xs font-mono font-bold px-1.5 py-0.5 border border-black dark:border-white bg-gray-50 dark:bg-neutral-900 rounded-none whitespace-nowrap flex-shrink-0"
                >
                  #{{ index + 1 }}
                </span>

                <div class="w-7 h-7 sm:w-8 sm:h-8 border border-black dark:border-white flex items-center justify-center rounded-none flex-shrink-0 bg-white">
                  <DynamicIcon :icon="cat.icon" :size="16" custom-class="w-4 h-4" />
                </div>

                <div class="min-w-0 flex-1">
                  <h4 class="text-xs sm:text-sm font-bold truncate">
                    {{ cat.name }}
                  </h4>
                </div>
              </div>

              <!-- Right: Count -->
              <div class="flex items-center gap-2 flex-shrink-0">
                <span class="text-[11px] font-mono text-gray-500 border border-black/20 dark:border-white/20 px-2 py-0.5 rounded-none">
                  {{ getCategoryWebsiteCount(cat.id) }} 个网址
                </span>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-12 text-xs font-mono text-gray-500 border border-dashed border-gray-300 dark:border-gray-700 p-6">
            暂无自定义分类
          </div>
        </div>

        <!-- TAB 2: Websites Drag Sorting -->
        <div v-else class="space-y-4">
          <p class="text-xs font-mono text-gray-500">
            按住左侧把手拖动可调整当前分类下的网址顺序，支持 PC 鼠标与移动端触摸：
          </p>

          <div v-if="filteredLocalWebsites.length > 0" ref="websitesListRef" class="space-y-2">
            <div
              v-for="(site, index) in filteredLocalWebsites"
              :key="site.id"
              :data-id="site.id"
              class="group flex items-center justify-between p-2.5 sm:p-3 border-2 border-black dark:border-white bg-white dark:bg-black gap-2 sm:gap-3 rounded-none transition-colors"
            >
              <div class="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
                <div
                  class="drag-handle cursor-grab active:cursor-grabbing p-1.5 border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black rounded-none flex items-center justify-center flex-shrink-0 transition-colors touch-none"
                  title="按住拖拽调整顺序"
                >
                  <GripVertical class="w-4 h-4" />
                </div>

                <span
                  class="text-xs font-mono font-bold px-1.5 py-0.5 border border-black dark:border-white bg-gray-50 dark:bg-neutral-900 rounded-none whitespace-nowrap flex-shrink-0"
                >
                  #{{ index + 1 }}
                </span>

                <div class="w-7 h-7 sm:w-8 sm:h-8 border border-black dark:border-white flex items-center justify-center overflow-hidden flex-shrink-0 bg-white">
                  <WebsiteIcon
                    :url="site.url"
                    :icon-url="site.icon_url"
                    :title="site.title"
                    :seed="site.title + ' ' + (site.url || site.id)"
                    img-class="w-4 h-4 sm:w-5 sm:h-5 object-contain"
                    icon-class="w-4 h-4 sm:w-5 sm:h-5"
                  />
                </div>

                <div class="min-w-0 flex-1">
                  <h4 class="text-xs sm:text-sm font-bold truncate">
                    {{ site.title }}
                  </h4>
                  <p class="text-[10px] sm:text-[11px] font-mono text-gray-500 truncate">{{ site.url }}</p>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-12 text-xs font-mono text-gray-500 border border-dashed border-gray-300 dark:border-gray-700 p-6">
            该分类下暂无网址
          </div>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="px-4 sm:px-6 py-3 sm:py-4 border-t-2 border-black dark:border-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-black flex-shrink-0">
        <div class="text-xs font-mono text-gray-500 flex items-center gap-1.5">
          <span>拖拽调整顺序后实时生效</span>
        </div>

        <div class="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto justify-end">
          <button
            type="button"
            @click="close"
            class="flex-1 sm:flex-initial border-2 border-black dark:border-white px-5 py-2 sm:px-6 sm:py-2.5 text-xs font-bold uppercase tracking-wider bg-black text-white dark:bg-white dark:text-black hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white transition-colors rounded-none whitespace-nowrap text-center"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, nextTick, onMounted, onUnmounted } from 'vue';
import {
  ArrowUpDown,
  X,
  Folder,
  Globe,
  GripVertical,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Check,
} from '@lucide/vue';
import Sortable from 'sortablejs';
import { useNavStore } from '../../stores/nav';
import type { Category, Website } from '../../types';
import DynamicIcon from '../common/DynamicIcon.vue';
import WebsiteIcon from '../common/WebsiteIcon.vue';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const navStore = useNavStore();
const activeTab = ref<'categories' | 'websites'>('categories');
const selectedWebsiteCatId = ref<string>('');
const isCatDropdownOpen = ref(false);
const catDropdownRef = ref<HTMLElement | null>(null);
const statusMsg = ref('');
const isErrorStatus = computed(() => statusMsg.value.includes('出错') || statusMsg.value.includes('失败'));

const categoriesListRef = ref<HTMLElement | null>(null);
const websitesListRef = ref<HTMLElement | null>(null);

let catSortable: Sortable | null = null;
let webSortable: Sortable | null = null;

function cleanupSortables() {
  if (catSortable) {
    catSortable.destroy();
    catSortable = null;
  }
  if (webSortable) {
    webSortable.destroy();
    webSortable = null;
  }
}

function initSortables() {
  cleanupSortables();
  if (!props.isOpen) return;

  if (activeTab.value === 'categories' && categoriesListRef.value) {
    catSortable = Sortable.create(categoriesListRef.value, {
      handle: '.drag-handle',
      animation: 180,
      ghostClass: 'opacity-25',
      chosenClass: 'scale-[1.01]',
      touchStartThreshold: 3,
      delay: 0,
      delayOnTouchOnly: true,
      onEnd: async (evt) => {
        const { oldIndex, newIndex, from, item } = evt;
        if (oldIndex === undefined || newIndex === undefined || oldIndex === newIndex) return;

        // 还原 DOM 位置，让 Vue 接管重新渲染
        from.removeChild(item);
        const targetEl = from.children[oldIndex];
        if (targetEl) {
          from.insertBefore(item, targetEl);
        } else {
          from.appendChild(item);
        }

        const nextList = [...localCategories.value];
        const [moved] = nextList.splice(oldIndex, 1);
        nextList.splice(newIndex, 0, moved);
        localCategories.value = nextList;

        const orderedIds = nextList.map((c) => c.id);
        await navStore.reorderCategories(orderedIds);
        statusMsg.value = '分类顺序已成功更新';
      },
    });
  } else if (activeTab.value === 'websites' && websitesListRef.value) {
    webSortable = Sortable.create(websitesListRef.value, {
      handle: '.drag-handle',
      animation: 180,
      ghostClass: 'opacity-25',
      chosenClass: 'scale-[1.01]',
      touchStartThreshold: 3,
      delay: 0,
      delayOnTouchOnly: true,
      onEnd: async (evt) => {
        const { oldIndex, newIndex, from, item } = evt;
        if (oldIndex === undefined || newIndex === undefined || oldIndex === newIndex) return;

        from.removeChild(item);
        const targetEl = from.children[oldIndex];
        if (targetEl) {
          from.insertBefore(item, targetEl);
        } else {
          from.appendChild(item);
        }

        const currentFiltered = [...filteredLocalWebsites.value];
        const [moved] = currentFiltered.splice(oldIndex, 1);
        currentFiltered.splice(newIndex, 0, moved);

        const orderedIds = currentFiltered.map((w) => w.id);
        await navStore.reorderWebsites(selectedWebsiteCatId.value, orderedIds);

        // 同步内存数据
        const otherSites = localWebsites.value.filter(
          (w) => w.category_id !== selectedWebsiteCatId.value
        );
        currentFiltered.forEach((w, i) => {
          w.order_index = i;
        });
        localWebsites.value = [...otherSites, ...currentFiltered];

        statusMsg.value = '网址顺序已成功更新';
      },
    });
  }
}

const currentSelectedCategory = computed(() => {
  return navStore.sortedCategories.find((c) => c.id === selectedWebsiteCatId.value) || null;
});

function getCategoryWebsiteCount(catId: string): number {
  return navStore.websites.filter((w) => w.category_id === catId).length;
}

function selectCategory(catId: string) {
  selectedWebsiteCatId.value = catId;
  isCatDropdownOpen.value = false;
  nextTick(initSortables);
}

function handleOutsideClick(e: MouseEvent | TouchEvent) {
  if (catDropdownRef.value && !catDropdownRef.value.contains(e.target as Node)) {
    isCatDropdownOpen.value = false;
  }
}

const localCategories = ref<Category[]>([]);
const localWebsites = ref<Website[]>([]);

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      statusMsg.value = '';
      isCatDropdownOpen.value = false;
      localCategories.value = JSON.parse(JSON.stringify(navStore.sortedCategories));
      localWebsites.value = JSON.parse(JSON.stringify(navStore.sortedWebsites));

      if (
        navStore.activeCategoryId &&
        navStore.activeCategoryId !== 'ALL' &&
        navStore.activeCategoryId !== 'UNCATEGORIZED' &&
        navStore.sortedCategories.some((c) => c.id === navStore.activeCategoryId)
      ) {
        selectedWebsiteCatId.value = navStore.activeCategoryId;
      } else if (navStore.sortedCategories.length > 0) {
        selectedWebsiteCatId.value = navStore.sortedCategories[0].id;
      } else {
        selectedWebsiteCatId.value = '';
      }

      nextTick(initSortables);
    } else {
      cleanupSortables();
    }
  }
);

watch(activeTab, () => {
  nextTick(initSortables);
});

const filteredLocalWebsites = computed(() => {
  if (!selectedWebsiteCatId.value) return [];
  return localWebsites.value
    .filter((w) => w.category_id === selectedWebsiteCatId.value)
    .sort((a, b) => a.order_index - b.order_index);
});

function close() {
  cleanupSortables();
  emit('close');
}

onMounted(() => {
  window.addEventListener('click', handleOutsideClick);
  window.addEventListener('touchstart', handleOutsideClick, { passive: true });
});

onUnmounted(() => {
  cleanupSortables();
  window.removeEventListener('click', handleOutsideClick);
  window.removeEventListener('touchstart', handleOutsideClick);
});
</script>
