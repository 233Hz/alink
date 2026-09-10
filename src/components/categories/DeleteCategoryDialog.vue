<template>
  <div
    v-if="isOpen && category"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
    @click.self="close"
  >
    <div
      class="w-full max-w-md bg-white dark:bg-black text-black dark:text-white border-2 border-black dark:border-white rounded-none overflow-hidden"
    >
      <div class="p-6">
        <!-- Warning Header -->
        <div class="flex items-center gap-3 border-b-2 border-black dark:border-white pb-4 mb-6">
          <div class="w-10 h-10 border-2 border-[#ff3366] text-[#ff3366] flex items-center justify-center rounded-none flex-shrink-0">
            <AlertTriangle class="w-5 h-5" />
          </div>
          <div>
            <h3 class="text-base font-bold uppercase tracking-tight">
              删除分类：{{ category.name }}
            </h3>
            <p class="text-xs font-mono text-gray-500 mt-0.5">
              包含 {{ websiteCount }} 个网址
            </p>
          </div>
        </div>

        <!-- Options if there are websites inside -->
        <div v-if="websiteCount > 0" class="space-y-3">
          <label
            class="flex items-start gap-3 p-4 border-2 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black cursor-pointer transition-colors duration-200 rounded-none group"
          >
            <input
              type="radio"
              :value="false"
              v-model="deleteWebsites"
              class="mt-1 accent-black dark:accent-white"
            />
            <div class="text-xs">
              <span class="font-bold uppercase tracking-wider">保留网址并转入【未分类】（推荐）</span>
              <p class="text-gray-500 group-hover:text-gray-300 dark:group-hover:text-gray-600 mt-1">
                分类被移除，但其中的网址保留并可以在未分类中重新归整
              </p>
            </div>
          </label>

          <label
            class="flex items-start gap-3 p-4 border-2 border-[#ff3366] text-[#ff3366] hover:bg-[#ff3366] hover:text-white cursor-pointer transition-colors duration-200 rounded-none group"
          >
            <input
              type="radio"
              :value="true"
              v-model="deleteWebsites"
              class="mt-1 accent-[#ff3366]"
            />
            <div class="text-xs">
              <span class="font-bold uppercase tracking-wider">一并彻底删除所有网址</span>
              <p class="text-[#ff3366]/80 group-hover:text-white mt-1">
                连同该分类下的 {{ websiteCount }} 个网址一并删除，不可恢复
              </p>
            </div>
          </label>
        </div>

        <p v-else class="text-xs text-gray-500 font-mono">
          该分类下无任何网址，确认删除吗？
        </p>

        <!-- Error Msg -->
        <div v-if="errorMsg" class="mt-4 p-3 text-xs font-mono font-bold text-white bg-[#ff3366] rounded-none">
          {{ errorMsg }}
        </div>

        <!-- Footer Actions -->
        <div class="mt-6 pt-4 border-t-2 border-black dark:border-white flex items-center justify-end gap-3">
          <button
            type="button"
            @click="close"
            class="border-2 border-black dark:border-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider bg-white text-black dark:bg-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors duration-200 rounded-none"
          >
            取消
          </button>
          <button
            type="button"
            @click="handleConfirm"
            :disabled="deleting"
            class="border-2 border-[#ff3366] bg-[#ff3366] text-white hover:bg-black hover:border-black px-6 py-2.5 text-xs font-bold uppercase tracking-wider disabled:opacity-50 transition-colors duration-200 rounded-none flex items-center gap-2"
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
