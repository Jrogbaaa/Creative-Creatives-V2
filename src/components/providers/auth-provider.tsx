'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { logger } from '@/lib/logger';

// Mock user for development when Firebase is not configured
const mockUser: User = {
  uid: '7gRRSlbgBjg0klsSERzJid5fVqd2',
  email: 'demo@example.com',
  emailVerified: true,
  displayName: 'Demo User',
  isAnonymous: false,
  photoURL: null,
  phoneNumber: null,
  providerId: 'firebase',
  metadata: {
    creationTime: new Date().toISOString(),
    lastSignInTime: new Date().toISOString()
  },
  providerData: [],
  delete: async () => {},
  getIdToken: async () => 'mock-token',
  getIdTokenResult: async () => ({} as any),
  reload: async () => {},
  toJSON: () => ({}),
  refreshToken: 'mock-refresh-token'
} as User;

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if Firebase auth is available
    if (!auth) {
      // Use mock user for development
      console.log('🔧 Using mock user for development (Firebase not configured)');
      setUser(mockUser);
      setLoading(false);
      return;
    }

    // Use real Firebase auth
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    
    if (!auth) {
      // Mock sign in for development
      console.log('🔧 Mock sign in for development');
      setUser(mockUser);
      setLoading(false);
      return;
    }

    logger.authAttempt('email_password');
    
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      logger.authSuccess('email_password', result.user.uid);
    } catch (error: any) {
      logger.authError('email_password', error.message);
      setLoading(false);
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    
    if (!auth) {
      // Mock sign up for development  
      console.log('🔧 Mock sign up for development');
      setUser(mockUser);
      setLoading(false);
      return;
    }

    logger.authAttempt('email_password_signup');
    
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      logger.authSuccess('email_password_signup', result.user.uid);
    } catch (error: any) {
      logger.authError('email_password_signup', error.message);
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    setLoading(true);
    const currentUserId = user?.uid;
    
    if (!auth) {
      // Mock logout for development
      console.log('🔧 Mock logout for development');
      setUser(null);
      setLoading(false);
      return;
    }

    logger.authAttempt('sign_out', currentUserId);
    
    try {
      await signOut(auth);
      logger.authSuccess('sign_out', currentUserId || 'unknown');
    } catch (error: any) {
      logger.authError('sign_out', error.message, currentUserId);
      setLoading(false);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
