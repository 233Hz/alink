<template>
  <img
    v-if="currentSrc && !hasFailedAll"
    :src="currentSrc"
    :alt="title || 'icon'"
    :class="imgClass"
    :loading="loading"
    @error="handleImgError"
  />
  <GeneratedIcon
    v-else
    :seed="effectiveSeed"
    :custom-class="iconClass"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { getFaviconCandidates } from '../../utils';
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

const candidateIndex = ref(0);
const hasFailedAll = ref(false);

const candidates = computed(() => {
  if (!props.url && !props.iconUrl) return [];
  return getFaviconCandidates(props.url || '', props.iconUrl);
});

const currentSrc = computed(() => {
  if (hasFailedAll.value) return '';
  if (!candidates.value.length || candidateIndex.value >= candidates.value.length) return '';
  return candidates.value[candidateIndex.value];
});

const effectiveSeed = computed(() => {
  return props.seed || `${props.title || 'ALINK'} ${props.url || 'default'}`;
});

watch(
  () => [props.url, props.iconUrl],
  () => {
    candidateIndex.value = 0;
    hasFailedAll.value = false;
  }
);

function handleImgError() {
  if (candidateIndex.value < candidates.value.length - 1) {
    candidateIndex.value += 1;
  } else {
    hasFailedAll.value = true;
  }
}
</script>
