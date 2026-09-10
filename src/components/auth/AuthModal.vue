<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150"
    @click.self="close"
  >
    <div
      class="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-150"
    >
      <!-- Header -->
      <div class="px-6 pt-6 pb-4 text-center">
        <div class="w-12 h-12 mx-auto rounded-2xl bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-3">
          <Link2 class="w-6 h-6" />
        </div>
        <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100">
          {{ isSignUp ? '创建 ALink 账号' : '欢迎回到 ALink' }}
        </h3>
        <p class="text-xs text-slate-400 mt-1">
          {{ isSignUp ? '注册账号即可拥有专属云端书签与分类' : '登录后管理你的专属分类与收藏网址' }}
        </p>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="px-6 pb-6 space-y-4">
        <div>
          <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            电子邮箱
          </label>
          <div class="relative">
            <input
              v-model="email"
              type="email"
              required
              placeholder="you@example.com"
              class="w-full pl-9 pr-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all placeholder:text-slate-400"
            />
            <Mail class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div>
          <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            密码
          </label>
          <div class="relative">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              required
              minlength="6"
              placeholder="至少 6 位密码"
              class="w-full pl-9 pr-10 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all placeholder:text-slate-400"
            />
            <Lock class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <EyeOff v-if="showPassword" class="w-4 h-4" />
              <Eye v-else class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Feedback Alert -->
        <div v-if="errorMsg" class="p-3 text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/30 rounded-xl">
          {{ errorMsg }}
        </div>
        <div v-if="successMsg" class="p-3 text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl">
          {{ successMsg }}
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="submitting"
          class="w-full py-2.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 disabled:opacity-50 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-1.5"
        >
          <Loader2 v-if="submitting" class="w-3.5 h-3.5 animate-spin" />
          <span>{{ isSignUp ? '注 册' : '登 录' }}</span>
        </button>

        <!-- Mode Toggle -->
        <div class="text-center text-xs text-slate-500 dark:text-slate-400 pt-1">
          <span>{{ isSignUp ? '已有账号？' : '还没有账号？' }}</span>
          <button
            type="button"
            @click="isSignUp = !isSignUp; errorMsg = ''; successMsg = '';"
            class="ml-1 font-semibold text-brand-600 dark:text-brand-400 hover:underline"
          >
            {{ isSignUp ? '去登录' : '立即注册' }}
          </button>
        </div>

        <!-- Guest / Demo Experience Mode -->
        <div class="pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            @click="handleGuestExperience"
            class="w-full py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors flex items-center justify-center gap-1.5"
          >
            <Sparkles class="w-3.5 h-3.5 text-amber-500" />
            <span>免登录访客体验模式</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Link2, Mail, Lock, Eye, EyeOff, Loader2, Sparkles } from '@lucide/vue';
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
      errorMsg.value = '';
      successMsg.value = '';
    }
  }
);

async function handleSubmit() {
  if (!email.value || !password.value) return;

  try {
    submitting.value = true;
    errorMsg.value = '';
    successMsg.value = '';

    if (isSignUp.value) {
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
    errorMsg.value = err.message || '认证失败，请检查邮箱与密码';
  } finally {
    submitting.value = false;
  }
}

async function handleGuestExperience() {
  authStore.setGuestMode(true);
  await navStore.fetchData();
  close();
}

function close() {
  emit('close');
}
</script>
