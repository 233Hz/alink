import type { Category, Website } from '../types';

export interface MatchedSiteSuggestion {
  type: 'website';
  id: string;
  title: string;
  url: string;
  icon_url?: string | null;
  categoryName?: string;
}

export interface MatchedCategorySuggestion {
  type: 'category';
  id: string;
  name: string;
  icon?: string;
  count: number;
}

export interface WebSuggestion {
  type: 'web';
  query: string;
}

export interface HistorySuggestion {
  type: 'history';
  query: string;
}

export type SuggestionItem =
  | MatchedSiteSuggestion
  | MatchedCategorySuggestion
  | WebSuggestion
  | HistorySuggestion;

let currentScript: HTMLScriptElement | null = null;
let currentCallbackName = '';

/**
 * 获取搜索引擎实时联想词（支持百度与谷歌，超时降级）
 */
export function fetchWebSuggestions(
  query: string,
  engineId = 'bing',
  timeoutMs = 1200
): Promise<string[]> {
  const trimmed = query.trim();
  if (!trimmed || typeof window === 'undefined') return Promise.resolve([]);

  return new Promise((resolve) => {
    if (currentScript && currentScript.parentNode) {
      currentScript.parentNode.removeChild(currentScript);
      currentScript = null;
    }
    if (currentCallbackName && (window as unknown as Record<string, unknown>)[currentCallbackName]) {
      delete (window as unknown as Record<string, unknown>)[currentCallbackName];
      currentCallbackName = '';
    }

    const callbackName = `__alink_sug_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    currentCallbackName = callbackName;

    const script = document.createElement('script');
    currentScript = script;

    let timer: ReturnType<typeof setTimeout> | null = null;

    const cleanup = () => {
      if (timer) clearTimeout(timer);
      delete (window as unknown as Record<string, unknown>)[callbackName];
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      if (currentScript === script) {
        currentScript = null;
      }
    };

    timer = setTimeout(() => {
      cleanup();
      resolve([]);
    }, timeoutMs);

    (window as unknown as Record<string, unknown>)[callbackName] = (data: unknown) => {
      cleanup();
      if (!data) {
        resolve([]);
        return;
      }
      // 百度格式: { q: '...', s: ['...', '...'] }
      if (typeof data === 'object' && 's' in (data as Record<string, unknown>)) {
        const sList = (data as { s: unknown }).s;
        if (Array.isArray(sList)) {
          resolve(
            sList
              .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
              .slice(0, 7)
          );
          return;
        }
      }
      // 谷歌格式: ['query', ['s1', 's2', ...]]
      if (Array.isArray(data) && Array.isArray(data[1])) {
        resolve(
          data[1]
            .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
            .slice(0, 7)
        );
        return;
      }
      resolve([]);
    };

    script.onerror = () => {
      cleanup();
      resolve([]);
    };

    if (engineId === 'google') {
      script.src = `https://suggestqueries.google.com/complete/search?client=chrome&q=${encodeURIComponent(
        trimmed
      )}&callback=${callbackName}`;
    } else {
      script.src = `https://suggestion.baidu.com/su?wd=${encodeURIComponent(
        trimmed
      )}&prod=pc&from=pc_web&ie=utf-8&cb=${callbackName}`;
    }

    document.head.appendChild(script);
  });
}

/**
 * 模糊搜索站内匹配网址，根据匹配度打分排序
 */
export function findMatchingWebsites(
  query: string,
  websites: Website[],
  categories: Category[],
  limit = 4
): MatchedSiteSuggestion[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const catMap = new Map<string, string>();
  categories.forEach((c) => catMap.set(c.id, c.name));

  return websites
    .map((w) => {
      const title = (w.title || '').toLowerCase();
      const url = (w.url || '').toLowerCase();
      const desc = (w.description || '').toLowerCase();
      let score = 0;

      if (title === q) score = 100;
      else if (title.startsWith(q)) score = 80;
      else if (title.includes(q)) score = 60;
      else if (url.includes(q)) score = 40;
      else if (desc.includes(q)) score = 20;

      return {
        type: 'website' as const,
        id: w.id,
        title: w.title,
        url: w.url,
        icon_url: w.icon_url,
        categoryName: w.category_id ? catMap.get(w.category_id) || '已分类' : '未分类',
        score,
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ score: _s, ...rest }) => rest);
}

/**
 * 模糊搜索站内分类
 */
export function findMatchingCategories(
  query: string,
  categories: Category[],
  websites: Website[],
  limit = 2
): MatchedCategorySuggestion[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  return categories
    .filter((c) => c.name.toLowerCase().includes(q))
    .slice(0, limit)
    .map((c) => {
      const count = websites.filter((w) => w.category_id === c.id).length;
      return {
        type: 'category' as const,
        id: c.id,
        name: c.name,
        icon: c.icon,
        count,
      };
    });
}
