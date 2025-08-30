import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/database';
import type { StudentProfile } from '@/lib/database';

interface AuthContextType {
  user: User | null;
  studentProfile: StudentProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, fullName: string, phone?: string) => Promise<any>;
  signOut: () => Promise<any>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user on mount
  useEffect(() => {
    async function loadUser() {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        if (user) {
          await loadStudentProfile(user.id);
        }
      } finally {
        setLoading(false);
      }
    }
    loadUser();

    // Set up auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
        if (session?.user) {
          loadStudentProfile(session.user.id);
        } else {
          setStudentProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function loadStudentProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
        
      if (error) {
        console.error('Error loading student profile:', error);
        return;
      }
      
      setStudentProfile(data);
    } catch (error) {
      console.error('Error loading student profile:', error);
    }
  }

  async function signIn(email: string, password: string) {
    const result = await supabase.auth.signInWithPassword({ email, password });
    return result;
  }

  async function signUp(email: string, password: string, fullName: string, phone?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.protocol}//${window.location.host}/auth/callback`
      }
    });

    if (error) throw error;

    // Create student profile if signup successful
    if (data.user) {
      const { error: profileError } = await supabase
        .from('student_profiles')
        .insert({
          user_id: data.user.id,
          full_name: fullName,
          phone: phone || null,
          is_active: true
        });

      if (profileError) {
        console.error('Error creating student profile:', profileError);
        throw profileError;
      }
    }

    return { data, error };
  }

  async function signOut() {
    const result = await supabase.auth.signOut();
    setStudentProfile(null);
    return result;
  }

  async function refreshProfile() {
    if (user) {
      await loadStudentProfile(user.id);
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      studentProfile,
      loading,
      signIn,
      signUp,
      signOut,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}