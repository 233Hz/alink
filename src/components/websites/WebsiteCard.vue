<template>
  <div
    class="group relative flex flex-col justify-between p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md hover:border-brand-500/40 dark:hover:border-brand-500/40 transition-all duration-200"
  >
    <!-- Top Row: Icon, Title, Order Badge & Actions Menu -->
    <div class="flex items-start justify-between gap-3">
      <a
        :href="normalizedUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center gap-3 flex-1 min-w-0 group/link"
        :title="website.url"
      >
        <!-- Favicon / Custom Icon / Fallback -->
        <div
          class="relative flex-shrink-0 w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center overflow-hidden transition-transform group-hover/link:scale-105"
        >
          <img
            v-if="iconSrc"
            :src="iconSrc"
            :alt="website.title"
            class="w-6 h-6 object-contain"
            loading="lazy"
            @error="handleImgError"
          />
          <span
            v-else
            class="text-sm font-semibold uppercase text-brand-600 dark:text-brand-400 select-none"
          >
            {{ letterBadge }}
          </span>
        </div>

        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-1.5">
            <h3
              class="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate group-hover/link:text-brand-600 dark:group-hover/link:text-brand-400 transition-colors"
            >
              {{ website.title }}
            </h3>
            <ExternalLink
              class="w-3.5 h-3.5 opacity-0 group-hover/link:opacity-100 text-slate-400 dark:text-slate-500 transition-opacity flex-shrink-0"
            />
          </div>
          <p class="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">
            {{ displayDomain }}
          </p>
        </div>
      </a>

      <!-- Quick Action Menu Dropdown / Buttons -->
      <div class="flex items-center gap-1">
        <!-- Order badge -->
        <span
          class="text-[11px] font-mono text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/80 px-1.5 py-0.5 rounded"
          title="排序序号"
        >
          #{{ website.order_index }}
        </span>

        <!-- Dropdown trigger -->
        <div class="relative" ref="menuRef">
          <button
            @click.stop="toggleMenu"
            class="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="更多操作"
          >
            <MoreVertical class="w-4 h-4" />
          </button>

          <!-- Dropdown popup -->
          <div
            v-if="isMenuOpen"
            @click.stop
            class="absolute right-0 mt-1 w-36 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-30 animate-in fade-in zoom-in-95 duration-100"
          >
            <button
              @click="handleEdit"
              class="w-full px-3 py-1.5 text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
            >
              <Pencil class="w-3.5 h-3.5 text-slate-400" />
              编辑网址
            </button>
            <button
              @click="handleMoveUp"
              :disabled="isFirst"
              :class="[
                'w-full px-3 py-1.5 text-left text-xs font-medium flex items-center gap-2',
                isFirst
                  ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800',
              ]"
            >
              <ArrowUp class="w-3.5 h-3.5 text-slate-400" />
              向前移动
            </button>
            <button
              @click="handleMoveDown"
              :disabled="isLast"
              :class="[
                'w-full px-3 py-1.5 text-left text-xs font-medium flex items-center gap-2',
                isLast
                  ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800',
              ]"
            >
              <ArrowDown class="w-3.5 h-3.5 text-slate-400" />
              向后移动
            </button>
            <div class="my-1 border-t border-slate-100 dark:border-slate-800"></div>
            <button
              @click="handleDelete"
              class="w-full px-3 py-1.5 text-left text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2"
            >
              <Trash2 class="w-3.5 h-3.5 text-rose-500" />
              删除网址
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Description -->
    <p
      v-if="website.description"
      class="mt-2.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed"
      :title="website.description"
    >
      {{ website.description }}
    </p>

    <!-- Bottom Bar: Direct Visit Link -->
    <div class="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
      <span class="text-[11px] text-slate-400 dark:text-slate-500 truncate max-w-[150px]">
        {{ website.url }}
      </span>
      <a
        :href="normalizedUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
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
  if (props.website.icon_url && props.website.icon_url.trim()) {
    return props.website.icon_url.trim();
  }
  return getFaviconUrl(props.website.url);
});

const letterBadge = computed(() => {
  const t = props.website.title || displayDomain.value || 'W';
  return t.charAt(0);
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
