<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80"
    @click.self="close"
  >
    <div
      class="w-full max-w-md max-h-[88vh] sm:max-h-[90vh] flex flex-col bg-white dark:bg-black text-black dark:text-white border-2 border-black dark:border-white rounded-none overflow-hidden"
    >
      <!-- Header -->
      <div class="px-4 sm:px-6 py-3.5 sm:py-4 border-b-2 border-black dark:border-white flex items-center justify-between flex-shrink-0">
        <h3 class="text-base sm:text-lg font-bold tracking-tight uppercase">
          {{ isEditing ? '编辑分类' : '新建分类' }}
        </h3>
        <button
          @click="close"
          class="p-1 border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Form Body -->
      <form id="category-form" @submit.prevent="handleSubmit" class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
        <!-- Category Name -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider mb-2">
            分类名称 <span class="text-[#ff3366]">*</span>
          </label>
          <input
            v-model="form.name"
            type="text"
            required
            placeholder="例如：开发工具、效率设计"
            class="w-full border-0 border-b-2 border-black dark:border-white bg-transparent text-black dark:text-white rounded-none focus:outline-none focus:border-[#ff3366] py-1.5 sm:py-2 text-sm transition-colors duration-200 placeholder:text-gray-400"
          />
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

        <!-- Icon Picker -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider mb-2">
            分类图标
          </label>

          <!-- Selected Icon Preview & Custom input -->
          <div class="flex items-center gap-2.5 sm:gap-3 mb-4">
            <div
              class="w-10 h-10 border-2 border-black dark:border-white bg-black text-white dark:bg-white dark:text-black flex items-center justify-center flex-shrink-0 rounded-none"
            >
              <DynamicIcon :icon="form.icon" :size="20" custom-class="w-5 h-5" />
            </div>
            <input
              v-model="form.icon"
              type="text"
              placeholder="图标名或 Emoji（如 🚀）"
              class="flex-1 min-w-0 border-0 border-b-2 border-black dark:border-white bg-transparent text-black dark:text-white rounded-none focus:outline-none focus:border-[#ff3366] py-1.5 sm:py-2 text-sm transition-colors duration-200"
            />
          </div>

          <!-- Preset Icons Grid -->
          <div class="grid grid-cols-8 gap-1.5 p-2 border-2 border-black dark:border-white bg-white dark:bg-black">
            <button
              v-for="preset in COMMON_ICONS"
              :key="preset.name"
              type="button"
              @click="form.icon = preset.name"
              :title="preset.label"
              :class="[
                'p-2 border border-black dark:border-white flex items-center justify-center transition-colors rounded-none',
                form.icon === preset.name
                  ? 'bg-black text-white dark:bg-white dark:text-black'
                  : 'hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black',
              ]"
            >
              <DynamicIcon :icon="preset.name" :size="16" custom-class="w-4 h-4" />
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
          form="category-form"
          :disabled="submitting"
          class="flex-1 sm:flex-initial border-2 border-black dark:border-white px-4 py-2 sm:px-6 sm:py-2.5 text-xs font-bold uppercase tracking-wider bg-black text-white dark:bg-white dark:text-black hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white disabled:opacity-50 transition-colors duration-200 rounded-none flex items-center justify-center gap-2 whitespace-nowrap text-center"
        >
          <Loader2 v-if="submitting" class="w-3.5 h-3.5 animate-spin" />
          <span>{{ isEditing ? '保存修改' : '确认创建' }}</span>
        </button>
      </div>
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
