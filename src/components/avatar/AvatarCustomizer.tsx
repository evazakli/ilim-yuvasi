import React, { useState } from 'react';
import {
  AvatarConfig,
  SkinTone,
  HairStyle,
  HairColor,
  OutfitType,
  OutfitColor,
  Accessory,
  DeskItem,
  CharacterState
} from '../../types/avatar';
import { AvatarRenderer } from './AvatarRenderer';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Check, X, RefreshCw } from 'lucide-react';

interface AvatarCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
}

const SKIN_OPTIONS: { id: SkinTone; label: string; color: string }[] = [
  { id: 'fair', label: 'Açık Ten', color: '#FFE8D6' },
  { id: 'peach', label: 'Buğday', color: '#F7CEB6' },
  { id: 'olive', label: 'Kumral', color: '#D8B18A' },
  { id: 'tan', label: 'Esmer', color: '#B58150' },
  { id: 'deep', label: 'Koyu', color: '#6B4025' },
];

const HAIR_STYLES: { id: HairStyle; label: string }[] = [
  { id: 'short', label: 'Kısa' },
  { id: 'curly', label: 'Kıvırcık' },
  { id: 'wavy', label: 'Dalgalı' },
  { id: 'bob', label: 'Küt' },
  { id: 'bun', label: 'Topuz' },
  { id: 'ponytail', label: 'At Kuyruğu' },
  { id: 'spiky', label: 'Dikenli' },
  { id: 'bald', label: 'Kel' },
];

const HAIR_COLORS: { id: HairColor; label: string; color: string }[] = [
  { id: 'black', label: 'Siyah', color: '#1C1917' },
  { id: 'dark_brown', label: 'Koyu Kahve', color: '#3E2723' },
  { id: 'chestnut', label: 'Kestane', color: '#6D4C41' },
  { id: 'blonde', label: 'Sarı', color: '#E2B144' },
  { id: 'auburn', label: 'Kızıl', color: '#9C3E1F' },
  { id: 'gray', label: 'Gri', color: '#9E9E9E' },
  { id: 'pink', label: 'Pembe', color: '#EC4899' },
  { id: 'teal', label: 'Turkuaz', color: '#0D9488' },
];

const OUTFIT_TYPES: { id: OutfitType; label: string }[] = [
  { id: 'hoodie', label: 'Kapüşonlu' },
  { id: 'sweater', label: 'Kazak' },
  { id: 'shirt', label: 'Gömlek' },
  { id: 'jacket', label: 'Ceket' },
  { id: 'tshirt', label: 'Tişört' },
  { id: 'cardigan', label: 'Hırka' },
];

const OUTFIT_COLORS: { id: OutfitColor; label: string; color: string }[] = [
  { id: 'navy', label: 'Lacivert', color: '#1E3A8A' },
  { id: 'emerald', label: 'Zümrüt Yeşili', color: '#065F46' },
  { id: 'crimson', label: 'Bordo', color: '#991B1B' },
  { id: 'charcoal', label: 'Antrasit', color: '#334155' },
  { id: 'mustard', label: 'Hardal', color: '#B45309' },
  { id: 'lavender', label: 'Lila / Mor', color: '#6D28D9' },
  { id: 'cream', label: 'Krem / Bal', color: '#D97706' },
  { id: 'mocha', label: 'Mocha', color: '#573824' },
];

const ACCESSORIES: { id: Accessory; label: string }[] = [
  { id: 'none', label: 'Yok' },
  { id: 'glasses', label: 'Kare Gözlük' },
  { id: 'round_glasses', label: 'Yuvarlak Gözlük' },
  { id: 'headphones', label: 'Kulaklık' },
  { id: 'beanie', label: 'Bere' },
  { id: 'scarf', label: 'Atkı' },
];

const DESK_ITEMS: { id: DeskItem; label: string; icon: string }[] = [
  { id: 'coffee_mug', label: 'Sıcak Kahve', icon: '☕' },
  { id: 'tea_cup', label: 'Bitki Çayı', icon: '🍵' },
  { id: 'laptop', label: 'Dizüstü Bilgisayar', icon: '💻' },
  { id: 'book_stack', label: 'Kitap Yığını', icon: '📚' },
  { id: 'desk_lamp', label: 'Masa Lambası', icon: '💡' },
  { id: 'succulent', label: 'Sukulent Bitki', icon: '🪴' },
];

