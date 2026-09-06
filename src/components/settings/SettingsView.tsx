import React, { useState, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { usePomodoro } from '../../context/PomodoroContext';
import { soundManager } from '../../utils/audioSynth';
import { AvatarCustomizer } from '../avatar/AvatarCustomizer';
import {
  isFirebaseConfigured,
  getStoredFirebaseConfig,
  saveCustomFirebaseConfig,
  clearCustomFirebaseConfig,
  parseFirebaseSnippet
} from '../../services/firebase';
import {
  ArrowLeft,
  Palette,
  Bell,
  Volume2,
  Upload,
  Sparkles,
  Check,
  Flame,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Trash2,
  ExternalLink
} from 'lucide-react';

interface SettingsViewProps {
  onBack: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onBack }) => {
  const { activeThemeName, setThemeName, availableThemeNames, theme } = useTheme();
  const { selectedSound, setSelectedSound } = usePomodoro();

  const [isThemeOpen, setIsThemeOpen] = useState<boolean>(true);
  const [isSoundOpen, setIsSoundOpen] = useState<boolean>(true);
  const [isAvatarOpen, setIsAvatarOpen] = useState<boolean>(false);
  const [isFirebaseOpen, setIsFirebaseOpen] = useState<boolean>(!isFirebaseConfigured);
  const [firebaseSnippet, setFirebaseSnippet] = useState<string>('');
  const [firebaseError, setFirebaseError] = useState<string>('');
  const [showSetupGuide, setShowSetupGuide] = useState<boolean>(false);
  const [customSounds, setCustomSounds] = useState<string[]>(() => soundManager.getCustomSoundsList());

  const activeFirebaseConfig = getStoredFirebaseConfig();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSaveFirebase = (e: React.FormEvent) => {
    e.preventDefault();
    setFirebaseError('');
    if (!firebaseSnippet.trim()) {
      setFirebaseError('Lütfen Firebase Console yapılandırma kodunuzu yapıştırın.');
      return;
    }

    const parsed = parseFirebaseSnippet(firebaseSnippet);
    if (!parsed.apiKey || !parsed.projectId) {
      setFirebaseError('Geçerli bir Firebase yapılandırması tespit edilemedi. apiKey ve projectId alanlarının olduğundan emin olun.');
      return;
    }

    saveCustomFirebaseConfig({
      apiKey: parsed.apiKey,
      authDomain: parsed.authDomain || `${parsed.projectId}.firebaseapp.com`,
      databaseURL: parsed.databaseURL || `https://${parsed.projectId}-default-rtdb.firebaseio.com`,
      projectId: parsed.projectId,
      storageBucket: parsed.storageBucket || `${parsed.projectId}.appspot.com`,
      messagingSenderId: parsed.messagingSenderId || '',
      appId: parsed.appId || '',
      measurementId: parsed.measurementId || ''
    });
  };

  const handleClearFirebase = () => {
    if (window.confirm('Firebase yapılandırmasını kaldırmak ve yerel moda dönmek istediğinize emin misiniz?')) {
      clearCustomFirebaseConfig();
    }
  };

  const defaultSounds = [
    { id: 'warning.mp3', label: 'Acil Durum Alarmı' },
    { id: 'bipbip.mp3', label: 'Bip Sesi' },
    { id: 'dog.mp3', label: 'Köpek Sesi' },
    { id: 'tibetan_bell', label: 'Meditatif Zil' },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      const soundName = file.name.replace(/\.[^/.]+$/, '');
      soundManager.saveCustomSound(soundName, dataUrl);
      setCustomSounds(soundManager.getCustomSoundsList());
      setSelectedSound(soundName);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-2xl mx-auto p-3.5 sm:p-6 md:p-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Geri
        </button>
        <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
          <span>⚙️ Ayarlar</span>
        </h2>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {/* Karakter Özelleştirme Banner */}
        <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-blue-950/60 to-purple-950/60 border border-blue-500/30 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Karakter & Avatar Özelleştirme</span>
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Kütüphanede sizi temsil eden avatarın saçını, kıyafetini ve masaüstü eşyalarını tasarlayın.
            </p>
          </div>
          <button
            onClick={() => setIsAvatarOpen(true)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md transition text-center shrink-0"
          >
            Karakter Tasarla
          </button>
        </div>

        {/* Tema Ayarları */}
        <div className="p-4 sm:p-6 rounded-2xl bg-[#232A36] border border-slate-700/60 shadow-xl">
          <button
            onClick={() => setIsThemeOpen(!isThemeOpen)}
            className="w-full flex items-center justify-between text-left pb-2 border-b border-slate-700/80"
          >
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Palette className="w-4 h-4 text-blue-400" />
              <span>Tema Ayarları</span>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              {isThemeOpen ? '▼' : '▶'}
            </span>
          </button>

          {isThemeOpen && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              {availableThemeNames.map(name => {
                const isSelected = activeThemeName === name;
                return (
                  <button
                    key={name}
                    onClick={() => setThemeName(name)}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition ${
                      isSelected
                        ? 'border-blue-500 bg-blue-500/15 text-white shadow-md'
                        : 'border-slate-700/60 bg-[#1A202C] text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-4 h-4 rounded-full border border-white/20"
                        style={{
                          backgroundColor:
                            name === 'Varsayılan' ? '#1E1E2E' :
                            name === 'Mavi' ? '#0F172A' :
                            name === 'Yeşil' ? '#14271A' :
                            name === 'Kırmızı' ? '#2C1111' : '#1E112A'
                        }}
                      />
                      <span className="text-xs font-bold">{name}</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-blue-400" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Uyarı Sesi Ayarları */}
        <div className="p-4 sm:p-6 rounded-2xl bg-[#232A36] border border-slate-700/60 shadow-xl">
          <button
            onClick={() => setIsSoundOpen(!isSoundOpen)}
            className="w-full flex items-center justify-between text-left pb-2 border-b border-slate-700/80"
          >
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Bell className="w-4 h-4 text-amber-400" />
              <span>Uyarı Sesi Ayarları</span>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              {isSoundOpen ? '▼' : '▶'}
            </span>
          </button>

          {isSoundOpen && (
            <div className="space-y-3 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {defaultSounds.map(snd => {
                  const isSelected = selectedSound === snd.id;
                  return (
                    <button
                      key={snd.id}
                      onClick={() => setSelectedSound(snd.id)}
                      className={`flex items-center justify-between px-3.5 py-3 rounded-xl border transition ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500/15 text-white shadow-md'
                          : 'border-slate-700/60 bg-[#1A202C] text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      <span className="text-xs font-medium">{snd.label}</span>
                      <Volume2 className="w-4 h-4 text-slate-400" />
                    </button>
                  );
                })}

                {/* Custom Uploaded Sounds */}
                {customSounds.map(sndName => {
                  const isSelected = selectedSound === sndName;
                  return (
                    <button
                      key={sndName}
                      onClick={() => setSelectedSound(sndName)}
                      className={`flex items-center justify-between px-3.5 py-3 rounded-xl border transition ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500/15 text-white shadow-md'
                          : 'border-slate-700/60 bg-[#1A202C] text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      <span className="text-xs font-medium truncate">{sndName} (Özel)</span>
                      <Volume2 className="w-4 h-4 text-slate-400" />
                    </button>
                  );
                })}
              </div>

              {/* Upload Custom Sound Button */}
              <div className="pt-3 border-t border-slate-700/60">
                <input
                  type="file"
                  accept="audio/*"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-dashed border-blue-500/50 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 text-xs font-semibold transition"
                >
                  <Upload className="w-4 h-4" />
                  + Kendi Ses Dosyanı Yükle (.mp3, .wav)
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Firebase Bulut & Canlı Senkronizasyon Ayarları */}
        <div className="p-4 sm:p-6 rounded-2xl bg-[#232A36] border border-slate-700/60 shadow-xl">
          <button
            onClick={() => setIsFirebaseOpen(!isFirebaseOpen)}
            className="w-full flex items-center justify-between text-left pb-2 border-b border-slate-700/80"
          >
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Flame className="w-4 h-4 text-amber-500" />
              <span>Firebase Bulut & Çok Oyunculu Bağlantısı</span>
            </div>
            <div className="flex items-center gap-2">
              {isFirebaseConfigured ? (
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Bağlı
                </span>
              ) : (
                <span className="text-[10px] font-semibold text-amber-300 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  Yerel Mod
                </span>
              )}
              <span className="text-xs text-slate-400 font-medium">
                {isFirebaseOpen ? '▼' : '▶'}
              </span>
            </div>
          </button>

          {isFirebaseOpen && (
            <div className="space-y-4 mt-4">
              {isFirebaseConfigured ? (
                /* Connected State Card */
                <div className="p-4 rounded-xl bg-slate-900/80 border border-emerald-500/30 space-y-3">
                  <div className="flex items-center gap-2.5 text-emerald-400">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-white">Firebase Bulutu Aktif</div>
                      <div className="text-[11px] text-slate-400">Kütüphanedeki diğer öğrencilerle ve arkadaşlarınızla canlı senkronizasyon çalışıyor.</div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-300 space-y-1 bg-black/30 p-2.5 rounded-lg border border-slate-800 font-mono text-[11px] break-all max-w-full overflow-hidden">
                    <div><strong className="text-slate-400 font-sans">Proje ID:</strong> {activeFirebaseConfig.projectId}</div>
                    <div><strong className="text-slate-400 font-sans">Auth Domain:</strong> {activeFirebaseConfig.authDomain}</div>
                    {activeFirebaseConfig.databaseURL && (
                      <div className="truncate"><strong className="text-slate-400 font-sans">Canlı Masa (RTDB):</strong> {activeFirebaseConfig.databaseURL}</div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={handleClearFirebase}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-300 bg-rose-950/40 hover:bg-rose-950/70 border border-rose-500/30 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Bağlantıyı Sıfırla / Kaldır
                    </button>
                  </div>
                </div>
              ) : (
                /* Not Connected State */
                <div className="space-y-3">
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Arkadaşlarınızla farklı cihazlardan aynı sanal kütüphanede buluşmak ve kullanıcı hesaplarını saklamak için Firebase yapılandırmanızı tanımlayabilirsiniz.
                  </p>

                  <form onSubmit={handleSaveFirebase} className="space-y-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                        Firebase Yapılandırma Kodu (firebaseConfig)
                      </label>
                      <textarea
                        rows={5}
                        placeholder={'const firebaseConfig = {\n  apiKey: "AIzaSy...",\n  authDomain: "proje.firebaseapp.com",\n  projectId: "proje",\n  ...\n};'}
                        value={firebaseSnippet}
                        onChange={(e) => setFirebaseSnippet(e.target.value)}
                        className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 focus:border-amber-500 text-xs font-mono text-white placeholder-slate-600 outline-none transition"
                      />
                    </div>

                    {firebaseError && (
                      <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>{firebaseError}</span>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowSetupGuide(!showSetupGuide)}
                        className="flex items-center justify-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 py-1"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>{showSetupGuide ? 'Rehberi Gizle' : 'Firebase Nasıl Kurulur? (Adım Adım)'}</span>
                      </button>

                      <button
                        type="submit"
                        className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 shadow-md shadow-amber-600/20 transition"
                      >
                        <Check className="w-4 h-4" />
                        Kaydet ve Bağlan
                      </button>
                    </div>
                  </form>

                  {/* Collapsible Setup Guide */}
                  {showSetupGuide && (
                    <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-2.5 animate-fade-in">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span>🔥 5 Adımda Ücretsiz Firebase Kurulumu:</span>
                      </div>
                      <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-slate-300">
                        <li>
                          <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-sky-400 underline inline-flex items-center gap-0.5">
                            Firebase Console <ExternalLink className="w-3 h-3" />
                          </a>{' '}
                          üzerinden ücretsiz bir proje oluşturun.
                        </li>
                        <li>Proje Genel Bakış sayfasında <strong>Web (&lt;/&gt;)</strong> simgesine tıklayıp uygulamanızı ekleyin.</li>
                        <li>Size verilen <code className="bg-black/40 px-1 py-0.5 rounded text-amber-300">firebaseConfig</code> kodunu kopyalayıp yukarıdaki kutucuğa yapıştırın.</li>
                        <li>Sol menüden <strong>Authentication</strong> açıp <em>Email/Password</em> ve <em>Google</em> giriş yöntemlerini aktifleştirin.</li>
                        <li><strong>Firestore Database</strong> ve canlı masalar için <strong>Realtime Database</strong> oluşturup kuralları kaydedin.</li>
                      </ol>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <AvatarCustomizer
        isOpen={isAvatarOpen}
        onClose={() => setIsAvatarOpen(false)}
      />
    </div>
  );
};
