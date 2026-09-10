<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80"
    @click.self="close"
  >
    <div
      class="w-full max-w-lg max-h-[88vh] sm:max-h-[90vh] flex flex-col bg-white dark:bg-black text-black dark:text-white border-2 border-black dark:border-white rounded-none overflow-hidden"
    >
      <!-- Header -->
      <div class="px-4 sm:px-6 py-3.5 sm:py-4 border-b-2 border-black dark:border-white flex items-center justify-between flex-shrink-0">
        <h3 class="text-base sm:text-lg font-bold tracking-tight uppercase">
          {{ isEditing ? '编辑网址' : '添加新网址' }}
        </h3>
        <button
          @click="close"
          class="p-1 border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Form Body -->
      <form id="website-form" @submit.prevent="handleSubmit" class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
        <!-- URL Input with Auto-extract trigger -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider mb-2">
            网站地址 (URL) <span class="text-[#ff3366]">*</span>
          </label>
          <div class="flex items-center gap-2.5 sm:gap-3">
            <input
              v-model="form.url"
              type="text"
              required
              placeholder="https://example.com"
              @blur="handleUrlBlur"
              class="flex-1 min-w-0 border-0 border-b-2 border-black dark:border-white bg-transparent text-black dark:text-white rounded-none focus:outline-none focus:border-[#ff3366] dark:focus:border-[#ff3366] py-1.5 sm:py-2 text-sm transition-colors duration-200 placeholder:text-gray-400"
            />
            <button
              type="button"
              @click="() => autoFillFromUrl(true)"
              :disabled="fetchingTitle"
              class="border-2 border-black dark:border-white px-2.5 py-1.5 sm:px-3 text-xs font-bold uppercase tracking-wider bg-white text-black dark:bg-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors rounded-none whitespace-nowrap flex-shrink-0 flex items-center gap-1.5 disabled:opacity-60"
              title="自动抓取网页真实标题"
            >
              <Loader2 v-if="fetchingTitle" class="w-3.5 h-3.5 animate-spin text-[#ff3366]" />
              <span>{{ fetchingTitle ? '抓取中...' : '自动识别' }}</span>
            </button>
          </div>
        </div>

        <!-- Title Input -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider mb-2">
            网站名称 <span class="text-[#ff3366]">*</span>
          </label>
          <input
            v-model="form.title"
            type="text"
            required
            placeholder="例如：GitHub"
            class="w-full border-0 border-b-2 border-black dark:border-white bg-transparent text-black dark:text-white rounded-none focus:outline-none focus:border-[#ff3366] dark:focus:border-[#ff3366] py-1.5 sm:py-2 text-sm transition-colors duration-200 placeholder:text-gray-400"
          />
        </div>

        <!-- Category and Order in 2 Columns -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <!-- Category Selector -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider mb-2">
              所属分类
            </label>
            <select
              v-model="form.category_id"
              class="w-full border-0 border-b-2 border-black dark:border-white bg-transparent text-black dark:text-white rounded-none focus:outline-none focus:border-[#ff3366] py-1.5 sm:py-2 text-sm transition-colors duration-200"
            >
              <option :value="null">未分类 (Uncategorized)</option>
              <option
                v-for="cat in navStore.sortedCategories"
                :key="cat.id"
                :value="cat.id"
              >
                {{ cat.name }}
              </option>
            </select>
          </div>

          <!-- Order Index -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider mb-2">
              排序序号
            </label>
            <input
              v-model.number="form.order_index"
              type="number"
              min="0"
              placeholder="0"
              class="w-full border-0 border-b-2 border-black dark:border-white bg-transparent text-black dark:text-white rounded-none focus:outline-none focus:border-[#ff3366] py-1.5 sm:py-2 text-sm transition-colors duration-200"
            />
          </div>
        </div>

        <!-- Description -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider mb-2">
            网站描述
          </label>
          <textarea
            v-model="form.description"
            rows="2"
            placeholder="简要描述网站用途或特点（可选）"
            class="w-full border-2 border-black dark:border-white bg-transparent text-black dark:text-white rounded-none focus:outline-none focus:border-[#ff3366] p-2.5 sm:p-3 text-sm transition-colors duration-200 placeholder:text-gray-400 resize-none"
          ></textarea>
        </div>

        <!-- Custom Icon URL / Preview -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider mb-2">
            图标链接 / Emoji
          </label>
          <div class="flex items-center gap-2 sm:gap-2.5">
            <div
              class="w-10 h-10 border-2 border-black dark:border-white bg-white flex items-center justify-center flex-shrink-0 rounded-none p-1"
            >
              <WebsiteIcon
                :url="form.url"
                :icon-url="form.icon_url"
                :title="form.title || '图标预览'"
                :seed="form.title || form.url || 'ALink'"
                img-class="w-6 h-6 object-contain"
                icon-class="w-6 h-6"
              />
            </div>
            <input
              v-model="form.icon_url"
              type="text"
              placeholder="留空则自动解析 Favicon 或生成风格图标"
              class="flex-1 min-w-0 border-0 border-b-2 border-black dark:border-white bg-transparent text-black dark:text-white rounded-none focus:outline-none focus:border-[#ff3366] py-1.5 sm:py-2 text-sm transition-colors duration-200 placeholder:text-gray-400"
            />
            <button
              type="button"
              @click="rollRandomIcon"
              class="border-2 border-black dark:border-white px-2 sm:px-2.5 py-1.5 text-xs font-bold uppercase tracking-wider bg-white text-black dark:bg-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors duration-200 rounded-none whitespace-nowrap flex-shrink-0 flex items-center gap-1"
              title="点击随机生成符合网站UI的几何风格图标"
            >
              <span>🎲 随机生成</span>
            </button>
          </div>

          <!-- Quick generative avatar style presets -->
          <div class="flex flex-wrap items-center gap-1.5 mt-2.5">
            <span class="text-[11px] font-mono text-gray-500 mr-1">生成风格:</span>
            <button
              v-for="st in DICEBEAR_STYLES"
              :key="st.id"
              type="button"
              @click="applyGenerativeStyle(st.id)"
              class="px-2 py-0.5 text-[11px] font-mono border border-black dark:border-white bg-transparent hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors rounded-none"
              :title="st.description"
            >
              {{ st.label }}
            </button>
            <button
              type="button"
              @click="applyLocalSvg"
              class="px-2 py-0.5 text-[11px] font-mono border border-black dark:border-white bg-transparent hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors rounded-none text-gray-600 dark:text-gray-300"
              title="使用内置离线矢量几何图标"
            >
              本地矢量
            </button>
            <button
              v-if="form.icon_url"
              type="button"
              @click="clearCustomIcon"
              class="px-1.5 py-0.5 text-[11px] font-mono text-[#ff3366] hover:underline"
              title="清空自定义图标，恢复自动抓取"
            >
              [恢复自动]
            </button>
          </div>
        </div>


        <!-- Error Alert -->
        <div v-if="errorMsg" class="p-3 text-xs font-mono font-bold text-white bg-[#ff3366] rounded-none">
          {{ errorMsg }}
        </div>
      </form>

      <!-- Footer Actions -->
      <div class="px-4 sm:px-6 py-3 sm:py-4 border-t-2 border-black dark:border-white flex items-center justify-end gap-2.5 sm:gap-3 flex-shrink-0 bg-white dark:bg-black">
        <button
          type="button"
          @click="close"
          class="flex-1 sm:flex-initial border-2 border-black dark:border-white px-4 py-2 sm:px-6 sm:py-2.5 text-xs font-bold uppercase tracking-wider bg-white text-black dark:bg-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors duration-200 rounded-none whitespace-nowrap text-center"
        >
          取消
        </button>
        <button
          type="submit"
          form="website-form"
          :disabled="submitting"
          class="flex-1 sm:flex-initial border-2 border-black dark:border-white px-4 py-2 sm:px-6 sm:py-2.5 text-xs font-bold uppercase tracking-wider bg-black text-white dark:bg-white dark:text-black hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white disabled:opacity-50 transition-colors duration-200 rounded-none flex items-center justify-center gap-2 whitespace-nowrap text-center"
        >
          <Loader2 v-if="submitting" class="w-3.5 h-3.5 animate-spin" />
          <span>{{ isEditing ? '保存修改' : '确认添加' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { X, Loader2 } from '@lucide/vue';
import { useNavStore } from '../../stores/nav';
import type { Website, WebsiteFormData } from '../../types';
import {
  normalizeUrl,
  suggestTitleFromUrl,
  crawlWebsiteTitle,
  getRandomGeneratedIconDataUrl,
  getRandomDiceBearAvatarUrl,
  DICEBEAR_STYLES,
  type DiceBearStyle,
} from '../../utils';
import WebsiteIcon from '../common/WebsiteIcon.vue';

const props = defineProps<{
  isOpen: boolean;
  websiteToEdit?: Website | null;
  defaultCategoryId?: string | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'saved'): void;
}>();

const navStore = useNavStore();
const submitting = ref(false);
const fetchingTitle = ref(false);
const errorMsg = ref('');

const isEditing = computed(() => !!props.websiteToEdit);

const form = reactive<WebsiteFormData>({
  title: '',
  url: '',
  description: '',
  icon_url: '',
  category_id: null,
  order_index: 0,
});

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      errorMsg.value = '';
      if (props.websiteToEdit) {
        form.title = props.websiteToEdit.title;
        form.url = props.websiteToEdit.url;
        form.description = props.websiteToEdit.description || '';
        form.icon_url = props.websiteToEdit.icon_url || '';
        form.category_id = props.websiteToEdit.category_id;
        form.order_index = props.websiteToEdit.order_index;
      } else {
        form.title = '';
        form.url = '';
        form.description = '';
        form.icon_url = '';
        form.category_id = props.defaultCategoryId ?? (navStore.activeCategoryId === 'ALL' || navStore.activeCategoryId === 'UNCATEGORIZED' ? null : navStore.activeCategoryId);
        form.order_index = navStore.filteredWebsites.length;
      }
    }
  }
);

