/**
 * ALink 本地持久化层
 *
 * 目标：冷启动时先用本地缓存瞬间渲染，网络请求退居后台做静默校验（stale-while-revalidate）。
 * 缓存按用户 ID 归属，多账号共用同一浏览器时不会串号；退出登录会立即清除。
 */
import type { Category, Website } from '../types';

const NAV_CACHE_KEY = 'alink_nav_cache_v1';
const ACTIVE_CATEGORY_KEY = 'alink_active_category_v1';
const CACHE_VERSION = 1;

export interface NavCachePayload {
  version: number;
  userId: string;
  categories: Category[];
  websites: Website[];
  /** 最后一次成功同步的时间戳，用于判断缓存新鲜度 */
  updatedAt: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

/** 逐字段白名单重建，避免把历史遗留字段或脏数据带回内存 */
function toCategory(value: unknown): Category | null {
  if (!isRecord(value) || typeof value.id !== 'string' || typeof value.name !== 'string') {
    return null;
  }
  return {
    id: value.id,
    user_id: asString(value.user_id),
    name: value.name,
    icon: asString(value.icon, 'Folder'),
    order_index: asNumber(value.order_index),
    created_at: asString(value.created_at),
    updated_at: asString(value.updated_at),
  };
}

function toWebsite(value: unknown): Website | null {
  if (!isRecord(value) || typeof value.id !== 'string' || typeof value.url !== 'string') {
    return null;
  }
  return {
    id: value.id,
    user_id: asString(value.user_id),
    category_id: typeof value.category_id === 'string' ? value.category_id : null,
    title: asString(value.title),
    url: value.url,
    description: asString(value.description),
    icon_url: asString(value.icon_url),
    order_index: asNumber(value.order_index),
    created_at: asString(value.created_at),
    updated_at: asString(value.updated_at),
  };
}

/** 读取缓存；任何损坏、跨版本或解析失败都安全退化为 null */
export function readNavCache(): NavCachePayload | null {
  try {
    const raw = localStorage.getItem(NAV_CACHE_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || parsed.version !== CACHE_VERSION) return null;
    if (typeof parsed.userId !== 'string' || !parsed.userId) return null;

    const categories = Array.isArray(parsed.categories)
      ? parsed.categories.map(toCategory).filter((c): c is Category => c !== null)
      : [];
    const websites = Array.isArray(parsed.websites)
      ? parsed.websites.map(toWebsite).filter((w): w is Website => w !== null)
      : [];

    return {
      version: CACHE_VERSION,
      userId: parsed.userId,
      categories,
      websites,
      updatedAt: asNumber(parsed.updatedAt),
    };
  } catch {
    return null;
  }
}

/** 写入缓存；配额超限等异常只降级为「本次不缓存」，绝不打断业务流程 */
export function writeNavCache(userId: string, categories: Category[], websites: Website[]): boolean {
  if (!userId) return false;
  try {
    const payload: NavCachePayload = {
      version: CACHE_VERSION,
      userId,
      categories,
      websites,
      updatedAt: Date.now(),
    };
    localStorage.setItem(NAV_CACHE_KEY, JSON.stringify(payload));
    return true;
  } catch (err) {
    console.warn('ALink: 本地缓存写入失败，已跳过本次持久化', err);
    return false;
  }
}

export function clearNavCache(): void {
  try {
    localStorage.removeItem(NAV_CACHE_KEY);
    localStorage.removeItem(ACTIVE_CATEGORY_KEY);
  } catch {
    /* 忽略：隐私模式下 localStorage 可能不可用 */
  }
}

/** 记住上次浏览的分类，重新打开时直接回到原位置 */
export function readActiveCategoryId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_CATEGORY_KEY);
  } catch {
    return null;
  }
}

export function writeActiveCategoryId(id: string): void {
  try {
    localStorage.setItem(ACTIVE_CATEGORY_KEY, id);
  } catch {
    /* 忽略 */
  }
}
