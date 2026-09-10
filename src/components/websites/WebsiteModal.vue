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
              @click="autoFillFromUrl"
              class="border-2 border-black dark:border-white px-2.5 py-1.5 sm:px-3 text-xs font-bold uppercase tracking-wider bg-white text-black dark:bg-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors rounded-none whitespace-nowrap flex-shrink-0"
            >
              自动识别
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
          <div class="flex items-center gap-2.5 sm:gap-3">
            <div
              class="w-10 h-10 border-2 border-black dark:border-white bg-white flex items-center justify-center flex-shrink-0 rounded-none p-1"
            >
              <img
                v-if="previewIconSrc"
                :src="previewIconSrc"
                alt="Preview"
                class="w-6 h-6 object-contain"
                @error="previewIconFailed = true"
              />
              <span v-else class="text-xs font-black text-black">
                {{ form.title ? form.title.charAt(0).toUpperCase() : '图' }}
              </span>
            </div>
            <input
              v-model="form.icon_url"
              type="text"
              placeholder="留空则自动从网址解析 Favicon"
              class="flex-1 min-w-0 border-0 border-b-2 border-black dark:border-white bg-transparent text-black dark:text-white rounded-none focus:outline-none focus:border-[#ff3366] py-1.5 sm:py-2 text-sm transition-colors duration-200 placeholder:text-gray-400"
            />
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
import { normalizeUrl, suggestTitleFromUrl, getFaviconUrl } from '../../utils';

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
const errorMsg = ref('');
const previewIconFailed = ref(false);

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
      previewIconFailed.value = false;
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

const previewIconSrc = computed(() => {
  if (previewIconFailed.value) return '';
  if (form.icon_url && form.icon_url.trim()) {
    return form.icon_url.trim();
  }
  if (form.url && form.url.trim()) {
    return getFaviconUrl(form.url);
  }
  return '';
});

function handleUrlBlur() {
  if (form.url.trim()) {
    form.url = normalizeUrl(form.url);
    if (!form.title.trim()) {
      form.title = suggestTitleFromUrl(form.url);
    }
    previewIconFailed.value = false;
  }
}

function autoFillFromUrl() {
  if (!form.url.trim()) return;
  form.url = normalizeUrl(form.url);
  form.title = suggestTitleFromUrl(form.url);
  form.icon_url = getFaviconUrl(form.url);
  previewIconFailed.value = false;
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
