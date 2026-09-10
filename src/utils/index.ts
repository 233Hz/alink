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

const MULTI_PART_TLDS = new Set([
  'com.cn', 'net.cn', 'org.cn', 'gov.cn', 'edu.cn',
  'co.uk', 'org.uk', 'me.uk',
  'co.jp', 'ne.jp',
  'com.hk', 'org.hk', 'edu.hk',
  'com.tw', 'org.tw',
  'com.au', 'net.au',
]);

/**
 * 提取主域名 / 根域名（Apex Domain）
 * 例如：chat.deepseek.com -> deepseek.com, m.bilibili.com -> bilibili.com
 */
export function extractApexDomain(hostname: string): string {
  if (!hostname) return '';
  const clean = hostname.replace(/^www\./, '').toLowerCase().trim();
  const parts = clean.split('.');
  if (parts.length <= 2) return clean;

  const lastTwo = parts.slice(-2).join('.');
  if (MULTI_PART_TLDS.has(lastTwo)) {
    if (parts.length >= 3) {
      return parts.slice(-3).join('.');
    }
    return clean;
  }

  return parts.slice(-2).join('.');
}

export function getFaviconUrl(rawUrl: string): string {
  const domain = extractDomain(rawUrl);
  if (!domain) return '';
  // Cloudflare 全球 CDN，不假报 200，覆盖率高
  return `https://icon.horse/icon/${encodeURIComponent(domain)}`;
}

/**
 * 获取多级兜底 Favicon 候选地址列表
 * 关键策略：
 * 1. 子域名（Subdomain）优先，失败后自动穿透尝试根域名（Apex Domain）
 * 2. 优先使用真实返回 404 的高质量服务（Icon Horse / DuckDuckGo），避免假 200 截断兜底
 * 3. 站点根目录 /favicon.ico 直链
 * 4. Google S2 备用
 */
export function getFaviconCandidates(rawUrl: string, customIconUrl?: string | null): string[] {
  const candidates: string[] = [];

  // Tier 0: 用户自定义图标
  if (
    customIconUrl &&
    customIconUrl.trim() &&
    !customIconUrl.endsWith('/favicon.ico')
  ) {
    candidates.push(customIconUrl.trim());
  }

  const domain = extractDomain(rawUrl);
  if (!domain) {
    return candidates;
  }

  const apex = extractApexDomain(domain);
  const domains = [domain];
  if (apex && apex !== domain) {
    domains.push(apex);
  }

  // 对子域名与主域名进行多级真实探针候选
  for (const d of domains) {
    const enc = encodeURIComponent(d);
    // 1. Icon Horse (Cloudflare 全球 CDN，真实 404，高清 PNG/SVG)
    candidates.push(`https://icon.horse/icon/${enc}`);
    // 2. DuckDuckGo (国外/大厂站点覆盖极广，返回标准 404)
    candidates.push(`https://icons.duckduckgo.com/ip3/${enc}.ico`);
    // 3. Cravatar (国内源快速缓存)
    candidates.push(`https://cn.cravatar.com/favicon/api/index.php?url=${enc}`);
    // 4. 源站根目录直链
    candidates.push(`https://${d}/favicon.ico`);
  }

  // 备选: Google S2 (海外/开启代理环境备用)
  candidates.push(`https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`);

  return Array.from(new Set(candidates));
}

export function getWebsiteIconUrl(website: { icon_url?: string | null; url: string }): string {
  if (
    website.icon_url &&
    website.icon_url.trim() &&
    !website.icon_url.endsWith('/favicon.ico')
  ) {
    return website.icon_url.trim();
  }
  return getFaviconUrl(website.url);
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

export interface WebsiteMetadata {
  title?: string;
  iconUrl?: string;
}

/**
 * 爬取网页标题与官方高清原生 Favicon 图标
 */
export async function crawlWebsiteMetadata(rawUrl: string): Promise<WebsiteMetadata> {
  const url = normalizeUrl(rawUrl);
  if (!url) return {};

  const result: WebsiteMetadata = {};

  // 1. 优先尝试 Microlink：结构化提取标题与官方高分 Logo / Icon
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}`, {
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (res.ok) {
      const json = await res.json();
      if (json.data) {
        if (json.data.title && typeof json.data.title === 'string') {
          result.title = cleanHtmlTitle(json.data.title);
        }
        const officialIcon = json.data.logo?.url || json.data.icon?.url;
        if (officialIcon && typeof officialIcon === 'string') {
          result.iconUrl = officialIcon;
        }
      }
    }
  } catch {}

  if (result.title && result.iconUrl) {
    return result;
  }

  // 2. 备用尝试 Allorigins 跨域抓取 HTML 源码，解析 <title> 与 <link rel="icon">
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`, {
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (res.ok) {
      const data = await res.json();
      if (data && data.contents && typeof data.contents === 'string') {
        const html = data.contents;
        if (!result.title) {
          const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
          if (match && match[1]) {
            result.title = cleanHtmlTitle(match[1]);
          }
        }
        if (!result.iconUrl) {
          const iconMatch =
            html.match(/<link[^>]+rel=["'](?:shortcut )?(?:icon|apple-touch-icon)["'][^>]+href=["']([^"']+)["']/i) ||
            html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["'](?:shortcut )?(?:icon|apple-touch-icon)["']/i);
          if (iconMatch && iconMatch[1]) {
            try {
              result.iconUrl = new URL(iconMatch[1], url).href;
            } catch {
              result.iconUrl = iconMatch[1];
            }
          }
        }
      }
    }
  } catch {}

  // 3. 兜底根据域名生成建议标题
  if (!result.title) {
    result.title = suggestTitleFromUrl(url);
  }

  return result;
}

/**
 * 保持向后兼容：抓取网站真实标题
 */
export async function crawlWebsiteTitle(rawUrl: string): Promise<string> {
  const meta = await crawlWebsiteMetadata(rawUrl);
  return meta.title || suggestTitleFromUrl(rawUrl);
}

export * from './iconGenerator';
