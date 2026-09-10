<template>
  <header
    class="sticky top-0 z-40 w-full bg-white dark:bg-black text-black dark:text-white border-b-2 border-black dark:border-white transition-colors flex-shrink-0"
  >
    <div class="w-full px-2.5 sm:px-4 md:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
      <!-- Left: Mobile Menu Toggle & Brand Logo (Logo hidden on mobile) -->
      <div class="flex items-center gap-2 sm:gap-4 flex-shrink-0">
        <button
          type="button"
          @click="emit('toggle-mobile-sidebar')"
          class="p-2 border-2 border-black dark:border-white md:hidden hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black rounded-none transition-colors"
          title="打开菜单"
        >
          <Menu class="w-4 h-4" />
        </button>

        <!-- Brand Logo (Desktop only) -->
        <a
          href="#"
          @click.prevent="navStore.activeCategoryId = 'ALL'"
          class="hidden md:flex items-center gap-3 group"
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

      <!-- Center: Web Search Bar with Engine Selector -->
      <div class="flex-1 min-w-0 max-w-xl mx-1 sm:mx-4">
        <form
          @submit.prevent="handleSearch"
          class="relative flex items-center border-2 border-black dark:border-white bg-white dark:bg-black rounded-none shadow-none"
        >
          <!-- Engine Selector Dropdown Trigger -->
          <div class="relative" ref="engineMenuRef">
            <button
              type="button"
              @click="isEngineMenuOpen = !isEngineMenuOpen"
              class="h-8 sm:h-9 px-2 sm:px-2.5 flex items-center gap-1 text-xs font-bold border-r-2 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors rounded-none whitespace-nowrap bg-transparent"
              title="切换搜索引擎"
            >
              <span>{{ currentEngine.name }}</span>
              <ChevronDown class="w-3 h-3" />
            </button>

            <!-- Dropdown Menu -->
            <div
              v-if="isEngineMenuOpen"
              class="absolute left-0 top-full mt-1.5 w-28 bg-white dark:bg-black border-2 border-black dark:border-white rounded-none shadow-none z-50 py-1"
            >
              <button
                v-for="eng in SEARCH_ENGINES"
                :key="eng.id"
                type="button"
                @click="selectEngine(eng.id)"
                class="w-full text-left px-3 py-1.5 text-xs font-bold hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black flex items-center justify-between transition-colors"
                :class="{ 'bg-black text-white dark:bg-white dark:text-black': eng.id === selectedEngineId }"
              >
                <span>{{ eng.name }}</span>
                <Check v-if="eng.id === selectedEngineId" class="w-3 h-3" />
              </button>
            </div>
          </div>

          <!-- Search Input -->
          <input
            v-model="searchInput"
            @input="handleInput"
            type="text"
            :placeholder="currentEngine.placeholder"
            class="flex-1 min-w-0 h-8 sm:h-9 px-2.5 text-xs sm:text-sm bg-transparent text-black dark:text-white rounded-none focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-600"
          />

          <!-- Clear Button -->
          <button
            v-if="searchInput"
            type="button"
            @click="clearSearch"
            class="p-1 text-gray-500 hover:text-black dark:hover:text-white mr-1"
            title="清空内容"
          >
            <X class="w-3.5 h-3.5" />
          </button>

          <!-- Search Submit Button -->
          <button
            type="submit"
            class="h-8 sm:h-9 px-2.5 sm:px-3 bg-black text-white dark:bg-white dark:text-black hover:bg-[#ff3366] dark:hover:bg-[#ff3366] dark:hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border-l-2 border-black dark:border-white rounded-none flex-shrink-0"
            title="点击搜索或按回车"
          >
            <Search class="w-3.5 h-3.5" />
            <span class="hidden md:inline">搜索</span>
          </button>
        </form>
      </div>

      <!-- Right: Action Buttons & User Profile (Desktop only, mobile moved to Drawer) -->
      <div class="hidden md:flex items-center gap-2 sm:gap-3 flex-shrink-0">
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
              @click="isUserMenuOpen = false; emit('open-change-password')"
              class="w-full px-3 py-2 text-left text-xs font-bold hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black flex items-center gap-2 transition-colors duration-200 mb-1"
            >
              <KeyRound class="w-3.5 h-3.5" />
              修改密码
            </button>
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
import { ref, computed, onMounted, onUnmounted } from 'vue';
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
  KeyRound,
  ChevronDown,
  Check,
} from '@lucide/vue';
import { useNavStore } from '../../stores/nav';
import { useThemeStore } from '../../stores/theme';
import { useAuthStore } from '../../stores/auth';

const emit = defineEmits<{
  (e: 'toggle-mobile-sidebar'): void;
  (e: 'open-add-website'): void;
  (e: 'open-reorder'): void;
  (e: 'open-auth'): void;
  (e: 'open-change-password'): void;
}>();

const navStore = useNavStore();
const themeStore = useThemeStore();
const authStore = useAuthStore();

interface SearchEngine {
  id: string;
  name: string;
  url: string;
  placeholder: string;
}

const SEARCH_ENGINES: SearchEngine[] = [
  {
    id: 'bing',
    name: '必应',
    url: 'https://www.bing.com/search?q=',
    placeholder: '在必应中搜索，回车直达...',
  },
  {
    id: 'baidu',
    name: '百度',
    url: 'https://www.baidu.com/s?wd=',
    placeholder: '在百度中搜索，回车直达...',
  },
  {
    id: 'google',
    name: '谷歌',
    url: 'https://www.google.com/search?q=',
    placeholder: '在 Google 中搜索，回车直达...',
  },
  {
    id: 'github',
    name: 'GitHub',
    url: 'https://github.com/search?q=',
    placeholder: '在 GitHub 中搜索仓库...',
  },
  {
    id: 'local',
    name: '站内',
    url: '',
    placeholder: '筛选站内网址、名称或描述...',
  },
];

const selectedEngineId = ref<string>(localStorage.getItem('alink_search_engine') || 'bing');
const isEngineMenuOpen = ref(false);
const engineMenuRef = ref<HTMLElement | null>(null);
const searchInput = ref('');

const currentEngine = computed(() => {
  return SEARCH_ENGINES.find((e) => e.id === selectedEngineId.value) || SEARCH_ENGINES[0];
});

function selectEngine(id: string) {
  selectedEngineId.value = id;
  localStorage.setItem('alink_search_engine', id);
  isEngineMenuOpen.value = false;
  if (id === 'local') {
    navStore.searchQuery = searchInput.value;
  } else {
    navStore.searchQuery = '';
  }
}

function handleSearch() {
  const q = searchInput.value.trim();
  if (currentEngine.value.id === 'local') {
    navStore.searchQuery = q;
    return;
  }

  if (!q) {
    if (currentEngine.value.url) {
      window.open(currentEngine.value.url.split('?')[0], '_blank');
    }
    return;
  }

  const targetUrl = `${currentEngine.value.url}${encodeURIComponent(q)}`;
  window.open(targetUrl, '_blank');
}

function clearSearch() {
  searchInput.value = '';
  if (currentEngine.value.id === 'local') {
    navStore.searchQuery = '';
  }
}

function handleInput() {
  if (currentEngine.value.id === 'local') {
    navStore.searchQuery = searchInput.value;
  }
}

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
  if (engineMenuRef.value && !engineMenuRef.value.contains(e.target as Node)) {
    isEngineMenuOpen.value = false;
  }
}

onMounted(() => {
  window.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside);
});
</script>
