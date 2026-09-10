<template>
  <span v-if="isEmoji" class="inline-flex items-center justify-center select-none" :class="customClass">
    {{ icon }}
  </span>
  <component
    v-else-if="iconComponent"
    :is="iconComponent"
    :class="customClass"
    :size="size"
    :stroke-width="strokeWidth"
  />
  <Folder v-else :class="customClass" :size="size" :stroke-width="strokeWidth" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
  Folder,
  Search,
  Bot,
  Code2,
  Sparkles,
  Compass,
  Globe,
  Bookmark,
  Star,
  Wrench,
  BookOpen,
  Coffee,
  Music,
  Video,
  ShoppingBag,
  Shield,
  Terminal,
  Cpu,
  Database,
  Palette,
  Cloud,
  Heart,
  Flame,
  Zap,
  CheckCircle2,
  FileText,
  Image,
  Film,
  MessageSquare,
  Headphones,
  Gamepad2,
  Settings,
  Box,
  Layers,
  Tag,
  ExternalLink,
} from '@lucide/vue';

const ICON_COMPONENTS: Record<string, any> = {
  Folder,
  Search,
  Bot,
  Code2,
  Sparkles,
  Compass,
  Globe,
  Bookmark,
  Star,
  Wrench,
  BookOpen,
  Coffee,
  Music,
  Video,
  ShoppingBag,
  Shield,
  Terminal,
  Cpu,
  Database,
  Palette,
  Cloud,
  Heart,
  Flame,
  Zap,
  CheckCircle2,
  FileText,
  Image,
  Film,
  MessageSquare,
  Headphones,
  Gamepad2,
  Settings,
  Box,
  Layers,
  Tag,
  ExternalLink,
};

const props = withDefaults(
  defineProps<{
    icon?: string;
    size?: number | string;
    strokeWidth?: number | string;
    customClass?: string;
  }>(),
  {
    icon: 'Folder',
    size: 18,
    strokeWidth: 2,
    customClass: 'w-4 h-4',
  }
);

// Regex for emoji detection
const isEmoji = computed(() => {
  if (!props.icon) return false;
  const emojiRegex = /(\p{Emoji_Presentation}|\p{Extended_Pictographic})/u;
  return emojiRegex.test(props.icon) && props.icon.length <= 4;
});

const iconComponent = computed(() => {
  if (!props.icon || isEmoji.value) return null;
  return ICON_COMPONENTS[props.icon] || null;
});
</script>
