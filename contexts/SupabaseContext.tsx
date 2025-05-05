'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@/types/supabase';
import { Session } from '@supabase/supabase-js';
import { upsertUser } from '@/utils/supabase-utils';

type SupabaseContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (walletAddress: string, username?: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
}

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUser(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchUser(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUser = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user:', error);
      } else {
        setUser(data);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (walletAddress: string, username?: string) => {
    try {
      setLoading(true);
      console.log('Signing in with wallet address:', walletAddress);
      
      // Normalize wallet address - strip out any dev mode text
      const normalizedWalletAddress = walletAddress
        .toLowerCase()
        .replace(/\s*\(dev\s*mode\)\s*/i, '')
        .trim();
      
      // First, check if user exists with this wallet address in our users table
      try {
        // Check if user exists first with a direct query
        const { data: existingUsers, error: selectError } = await supabase
          .from('users')
          .select('*')
          .ilike('wallet_address', normalizedWalletAddress)
          .limit(1);
        
        if (selectError) {
          console.error('Error checking for existing user:', selectError);
        }
          
        if (existingUsers && existingUsers.length > 0) {
          console.log('Found existing user by wallet address:', existingUsers[0]);
          setUser(existingUsers[0]);
          return;
        }
        
        // If user doesn't exist, create a new one via the API
        console.log('User not found, creating new user via API');
        
        // Instead of using fire-and-forget, properly await the response
        const response = await fetch('/api/users/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            wallet_address: normalizedWalletAddress,
            username: username || 'worldapp_user'
          })
        });
        
        if (!response.ok) {
          throw new Error(`Failed to create user: ${response.status} ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('User creation API response:', result);
        
        if (result.user) {
          // Set the user from the API response
          setUser(result.user);
          console.log('User created and set from API response:', result.user);
        } else {
          // Fallback to temporary user if needed - using proper UUID format
          const tempUserId = crypto.randomUUID ? crypto.randomUUID() : 
            'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
              const r = Math.random() * 16 | 0;
              const v = c === 'x' ? r : (r & 0x3 | 0x8);
              return v.toString(16);
            });
          
          const tempUser = {
            id: tempUserId,
            wallet_address: normalizedWalletAddress,
            username: username || 'worldapp_user',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          setUser(tempUser as User);
          console.log('Using client-side user object as fallback:', tempUser);
        }
      } catch (error) {
        console.error('Error in user management:', error);
        
        // Create a temporary client-side user with proper UUID format
        const tempUserId = crypto.randomUUID ? crypto.randomUUID() : 
          'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          });
        
        const tempUser = {
          id: tempUserId,
          wallet_address: normalizedWalletAddress,
          username: username || 'worldapp_user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        setUser(tempUser as User);
        console.log('Using fallback user object due to database error:', tempUser);
      }
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    if (session?.user) {
      await fetchUser(session.user.id);
    }
  };

  const value = {
    session,
    user,
    loading,
    signIn,
    signOut,
    refreshUser
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
} 