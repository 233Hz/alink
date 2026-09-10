export const COMMON_ICONS = [
  { name: 'Folder', label: '默认文件夹' },
  { name: 'Search', label: '搜索发现' },
  { name: 'Bot', label: 'AI与机器人' },
  { name: 'Code2', label: '编程开发' },
  { name: 'Sparkles', label: '创意灵感' },
  { name: 'Compass', label: '探索导航' },
  { name: 'Globe', label: '网络全球' },
  { name: 'Bookmark', label: '常用书签' },
  { name: 'Star', label: '重要精选' },
  { name: 'Wrench', label: '实用工具' },
  { name: 'BookOpen', label: '文档阅读' },
  { name: 'Coffee', label: '休闲日常' },
  { name: 'Music', label: '音频音乐' },
  { name: 'Video', label: '影音视频' },
  { name: 'ShoppingBag', label: '购物消费' },
  { name: 'Shield', label: '安全运维' },
];

export function normalizeUrl(rawUrl: string): string {
  let url = rawUrl.trim();
  if (!url) return '';
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }
  return url;
}

export function extractDomain(rawUrl: string): string {
  try {
    const url = normalizeUrl(rawUrl);
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return rawUrl;
  }
}

export function getFaviconUrl(rawUrl: string): string {
  const domain = extractDomain(rawUrl);
  if (!domain) return '';
  // Google's 128px high-res favicon service
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;
}

export function getFallbackFavicon(rawUrl: string): string {
  const domain = extractDomain(rawUrl);
  if (!domain) return '';
  return `https://icon.horse/icon/${encodeURIComponent(domain)}`;
}

export function suggestTitleFromUrl(rawUrl: string): string {
  const domain = extractDomain(rawUrl);
  if (!domain) return '';

  const knownMap: Record<string, string> = {
    'github.com': 'GitHub',
    'google.com': 'Google',
    'baidu.com': '百度',
    'bing.com': 'Bing',
    'chatgpt.com': 'ChatGPT',
    'claude.ai': 'Claude',
    'gemini.google.com': 'Gemini',
    'deepseek.com': 'DeepSeek',
    'v2ex.com': 'V2EX',
    'juejin.cn': '稀土掘金',
    'developer.mozilla.org': 'MDN Web Docs',
    'notion.so': 'Notion',
    'figma.com': 'Figma',
    'bilibili.com': '哔哩哔哩',
    'youtube.com': 'YouTube',
    'twitter.com': 'X (Twitter)',
    'x.com': 'X (Twitter)',
    'zhihu.com': '知乎',
    'stackoverflow.com': 'Stack Overflow',
    'npm.com': 'npm',
    'npmjs.com': 'npm',
    'tailwindcss.com': 'Tailwind CSS',
    'vuejs.org': 'Vue.js',
    'react.dev': 'React',
  };

  if (knownMap[domain]) return knownMap[domain];

  // Capitalize main segment: e.g. "gitlab.com" -> "Gitlab"
  const parts = domain.split('.');
  if (parts.length >= 2) {
    const main = parts[0] === 'mail' || parts[0] === 'app' ? parts[1] : parts[0];
    return main.charAt(0).toUpperCase() + main.slice(1);
  }
  return domain;
}

function cleanHtmlTitle(title: string): string {
  let t = title.trim();
  if (typeof document !== 'undefined') {
    try {
      const txt = document.createElement('textarea');
      txt.innerHTML = t;
      t = txt.value;
    } catch {}
  } else {
    t = t
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>');
  }
  return t.replace(/\s+/g, ' ').trim();
}

/**
 * Crawls and extracts real website <title> using resilient services with fast local fallback.
 */
export async function crawlWebsiteTitle(rawUrl: string): Promise<string> {
  const url = normalizeUrl(rawUrl);
  if (!url) return '';

  // 1. Try Microlink (Fast, structured OpenGraph / HTML title)
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}`, {
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (res.ok) {
      const json = await res.json();
      if (json.data && json.data.title && typeof json.data.title === 'string') {
        const cleaned = cleanHtmlTitle(json.data.title);
        if (cleaned) return cleaned;
      }
    }
  } catch {}

  // 2. Try Allorigins fallback (Fetches raw HTML and extracts <title>)
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`, {
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (res.ok) {
      const data = await res.json();
      if (data && data.contents && typeof data.contents === 'string') {
        const match = data.contents.match(/<title[^>]*>([^<]+)<\/title>/i);
        if (match && match[1]) {
          const cleaned = cleanHtmlTitle(match[1]);
          if (cleaned) return cleaned;
        }
      }
    }
  } catch {}

  // 3. Fallback to suggestTitleFromUrl
  return suggestTitleFromUrl(url);
}

export * from './iconGenerator';
