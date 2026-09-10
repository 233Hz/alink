<template>
  <div
    v-if="isOpen && category"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150"
    @click.self="close"
  >
    <div
      class="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-150"
    >
      <!-- Header -->
      <div class="p-6">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center flex-shrink-0">
            <AlertTriangle class="w-5 h-5" />
          </div>
          <div>
            <h3 class="text-base font-semibold text-slate-900 dark:text-slate-100">
              删除分类：{{ category.name }}
            </h3>
            <p class="text-xs text-slate-400 mt-0.5">
              该分类下当前共有 <strong class="text-slate-700 dark:text-slate-200">{{ websiteCount }}</strong> 个网址
            </p>
          </div>
        </div>

        <!-- Options if there are websites inside -->
        <div v-if="websiteCount > 0" class="mt-5 space-y-2.5">
          <label
            class="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
          >
            <input
              type="radio"
              :value="false"
              v-model="deleteWebsites"
              class="mt-0.5 text-brand-600 focus:ring-brand-500"
            />
            <div class="text-xs">
              <span class="font-medium text-slate-800 dark:text-slate-200">转移到【未分类】（推荐）</span>
              <p class="text-slate-400 mt-0.5">
                保留该分类下的所有网址，将其分类变更为“未分类”，以便后续重新归类
              </p>
            </div>
          </label>

          <label
            class="flex items-start gap-3 p-3 rounded-xl border border-rose-200/60 dark:border-rose-900/40 bg-rose-50/30 dark:bg-rose-950/20 hover:bg-rose-50/70 cursor-pointer transition-colors"
          >
            <input
              type="radio"
              :value="true"
              v-model="deleteWebsites"
              class="mt-0.5 text-rose-600 focus:ring-rose-500"
            />
            <div class="text-xs">
              <span class="font-medium text-rose-700 dark:text-rose-400">一并删除其中的所有网址</span>
              <p class="text-rose-500/80 dark:text-rose-400/70 mt-0.5">
                连同该分类及其包含的 {{ websiteCount }} 个网址彻底删除，不可恢复
              </p>
            </div>
          </label>
        </div>

        <p v-else class="mt-4 text-xs text-slate-500 dark:text-slate-400">
          该分类下无任何网址，确认删除吗？
        </p>

        <!-- Error Msg -->
        <div v-if="errorMsg" class="mt-3 p-3 text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/30 rounded-xl">
          {{ errorMsg }}
        </div>

        <!-- Footer Actions -->
        <div class="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            @click="close"
            class="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            取消
          </button>
          <button
            type="button"
            @click="handleConfirm"
            :disabled="deleting"
            class="px-5 py-2 text-xs font-medium text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50 rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Loader2 v-if="deleting" class="w-3.5 h-3.5 animate-spin" />
            <span>确认删除</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { AlertTriangle, Loader2 } from '@lucide/vue';
import { useNavStore } from '../../stores/nav';
import type { Category } from '../../types';

const props = defineProps<{
  isOpen: boolean;
  category?: Category | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'deleted'): void;
}>();

const navStore = useNavStore();
const deleteWebsites = ref(false);
const deleting = ref(false);
const errorMsg = ref('');

const websiteCount = computed(() => {
  if (!props.category) return 0;
  return navStore.websites.filter(w => w.category_id === props.category!.id).length;
});

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      deleteWebsites.value = false;
      errorMsg.value = '';
    }
  }
);

async function handleConfirm() {
  if (!props.category) return;
  try {
    deleting.value = true;
    errorMsg.value = '';
    await navStore.deleteCategory(props.category.id, deleteWebsites.value);
    emit('deleted');
    close();
  } catch (err: any) {
    errorMsg.value = err.message || '删除失败，请重试';
  } finally {
    deleting.value = false;
  }
}

function close() {
  emit('close');
}
</script>
