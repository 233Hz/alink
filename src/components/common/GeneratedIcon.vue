<template>
  <div
    class="inline-flex items-center justify-center select-none overflow-hidden"
    :class="customClass"
    v-html="svgContent"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { getGeneratedIconSvg } from '../../utils/iconGenerator';

const props = withDefaults(
  defineProps<{
    seed?: string;
    customClass?: string;
  }>(),
  {
    seed: 'alink',
    customClass: 'w-7 h-7 sm:w-8 sm:h-8',
  }
);

const svgContent = computed(() => {
  return getGeneratedIconSvg(props.seed);
});
</script>
