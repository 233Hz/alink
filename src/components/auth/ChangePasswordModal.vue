<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4"
  >
    <!-- Solid Backdrop (No blur) -->
    <div
      class="fixed inset-0 bg-black/80 transition-opacity"
      @click="close"
    ></div>

    <!-- Modal Content -->
    <div
      class="relative w-full max-w-md bg-white dark:bg-black text-black dark:text-white border-2 border-black dark:border-white p-6 sm:p-8 rounded-none z-10"
    >
      <!-- Header -->
      <div class="flex items-center justify-between pb-4 border-b-2 border-black dark:border-white mb-6">
        <div class="flex items-center gap-2">
          <KeyRound class="w-5 h-5 text-[#ff3366]" />
          <h2 class="text-xl font-black uppercase tracking-tight">
            修改密码
          </h2>
        </div>
        <button
          type="button"
          @click="close"
          class="p-1 border-2 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors rounded-none"
          title="关闭"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Account Info -->
      <div class="mb-5 p-3 border-2 border-black dark:border-white bg-gray-50 dark:bg-zinc-900 rounded-none">
        <p class="text-[10px] font-mono uppercase text-gray-500">当前账号</p>
        <p class="text-xs font-mono font-bold truncate mt-0.5">
          {{ authStore.user?.email || '未知用户' }}
        </p>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- New Password Field -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider mb-1">
            新密码
          </label>
          <div class="relative flex items-center">
            <Lock class="w-4 h-4 text-black dark:text-white absolute left-0 pointer-events-none" />
            <input
              v-model="newPassword"
              :type="showNewPassword ? 'text' : 'password'"
              placeholder="请输入新密码（至少 6 位）"
              required
              minlength="6"
              class="w-full pl-7 pr-8 py-2 text-sm border-0 border-b-2 border-black dark:border-white bg-transparent text-black dark:text-white rounded-none focus:outline-none focus:border-[#ff3366] dark:focus:border-[#ff3366] transition-colors duration-200 placeholder:text-gray-400 dark:placeholder:text-gray-600"
            />
            <button
              type="button"
              @click="showNewPassword = !showNewPassword"
              class="absolute right-0 top-1/2 -translate-y-1/2 text-black dark:text-white p-1 hover:text-[#ff3366] transition-colors"
              title="切换密码显示"
            >
              <EyeOff v-if="showNewPassword" class="w-4 h-4" />
              <Eye v-else class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Confirm Password Field -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider mb-1">
            确认新密码
          </label>
          <div class="relative flex items-center">
            <Lock class="w-4 h-4 text-black dark:text-white absolute left-0 pointer-events-none" />
            <input
              v-model="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              placeholder="请再次输入新密码"
              required
              minlength="6"
              class="w-full pl-7 pr-8 py-2 text-sm border-0 border-b-2 border-black dark:border-white bg-transparent text-black dark:text-white rounded-none focus:outline-none focus:border-[#ff3366] dark:focus:border-[#ff3366] transition-colors duration-200 placeholder:text-gray-400 dark:placeholder:text-gray-600"
            />
            <button
              type="button"
              @click="showConfirmPassword = !showConfirmPassword"
              class="absolute right-0 top-1/2 -translate-y-1/2 text-black dark:text-white p-1 hover:text-[#ff3366] transition-colors"
              title="切换密码显示"
            >
              <EyeOff v-if="showConfirmPassword" class="w-4 h-4" />
              <Eye v-else class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Feedback Messages -->
        <div
          v-if="errorMsg"
          class="p-3 text-xs font-mono font-bold text-white bg-[#ff3366] border-2 border-[#ff3366] rounded-none"
        >
          {{ errorMsg }}
        </div>
        <div
          v-if="successMsg"
          class="p-3 text-xs font-mono font-bold text-black dark:text-white border-2 border-black dark:border-white bg-gray-100 dark:bg-zinc-800 rounded-none"
        >
          {{ successMsg }}
        </div>

        <!-- Action Buttons -->
        <div class="pt-4 flex items-center justify-end gap-3">
          <button
            type="button"
            @click="close"
            class="px-4 py-2 text-xs font-bold uppercase tracking-wider border-2 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors rounded-none"
          >
            取消
          </button>
          <button
            type="submit"
            :disabled="submitting"
            class="px-6 py-2 text-xs font-bold uppercase tracking-wider bg-black text-white dark:bg-white dark:text-black border-2 border-black dark:border-white hover:bg-[#ff3366] hover:border-[#ff3366] hover:text-white dark:hover:bg-[#ff3366] dark:hover:border-[#ff3366] dark:hover:text-white disabled:opacity-50 transition-colors duration-200 rounded-none flex items-center justify-center gap-2"
          >
            <Loader2 v-if="submitting" class="w-3.5 h-3.5 animate-spin" />
            <span>{{ submitting ? '正在更新...' : '确认修改' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Lock, Eye, EyeOff, Loader2, KeyRound, X } from '@lucide/vue';
import { useAuthStore } from '../../stores/auth';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'success'): void;
}>();

const authStore = useAuthStore();

const newPassword = ref('');
const confirmPassword = ref('');
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);
const submitting = ref(false);
const errorMsg = ref('');
const successMsg = ref('');

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      newPassword.value = '';
      confirmPassword.value = '';
      showNewPassword.value = false;
      showConfirmPassword.value = false;
      errorMsg.value = '';
      successMsg.value = '';
    }
  }
);

async function handleSubmit() {
  if (!newPassword.value || !confirmPassword.value) {
    errorMsg.value = '请填写新密码与确认密码';
    return;
  }

  if (newPassword.value.length < 6) {
    errorMsg.value = '新密码长度至少需要 6 位字符';
    return;
  }

  if (newPassword.value !== confirmPassword.value) {
    errorMsg.value = '两次输入的新密码不一致，请重新检查';
    return;
  }

  try {
    submitting.value = true;
    errorMsg.value = '';
    successMsg.value = '';

    await authStore.updatePassword(newPassword.value);
    successMsg.value = '密码修改成功！';

    setTimeout(() => {
      emit('success');
      close();
    }, 1000);
  } catch (err: any) {
    console.error('Update password error:', err);
    errorMsg.value = err.message || '修改密码失败，请重试';
  } finally {
    submitting.value = false;
  }
}

function close() {
  emit('close');
}
</script>
