import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ensure mock user is ALWAYS set first
    const mockUser = {
      id: 'mock-id-123',
      email: 'test@example.com',
      user_metadata: { full_name: 'Test Auditor' }
    };
    setUser(mockUser);
    setProfile(mockUser.user_metadata);
    setLoading(false);

    // Optional: Only listen for real changes if supabase is ready
    let subscription;
    try {
      const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          setUser(session.user);
          setProfile(session.user.user_metadata);
        } else {
          // Re-affirm mock if session is lost
          setUser(mockUser);
          setProfile(mockUser.user_metadata);
        }
      });
      subscription = data?.subscription;
    } catch (e) {
      console.warn('Auth state listener failed', e);
    }

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email, password, metadata = {}) => {
    const response = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: window.location.origin
      }
    });
    if (response.error) throw response.error;
    return response.data;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const value = {
    user,
    profile,
    login,
    signUp,
    logout,
    loading
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
