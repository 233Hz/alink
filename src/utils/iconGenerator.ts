/**
 * Minimalist Flat Fallback Icon Generator for ALink
 * Generates geometric, zero-radius, high-contrast SVG vector icons
 * with signature #ff3366 accents, strictly compliant with DESGIN.md.
 */

export interface MinimalistIconDefinition {
  name: string;
  keywords: string[];
  elements: string;
}

export function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
  }
  return Math.abs(hash);
}

export const MINIMALIST_ICONS: MinimalistIconDefinition[] = [
  {
    name: 'terminal',
    keywords: ['term', 'cli', 'bash', 'shell', 'cmd', 'console', 'prompt', 'linux', 'ubuntu'],
    elements: `
      <polyline points="7,10 13,16 7,22" stroke="#000000" stroke-width="2.5" fill="none" stroke-linecap="square"/>
      <line x1="16" y1="22" x2="25" y2="22" stroke="#ff3366" stroke-width="2.5" stroke-linecap="square"/>
    `,
  },
  {
    name: 'globe',
    keywords: ['web', 'net', 'site', 'world', 'global', 'online', 'domain', 'internet'],
    elements: `
      <rect x="5" y="5" width="22" height="22" stroke="#000000" stroke-width="2" fill="none"/>
      <line x1="5" y1="16" x2="27" y2="16" stroke="#000000" stroke-width="2"/>
      <line x1="16" y1="5" x2="16" y2="27" stroke="#000000" stroke-width="2"/>
      <rect x="13" y="13" width="6" height="6" fill="#ff3366"/>
    `,
  },
  {
    name: 'compass',
    keywords: ['nav', 'compass', 'explore', 'map', 'travel', 'guide', 'locate'],
    elements: `
      <polygon points="16,4 27,28 16,22 5,28" stroke="#000000" stroke-width="2" fill="none" stroke-linejoin="miter"/>
      <polygon points="16,8 23,24 16,20" fill="#ff3366"/>
    `,
  },
  {
    name: 'code',
    keywords: ['code', 'dev', 'git', 'hub', 'repo', 'develop', 'script', 'program', 'vue', 'react', 'ts', 'js'],
    elements: `
      <polyline points="10,9 4,16 10,23" stroke="#000000" stroke-width="2.5" fill="none" stroke-linecap="square"/>
      <polyline points="22,9 28,16 22,23" stroke="#000000" stroke-width="2.5" fill="none" stroke-linecap="square"/>
      <line x1="18" y1="7" x2="14" y2="25" stroke="#ff3366" stroke-width="2.5" stroke-linecap="square"/>
    `,
  },
  {
    name: 'cpu',
    keywords: ['cpu', 'chip', 'hardware', 'intel', 'amd', 'arm', 'tech', 'processor', 'compute', 'system'],
    elements: `
      <rect x="8" y="8" width="16" height="16" stroke="#000000" stroke-width="2" fill="none"/>
      <rect x="12" y="12" width="8" height="8" fill="#ff3366"/>
      <line x1="12" y1="3" x2="12" y2="8" stroke="#000000" stroke-width="2"/>
      <line x1="20" y1="3" x2="20" y2="8" stroke="#000000" stroke-width="2"/>
      <line x1="12" y1="24" x2="12" y2="29" stroke="#000000" stroke-width="2"/>
      <line x1="20" y1="24" x2="20" y2="29" stroke="#000000" stroke-width="2"/>
      <line x1="3" y1="12" x2="8" y2="12" stroke="#000000" stroke-width="2"/>
      <line x1="3" y1="20" x2="8" y2="20" stroke="#000000" stroke-width="2"/>
      <line x1="24" y1="12" x2="29" y2="12" stroke="#000000" stroke-width="2"/>
      <line x1="24" y1="20" x2="29" y2="20" stroke="#000000" stroke-width="2"/>
    `,
  },
  {
    name: 'zap',
    keywords: ['zap', 'fast', 'speed', 'quick', 'power', 'flash', 'energy', 'vite'],
    elements: `
      <polygon points="17,3 7,17 15,17 15,29 25,15 17,15" stroke="#000000" stroke-width="2" fill="none" stroke-linejoin="miter"/>
      <polygon points="17,7 10,17 15,17" fill="#ff3366"/>
    `,
  },
  {
    name: 'layers',
    keywords: ['layer', 'stack', 'cloud', 'server', 'docker', 'k8s', 'infra', 'platform'],
    elements: `
      <polygon points="16,4 27,10 16,16 5,10" stroke="#000000" stroke-width="2" fill="none" stroke-linejoin="miter"/>
      <polyline points="5,15 16,21 27,15" stroke="#000000" stroke-width="2" fill="none" stroke-linejoin="miter"/>
      <polyline points="5,20 16,26 27,20" stroke="#ff3366" stroke-width="2.5" fill="none" stroke-linejoin="miter"/>
    `,
  },
  {
    name: 'box',
    keywords: ['box', 'cube', 'package', 'npm', 'cargo', 'product', 'item', 'tool'],
    elements: `
      <rect x="5" y="5" width="22" height="22" stroke="#000000" stroke-width="2" fill="none"/>
      <line x1="5" y1="5" x2="16" y2="16" stroke="#000000" stroke-width="2"/>
      <rect x="16" y="16" width="11" height="11" fill="#ff3366"/>
    `,
  },
  {
    name: 'sparkle',
    keywords: ['ai', 'gpt', 'deepseek', 'claude', 'gemini', 'chat', 'magic', 'star', 'smart', 'bot', 'llm', 'model'],
    elements: `
      <polygon points="16,3 19,13 29,16 19,19 16,29 13,19 3,16 13,13" stroke="#000000" stroke-width="2" fill="none" stroke-linejoin="miter"/>
      <rect x="14" y="14" width="4" height="4" fill="#ff3366"/>
    `,
  },
  {
    name: 'target',
    keywords: ['target', 'goal', 'aim', 'focus', 'scope', 'radar', 'track', 'metric'],
    elements: `
      <rect x="6" y="6" width="20" height="20" stroke="#000000" stroke-width="2" fill="none"/>
      <rect x="13" y="13" width="6" height="6" fill="#ff3366"/>
      <line x1="16" y1="2" x2="16" y2="6" stroke="#000000" stroke-width="2"/>
      <line x1="16" y1="26" x2="16" y2="30" stroke="#000000" stroke-width="2"/>
      <line x1="2" y1="16" x2="6" y2="16" stroke="#000000" stroke-width="2"/>
      <line x1="26" y1="16" x2="30" y2="16" stroke="#000000" stroke-width="2"/>
    `,
  },
  {
    name: 'flame',
    keywords: ['hot', 'fire', 'flame', 'trending', 'popular', 'news', 'v2ex', 'reddit', 'forum'],
    elements: `
      <polygon points="16,4 22,12 18,15 24,25 8,25 14,15 10,12" stroke="#000000" stroke-width="2" fill="none" stroke-linejoin="miter"/>
      <rect x="13" y="16" width="6" height="7" fill="#ff3366"/>
    `,
  },
  {
    name: 'radio',
    keywords: ['radio', 'broadcast', 'signal', 'media', 'podcast', 'stream', 'audio', 'music'],
    elements: `
      <rect x="14" y="19" width="4" height="8" fill="#ff3366"/>
      <path d="M10,15 A8,8 0 0,1 22,15" stroke="#000000" stroke-width="2" fill="none"/>
      <path d="M5,10 A14,14 0 0,1 27,10" stroke="#000000" stroke-width="2" fill="none"/>
      <line x1="16" y1="19" x2="16" y2="15" stroke="#000000" stroke-width="2"/>
    `,
  },
  {
    name: 'bookmark',
    keywords: ['book', 'note', 'doc', 'wiki', 'notion', 'read', 'article', 'post', 'blog', 'learn'],
    elements: `
      <polygon points="7,4 25,4 25,28 16,21 7,28" stroke="#000000" stroke-width="2" fill="none" stroke-linejoin="miter"/>
      <polygon points="10,7 22,7 22,21 16,17 10,21" fill="#ff3366"/>
    `,
  },
  {
    name: 'layout',
    keywords: ['ui', 'ux', 'design', 'layout', 'art', 'css', 'figma', 'grid', 'frontend'],
    elements: `
      <rect x="4" y="4" width="10" height="10" stroke="#000000" stroke-width="2" fill="none"/>
      <rect x="18" y="4" width="10" height="10" fill="#000000"/>
      <rect x="4" y="18" width="10" height="10" fill="#000000"/>
      <rect x="18" y="18" width="10" height="10" fill="#ff3366"/>
    `,
  },
  {
    name: 'hash',
    keywords: ['hash', 'tag', 'topic', 'social', 'community', 'channel'],
    elements: `
      <line x1="11" y1="5" x2="9" y2="27" stroke="#000000" stroke-width="2.5"/>
      <line x1="23" y1="5" x2="21" y2="27" stroke="#000000" stroke-width="2.5"/>
      <line x1="5" y1="11" x2="27" y2="11" stroke="#000000" stroke-width="2.5"/>
      <line x1="4" y1="21" x2="26" y2="21" stroke="#ff3366" stroke-width="2.5"/>
    `,
  },
  {
    name: 'database',
    keywords: ['db', 'data', 'sql', 'mysql', 'postgres', 'redis', 'mongo', 'storage', 'supabase'],
    elements: `
      <rect x="5" y="5" width="22" height="6" stroke="#000000" stroke-width="2" fill="none"/>
      <rect x="5" y="13" width="22" height="6" stroke="#000000" stroke-width="2" fill="none"/>
      <rect x="5" y="21" width="22" height="6" stroke="#000000" stroke-width="2" fill="none"/>
      <rect x="20" y="7" width="4" height="2" fill="#ff3366"/>
      <rect x="20" y="15" width="4" height="2" fill="#ff3366"/>
      <rect x="20" y="23" width="4" height="2" fill="#ff3366"/>
    `,
  },
  {
    name: 'shield',
    keywords: ['sec', 'auth', 'login', 'protect', 'safe', 'guard', 'lock', 'shield'],
    elements: `
      <polygon points="16,4 27,8 27,18 16,28 5,18 5,8" stroke="#000000" stroke-width="2" fill="none" stroke-linejoin="miter"/>
      <polygon points="16,8 23,11 23,17 16,23" fill="#ff3366"/>
    `,
  },
  {
    name: 'radar',
    keywords: ['radar', 'scan', 'detect', 'monitor', 'analytics', 'status', 'ping'],
    elements: `
      <rect x="5" y="5" width="22" height="22" stroke="#000000" stroke-width="2" fill="none"/>
      <line x1="5" y1="5" x2="27" y2="27" stroke="#000000" stroke-width="2"/>
      <line x1="5" y1="27" x2="27" y2="5" stroke="#000000" stroke-width="2"/>
      <rect x="13" y="13" width="6" height="6" fill="#ff3366"/>
    `,
  },
  {
    name: 'chain',
    keywords: ['link', 'chain', 'connect', 'alink', 'url', 'bookmark', 'favorite'],
    elements: `
      <g transform="rotate(-45 16 16)">
        <path d="M14 11 H7 V21 H14" stroke="#000000" stroke-width="2.8" fill="none" stroke-linecap="square"/>
        <path d="M18 11 H25 V21 H18" stroke="#000000" stroke-width="2.8" fill="none" stroke-linecap="square"/>
        <line x1="11" y1="16" x2="21" y2="16" stroke="#ff3366" stroke-width="3.2" stroke-linecap="square"/>
      </g>
    `,
  },
  {
    name: 'diamond',
    keywords: ['diamond', 'gem', 'ruby', 'precious', 'valuable', 'star'],
    elements: `
      <polygon points="16,4 28,16 16,28 4,16" stroke="#000000" stroke-width="2" fill="none" stroke-linejoin="miter"/>
      <rect x="13" y="13" width="6" height="6" fill="#ff3366"/>
    `,
  },
  {
    name: 'pulse',
    keywords: ['pulse', 'activity', 'health', 'heart', 'rate', 'video', 'bilibili', 'youtube', 'stream'],
    elements: `
      <polyline points="4,16 10,16 13,7 19,25 22,16 28,16" stroke="#000000" stroke-width="2.5" fill="none" stroke-linecap="square" stroke-linejoin="miter"/>
      <rect x="11" y="5" width="4" height="4" fill="#ff3366"/>
    `,
  },
  {
    name: 'matrix',
    keywords: ['matrix', 'dots', 'grid', 'points', 'data', 'cluster'],
    elements: `
      <rect x="6" y="6" width="5" height="5" fill="#000000"/>
      <rect x="14" y="6" width="5" height="5" fill="#ff3366"/>
      <rect x="22" y="6" width="5" height="5" fill="#000000"/>
      <rect x="6" y="14" width="5" height="5" fill="#000000"/>
      <rect x="14" y="14" width="5" height="5" fill="#000000"/>
      <rect x="22" y="14" width="5" height="5" fill="#000000"/>
      <rect x="6" y="22" width="5" height="5" fill="#ff3366"/>
      <rect x="14" y="22" width="5" height="5" fill="#000000"/>
      <rect x="22" y="22" width="5" height="5" fill="#000000"/>
    `,
  },
  {
    name: 'folder',
    keywords: ['folder', 'dir', 'directory', 'file', 'archive', 'doc', 'repo'],
    elements: `
      <polygon points="5,6 13,6 16,10 27,10 27,26 5,26" stroke="#000000" stroke-width="2" fill="none" stroke-linejoin="miter"/>
      <line x1="5" y1="13" x2="27" y2="13" stroke="#000000" stroke-width="2"/>
      <rect x="18" y="17" width="6" height="5" fill="#ff3366"/>
    `,
  },
  {
    name: 'aperture',
    keywords: ['camera', 'photo', 'picture', 'image', 'lens', 'view', 'graphic', 'art'],
    elements: `
      <rect x="5" y="5" width="22" height="22" stroke="#000000" stroke-width="2" fill="none"/>
      <line x1="5" y1="12" x2="20" y2="5" stroke="#000000" stroke-width="2"/>
      <line x1="20" y1="5" x2="27" y2="20" stroke="#000000" stroke-width="2"/>
      <line x1="27" y1="20" x2="12" y2="27" stroke="#000000" stroke-width="2"/>
      <line x1="12" y1="27" x2="5" y2="12" stroke="#000000" stroke-width="2"/>
      <rect x="13" y="13" width="6" height="6" fill="#ff3366"/>
    `,
  },
];