export const AvatarCustomizer: React.FC<AvatarCustomizerProps> = ({ isOpen, onClose }) => {
  const { user, updateAvatar } = useAuth();
  const [config, setConfig] = useState<AvatarConfig>(user?.avatar || {
    skin: 'peach',
    hairStyle: 'short',
    hairColor: 'dark_brown',
    outfit: 'hoodie',
    outfitColor: 'emerald',
    accessory: 'headphones',
    deskItem: 'coffee_mug'
  });

  const [activeTab, setActiveTab] = useState<'skin' | 'hair' | 'outfit' | 'accessory' | 'desk'>('hair');
  const [previewState, setPreviewState] = useState<CharacterState>('working');
  const [isMobile, setIsMobile] = useState<boolean>(() => typeof window !== 'undefined' ? window.innerWidth < 768 : false);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isOpen) return null;

  const handleRandomize = () => {
    const randomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
    setConfig({
      skin: randomItem(SKIN_OPTIONS).id,
      hairStyle: randomItem(HAIR_STYLES).id,
      hairColor: randomItem(HAIR_COLORS).id,
      outfit: randomItem(OUTFIT_TYPES).id,
      outfitColor: randomItem(OUTFIT_COLORS).id,
      accessory: randomItem(ACCESSORIES).id,
      deskItem: randomItem(DESK_ITEMS).id,
    });
  };

  const handleSave = async () => {
    await updateAvatar(config);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#1E1E2E] border border-slate-700/60 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-800 bg-[#181825] shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-base sm:text-lg font-bold text-white">Karakterini Tasarla</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-6">
          {/* Left: Avatar Live Preview */}
          <div className="md:col-span-2 flex flex-col sm:flex-row md:flex-col items-center justify-center p-3.5 sm:p-5 bg-[#181825] rounded-2xl border border-slate-800 gap-3">
            <div className="relative p-2.5 sm:p-4 rounded-2xl bg-gradient-to-b from-slate-800/40 to-slate-900/80 border border-slate-700/50 shadow-inner flex items-center justify-center shrink-0">
              <AvatarRenderer config={config} state={previewState} size={isMobile ? 85 : 140} />
            </div>

            <div className="flex flex-col items-center gap-2 w-full">
              {/* Preview Animation State Switcher */}
              <div className="flex gap-1 p-1 bg-slate-900/90 rounded-xl border border-slate-800 text-[11px]">
                <button
                  onClick={() => setPreviewState('idle')}
                  className={`px-2 py-1 rounded-lg transition ${previewState === 'idle' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-white'}`}
                >
                  Boşta
                </button>
                <button
                  onClick={() => setPreviewState('working')}
                  className={`px-2 py-1 rounded-lg transition ${previewState === 'working' ? 'bg-emerald-600 text-white font-medium' : 'text-slate-400 hover:text-white'}`}
                >
                  Çalışıyor ✍️
                </button>
                <button
                  onClick={() => setPreviewState('break')}
                  className={`px-2 py-1 rounded-lg transition ${previewState === 'break' ? 'bg-amber-600 text-white font-medium' : 'text-slate-400 hover:text-white'}`}
                >
                  Molada ☕
                </button>
              </div>

              <button
                onClick={handleRandomize}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-sky-400 transition py-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Rastgele Karakter</span>
              </button>
            </div>
          </div>

          {/* Right: Customization Controls */}
          <div className="md:col-span-3 flex flex-col">
            {/* Category Tabs */}
            <div className="flex border-b border-slate-800 pb-2 gap-1.5 overflow-x-auto scrollbar-none">
              {[
                { id: 'hair', label: 'Saç' },
                { id: 'skin', label: 'Ten' },
                { id: 'outfit', label: 'Kıyafet' },
                { id: 'accessory', label: 'Aksesuar' },
                { id: 'desk', label: 'Masa Eşyası' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 py-4 space-y-4">
              {/* Tab: Hair */}
              {activeTab === 'hair' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Saç Modeli</label>
                    <div className="grid grid-cols-2 gap-2">
                      {HAIR_STYLES.map(style => (
                        <button
                          key={style.id}
                          onClick={() => setConfig({ ...config, hairStyle: style.id })}
                          className={`px-3 py-2 rounded-lg text-xs font-medium text-left border transition ${
                            config.hairStyle === style.id
                              ? 'border-blue-500 bg-blue-500/15 text-blue-300'
                              : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          {style.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Saç Rengi</label>
                    <div className="flex flex-wrap gap-2">
                      {HAIR_COLORS.map(color => (
                        <button
                          key={color.id}
                          onClick={() => setConfig({ ...config, hairColor: color.id })}
                          className={`w-7 h-7 rounded-full border-2 transition ${
                            config.hairColor === color.id ? 'border-blue-400 scale-110 shadow-md' : 'border-transparent hover:scale-105'
                          }`}
                          style={{ backgroundColor: color.color }}
                          title={color.label}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Skin */}
              {activeTab === 'skin' && (
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">Ten Rengi Tonu</label>
                  <div className="grid grid-cols-1 gap-2.5">
                    {SKIN_OPTIONS.map(skin => (
                      <button
                        key={skin.id}
                        onClick={() => setConfig({ ...config, skin: skin.id })}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition ${
                          config.skin === skin.id
                            ? 'border-blue-500 bg-blue-500/15 text-white'
                            : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <span className="w-5 h-5 rounded-full border border-black/20" style={{ backgroundColor: skin.color }} />
                        <span className="text-xs font-medium">{skin.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab: Outfit */}
              {activeTab === 'outfit' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Kıyafet Türü</label>
                    <div className="grid grid-cols-2 gap-2">
                      {OUTFIT_TYPES.map(type => (
                        <button
                          key={type.id}
                          onClick={() => setConfig({ ...config, outfit: type.id })}
                          className={`px-3 py-2 rounded-lg text-xs font-medium text-left border transition ${
                            config.outfit === type.id
                              ? 'border-blue-500 bg-blue-500/15 text-blue-300'
                              : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Kıyafet Rengi</label>
                    <div className="flex flex-wrap gap-2">
                      {OUTFIT_COLORS.map(color => (
                        <button
                          key={color.id}
                          onClick={() => setConfig({ ...config, outfitColor: color.id })}
                          className={`w-7 h-7 rounded-full border-2 transition ${
                            config.outfitColor === color.id ? 'border-blue-400 scale-110 shadow-md' : 'border-transparent hover:scale-105'
                          }`}
                          style={{ backgroundColor: color.color }}
                          title={color.label}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Accessory */}
              {activeTab === 'accessory' && (
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Aksesuar Seçimi</label>
                  <div className="grid grid-cols-2 gap-2">
                    {ACCESSORIES.map(acc => (
                      <button
                        key={acc.id}
                        onClick={() => setConfig({ ...config, accessory: acc.id })}
                        className={`px-3 py-2.5 rounded-lg text-xs font-medium text-left border transition ${
                          config.accessory === acc.id
                            ? 'border-blue-500 bg-blue-500/15 text-blue-300'
                            : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        {acc.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab: Desk Items */}
              {activeTab === 'desk' && (
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Masaüstü Eşyanız</label>
                  <p className="text-xs text-slate-400 mb-3">Çalışma masanızda sizin tarzınızı yansıtacak simge nesne:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {DESK_ITEMS.map(item => (
                      <button
                        key={item.id}
                        onClick={() => setConfig({ ...config, deskItem: item.id })}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium text-left border transition ${
                          config.deskItem === item.id
                            ? 'border-blue-500 bg-blue-500/15 text-blue-300'
                            : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-base">{item.icon}</span>
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Buttons Sticky */}
        <div className="sticky bottom-0 flex items-center justify-end gap-3 px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-800 bg-[#181825] z-10 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition"
          >
            İptal
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-500/20 transition"
          >
            <Check className="w-4 h-4" />
            Kaydet ve Kullan
          </button>
        </div>
      </div>
    </div>
  );
};
