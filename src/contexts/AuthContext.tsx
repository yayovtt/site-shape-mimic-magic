
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  getCurrentUser: () => Promise<User | null>;
  isUserLoggedIn: () => Promise<boolean>;
  getUserProfile: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("AuthProvider: Setting up auth state listener");
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("AuthProvider: Auth state changed", { event, session: !!session });
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("AuthProvider: Initial session check", { session: !!session });
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log("AuthProvider: Attempting sign in");
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      
      console.log("AuthProvider: Sign in result", { error, user: data?.user?.id });
      return { error };
    } catch (err) {
      console.error("AuthProvider: Sign in error", err);
      return { error: err };
    }
  };

  const signUp = async (email: string, password: string) => {
    console.log("AuthProvider: Attempting sign up");
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });
      
      console.log("AuthProvider: Sign up result", { error, user: data?.user?.id });
      return { error };
    } catch (err) {
      console.error("AuthProvider: Sign up error", err);
      return { error: err };
    }
  };

  const signInWithGoogle = async () => {
    console.log("AuthProvider: Attempting Google sign in");
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      
      console.log("AuthProvider: Google sign in result", { error });
      return { error };
    } catch (err) {
      console.error("AuthProvider: Google sign in error", err);
      return { error: err };
    }
  };

  const signOut = async () => {
    console.log("AuthProvider: Signing out");
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err) {
      console.error("AuthProvider: Sign out error", err);
    }
  };

  const getCurrentUser = async (): Promise<User | null> => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('שגיאה בקבלת המשתמש:', error.message);
        return null;
      }
      
      return user;
    } catch (error) {
      console.error('שגיאה לא צפויה בקבלת המשתמש:', error);
      return null;
    }
  };

  const isUserLoggedIn = async (): Promise<boolean> => {
    const user = await getCurrentUser();
    return user !== null;
  };

  const getUserProfile = async () => {
    const user = await getCurrentUser();
    if (!user) return null;
    
    return {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name || user.email?.split('@')[0],
      avatar: user.user_metadata?.avatar_url,
      provider: user.app_metadata?.provider
    };
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    getCurrentUser,
    isUserLoggedIn,
    getUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
