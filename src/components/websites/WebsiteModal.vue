<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150"
    @click.self="close"
  >
    <div
      class="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-150"
    >
      <!-- Header -->
      <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <h3 class="text-base font-semibold text-slate-800 dark:text-slate-100">
          {{ isEditing ? '编辑网址' : '添加新网址' }}
        </h3>
        <button
          @click="close"
          class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Form Body -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
        <!-- URL Input with Auto-extract trigger -->
        <div>
          <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            网站地址 (URL) <span class="text-rose-500">*</span>
          </label>
          <div class="relative">
            <input
              v-model="form.url"
              type="text"
              required
              placeholder="https://example.com"
              @blur="handleUrlBlur"
              class="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all placeholder:text-slate-400"
            />
            <button
              type="button"
              @click="autoFillFromUrl"
              class="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-[11px] font-medium text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/50 hover:bg-brand-100 rounded-md transition-colors"
              title="根据网址自动提取标题和图标"
            >
              自动识别
            </button>
          </div>
          <p class="text-[11px] text-slate-400 mt-1">
            输入网址后将自动提取网站 Favicon 图标与建议标题
          </p>
        </div>

        <!-- Title Input -->
        <div>
          <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            网站名称 <span class="text-rose-500">*</span>
          </label>
          <input
            v-model="form.title"
            type="text"
            required
            placeholder="例如：GitHub"
            class="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all placeholder:text-slate-400"
          />
        </div>

        <!-- Category and Order in 2 Columns -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Category Selector -->
          <div>
            <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              所属分类
            </label>
            <select
              v-model="form.category_id"
              class="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
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
            <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              排序序号
            </label>
            <input
              v-model.number="form.order_index"
              type="number"
              min="0"
              placeholder="0"
              class="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
            />
          </div>
        </div>

        <!-- Description -->
        <div>
          <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            网站简述 / 备注
          </label>
          <textarea
            v-model="form.description"
            rows="2"
            placeholder="简要描述网站用途或特点（可选）"
            class="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all placeholder:text-slate-400 resize-none"
          ></textarea>
        </div>

        <!-- Custom Icon URL / Emoji (Optional override) -->
        <div>
          <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            自定义图标链接 / Emoji（留空则自动使用 Favicon）
          </label>
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center flex-shrink-0 overflow-hidden"
            >
              <img
                v-if="previewIconSrc"
                :src="previewIconSrc"
                alt="Preview"
                class="w-6 h-6 object-contain"
                @error="previewIconFailed = true"
              />
              <span v-else class="text-xs font-semibold text-slate-400">
                {{ form.title ? form.title.charAt(0).toUpperCase() : '图' }}
              </span>
            </div>
            <input
              v-model="form.icon_url"
              type="text"
              placeholder="https://... 或直接输入单个 Emoji"
              class="flex-1 px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        <!-- Error Alert -->
        <div v-if="errorMsg" class="p-3 text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/30 rounded-xl">
          {{ errorMsg }}
        </div>

        <!-- Footer Actions -->
        <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            @click="close"
            class="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            取消
          </button>
          <button
            type="submit"
            :disabled="submitting"
            class="px-5 py-2 text-xs font-medium text-white bg-brand-600 hover:bg-brand-500 disabled:opacity-50 rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Loader2 v-if="submitting" class="w-3.5 h-3.5 animate-spin" />
            <span>{{ isEditing ? '保存修改' : '确认添加' }}</span>
          </button>
        </div>
      </form>
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
