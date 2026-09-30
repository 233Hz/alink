import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, clearSupabaseAuthStorage } from '../lib/supabase';
import { clearNavCache } from '../lib/persistence';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const session = ref<Session | null>(null);
  const loading = ref(true);

  const isAuthenticated = computed(() => !!user.value && !!session.value);
  const userEmail = computed(() => (isAuthenticated.value ? user.value?.email : '未登录'));

  async function initAuth() {
    try {
      loading.value = true;
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error fetching session:', error.message);
      }
      session.value = data?.session || null;
      user.value = data?.session?.user || null;

      // Subscribe to auth state changes
      supabase.auth.onAuthStateChange((_event, currentSession) => {
        session.value = currentSession;
        user.value = currentSession?.user || null;
      });
    } catch (err) {
      console.error('Auth initialization error:', err);
    } finally {
      loading.value = false;
    }
  }

  async function ensureSession(): Promise<boolean> {
    if (session.value) return true;
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data?.session) {
        session.value = null;
        user.value = null;
        return false;
      }
      session.value = data.session;
      user.value = data.session.user;
      return true;
    } catch {
      session.value = null;
      user.value = null;
      return false;
    }
  }

  async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    user.value = data.user;
    session.value = data.session;
    return data;
  }

  async function signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;

    // If Supabase didn't return an active session immediately, auto sign-in
    // to establish a valid JWT session
    if (!data.session) {
      return await signIn(email, password);
    }

    user.value = data.user;
    session.value = data.session;
    return data;
  }

  async function updatePassword(newPassword: string) {
    await ensureSession();
    if (!isAuthenticated.value || !user.value) {
      throw new Error('用户未登录或登录已失效，请重新登录');
    }
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
    return data;
  }

  async function resetPasswordForEmail(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin + window.location.pathname,
    });
    if (error) throw error;
    return data;
  }

  /**
   * 无条件清理本地登录痕迹：内存状态 + 定时器 + LocalStorage 令牌 + 导航缓存。
   * 供登出流程兜底，保证「点了退出登录就一定是退出」。
   */
  async function clearLocalSession() {
    // 同步部分：立刻切断本页的登录态与本地令牌
    user.value = null;
    session.value = null;
    clearSupabaseAuthStorage();
    clearNavCache();
    try {
      await supabase.auth.stopAutoRefresh();
    } catch {
      /* 忽略：没有启动自动刷新时可能抛错 */
    }
  }

  async function signOut() {
    const accessToken = session.value?.access_token;

    // 1) 立即同步清理本地：无论后续网络请求是否成功，界面和刷新后的状态都一定是「未登录」
    await clearLocalSession();

    // 2) 尽力撤销服务端会话（失败也不影响本地已登出的结果）
    if (accessToken) {
      try {
        const { error } = await supabase.auth.admin.signOut(accessToken, 'global');
        if (error) {
          console.warn('ALink: 服务端会话撤销失败，本地已登出 -', error.message);
        }
      } catch (err) {
        console.warn('ALink: 服务端会话撤销异常，本地已登出 -', err);
      }
    }

    // 3) 兜底：防止 auth 库在请求过程中又回写过会话数据
    await clearLocalSession();
  }

  return {
    user,
    session,
    loading,
    isAuthenticated,
    userEmail,
    initAuth,
    ensureSession,
    signIn,
    signUp,
    signOut,
    updatePassword,
    resetPasswordForEmail,
  };
});
