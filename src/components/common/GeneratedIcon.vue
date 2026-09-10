<template>
  <div
    class="inline-flex items-center justify-center select-none overflow-hidden"
    :class="customClass"
  >
    <img
      v-if="dicebearUrl && !dicebearFailed"
      :src="dicebearUrl"
      :alt="seed"
      class="w-full h-full object-contain"
      loading="lazy"
      @error="handleDicebearError"
    />
    <div
      v-else
      class="w-full h-full flex items-center justify-center"
      v-html="localSvgContent"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import {
  getGeneratedIconSvg,
  getDiceBearAvatarUrl,
  type DiceBearStyle,
} from '../../utils/iconGenerator';

const props = withDefaults(
  defineProps<{
    seed?: string;
    customClass?: string;
    style?: DiceBearStyle;
    useOnlineService?: boolean;
  }>(),
  {
    seed: 'alink',
    customClass: 'w-7 h-7 sm:w-8 sm:h-8',
    style: 'shapes',
    useOnlineService: true,
  }
);

const dicebearFailed = ref(false);

watch(
  () => [props.seed, props.style],
  () => {
    dicebearFailed.value = false;
  }
);

function handleDicebearError() {
  dicebearFailed.value = true;
}

const dicebearUrl = computed(() => {
  if (!props.useOnlineService) return '';
  return getDiceBearAvatarUrl(props.seed || 'alink', props.style || 'shapes');
});

const localSvgContent = computed(() => {
  return getGeneratedIconSvg(props.seed || 'alink');
});
</script>
