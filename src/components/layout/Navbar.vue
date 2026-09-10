<template>
  <header
    class="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-slate-950/80 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors"
  >
    <div class="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-6">
      <!-- Left: Mobile Menu Toggle & Brand Logo -->
      <div class="flex items-center gap-3">
        <button
          type="button"
          @click="emit('toggle-mobile-sidebar')"
          class="p-2 -ml-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden transition-colors"
          title="打开菜单"
        >
          <Menu class="w-5 h-5" />
        </button>

        <a href="#" @click.prevent="navStore.activeCategoryId = 'ALL'" class="flex items-center gap-2.5 group">
          <div
            class="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform"
          >
            <BookmarkCheck class="w-5 h-5" />
          </div>
          <div class="hidden sm:block">
            <h1 class="text-base font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              ALink
            </h1>
            <p class="text-[10px] text-slate-400 font-medium -mt-1 tracking-wider uppercase">
              网页聚合导航
            </p>
          </div>
        </a>
      </div>

      <!-- Center: Global Real-time Search -->
      <div class="flex-1 max-w-md mx-2 sm:mx-4">
        <div class="relative">
          <Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            v-model="navStore.searchQuery"
            type="text"
            placeholder="搜索网址、名称或描述..."
            class="w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all placeholder:text-slate-400"
          />
          <button
            v-if="navStore.searchQuery"
            @click="navStore.searchQuery = ''"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <!-- Right: Action Buttons & User Profile -->
      <div class="flex items-center gap-1.5 sm:gap-2.5">
        <!-- Reorder Manager Button -->
        <button
          @click="emit('open-reorder')"
          class="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
          title="排序管理中心"
        >
          <ArrowUpDown class="w-4 h-4" />
        </button>

        <!-- Quick Add Website -->
        <button
          @click="emit('open-add-website')"
          class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-sm transition-all hover:shadow-brand-500/20 active:scale-95"
        >
          <Plus class="w-3.5 h-3.5" />
          <span>添加网址</span>
        </button>

        <!-- Theme Toggle -->
        <button
          @click="themeStore.toggleTheme"
          class="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
          :title="themeStore.isDark ? '切换到亮色模式' : '切换到暗黑模式'"
        >
          <Sun v-if="themeStore.isDark" class="w-4 h-4 text-amber-400" />
          <Moon v-else class="w-4 h-4 text-slate-600" />
        </button>

        <!-- User / Auth State -->
        <div v-if="authStore.isAuthenticated" class="relative" ref="userMenuRef">
          <button
            @click="isUserMenuOpen = !isUserMenuOpen"
            class="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center">
              {{ (authStore.user?.email || 'U').charAt(0).toUpperCase() }}
            </div>
          </button>

          <!-- Dropdown -->
          <div
            v-if="isUserMenuOpen"
            @click.stop
            class="absolute right-0 mt-2 w-52 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100"
          >
            <div class="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
              <p class="text-[11px] text-slate-400">已登录账号</p>
              <p class="text-xs font-medium text-slate-800 dark:text-slate-200 truncate mt-0.5">
                {{ authStore.user?.email }}
              </p>
            </div>
            <button
              @click="handleSignOut"
              class="w-full px-4 py-2 text-left text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2"
            >
              <LogOut class="w-3.5 h-3.5" />
              退出登录
            </button>
          </div>
        </div>

        <!-- Not Logged In Button -->
        <button
          v-else
          @click="emit('open-auth')"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
        >
          <User class="w-3.5 h-3.5" />
          <span>{{ authStore.isGuest ? '登录账号' : '登录 / 注册' }}</span>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import {
  Menu,
  BookmarkCheck,
  Search,
  X,
  Plus,
  ArrowUpDown,
  Sun,
  Moon,
  User,
  LogOut,
} from '@lucide/vue';
import { useNavStore } from '../../stores/nav';
import { useThemeStore } from '../../stores/theme';
import { useAuthStore } from '../../stores/auth';

const emit = defineEmits<{
  (e: 'toggle-mobile-sidebar'): void;
  (e: 'open-add-website'): void;
  (e: 'open-reorder'): void;
  (e: 'open-auth'): void;
}>();

const navStore = useNavStore();
const themeStore = useThemeStore();
const authStore = useAuthStore();

const isUserMenuOpen = ref(false);
const userMenuRef = ref<HTMLElement | null>(null);

function handleSignOut() {
  isUserMenuOpen.value = false;
  authStore.signOut();
  navStore.fetchData();
}

function handleClickOutside(e: MouseEvent) {
  if (userMenuRef.value && !userMenuRef.value.contains(e.target as Node)) {
    isUserMenuOpen.value = false;
  }
}

onMounted(() => {
  window.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside);
});
</script>
