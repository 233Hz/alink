<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150"
    @click.self="close"
  >
    <div
      class="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-150"
    >
      <!-- Header -->
      <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <h3 class="text-base font-semibold text-slate-800 dark:text-slate-100">
          {{ isEditing ? '编辑分类' : '新建分类' }}
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
        <!-- Category Name -->
        <div>
          <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            分类名称 <span class="text-rose-500">*</span>
          </label>
          <input
            v-model="form.name"
            type="text"
            required
            placeholder="例如：开发工具、生活日常"
            class="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all placeholder:text-slate-400"
          />
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
          <p class="text-[11px] text-slate-400 mt-1">
            数字越小排列越靠前，也可在分类菜单中通过“上移/下移”随时调整
          </p>
        </div>

        <!-- Icon Picker -->
        <div>
          <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            分类图标
          </label>

          <!-- Selected Icon Preview & Custom input -->
          <div class="flex items-center gap-3 mb-3">
            <div
              class="w-10 h-10 rounded-xl bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center flex-shrink-0"
            >
              <DynamicIcon :icon="form.icon" :size="20" custom-class="w-5 h-5" />
            </div>
            <input
              v-model="form.icon"
              type="text"
              placeholder="可输入自定义图标名或 Emoji（如 🚀）"
              class="flex-1 px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
            />
          </div>

          <!-- Preset Icons Grid -->
          <div class="grid grid-cols-8 gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
            <button
              v-for="preset in COMMON_ICONS"
              :key="preset.name"
              type="button"
              @click="form.icon = preset.name"
              :title="preset.label"
              :class="[
                'p-2 rounded-lg flex items-center justify-center transition-all',
                form.icon === preset.name
                  ? 'bg-brand-500 text-white shadow-sm scale-105'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 hover:text-slate-700 dark:hover:text-slate-200',
              ]"
            >
              <DynamicIcon :icon="preset.name" :size="16" custom-class="w-4 h-4" />
            </button>
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
            <span>{{ isEditing ? '保存修改' : '确认创建' }}</span>
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
import type { Category, CategoryFormData } from '../../types';
import { COMMON_ICONS } from '../../utils';
import DynamicIcon from '../common/DynamicIcon.vue';

const props = defineProps<{
  isOpen: boolean;
  categoryToEdit?: Category | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'saved'): void;
}>();

const navStore = useNavStore();
const submitting = ref(false);
const errorMsg = ref('');

const isEditing = computed(() => !!props.categoryToEdit);

const form = reactive<CategoryFormData>({
  name: '',
  icon: 'Folder',
  order_index: 0,
});

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      errorMsg.value = '';
      if (props.categoryToEdit) {
        form.name = props.categoryToEdit.name;
        form.icon = props.categoryToEdit.icon || 'Folder';
        form.order_index = props.categoryToEdit.order_index;
      } else {
        form.name = '';
        form.icon = 'Folder';
        form.order_index = navStore.categories.length;
      }
    }
  }
);

async function handleSubmit() {
  if (!form.name.trim()) {
    errorMsg.value = '分类名称不能为空';
    return;
  }

  try {
    submitting.value = true;
    errorMsg.value = '';

    if (isEditing.value && props.categoryToEdit) {
      await navStore.updateCategory(props.categoryToEdit.id, form);
    } else {
      await navStore.createCategory(form);
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
