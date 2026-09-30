import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://angslcexviasghvjbcqe.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFuZ3NsY2V4dmlhc2dodmpiY3FlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5NDQxMjksImV4cCI6MjEwNDUyMDEyOX0.rlnVQgDT6hzsE2xVCXW2dH_bIDU73af3YqE6yV-BEDE';

const supabaseSchema = import.meta.env.VITE_SUPABASE_SCHEMA || 'web_nav';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: supabaseSchema,
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/**
 * 强制清除 Supabase 持久化在本地的会话数据。
 *
 * 场景：调用 `supabase.auth.signOut()` 时，如果服务端登出请求失败、超时或刷新令牌已失效，
 * auth-js 会提前返回错误并跳过本地会话清理，导致刷新页面后又“自动登录回上一个账号”。
 * 这里直接扫描并删除所有 `sb-*-auth-token*` 键，作为兜底。
 */
export function clearSupabaseAuthStorage(): void {
  try {
    const staleKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('sb-') && key.includes('auth-token')) {
        staleKeys.push(key);
      }
    }
    staleKeys.forEach((key) => localStorage.removeItem(key));
  } catch {
    /* 忽略：隐私模式下 localStorage 可能不可用 */
  }
}
