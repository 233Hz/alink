import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

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

  async function signOut() {
    await supabase.auth.signOut();
    user.value = null;
    session.value = null;
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
  };
});
