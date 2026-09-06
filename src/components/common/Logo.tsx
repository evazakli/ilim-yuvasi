import React from 'react';

interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 32, showText = true, className = '' }) => {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* 
        Özgün Logo: "İlim Meşalesi & Yuva Kubbesi" 
        Kitap sayfası yerine: İlim (Bilgi meşalesi / parlayan kıvılcım), 
        Yuva (Korumacı zarif kubbe/kemer) ve Pomodoro (Zaman odak halkası) birleşimi.
      */}
      <div
        className="relative flex items-center justify-center rounded-2xl p-1.5 shadow-lg shadow-amber-500/15 transition-transform duration-300 group-hover:scale-105"
        style={{
          width: size,
          height: size,
          background: 'linear-gradient(135deg, #1E2235 0%, #151824 100%)',
          border: '1px solid rgba(245, 158, 11, 0.35)',
        }}
      >
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full overflow-visible"
        >
          {/* Arka plan yumuşak sıcak ışıma */}
          <circle cx="24" cy="24" r="18" fill="url(#logo-glow)" opacity="0.4" />

          {/* Yuva Kubbesi (Arch of Sanctuary) */}
          <path
            d="M 12 36 C 12 20 36 20 36 36"
            stroke="url(#gold-grad)"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Dış Odak Çemberi (Pomodoro Time Ring) */}
          <circle
            cx="24"
            cy="24"
            r="19"
            stroke="url(#blue-grad)"
            strokeWidth="2"
            strokeDasharray="4 6"
            strokeLinecap="round"
            opacity="0.8"
          />

          {/* İlim Işığı / Meşale Kıvılcımı (Spark of Enlightenment) */}
          <path
            d="M 24 10 C 24 10 29 17 29 22 C 29 24.76 26.76 27 24 27 C 21.24 27 19 24.76 19 22 C 19 17 24 10 24 10 Z"
            fill="url(#flame-grad)"
          />

          {/* Kıvılcımın Merkez Çekirdeği */}
          <circle cx="24" cy="22" r="2.5" fill="#FFFBEB" />

          {/* Alt Kaide / Destek Çizgisi */}
          <path
            d="M 16 38 L 32 38"
            stroke="url(#gold-grad)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Gradients */}
          <defs>
            <linearGradient id="gold-grad" x1="12" y1="20" x2="36" y2="38" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F59E0B" />
              <stop offset="1" stopColor="#D97706" />
            </linearGradient>

            <linearGradient id="flame-grad" x1="24" y1="10" x2="24" y2="27" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FDE68A" />
              <stop offset="0.4" stopColor="#F59E0B" />
              <stop offset="1" stopColor="#DC2626" />
            </linearGradient>

            <linearGradient id="blue-grad" x1="5" y1="5" x2="43" y2="43" gradientUnits="userSpaceOnUse">
              <stop stopColor="#60A5FA" />
              <stop offset="1" stopColor="#3B82F6" />
            </linearGradient>

            <radialGradient id="logo-glow" cx="24" cy="24" r="18" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F59E0B" stopOpacity="0.8" />
              <stop offset="1" stopColor="#F59E0B" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-extrabold tracking-wide text-white font-sans">
              İlim Yuvası
            </span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
              V0.4
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium tracking-tight -mt-0.5">
            Birlikte Odaklanma Salonu
          </span>
        </div>
      )}
    </div>
  );
};
