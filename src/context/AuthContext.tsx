import React, { createContext, useState, useEffect, useContext } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  updated_at: string | null;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const getInitialSessionAndProfile = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error getting initial session:", error);
      }
      setSession(session);
      setUser(session?.user || null);
      setLoading(false);

      if (session?.user) {
        fetchOrCreateProfile(session.user);
      }
    };

    getInitialSessionAndProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user || null);
      setLoading(false);

      if (session?.user) {
        fetchOrCreateProfile(session.user);
      } else {
        setProfile(null); // Clear profile on logout
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchOrCreateProfile = async (currentUser: User) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (error && error.code === 'PGRST116') { // No rows found
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({ 
            id: currentUser.id, 
            username: currentUser.user_metadata?.username || currentUser.email?.split('@')[0] || null, 
            avatar_url: currentUser.user_metadata?.avatar_url || null 
          })
          .select()
          .single();
        if (insertError) throw insertError;
        setProfile(newProfile);
      } else if (error) {
        throw error;
      } else {
        setProfile(data);
      }
    } catch (profileError) {
      console.error("Error fetching or creating profile:", profileError);
      setProfile(null);
    }
  };

  return <AuthContext.Provider value={{ session, user, profile, loading }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};