async function handleUrlBlur() {
  if (form.url.trim()) {
    form.url = normalizeUrl(form.url);
    if (!form.title.trim()) {
      form.title = suggestTitleFromUrl(form.url);
      await fetchAndApplyTitle(false);
    }
  }
}

async function autoFillFromUrl(force = false) {
  if (!form.url.trim()) return;
  form.url = normalizeUrl(form.url);
  if (!form.title.trim()) {
    form.title = suggestTitleFromUrl(form.url);
  }
  form.icon_url = '';
  await fetchAndApplyTitle(force);
}

async function fetchAndApplyTitle(force = false) {
  if (!form.url.trim()) return;
  try {
    fetchingTitle.value = true;
    const crawled = await crawlWebsiteTitle(form.url);
    if (crawled && (force || !form.title.trim() || form.title === suggestTitleFromUrl(form.url))) {
      form.title = crawled;
    }
  } catch {
    if (!form.title.trim()) {
      form.title = suggestTitleFromUrl(form.url);
    }
  } finally {
    fetchingTitle.value = false;
  }
}

function rollRandomIcon() {
  const seed = form.title || form.url || 'alink';
  form.icon_url = getRandomDiceBearAvatarUrl(seed);
}

function applyGenerativeStyle(style: DiceBearStyle) {
  const seed = form.title || form.url || 'alink';
  form.icon_url = getRandomDiceBearAvatarUrl(seed, style);
}

function applyLocalSvg() {
  form.icon_url = getRandomGeneratedIconDataUrl();
}

function clearCustomIcon() {
  form.icon_url = '';
}

async function handleSubmit() {
  if (!form.title.trim() || !form.url.trim()) {
    errorMsg.value = '请填写完整的网址和网站名称';
    return;
  }

  try {
    submitting.value = true;
    errorMsg.value = '';
    form.url = normalizeUrl(form.url);

    if (isEditing.value && props.websiteToEdit) {
      await navStore.updateWebsite(props.websiteToEdit.id, form);
    } else {
      await navStore.createWebsite(form);
    }

    emit('saved');
    close();
  } catch (err: any) {
    errorMsg.value = err.message || '操作失败，请重试';
  } finally {
    submitting.value = false;
  }
}

function close() {
  emit('close');
}
</script>
