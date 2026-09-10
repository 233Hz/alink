import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const session = ref<Session | null>(null);
  const loading = ref(true);
  const isGuest = ref(false);

  const isAuthenticated = computed(() => !!user.value);
  const userEmail = computed(() => user.value?.email || (isGuest.value ? '访客体验模式' : '未登录'));

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
        if (currentSession?.user) {
          isGuest.value = false;
        }
      });
    } catch (err) {
      console.error('Auth initialization error:', err);
    } finally {
      loading.value = false;
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
    isGuest.value = false;
    return data;
  }

  async function signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    user.value = data.user;
    session.value = data.session;
    isGuest.value = false;
    return data;
  }

  async function signOut() {
    await supabase.auth.signOut();
    user.value = null;
    session.value = null;
    isGuest.value = false;
  }

  function setGuestMode(val = true) {
    isGuest.value = val;
  }

  return {
    user,
    session,
    loading,
    isGuest,
    isAuthenticated,
    userEmail,
    initAuth,
    signIn,
    signUp,
    signOut,
    setGuestMode,
  };
});
