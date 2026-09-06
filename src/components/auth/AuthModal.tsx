import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { isFirebaseConfigured } from '../../services/firebase';
import {
  X,
  Lock,
  Mail,
  User,
  Sparkles,
  LogIn,
  UserPlus,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const {
    user,
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    loginAsGuest,
    logout,
    sendPasswordReset,
    friendlyError
  } = useAuth();

  const [tab, setTab] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setSubmitting(true);

    try {
      if (tab === 'login') {
        await loginWithEmail(email, password);
        onClose();
      } else if (tab === 'register') {
        await registerWithEmail(email, password, displayName);
        onClose();
      } else if (tab === 'forgot') {
        await sendPasswordReset(email);
        setSuccessMsg('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.');
      }
    } catch (err: any) {
      setError(friendlyError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    try {
      await loginWithGoogle();
      onClose();
    } catch (err: any) {
      setError(friendlyError(err));
    }
  };

  const handleGuest = () => {
    loginAsGuest(displayName || 'Misafir Öğrenci');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md p-4 sm:p-6 rounded-3xl bg-[#1E1E2E] border border-slate-700/60 shadow-2xl overflow-hidden max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {user && !user.isGuest ? 'Kullanıcı Hesabı' : 'İlim Yuvası Girişi'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {user && !user.isGuest ? 'Oturum Açık' : 'Odaklanma salonuna katılın'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {user && !user.isGuest ? (
          /* Logged In Profile Card */
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-600/20 border border-blue-500/50 flex items-center justify-center text-lg font-bold text-blue-400">
                {user.displayName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-white truncate">{user.displayName}</div>
                <div className="text-xs text-slate-400 truncate">{user.email}</div>
                <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-3 h-3" />
                  Çevrimiçi
                </span>
              </div>
            </div>

            <button
              onClick={async () => {
                await logout();
                onClose();
              }}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-rose-300 bg-rose-950/40 border border-rose-500/30 hover:bg-rose-950/80 transition"
            >
              Oturumu Kapat
            </button>
          </div>
        ) : (
          /* Login / Register / Forgot Password View */
          <div>
            {/* Tabs */}
            {tab !== 'forgot' && (
              <div className="flex rounded-xl bg-slate-900/80 p-1 border border-slate-800 mb-4">
                <button
                  onClick={() => { setTab('login'); setError(''); setSuccessMsg(''); }}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${
                    tab === 'login' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Giriş Yap
                </button>
                <button
                  onClick={() => { setTab('register'); setError(''); setSuccessMsg(''); }}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${
                    tab === 'register' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Kayıt Ol
                </button>
              </div>
            )}

            {tab === 'forgot' ? (
              /* TAB: FORGOT PASSWORD */
              <form onSubmit={handleSubmit} className="space-y-3">
                <p className="text-xs text-slate-300">
                  Kayıtlı e-posta adresinizi girin. Şifrenizi yenilemeniz için bir bağlantı göndereceğiz.
                </p>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">E-posta</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="ornek@ogrenci.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-blue-500 text-xs text-white placeholder-slate-500 outline-none transition"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-2 rounded-lg bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                {successMsg && (
                  <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{successMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md transition disabled:opacity-50"
                >
                  Şifre Sıfırlama Bağlantısı Gönder
                </button>

                <button
                  type="button"
                  onClick={() => { setTab('login'); setError(''); setSuccessMsg(''); }}
                  className="w-full text-center text-xs text-slate-400 hover:text-white pt-2 block"
                >
                  ← Giriş Ekranına Dön
                </button>
              </form>
            ) : (
              /* TAB: LOGIN & REGISTER */
              <form onSubmit={handleSubmit} className="space-y-3">
                {tab === 'register' && (
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Kullanıcı Adı</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        placeholder="Adınız veya Takma Adınız"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-blue-500 text-xs text-white placeholder-slate-500 outline-none transition"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">E-posta</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="ornek@ogrenci.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-blue-500 text-xs text-white placeholder-slate-500 outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] font-semibold text-slate-400">Şifre</label>
                    {tab === 'login' && (
                      <button
                        type="button"
                        onClick={() => { setTab('forgot'); setError(''); }}
                        className="text-[10px] text-sky-400 hover:underline"
                      >
                        Şifremi Unuttum?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-blue-500 text-xs text-white placeholder-slate-500 outline-none transition"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-2 rounded-lg bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {tab === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  {tab === 'login' ? 'Giriş Yap' : 'Hesap Oluştur'}
                </button>
              </form>
            )}

            {/* Social & Guest Buttons */}
            {tab !== 'forgot' && (
              <div className="mt-4 pt-4 border-t border-slate-800 space-y-2">
                <button
                  type="button"
                  onClick={handleGoogle}
                  className="w-full py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 transition flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  Google ile Giriş Yap
                </button>

                <button
                  type="button"
                  onClick={handleGuest}
                  className="w-full py-2 rounded-xl text-xs font-semibold text-amber-300/90 bg-amber-950/30 hover:bg-amber-950/60 border border-amber-600/30 transition flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Misafir Olarak Devam Et
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
