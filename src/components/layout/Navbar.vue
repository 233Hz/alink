<template>
  <header
    class="sticky top-0 z-40 w-full bg-white dark:bg-black text-black dark:text-white border-b-2 border-black dark:border-white transition-colors"
  >
    <div class="w-full px-4 md:px-8 h-16 flex items-center justify-between gap-4">
      <!-- Left: Mobile Menu Toggle & Brand Logo -->
      <div class="flex items-center gap-4">
        <button
          type="button"
          @click="emit('toggle-mobile-sidebar')"
          class="p-2 border-2 border-black dark:border-white md:hidden hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black rounded-none transition-colors"
          title="打开菜单"
        >
          <Menu class="w-4 h-4" />
        </button>

        <a
          href="#"
          @click.prevent="navStore.activeCategoryId = 'ALL'"
          class="flex items-center gap-3 group"
        >
          <div
            class="w-9 h-9 border-2 border-black dark:border-white bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-black text-base rounded-none"
          >
            A
          </div>
          <span class="font-black tracking-tight text-xl uppercase hidden sm:inline-block">
            ALink
          </span>
        </a>
      </div>

      <!-- Center: Global Search Input -->
      <div class="flex-1 max-w-lg mx-2">
        <div class="relative flex items-center">
          <Search class="w-4 h-4 text-black dark:text-white absolute left-0 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            v-model="navStore.searchQuery"
            type="text"
            placeholder="搜索网址、名称或描述..."
            class="w-full pl-7 pr-8 py-1.5 text-sm border-0 border-b-2 border-black dark:border-white bg-transparent text-black dark:text-white rounded-none focus:outline-none focus:border-[#ff3366] dark:focus:border-[#ff3366] transition-colors duration-200 placeholder:text-gray-400 dark:placeholder:text-gray-600"
          />
          <button
            v-if="navStore.searchQuery"
            @click="navStore.searchQuery = ''"
            class="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-black dark:text-white hover:text-[#ff3366]"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Right: Action Buttons & User Profile -->
      <div class="flex items-center gap-2 sm:gap-3">
        <!-- Reorder Manager Button -->
        <button
          @click="emit('open-reorder')"
          class="p-2 border-2 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black rounded-none transition-colors duration-200"
          title="排序管理中心"
        >
          <ArrowUpDown class="w-4 h-4" />
        </button>

        <!-- Quick Add Website Button -->
        <button
          @click="emit('open-add-website')"
          class="hidden sm:inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold uppercase tracking-wider bg-black text-white dark:bg-white dark:text-black border-2 border-black dark:border-white hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white transition-colors duration-200 rounded-none"
        >
          <Plus class="w-4 h-4" />
          <span>添加网址</span>
        </button>

        <!-- Theme Toggle -->
        <button
          @click="themeStore.toggleTheme"
          class="p-2 border-2 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black rounded-none transition-colors duration-200"
          :title="themeStore.isDark ? '切换到亮色模式' : '切换到暗黑模式'"
        >
          <Sun v-if="themeStore.isDark" class="w-4 h-4" />
          <Moon v-else class="w-4 h-4" />
        </button>

        <!-- User / Auth Dropdown -->
        <div v-if="authStore.isAuthenticated" class="relative" ref="userMenuRef">
          <button
            @click="isUserMenuOpen = !isUserMenuOpen"
            class="flex items-center p-1 border-2 border-black dark:border-white rounded-none hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
          >
            <div class="w-6 h-6 bg-black text-white dark:bg-white dark:text-black font-black text-xs flex items-center justify-center">
              {{ (authStore.user?.email || 'U').charAt(0).toUpperCase() }}
            </div>
          </button>

          <!-- Dropdown popup -->
          <div
            v-if="isUserMenuOpen"
            @click.stop
            class="absolute right-0 mt-2 w-56 p-2 bg-white dark:bg-black border-2 border-black dark:border-white rounded-none z-50"
          >
            <div class="px-3 py-2 border-b-2 border-black dark:border-white mb-2">
              <p class="text-[10px] font-mono uppercase text-gray-500">已登录账号</p>
              <p class="text-xs font-mono font-bold truncate mt-0.5">
                {{ authStore.user?.email }}
              </p>
            </div>
            <button
              @click="handleSignOut"
              class="w-full px-3 py-2 text-left text-xs font-bold text-[#ff3366] hover:bg-[#ff3366] hover:text-white flex items-center gap-2 transition-colors duration-200"
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
          class="p-2 sm:px-3 sm:py-1.5 border-2 border-black dark:border-white text-xs font-bold uppercase tracking-wider hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black rounded-none transition-colors duration-200 inline-flex items-center justify-center gap-1.5 whitespace-nowrap flex-shrink-0"
          title="登录 / 注册"
        >
          <User class="w-4 h-4 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
          <span class="hidden sm:inline">登录 / 注册</span>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import {
  Menu,
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