function wrapSvg(innerContent: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="100%" height="100%" fill="none" shape-rendering="geometricPrecision">${innerContent.trim()}</svg>`;
}

/**
 * Returns an SVG string for a given seed (URL or title).
 * 1. Checks semantic keywords in seed for smart matching.
 * 2. Deterministically hashes seed to pick from the 24 Minimalist Flat icon designs.
 */
export function getGeneratedIconSvg(seed: string): string {
  const cleanSeed = (seed || 'alink').toLowerCase().trim();

  // 1. Semantic keyword matching
  for (const icon of MINIMALIST_ICONS) {
    if (icon.keywords.some((kw) => cleanSeed.includes(kw))) {
      return wrapSvg(icon.elements);
    }
  }

  // 2. Deterministic hash selection
  const hash = hashString(cleanSeed);
  const selectedIcon = MINIMALIST_ICONS[hash % MINIMALIST_ICONS.length];
  return wrapSvg(selectedIcon.elements);
}

/**
 * Returns a base64 or UTF-8 encoded SVG Data URL suitable for img :src.
 */
export function getGeneratedIconDataUrl(seed: string): string {
  const svg = getGeneratedIconSvg(seed);
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Randomly picks one icon and returns its SVG Data URL.
 */
export function getRandomGeneratedIconDataUrl(): string {
  const rand = Math.floor(Math.random() * MINIMALIST_ICONS.length);
  const icon = MINIMALIST_ICONS[rand];
  const svg = wrapSvg(icon.elements);
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export type DiceBearStyle = 'shapes' | 'identicon' | 'rings' | 'icons' | 'bottts-neutral';

export interface DiceBearStyleOption {
  id: DiceBearStyle;
  label: string;
  description: string;
}

export const DICEBEAR_STYLES: DiceBearStyleOption[] = [
  { id: 'shapes', label: '包豪斯几何', description: '抽象几何色块组合 (Shapes)' },
  { id: 'identicon', label: '像素矩阵', description: '经典5x5对称哈希矩阵 (Identicon)' },
  { id: 'rings', label: '同心圆环', description: '极简同心环结构 (Rings)' },
  { id: 'icons', label: '极简线条', description: '通用线条符号图标 (Icons)' },
  { id: 'bottts-neutral', label: '几何机甲', description: '极简机器人部件头像 (Bottts)' },
];

/**
 * Builds a DiceBear generative avatar URL customized for ALink's Minimalist Flat style.
 * Guarantees zero border radius, pure white background, and signature black & coral colors.
 */
export function getDiceBearAvatarUrl(seed: string, style: DiceBearStyle = 'shapes'): string {
  const cleanSeed = encodeURIComponent((seed || 'alink').trim());
  const base = `https://api.dicebear.com/9.x/${style}/svg?seed=${cleanSeed}&radius=0&backgroundColor=ffffff`;
  if (style === 'shapes') {
    return `${base}&shape1Color=000000,ff3366&shape2Color=000000,ff3366&shape3Color=000000,ff3366`;
  }
  if (style === 'identicon') {
    return `${base}&rowColor=000000,ff3366`;
  }
  if (style === 'rings') {
    return `${base}&ringColor=000000,ff3366`;
  }
  return base;
}

/**
 * Generates a random DiceBear avatar URL with optional seed and style.
 */
export function getRandomDiceBearAvatarUrl(seed?: string, preferredStyle?: DiceBearStyle): string {
  const styles: DiceBearStyle[] = ['shapes', 'identicon', 'rings', 'icons', 'bottts-neutral'];
  const chosenStyle = preferredStyle || styles[Math.floor(Math.random() * styles.length)];
  const randomSuffix = Math.random().toString(36).substring(2, 7);
  const actualSeed = seed && seed.trim()
    ? `${seed.trim()}-${randomSuffix}`
    : `alink-${randomSuffix}`;
  return getDiceBearAvatarUrl(actualSeed, chosenStyle);
}
