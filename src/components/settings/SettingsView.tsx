import React, { useState, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { usePomodoro } from '../../context/PomodoroContext';
import { soundManager } from '../../utils/audioSynth';
import { AvatarCustomizer } from '../avatar/AvatarCustomizer';
import { ArrowLeft, Palette, Bell, Volume2, Upload, Sparkles, Check } from 'lucide-react';

interface SettingsViewProps {
  onBack: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onBack }) => {
  const { activeThemeName, setThemeName, availableThemeNames, theme } = useTheme();
  const { selectedSound, setSelectedSound } = usePomodoro();

  const [isThemeOpen, setIsThemeOpen] = useState<boolean>(true);
  const [isSoundOpen, setIsSoundOpen] = useState<boolean>(true);
  const [isAvatarOpen, setIsAvatarOpen] = useState<boolean>(false);
  const [customSounds, setCustomSounds] = useState<string[]>(() => soundManager.getCustomSoundsList());

  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
    <div className="max-w-2xl mx-auto p-4 md:p-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Geri
        </button>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span>⚙️ Ayarlar</span>
        </h2>
      </div>

      <div className="space-y-6">
        {/* Karakter Özelleştirme Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950/60 to-purple-950/60 border border-blue-500/30 shadow-xl flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Karakter & Avatar Özelleştirme
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Kütüphanede sizi temsil eden avatarın saçını, kıyafetini ve masaüstü eşyalarını tasarlayın.
            </p>
          </div>
          <button
            onClick={() => setIsAvatarOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md transition whitespace-nowrap"
          >
            Tasarla
          </button>
        </div>

        {/* Tema Ayarları */}
        <div className="p-6 rounded-2xl bg-[#232A36] border border-slate-700/60 shadow-xl">
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
        <div className="p-6 rounded-2xl bg-[#232A36] border border-slate-700/60 shadow-xl">
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
      </div>

      <AvatarCustomizer
        isOpen={isAvatarOpen}
        onClose={() => setIsAvatarOpen(false)}
      />
    </div>
  );
};
