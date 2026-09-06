import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types/user';
import { AvatarConfig, DEFAULT_AVATAR } from '../types/avatar';
import { auth, firestore, isFirebaseConfigured } from '../services/firebase';
import { storageService } from '../services/storageService';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  fetchSignInMethodsForEmail
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  loginAsGuest: (displayName?: string) => void;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  updateAvatar: (avatar: AvatarConfig) => Promise<void>;
  updateDisplayName: (name: string) => Promise<void>;
  friendlyError: (error: any) => string;
}

const LOCAL_USER_KEY = 'virtual_library_user_profile';

export function getFriendlyErrorMessage(err: any): string {
  const code = err?.code || '';
  switch (code) {
    case 'auth/invalid-email':
      return 'Geçerli bir e-posta adresi yazınız.';
    case 'auth/user-not-found':
      return 'Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'E-posta veya şifre hatalı. Lütfen kontrol ediniz.';
    case 'auth/email-already-in-use':
      return 'Bu e-posta adresi zaten kullanımda.';
    case 'auth/weak-password':
      return 'Şifreniz çok zayıf. En az 6 karakter olmalıdır.';
    case 'auth/popup-closed-by-user':
      return 'Google giriş penceresi kapatıldı.';
    case 'auth/too-many-requests':
      return 'Çok fazla başarısız deneme yapıldı. Lütfen biraz bekleyin.';
    case 'auth/network-request-failed':
      return 'İnternet bağlantısı kurulamadı.';
    default:
      return err?.message || 'İşlem gerçekleştirilemedi.';
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        if (fbUser) {
          let profile: UserProfile = {
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Öğrenci',
            isGuest: false,
            avatar: DEFAULT_AVATAR,
            selectedTheme: 'Varsayılan',
            selectedSound: 'warning.mp3',
            createdAt: Date.now()
          };

          if (firestore) {
            try {
              const snap = await getDoc(doc(firestore, 'users', fbUser.uid));
              if (snap.exists()) {
                profile = { ...profile, ...snap.data() };
              } else {
                await setDoc(doc(firestore, 'users', fbUser.uid), profile);
              }
            } catch (e) {
              console.warn('Could not fetch user profile from Firestore:', e);
            }
          }

          setUser(profile);
          localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(profile));

          // Sync data from Cloud Firestore on login
          storageService.syncFromFirestore(fbUser.uid);
        } else {
          loadLocalGuest();
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      loadLocalGuest();
      setLoading(false);
    }
  }, []);

  const loadLocalGuest = () => {
    try {
      const saved = localStorage.getItem(LOCAL_USER_KEY);
      if (saved) {
        setUser(JSON.parse(saved));
      } else {
        const guest: UserProfile = {
          uid: 'guest_' + Math.random().toString(36).substring(2, 9),
          displayName: 'Misafir Öğrenci',
          isGuest: true,
          avatar: DEFAULT_AVATAR,
          selectedTheme: 'Varsayılan',
          selectedSound: 'warning.mp3',
          createdAt: Date.now()
        };
        setUser(guest);
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(guest));
      }
    } catch {
      // ignore
    }
  };

  const loginAsGuest = (displayName: string = 'Misafir Öğrenci') => {
    const guest: UserProfile = {
      uid: 'guest_' + Math.random().toString(36).substring(2, 9),
      displayName,
      isGuest: true,
      avatar: user?.avatar || DEFAULT_AVATAR,
      selectedTheme: user?.selectedTheme || 'Varsayılan',
      selectedSound: user?.selectedSound || 'warning.mp3',
      createdAt: Date.now()
    };
    setUser(guest);
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(guest));
  };

  const loginWithEmail = async (email: string, pass: string) => {
    if (!isFirebaseConfigured || !auth) {
      loginAsGuest(email.split('@')[0]);
      return;
    }
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const registerWithEmail = async (email: string, pass: string, name: string) => {
    if (!isFirebaseConfigured || !auth) {
      loginAsGuest(name || email.split('@')[0]);
      return;
    }
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(cred.user, { displayName: name });
    const profile: UserProfile = {
      uid: cred.user.uid,
      email: cred.user.email,
      displayName: name,
      isGuest: false,
      avatar: DEFAULT_AVATAR,
      selectedTheme: 'Varsayılan',
      selectedSound: 'warning.mp3',
      createdAt: Date.now()
    };
    if (firestore) {
      await setDoc(doc(firestore, 'users', cred.user.uid), profile);
    }
    setUser(profile);
  };

  const loginWithGoogle = async () => {
    if (!isFirebaseConfigured || !auth) {
      loginAsGuest('Google Öğrencisi');
      return;
    }
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const sendPasswordReset = async (email: string) => {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      const err: any = new Error('Geçerli bir e-posta adresi yazınız.');
      err.code = 'auth/invalid-email';
      throw err;
    }

    if (!isFirebaseConfigured || !auth) {
      // Yerel mod kontrolü
      const localUserStr = localStorage.getItem(LOCAL_USER_KEY);
      if (localUserStr) {
        try {
          const localUser = JSON.parse(localUserStr);
          if (localUser?.email && localUser.email.toLowerCase() === cleanEmail) {
            throw new Error('Yerel moddasınız. Gerçek e-posta gönderimi için Firebase bulut bağlantısı gereklidir.');
          }
        } catch (e: any) {
          if (e.message?.includes('Yerel moddasınız')) throw e;
        }
      }
      const notFoundErr: any = new Error('Bu e-posta adresi ile kayıtlı bir hesap bulunamadı.');
      notFoundErr.code = 'auth/user-not-found';
      throw notFoundErr;
    }

    // 1. Firebase Auth üzerinde e-postanın kayıtlı olup olmadığını doğrula
    try {
      const methods = await fetchSignInMethodsForEmail(auth, cleanEmail);
      if (!methods || methods.length === 0) {
        const notFoundErr: any = new Error('Bu e-posta adresi ile kayıtlı bir hesap bulunamadı.');
        notFoundErr.code = 'auth/user-not-found';
        throw notFoundErr;
      }
    } catch (checkErr: any) {
      if (checkErr?.code === 'auth/user-not-found' || checkErr?.code === 'auth/invalid-email') {
        throw checkErr;
      }
    }

    // 2. Hesap kayıtlıysa şifre yenileme bağlantısını gönder
    await sendPasswordResetEmail(auth, cleanEmail);
  };

  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      await signOut(auth);
    }
    localStorage.removeItem(LOCAL_USER_KEY);
    loadLocalGuest();
  };

  const updateAvatar = async (avatar: AvatarConfig) => {
    if (!user) return;
    const updated = { ...user, avatar };
    setUser(updated);
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(updated));

    if (isFirebaseConfigured && firestore && !user.isGuest) {
      try {
        await setDoc(doc(firestore, 'users', user.uid), { avatar }, { merge: true });
      } catch (e) {
        console.warn('Could not sync avatar to Firestore:', e);
      }
    }
  };

  const updateDisplayName = async (name: string) => {
    if (!user) return;
    const updated = { ...user, displayName: name };
    setUser(updated);
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(updated));

    if (isFirebaseConfigured && firestore && !user.isGuest) {
      try {
        await setDoc(doc(firestore, 'users', user.uid), { displayName: name }, { merge: true });
      } catch (e) {
        console.warn('Could not sync displayName to Firestore:', e);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginAsGuest,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        logout,
        sendPasswordReset,
        updateAvatar,
        updateDisplayName,
        friendlyError: getFriendlyErrorMessage
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
