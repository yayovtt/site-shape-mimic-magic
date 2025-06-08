
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
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
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("AuthProvider: Auth state changed", { event, session: !!session });
        
        if (event === 'SIGNED_OUT' || !session) {
          setSession(null);
          setUser(null);
          setLoading(false);
          return;
        }

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("AuthProvider: Initial session check", { session: !!session });
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log("AuthProvider: Attempting sign in with email:", email);
    setLoading(true);
    
    try {
      // Clear any existing session first
      await supabase.auth.signOut();
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      
      console.log("AuthProvider: Sign in result", { error, user: data?.user?.id });
      
      if (error) {
        // Handle specific database errors
        if (error.message.includes('Database error') || error.status === 500) {
          return { error: { message: 'יש בעיה זמנית במערכת. אנא נסה להירשם מחדש או צור קשר לתמיכה.' } };
        }
      }
      
      return { error };
    } catch (err) {
      console.error("AuthProvider: Sign in catch error", err);
      return { error: err };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    console.log("AuthProvider: Attempting sign up with email:", email);
    setLoading(true);
    
    try {
      // Clear any existing session first
      await supabase.auth.signOut();
      
      const redirectUrl = `${window.location.origin}/`;
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });
      
      console.log("AuthProvider: Sign up result", { error, user: data?.user?.id });
      
      if (error) {
        // Handle specific database errors
        if (error.message.includes('Database error') || error.status === 500) {
          return { error: { message: 'יש בעיה זמנית במערכת. אנא נסה שוב מאוחר יותר או צור קשר לתמיכה.' } };
        }
      }
      
      return { error };
    } catch (err) {
      console.error("AuthProvider: Sign up catch error", err);
      return { error: err };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    console.log("AuthProvider: Signing out");
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Force clear local state
      setSession(null);
      setUser(null);
    } catch (err) {
      console.error("AuthProvider: Sign out error", err);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  };

  console.log("AuthProvider: Current state", { user: !!user, session: !!session, loading });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
