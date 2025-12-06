'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut as firebaseSignOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, getFirebaseAuth } from '@/lib/firebase/client';
import { UserProfile } from '@/types/user';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  changePassword: (current: string, newPass: string) => Promise<void>;
  linkWithProvider: (provider: 'google' | 'apple') => Promise<void>;
  unlinkProvider: (providerId: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  signInWithGoogle: async () => {},
  signInWithApple: async () => {},
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  signOut: async () => {},
  updateUserProfile: async () => {},
  changePassword: async () => {},
  linkWithProvider: async () => {},
  unlinkProvider: async () => {},
  deleteAccount: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const _auth = getFirebaseAuth();
    if (!_auth) {
      console.warn('Firebase Auth not initialized. Auth features disabled.');
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(_auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          // Fetch or create user profile via API
          const response = await fetch('/api/auth/user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
            }),
          });

          if (response.ok) {
            const profile = await response.json();
            setUserProfile(profile);
          } else {
            console.error('Failed to fetch user profile');
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const _auth = getFirebaseAuth();
    if (!_auth) {
      console.error('Firebase Auth not initialized');
      return;
    }
    const provider = new GoogleAuthProvider();
    await signInWithPopup(_auth, provider);
  };

  const signInWithApple = async () => {
    const _auth = getFirebaseAuth();
    if (!_auth) {
      console.error('Firebase Auth not initialized');
      return;
    }
    // Apple Auth Provider
    const { OAuthProvider } = await import('firebase/auth');
    const provider = new OAuthProvider('apple.com');
    await signInWithPopup(_auth, provider);
  };

  const signInWithEmail = async (email: string, password: string) => {
    const _auth = getFirebaseAuth();
    if (!_auth) {
      console.error('Firebase Auth not initialized');
      return;
    }
    await signInWithEmailAndPassword(_auth, email, password);
  };

  const signUpWithEmail = async (email: string, password: string) => {
    const _auth = getFirebaseAuth();
    if (!_auth) {
      console.error('Firebase Auth not initialized');
      return;
    }
    await createUserWithEmailAndPassword(_auth, email, password);
  };

  const signOut = async () => {
    const _auth = getFirebaseAuth();
    if (!_auth) return;
    await firebaseSignOut(_auth);
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    const _auth = getFirebaseAuth();
    if (!_auth || !_auth.currentUser) throw new Error('No user logged in');

    try {
        // Update Firebase Auth Profile
        if (data.displayName || data.photoURL) {
            await import('firebase/auth').then(({ updateProfile }) => 
                updateProfile(_auth.currentUser!, {
                    displayName: data.displayName,
                    photoURL: data.photoURL
                })
            );
        }

        // Update Database Profile
        const response = await fetch('/api/auth/user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                uid: _auth.currentUser.uid,
                ...data
            }),
        });

        if (response.ok) {
            const updatedProfile = await response.json();
            setUserProfile(updatedProfile);
            // Force refresh user object to reflect changes
            setUser({ ..._auth.currentUser }); 
        } else {
            throw new Error('Failed to update database profile');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        throw error;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    const _auth = getFirebaseAuth();
    if (!_auth || !_auth.currentUser) throw new Error('No user logged in');

    try {
        const { updatePassword, EmailAuthProvider, reauthenticateWithCredential } = await import('firebase/auth');
        const credential = EmailAuthProvider.credential(_auth.currentUser.email!, currentPassword);
        
        await reauthenticateWithCredential(_auth.currentUser, credential);
        await updatePassword(_auth.currentUser, newPassword);
    } catch (error) {
        console.error('Error changing password:', error);
        throw error;
    }
  };

  const linkWithProvider = async (providerName: 'google' | 'apple') => {
    const _auth = getFirebaseAuth();
    if (!_auth || !_auth.currentUser) throw new Error('No user logged in');

    try {
        const { linkWithPopup, GoogleAuthProvider, OAuthProvider } = await import('firebase/auth');
        let provider;
        if (providerName === 'google') {
            provider = new GoogleAuthProvider();
        } else {
            provider = new OAuthProvider('apple.com');
        }

        const result = await linkWithPopup(_auth.currentUser, provider);
        const user = result.user;
        
        // Sync providers to DB
        await syncProviders(user);
    } catch (error) {
        console.error('Error linking provider:', error);
        throw error;
    }
  };

  const unlinkProvider = async (providerId: string) => {
    const _auth = getFirebaseAuth();
    if (!_auth || !_auth.currentUser) throw new Error('No user logged in');

    try {
        const { unlink } = await import('firebase/auth');
        const result = await unlink(_auth.currentUser, providerId);
        
        // Sync providers to DB
        await syncProviders(result);
    } catch (error) {
        console.error('Error unlinking provider:', error);
        throw error;
    }
  };

  const syncProviders = async (firebaseUser: User) => {
    const providers = firebaseUser.providerData.map(p => ({
        providerId: p.providerId,
        uid: p.uid,
        displayName: p.displayName,
        email: p.email
    }));

    await updateUserProfile({ providers });
  };

  const deleteAccount = async () => {
    const _auth = getFirebaseAuth();
    if (!_auth || !_auth.currentUser) throw new Error('No user logged in');

    // Check subscription status
    if (userProfile?.subscriptionStatus === 'active' || userProfile?.subscriptionStatus === 'trialing') {
         throw new Error('Please cancel your active subscription before deleting your account.');
    }

    try {
        const { deleteUser: firebaseDeleteUser } = await import('firebase/auth');
        const uid = _auth.currentUser.uid;
        
        // Delete from DB (via API)
        const response = await fetch(`/api/auth/user?uid=${uid}`, {
             method: 'DELETE',
        });

        if (!response.ok) {
            console.error('Failed to delete user data from database, but proceeding with Auth deletion.');
        }
        
        await firebaseDeleteUser(_auth.currentUser);
    } catch (error) {
        console.error('Error deleting account:', error);
        throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
        user, 
        userProfile, 
        loading, 
        signInWithGoogle, 
        signInWithApple, 
        signInWithEmail, 
        signUpWithEmail, 
        signOut,
        updateUserProfile,
        changePassword,
        linkWithProvider,
        unlinkProvider,
        deleteAccount
    }}>
      {children}
    </AuthContext.Provider>
  );
};
