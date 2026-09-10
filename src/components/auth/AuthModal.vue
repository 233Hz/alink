<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80"
    @click.self="close"
  >
    <div
      class="w-full max-w-sm max-h-[88vh] sm:max-h-[90vh] flex flex-col bg-white dark:bg-black text-black dark:text-white border-2 border-black dark:border-white rounded-none overflow-hidden"
    >
      <!-- Header -->
      <div class="relative p-5 sm:p-6 text-center border-b-2 border-black dark:border-white flex-shrink-0">
        <button
          @click="close"
          class="absolute right-3 top-3 p-1 border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
          title="关闭"
        >
          <X class="w-4 h-4" />
        </button>
        <div class="w-10 h-10 sm:w-12 sm:h-12 mx-auto border-2 border-black dark:border-white bg-black text-white dark:bg-white dark:text-black flex items-center justify-center mb-2 font-black text-lg sm:text-xl rounded-none">
          A
        </div>
        <h3 class="text-lg sm:text-xl font-bold tracking-tight uppercase">
          {{ isResetMode ? '重置 ALink 密码' : (isSignUp ? '创建 ALink 账号' : '登录 ALink 账号') }}
        </h3>
        <p class="text-xs font-mono text-gray-500 mt-1">
          {{ isResetMode ? '输入注册邮箱，我们将向你发送密码重置链接' : (isSignUp ? '注册账号即可拥有专属云端书签与分类' : '登录后管理你的专属分类与收藏网址') }}
        </p>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider mb-2">
            电子邮箱
          </label>
          <div class="relative flex items-center">
            <Mail class="w-4 h-4 text-black dark:text-white absolute left-0 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              v-model="email"
              type="email"
              required
              placeholder="you@example.com"
              class="w-full pl-7 pr-2 py-2 text-sm border-0 border-b-2 border-black dark:border-white bg-transparent text-black dark:text-white rounded-none focus:outline-none focus:border-[#ff3366] transition-colors placeholder:text-gray-400"
            />
          </div>
        </div>

        <div v-if="!isResetMode">
          <label class="block text-xs font-bold uppercase tracking-wider mb-2">
            密码
          </label>
          <div class="relative flex items-center">
            <Lock class="w-4 h-4 text-black dark:text-white absolute left-0 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              :required="!isResetMode"
              minlength="6"
              placeholder="至少 6 位密码"
              class="w-full pl-7 pr-8 py-2 text-sm border-0 border-b-2 border-black dark:border-white bg-transparent text-black dark:text-white rounded-none focus:outline-none focus:border-[#ff3366] transition-colors placeholder:text-gray-400"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-0 top-1/2 -translate-y-1/2 text-black dark:text-white p-1"
            >
              <EyeOff v-if="showPassword" class="w-4 h-4" />
              <Eye v-else class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Forgot Password Link for Login Mode -->
        <div v-if="!isSignUp && !isResetMode" class="text-right -mt-2">
          <button
            type="button"
            @click="isResetMode = true; errorMsg = ''; successMsg = '';"
            class="text-[11px] text-gray-500 hover:text-[#ff3366] transition-colors"
          >
            忘记密码？
          </button>
        </div>

        <!-- Feedback Alert -->
        <div v-if="errorMsg" class="p-3 text-xs font-mono font-bold text-white bg-[#ff3366] rounded-none">
          {{ errorMsg }}
        </div>
        <div v-if="successMsg" class="p-3 text-xs font-mono font-bold text-black dark:text-white border-2 border-black dark:border-white rounded-none">
          {{ successMsg }}
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="submitting"
          class="w-full py-3 text-xs font-bold uppercase tracking-wider bg-black text-white dark:bg-white dark:text-black border-2 border-black dark:border-white hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white disabled:opacity-50 transition-colors duration-200 rounded-none flex items-center justify-center gap-2"
        >
          <Loader2 v-if="submitting" class="w-3.5 h-3.5 animate-spin" />
          <span>{{ isResetMode ? '发送重置密码邮件' : (isSignUp ? '立即注册' : '登 录') }}</span>
        </button>

        <!-- Mode Toggle -->
        <div v-if="isResetMode" class="text-center text-xs text-gray-500 pt-1">
          <span>记起密码了？</span>
          <button
            type="button"
            @click="isResetMode = false; errorMsg = ''; successMsg = '';"
            class="ml-1 font-bold text-black dark:text-white hover:text-[#ff3366] underline transition-colors"
          >
            返回登录
          </button>
        </div>
        <div v-else class="text-center text-xs text-gray-500 pt-1">
          <span>{{ isSignUp ? '已有账号？' : '还没有账号？' }}</span>
          <button
            type="button"
            @click="isSignUp = !isSignUp; errorMsg = ''; successMsg = '';"
            class="ml-1 font-bold text-black dark:text-white hover:text-[#ff3366] underline transition-colors"
          >
            {{ isSignUp ? '去登录' : '立即注册' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Mail, Lock, Eye, EyeOff, Loader2, X } from '@lucide/vue';
import { useAuthStore } from '../../stores/auth';
import { useNavStore } from '../../stores/nav';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const authStore = useAuthStore();
const navStore = useNavStore();

const isSignUp = ref(false);
const isResetMode = ref(false);
const email = ref('');
const password = ref('');
const showPassword = ref(false);
const submitting = ref(false);
const errorMsg = ref('');
const successMsg = ref('');

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      isResetMode.value = false;
      errorMsg.value = '';
      successMsg.value = '';
    }
  }
);

async function handleSubmit() {
  if (!email.value) return;
  if (!isResetMode.value && !password.value) return;

  try {
    submitting.value = true;
    errorMsg.value = '';
    successMsg.value = '';

    if (isResetMode.value) {
      await authStore.resetPasswordForEmail(email.value);
      successMsg.value = '重置密码链接已发送至邮箱，请查收邮件并根据提示重置！';
    } else if (isSignUp.value) {
      await authStore.signUp(email.value, password.value);
      successMsg.value = '注册成功！正在进入系统...';
      await navStore.fetchData();
      setTimeout(() => {
        close();
      }, 800);
    } else {
      await authStore.signIn(email.value, password.value);
      successMsg.value = '登录成功！';
      await navStore.fetchData();
      setTimeout(() => {
        close();
      }, 800);
    }
  } catch (err: any) {
    console.error('Auth error:', err);
    let msg = err.message || '认证失败，请检查邮箱与密码';
    if (msg.includes('User already registered')) {
      msg = '该邮箱已注册，请直接点击下方“去登录”';
    } else if (msg.includes('Invalid login credentials')) {
      msg = '邮箱或密码错误，请检查后重新输入';
    } else if (msg.includes('Email not confirmed')) {
      msg = '邮箱尚未激活，请刷新后重试';
    }
    errorMsg.value = msg;
  } finally {
    submitting.value = false;
  }
}

function close() {
  emit('close');
}
</script>
