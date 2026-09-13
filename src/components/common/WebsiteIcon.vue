<template>
  <div ref="rootRef" class="relative inline-flex items-center justify-center" :class="iconClass">
    <!-- 兜底生成图标常驻底层：候选请求挂起时底部仍有图案，不会出现空白格子 -->
    <GeneratedIcon :seed="effectiveSeed" :custom-class="iconClass" />

    <!--
      真实图标必须是不透明的（bg-white）：生成图标是白底彩色像素块，
      而很多 favicon 是透明底，不铺底就会透出下层的默认图案。
      未加载完成时保持 opacity-0，此时背景与内容都不可见，兜底图标正常展示。
    -->
    <img
      v-if="currentSrc"
      ref="imgRef"
      :src="currentSrc"
      :alt="title || 'icon'"
      :loading="loading"
      decoding="async"
      referrerpolicy="no-referrer"
      :class="[
        imgClass,
        'absolute inset-0 m-auto bg-white transition-opacity duration-200',
        isLoaded ? 'opacity-100' : 'opacity-0',
      ]"
      @load="handleImgLoad"
      @error="handleImgError"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import {
  getFaviconCandidates,
  extractDomain,
  rememberFaviconResolution,
} from '../../utils';
import { observeVisibility } from '../../utils/viewport';
import GeneratedIcon from './GeneratedIcon.vue';

const props = withDefaults(
  defineProps<{
    url?: string;
    iconUrl?: string | null;
    title?: string;
    seed?: string;
    imgClass?: string;
    iconClass?: string;
    loading?: 'lazy' | 'eager';
  }>(),
  {
    url: '',
    iconUrl: '',
    title: '',
    seed: '',
    imgClass: 'w-7 h-7 sm:w-8 sm:h-8 object-contain',
    iconClass: 'w-7 h-7 sm:w-8 sm:h-8',
    loading: 'lazy',
  }
);

const rootRef = ref<HTMLElement | null>(null);
const imgRef = ref<HTMLImageElement | null>(null);

const candidateIndex = ref(0);
const hasFailedAll = ref(false);
const isLoaded = ref(false);
const isVisible = ref(false);

let timer: ReturnType<typeof setTimeout> | null = null;
let stopObserving: (() => void) | null = null;
/** 递增令牌：候选切换后，上一轮的回调不会再影响新一轮状态 */
let token = 0;

const domain = computed(() => extractDomain(props.url || ''));

const candidates = computed(() => {
  if (!props.url && !props.iconUrl) return [];
  return getFaviconCandidates(props.url || '', props.iconUrl);
});

const currentCandidate = computed(() => candidates.value[candidateIndex.value] ?? null);
const currentSrc = computed(() =>
  hasFailedAll.value ? '' : currentCandidate.value?.url ?? ''
);

const effectiveSeed = computed(() => {
  return props.seed || `${props.title || 'ALINK'} ${props.url || 'default'}`;
});

function clearTimer() {
  if (timer !== null) {
    clearTimeout(timer);
    timer = null;
  }
}

/**
 * 是否为「占位垃圾图」。
 *
 * 注意不能简单用 naturalWidth === 0 判断失败：没有 width/height 属性、
 * 只有 viewBox 的 SVG 加载成功时 naturalWidth 同样是 0，那样会把大量
 * 正常的 SVG favicon 误判为失败，最终全部退化成默认图标。
 * 这里只把典型的 1x1 占位图视为垃圾。
 */
function isJunkImage(img: HTMLImageElement): boolean {
  return img.naturalWidth === 1 && img.naturalHeight === 1;
}

function markLoaded(img: HTMLImageElement) {
  isLoaded.value = true;
  clearTimer();
  // 1x1 之类的占位图不写入记忆，避免被其他卡片复用
  if (img.naturalWidth > 1 && domain.value) {
    rememberFaviconResolution(domain.value, img.currentSrc || img.src);
  }
}

/**
 * 仅在「已进入视口 + 尚未成功 + 仍有候选」时计时。
 * 候选迟迟不返回（受限网络下的静默丢包）就主动降级到下一个，
 * 这是避免整条兜底链路被永久卡死的关键。
 */
function syncTimer() {
  clearTimer();
  if (!isVisible.value || isLoaded.value || hasFailedAll.value) return;

  const candidate = currentCandidate.value;
  if (!candidate) return;

  const epoch = token;
  timer = setTimeout(() => {
    if (epoch !== token) return;

    // 超时前其实已经加载完成（load 事件可能已被错过）——按成功处理
    const img = imgRef.value;
    if (img?.complete && !isJunkImage(img)) {
      markLoaded(img);
      return;
    }
    advance();
  }, candidate.timeout);
}

function advance() {
  clearTimer();
  isLoaded.value = false;

  if (candidateIndex.value < candidates.value.length - 1) {
    candidateIndex.value += 1;
    syncTimer();
  } else {
    // 全部候选耗尽：只保留底层生成图标
    hasFailedAll.value = true;
  }
}

function handleImgLoad(event: Event) {
  const img = event.target as HTMLImageElement;
  if (isJunkImage(img)) {
    advance();
    return;
  }
  markLoaded(img);
}

function handleImgError() {
  advance();
}

function restart() {
  token += 1;
  candidateIndex.value = 0;
  hasFailedAll.value = false;
  isLoaded.value = false;
  syncTimer();
}

watch(() => [props.url, props.iconUrl], restart, { immediate: true });

onMounted(() => {
  if (rootRef.value) {
    stopObserving = observeVisibility(rootRef.value, (visible) => {
      isVisible.value = visible;
      syncTimer();
    });
  }
});

onUnmounted(() => {
  token += 1;
  clearTimer();
  stopObserving?.();
  stopObserving = null;
});
</script>
