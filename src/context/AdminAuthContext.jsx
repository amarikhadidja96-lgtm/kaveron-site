import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const INACTIVITY_TIMEOUT_MS = 60 * 60 * 1000; // 60 minutes

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children, onNavigate }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const lastActivityRef = useRef(Date.now());

  // Record user activity
  const resetActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  // Check admin status in Supabase profiles table
  const checkAdminRole = async (userId) => {
    if (!supabase || !userId) return false;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error || !data) {
        console.warn('Could not verify admin role:', error);
        return false;
      }

      return data.role === 'admin';
    } catch (err) {
      console.error('Error checking admin role:', err);
      return false;
    }
  };

  // Sign out helper
  const logout = useCallback(async (reason = '') => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setIsAdmin(false);
    if (reason) {
      setAuthError(reason);
    }
    if (onNavigate) {
      onNavigate('/admin/login');
    }
  }, [onNavigate]);

  // Initial session restoration
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        if (isSupabaseConfigured() && supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const hasAdminRole = await checkAdminRole(session.user.id);
            if (mounted) {
              if (hasAdminRole) {
                setUser(session.user);
                setIsAdmin(true);
              } else {
                // Not an admin
                await supabase.auth.signOut();
                setUser(null);
                setIsAdmin(false);
              }
            }
          }
        }
      } catch (err) {
        console.error('Error initializing admin auth:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    initAuth();

    // Listen to Supabase auth state changes
    if (isSupabaseConfigured() && supabase) {
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          if (mounted) {
            setUser(null);
            setIsAdmin(false);
          }
        } else if (session?.user) {
          const hasAdminRole = await checkAdminRole(session.user.id);
          if (mounted) {
            if (hasAdminRole) {
              setUser(session.user);
              setIsAdmin(true);
            } else {
              await supabase.auth.signOut();
              setUser(null);
              setIsAdmin(false);
              setAuthError('Access denied. Administrator privileges required.');
            }
          }
        }
      });

      return () => {
        mounted = false;
        authListener?.subscription?.unsubscribe();
      };
    }

    return () => {
      mounted = false;
    };
  }, []);

  // 60-Minute Inactivity Tracker
  useEffect(() => {
    if (!isAdmin) return;

    const activityEvents = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    const handleActivity = () => resetActivity();

    activityEvents.forEach((evt) => {
      window.addEventListener(evt, handleActivity, { passive: true });
    });

    const intervalId = setInterval(() => {
      const idleTime = Date.now() - lastActivityRef.current;
      if (idleTime >= INACTIVITY_TIMEOUT_MS) {
        logout('Session timed out after 60 minutes of inactivity. Please log in again.');
      }
    }, 60 * 1000); // Check every minute

    return () => {
      activityEvents.forEach((evt) => {
        window.removeEventListener(evt, handleActivity);
      });
      clearInterval(intervalId);
    };
  }, [isAdmin, logout, resetActivity]);

  // Sign In function (Email + Password) - strictly via Supabase Auth & admin role
  const login = async (email, password) => {
    setAuthError(null);

    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase authentication is not configured.');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('Authentication failed');
    }

    const hasAdminRole = await checkAdminRole(data.user.id);
    if (!hasAdminRole) {
      await supabase.auth.signOut();
      throw new Error('Access denied. Administrator privileges required in profiles table.');
    }

    setUser(data.user);
    setIsAdmin(true);
    resetActivity();
    return { ok: true, user: data.user };
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        isAdmin,
        isLoading,
        authError,
        setAuthError,
        login,
        logout,
        resetActivity,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

