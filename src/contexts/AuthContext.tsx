'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut as firebaseSignOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth, getFirebaseAuth } from '@/lib/firebase/client';
import config from '@/lib/config';
import { UserProfile } from '@/types/user';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  sendMagicLink: (email: string) => Promise<void>;
  signInWithMagicLink: (email: string, href: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  changePassword: (current: string, newPass: string) => Promise<void>;
  linkWithProvider: (provider: 'google') => Promise<void>;
  unlinkProvider: (providerId: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  resendActivationEmail: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  signInWithGoogle: async () => {},
  sendMagicLink: async () => {},
  signInWithMagicLink: async () => {},
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  signOut: async () => {},
  updateUserProfile: async () => {},
  changePassword: async () => {},
  linkWithProvider: async () => {},
  unlinkProvider: async () => {},
  deleteAccount: async () => {},
  resendActivationEmail: async () => {},
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
          const token = await firebaseUser.getIdToken();
          const response = await fetch('/api/auth/user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              emailVerified: firebaseUser.emailVerified,
              providers: firebaseUser.providerData.map(p => ({
                providerId: p.providerId,
                uid: p.uid,
                displayName: p.displayName,
                email: p.email
              }))
            }),
          });

          if (response.ok) {
            const profile = await response.json();
            setUserProfile(profile);
          } else {
            const errorData = await response.json().catch(() => ({}));
            console.error('Failed to fetch user profile:', response.status, errorData.error || response.statusText);
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

  const sendMagicLink = async (email: string) => {
    const _auth = getFirebaseAuth();
    if (!_auth) return;
    
    const { sendSignInLinkToEmail } = await import('firebase/auth');
    const actionCodeSettings = {
      url: `${window.location.origin}/login?finishSignUp=true`,
      handleCodeInApp: true,
    };
    
    console.log('--- Sending Magic Link ---');
    console.log('Target Email:', email);
    console.log('Action Code Settings:', actionCodeSettings);
    
    try {
        await sendSignInLinkToEmail(_auth, email, actionCodeSettings);
        console.log('Magic Link sent successfully!');
    } catch (error) {
        console.error('Error sending magic link:', error);
        throw error;
    }
    // Save email locally to complete sign in on return
    // Save email in sessionStorage (cleared when tab closes - more secure than localStorage)
    window.sessionStorage.setItem('emailForSignIn', email);
  };

  const signInWithMagicLink = async (email: string, href: string) => {
    const _auth = getFirebaseAuth();
    if (!_auth) return;

    const { signInWithEmailLink } = await import('firebase/auth');
    await signInWithEmailLink(_auth, email, href);
    window.sessionStorage.removeItem('emailForSignIn');
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
    const userCredential = await createUserWithEmailAndPassword(_auth, email, password);
    
    // Send email verification
    try {
      await sendEmailVerification(userCredential.user, {
        url: `${window.location.origin}/profile`,
        handleCodeInApp: false,
      });
      console.log('Verification email sent successfully');
      
      // Update activation email sent timestamp
      const token = await userCredential.user.getIdToken();
      await fetch('/api/auth/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          uid: userCredential.user.uid,
          activationEmailSentAt: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error('Error sending verification email:', error);
      // Don't throw - allow user to sign up even if email fails
    }
  };

  const signOut = async () => {
    const _auth = getFirebaseAuth();
    if (!_auth) return;
    await firebaseSignOut(_auth);
    // Redirect to home page after logout
    window.location.href = '/';
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
        const token = await _auth.currentUser.getIdToken();
        const response = await fetch('/api/auth/user', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
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

  const linkWithProvider = async (providerName: 'google') => {
    const _auth = getFirebaseAuth();
    if (!_auth || !_auth.currentUser) throw new Error('No user logged in');

    try {
        const { linkWithPopup, GoogleAuthProvider } = await import('firebase/auth');
        let provider;
        if (providerName === 'google') {
            provider = new GoogleAuthProvider();
        } else {
           throw new Error('Provider not supported');
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
        const token = await _auth.currentUser.getIdToken();
        const response = await fetch(`/api/auth/user?uid=${uid}`, {
             method: 'DELETE',
             headers: {
                 'Authorization': `Bearer ${token}`
             }
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

  const resendActivationEmail = async () => {
    const _auth = getFirebaseAuth();
    if (!_auth || !_auth.currentUser) throw new Error('No user logged in');

    try {
      await sendEmailVerification(_auth.currentUser, {
        url: `${window.location.origin}/profile`,
        handleCodeInApp: false,
      });
      
      // Update activation email sent timestamp
      const token = await _auth.currentUser.getIdToken();
      await fetch('/api/auth/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          uid: _auth.currentUser.uid,
          activationEmailSentAt: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error('Error resending activation email:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
        user, 
        userProfile, 
        loading, 
        signInWithGoogle, 
        sendMagicLink,
        signInWithMagicLink,
        signInWithEmail, 
        signUpWithEmail, 
        signOut,
        updateUserProfile,
        changePassword,
        linkWithProvider,
        unlinkProvider,
        deleteAccount,
        resendActivationEmail
    }}>
      {children}
    </AuthContext.Provider>
  );
};
