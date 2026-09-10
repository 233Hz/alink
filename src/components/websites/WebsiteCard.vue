<template>
  <div
    class="group relative border-2 border-black dark:border-white bg-white dark:bg-black text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors duration-200 rounded-none p-6 flex flex-col justify-between"
  >
    <!-- Top Row: Icon, Title & Domain, Order Badge & Actions Menu -->
    <div class="flex items-start justify-between gap-3">
      <!-- Clickable Title & Icon -->
      <a
        :href="normalizedUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center gap-3.5 flex-1 min-w-0"
        :title="website.title + ' - ' + website.url"
      >
        <!-- Favicon / Fallback -->
        <div
          class="w-12 h-12 border-2 border-black dark:border-white rounded-none bg-white flex items-center justify-center overflow-hidden flex-shrink-0 p-1"
        >
          <img
            v-if="iconSrc"
            :src="iconSrc"
            :alt="website.title"
            class="w-7 h-7 object-contain"
            loading="lazy"
            @error="handleImgError"
          />
          <span
            v-else
            class="text-base font-black uppercase text-black select-none"
          >
            {{ letterBadge }}
          </span>
        </div>

        <!-- Title & Hostname -->
        <div class="min-w-0 flex-1">
          <h3 class="font-bold tracking-tight text-base sm:text-lg truncate">
            {{ website.title }}
          </h3>
          <p
            class="text-xs font-mono text-gray-500 group-hover:text-gray-300 dark:group-hover:text-gray-600 truncate mt-0.5"
          >
            {{ displayDomain }}
          </p>
        </div>
      </a>

      <!-- Right Action Items: Order Badge + Menu -->
      <div class="flex items-center gap-1.5 flex-shrink-0 ml-1">
        <!-- Order badge -->
        <span
          class="text-xs font-mono px-1.5 py-0.5 border border-black dark:border-white group-hover:border-white dark:group-hover:border-black rounded-none whitespace-nowrap"
          title="排序序号"
        >
          #{{ website.order_index }}
        </span>

        <!-- Dropdown trigger -->
        <div class="relative" ref="menuRef">
          <button
            @click.stop="toggleMenu"
            class="p-1 border border-black dark:border-white group-hover:border-white dark:group-hover:border-black rounded-none transition-colors"
            title="更多操作"
          >
            <MoreVertical class="w-3.5 h-3.5" />
          </button>

          <!-- Dropdown popup -->
          <div
            v-if="isMenuOpen"
            @click.stop
            class="absolute right-0 mt-1 w-36 py-1 bg-white dark:bg-black text-black dark:text-white border-2 border-black dark:border-white rounded-none z-30"
          >
            <button
              @click="handleEdit"
              class="w-full px-3 py-1.5 text-left text-xs font-bold hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black flex items-center gap-2 transition-colors duration-200"
            >
              <Pencil class="w-3.5 h-3.5" />
              编辑网址
            </button>
            <button
              @click="handleMoveUp"
              :disabled="isFirst"
              :class="[
                'w-full px-3 py-1.5 text-left text-xs font-bold flex items-center gap-2 transition-colors duration-200',
                isFirst
                  ? 'opacity-30 cursor-not-allowed'
                  : 'hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black',
              ]"
            >
              <ArrowUp class="w-3.5 h-3.5" />
              向前移动
            </button>
            <button
              @click="handleMoveDown"
              :disabled="isLast"
              :class="[
                'w-full px-3 py-1.5 text-left text-xs font-bold flex items-center gap-2 transition-colors duration-200',
                isLast
                  ? 'opacity-30 cursor-not-allowed'
                  : 'hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black',
              ]"
            >
              <ArrowDown class="w-3.5 h-3.5" />
              向后移动
            </button>
            <div class="border-t border-black dark:border-white my-1"></div>
            <button
              @click="handleDelete"
              class="w-full px-3 py-1.5 text-left text-xs font-bold text-[#ff3366] hover:bg-[#ff3366] hover:text-white flex items-center gap-2 transition-colors duration-200"
            >
              <Trash2 class="w-3.5 h-3.5" />
              删除网址
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Description -->
    <p
      class="mt-4 text-xs sm:text-sm leading-relaxed text-gray-500 dark:text-gray-400 group-hover:text-gray-300 dark:group-hover:text-gray-600 line-clamp-2 h-10"
      :title="website.description || ''"
    >
      {{ website.description || '暂无描述信息' }}
    </p>

    <!-- Bottom Bar: URL & Direct Visit Link -->
    <div
      class="mt-4 pt-3 border-t-2 border-black dark:border-white group-hover:border-white dark:group-hover:border-black flex items-center justify-between gap-3"
    >
      <span
        class="text-xs font-mono text-gray-500 group-hover:text-gray-300 dark:group-hover:text-gray-600 truncate flex-1 min-w-0"
        :title="website.url"
      >
        {{ displayDomain }}
      </span>

      <a
        :href="normalizedUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="border-2 border-black dark:border-white bg-black text-white dark:bg-white dark:text-black group-hover:bg-white group-hover:text-black dark:group-hover:bg-black dark:group-hover:text-white hover:border-[#ff3366] px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-none inline-flex items-center gap-1.5 transition-colors duration-200 whitespace-nowrap flex-shrink-0"
      >
        <span>直达</span>
        <ExternalLink class="w-3 h-3" />
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { ExternalLink, MoreVertical, Pencil, Trash2, ArrowUp, ArrowDown } from '@lucide/vue';
import type { Website } from '../../types';
import { normalizeUrl, extractDomain, getFaviconUrl } from '../../utils';

const props = defineProps<{
  website: Website;
  isFirst?: boolean;
  isLast?: boolean;
}>();

const emit = defineEmits<{
  (e: 'edit', website: Website): void;
  (e: 'delete', website: Website): void;
  (e: 'move-up', website: Website): void;
  (e: 'move-down', website: Website): void;
}>();

const isMenuOpen = ref(false);
const imgFailed = ref(false);
const menuRef = ref<HTMLElement | null>(null);

const normalizedUrl = computed(() => normalizeUrl(props.website.url));
const displayDomain = computed(() => extractDomain(props.website.url));

const iconSrc = computed(() => {
  if (imgFailed.value) return '';
  if (
    props.website.icon_url &&
    props.website.icon_url.trim() &&
    !props.website.icon_url.endsWith('/favicon.ico')
  ) {
    return props.website.icon_url.trim();
  }
  return getFaviconUrl(props.website.url);
});

const letterBadge = computed(() => {
  const t = props.website.title || displayDomain.value || 'W';
  return t.charAt(0).toUpperCase();
});

function handleImgError() {
  imgFailed.value = true;
}

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value;
}

function closeMenu(e?: MouseEvent) {
  if (menuRef.value && !menuRef.value.contains(e?.target as Node)) {
    isMenuOpen.value = false;
  }
}

function handleEdit() {
  isMenuOpen.value = false;
  emit('edit', props.website);
}

function handleDelete() {
  isMenuOpen.value = false;
  emit('delete', props.website);
}

function handleMoveUp() {
  isMenuOpen.value = false;
  emit('move-up', props.website);
}

function handleMoveDown() {
  isMenuOpen.value = false;
  emit('move-down', props.website);
}

onMounted(() => {
  window.addEventListener('click', closeMenu);
});

onUnmounted(() => {
  window.removeEventListener('click', closeMenu);
});
</script>
