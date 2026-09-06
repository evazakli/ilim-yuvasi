import React from 'react';
import { AvatarConfig, CharacterState, SkinTone, HairColor, OutfitColor } from '../../types/avatar';

interface AvatarRendererProps {
  config: AvatarConfig;
  state?: CharacterState;
  size?: number; // width in pixels
  className?: string;
}

// Color palettes for skin, hair, outfit
const SKIN_COLORS: Record<SkinTone, { base: string; shadow: string }> = {
  fair: { base: '#FFE8D6', shadow: '#F3D2BA' },
  peach: { base: '#F7CEB6', shadow: '#E9B599' },
  olive: { base: '#D8B18A', shadow: '#BF946A' },
  tan: { base: '#B58150', shadow: '#966333' },
  deep: { base: '#6B4025', shadow: '#4F2A14' },
};

const HAIR_COLORS: Record<HairColor, { base: string; highlight: string }> = {
  black: { base: '#1C1917', highlight: '#292524' },
  dark_brown: { base: '#3E2723', highlight: '#4E342E' },
  chestnut: { base: '#6D4C41', highlight: '#8D6E63' },
  blonde: { base: '#E2B144', highlight: '#F4CA64' },
  auburn: { base: '#9C3E1F', highlight: '#B84E29' },
  gray: { base: '#9E9E9E', highlight: '#BDBDBD' },
  pink: { base: '#EC4899', highlight: '#F472B6' },
  teal: { base: '#0D9488', highlight: '#14B8A6' },
};

const OUTFIT_COLORS: Record<OutfitColor, { base: string; dark: string; trim: string }> = {
  navy: { base: '#1E3A8A', dark: '#172554', trim: '#60A5FA' },
  emerald: { base: '#065F46', dark: '#022C22', trim: '#34D399' },
  crimson: { base: '#991B1B', dark: '#450A0A', trim: '#F87171' },
  charcoal: { base: '#334155', dark: '#1E293B', trim: '#94A3B8' },
  mustard: { base: '#B45309', dark: '#78350F', trim: '#FBBF24' },
  lavender: { base: '#6D28D9', dark: '#4C1D95', trim: '#A78BFA' },
  cream: { base: '#D97706', dark: '#92400E', trim: '#FDE68A' },
  mocha: { base: '#573824', dark: '#382315', trim: '#D7B49E' },
};

export const AvatarRenderer: React.FC<AvatarRendererProps> = ({
  config,
  state = 'idle',
  size = 120,
  className = ''
}) => {
  const skin = SKIN_COLORS[config.skin] || SKIN_COLORS.peach;
  const hair = HAIR_COLORS[config.hairColor] || HAIR_COLORS.dark_brown;
  const outfit = OUTFIT_COLORS[config.outfitColor] || OUTFIT_COLORS.emerald;

  // Animation classes based on state
  const isWorking = state === 'working';
  const isBreak = state === 'break';

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size * 1.15 }}
    >
      <svg
        viewBox="0 0 160 184"
        className="w-full h-full drop-shadow-md overflow-visible"
      >
        {/* Soft Shadow under the character */}
        <ellipse cx="80" cy="176" rx="42" ry="7" fill="rgba(0,0,0,0.22)" />

        {/* --- BACK HAIR (for long styles) --- */}
        {(config.hairStyle === 'bun' || config.hairStyle === 'ponytail' || config.hairStyle === 'wavy') && (
          <g fill={hair.base}>
            {config.hairStyle === 'bun' && (
              <circle cx="80" cy="36" r="22" />
            )}
            {config.hairStyle === 'ponytail' && (
              <path d="M 80 48 Q 116 52 112 90 Q 95 90 84 56 Z" />
            )}
            {config.hairStyle === 'wavy' && (
              <path d="M 46 64 C 36 90 40 120 48 135 C 54 125 58 100 56 70 Z M 114 64 C 124 90 120 120 112 135 C 106 125 102 100 104 70 Z" />
            )}
          </g>
        )}

        {/* --- BODY & CLOTHES --- */}
        <g className={isWorking ? 'anim-reading origin-bottom' : ''}>
          {/* Shoulders / Torso */}
          <path
            d="M 44 135 C 44 105 116 105 116 135 L 126 170 L 34 170 Z"
            fill={outfit.base}
          />
          {/* Collar / Outfit Trim */}
          {config.outfit === 'hoodie' && (
            <g>
              <path d="M 68 112 Q 80 134 92 112 Q 80 124 68 112 Z" fill={outfit.trim} />
              {/* Hoodie strings */}
              <line x1="74" y1="120" x2="73" y2="138" stroke={outfit.trim} strokeWidth="2.5" strokeLinecap="round" />
              <line x1="86" y1="120" x2="87" y2="138" stroke={outfit.trim} strokeWidth="2.5" strokeLinecap="round" />
            </g>
          )}

          {config.outfit === 'sweater' && (
            <path
              d="M 66 110 Q 80 120 94 110"
              stroke={outfit.trim}
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
            />
          )}

          {config.outfit === 'shirt' && (
            <g>
              <polygon points="65,110 80,126 76,110" fill={outfit.trim} />
              <polygon points="95,110 80,126 84,110" fill={outfit.trim} />
              <line x1="80" y1="126" x2="80" y2="165" stroke={outfit.dark} strokeWidth="2" strokeDasharray="3 4" />
            </g>
          )}

          {/* Scarf Accessory if equipped */}
          {config.accessory === 'scarf' && (
            <g>
              <ellipse cx="80" cy="116" rx="24" ry="9" fill="#E11D48" />
              <path d="M 88 118 L 88 148 L 78 148 L 78 118 Z" fill="#BE123C" />
            </g>
          )}

          {/* Neck */}
          <rect x="73" y="98" width="14" height="15" rx="3" fill={skin.shadow} />
        </g>

        {/* --- HEAD & FACE --- */}
        <g>
          {/* Head Base */}
          <ellipse cx="80" cy="74" rx="28" ry="32" fill={skin.base} />

          {/* Ears */}
          <ellipse cx="51" cy="76" rx="5" ry="8" fill={skin.shadow} />
          <ellipse cx="109" cy="76" rx="5" ry="8" fill={skin.shadow} />

          {/* Eyes */}
          {isWorking ? (
            // Focused, looking downward at book/laptop
            <g>
              <path d="M 68 76 Q 74 79 78 76" stroke="#1E293B" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d="M 82 76 Q 86 79 92 76" stroke="#1E293B" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            </g>
          ) : isBreak ? (
            // Joyful curved break eyes ^_^
            <g>
              <path d="M 66 74 Q 72 68 78 74" stroke="#1E293B" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d="M 82 74 Q 88 68 94 74" stroke="#1E293B" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            </g>
          ) : (
            // Idle friendly open eyes
            <g>
              <ellipse cx="71" cy="73" rx="3" ry="4" fill="#1E293B" />
              <circle cx="72" cy="71.5" r="1" fill="#FFFFFF" />
              <ellipse cx="89" cy="73" rx="3" ry="4" fill="#1E293B" />
              <circle cx="90" cy="71.5" r="1" fill="#FFFFFF" />
            </g>
          )}

          {/* Eyebrows */}
          <path d="M 66 65 Q 72 63 77 65" stroke={hair.base} strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M 83 65 Q 88 63 94 65" stroke={hair.base} strokeWidth="2" fill="none" strokeLinecap="round" />

          {/* Nose */}
          <path d="M 79 76 Q 82 81 78 83" stroke={skin.shadow} strokeWidth="2" fill="none" strokeLinecap="round" />

          {/* Gentle Smile */}
          <path
            d={isBreak ? "M 74 88 Q 80 95 86 88" : "M 75 89 Q 80 93 85 89"}
            stroke="#943734"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />

          {/* Cheeks Blush */}
          <ellipse cx="64" cy="80" rx="4" ry="2.5" fill="rgba(244, 63, 94, 0.25)" />
          <ellipse cx="96" cy="80" rx="4" ry="2.5" fill="rgba(244, 63, 94, 0.25)" />

          {/* --- GLASSES ACCESSORY --- */}
          {(config.accessory === 'glasses' || config.accessory === 'round_glasses') && (
            <g stroke="#334155" strokeWidth="2" fill="none">
              {config.accessory === 'glasses' ? (
                <>
                  <rect x="63" y="67" width="16" height="12" rx="3" stroke="#1E293B" fill="rgba(255,255,255,0.25)" />
                  <rect x="81" y="67" width="16" height="12" rx="3" stroke="#1E293B" fill="rgba(255,255,255,0.25)" />
                  <line x1="79" y1="73" x2="81" y2="73" stroke="#1E293B" />
                </>
              ) : (
                <>
                  <circle cx="71" cy="73" r="8" stroke="#B45309" strokeWidth="2.2" fill="rgba(255,255,255,0.2)" />
                  <circle cx="89" cy="73" r="8" stroke="#B45309" strokeWidth="2.2" fill="rgba(255,255,255,0.2)" />
                  <line x1="79" y1="73" x2="81" y2="73" stroke="#B45309" strokeWidth="2" />
                </>
              )}
            </g>
          )}

          {/* --- FRONT HAIR STYLES --- */}
          {config.hairStyle !== 'bald' && (
            <g fill={hair.base}>
              {config.hairStyle === 'short' && (
                <path d="M 52 64 C 52 42 108 42 108 64 C 98 52 88 56 80 50 C 72 56 62 52 52 64 Z" />
              )}
              {config.hairStyle === 'spiky' && (
                <path d="M 52 66 L 56 46 L 66 52 L 74 38 L 84 50 L 96 40 L 102 54 L 108 66 C 98 56 86 52 80 54 C 72 52 62 56 52 66 Z" />
              )}
              {config.hairStyle === 'curly' && (
                <g>
                  <circle cx="60" cy="50" r="12" />
                  <circle cx="76" cy="44" r="14" />
                  <circle cx="94" cy="48" r="13" />
                  <circle cx="106" cy="60" r="10" />
                  <circle cx="54" cy="60" r="10" />
                </g>
              )}
              {config.hairStyle === 'bob' && (
                <path d="M 50 64 C 50 40 110 40 110 64 L 112 88 C 108 92 104 80 102 70 C 90 60 70 60 58 70 C 56 80 52 92 48 88 Z" />
              )}
              {config.hairStyle === 'wavy' && (
                <path d="M 50 60 C 50 38 110 38 110 60 C 96 48 88 54 80 48 C 72 54 64 48 50 60 Z" />
              )}
              {config.hairStyle === 'bun' && (
                <path d="M 52 64 C 52 44 108 44 108 64 C 98 54 88 56 80 52 C 72 56 62 54 52 64 Z" />
              )}
              {config.hairStyle === 'ponytail' && (
                <path d="M 52 64 C 52 44 108 44 108 64 C 98 54 88 56 80 52 C 72 56 62 54 52 64 Z" />
              )}
            </g>
          )}

          {/* --- BEANIE HAT ACCESSORY --- */}
          {config.accessory === 'beanie' && (
            <g>
              <ellipse cx="80" cy="46" rx="31" ry="18" fill="#475569" />
              <rect x="50" y="44" width="60" height="12" rx="4" fill="#334155" />
              <circle cx="80" cy="27" r="6" fill="#64748B" />
            </g>
          )}

          {/* --- HEADPHONES ACCESSORY --- */}
          {config.accessory === 'headphones' && (
            <g>
              {/* Headband arch */}
              <path
                d="M 50 74 C 48 35 112 35 110 74"
                stroke="#0F172A"
                strokeWidth="5"
                fill="none"
                strokeLinecap="round"
              />
              {/* Ear cushions with neon/accent rings */}
              <rect x="46" y="66" width="8" height="20" rx="4" fill="#38BDF8" stroke="#0F172A" strokeWidth="2" />
              <rect x="106" y="66" width="8" height="20" rx="4" fill="#38BDF8" stroke="#0F172A" strokeWidth="2" />
            </g>
          )}
        </g>

        {/* --- FOREGROUND DESK ITEM & HANDS --- */}
        <g className="origin-bottom">
          {/* Hands Typing or Resting */}
          {isWorking ? (
            <g className="anim-typing">
              <ellipse cx="66" cy="154" rx="8" ry="6" fill={skin.base} stroke={skin.shadow} strokeWidth="1.5" />
              <ellipse cx="94" cy="154" rx="8" ry="6" fill={skin.base} stroke={skin.shadow} strokeWidth="1.5" />
            </g>
          ) : isBreak ? (
            <g className="anim-sip">
              <ellipse cx="88" cy="142" rx="7" ry="6" fill={skin.base} stroke={skin.shadow} strokeWidth="1.5" />
            </g>
          ) : (
            <g>
              <ellipse cx="64" cy="156" rx="7" ry="5" fill={skin.base} />
              <ellipse cx="96" cy="156" rx="7" ry="5" fill={skin.base} />
            </g>
          )}

          {/* Specific Desk Items */}
          {config.deskItem === 'laptop' && (
            <g transform="translate(48, 142)">
              {/* Laptop Screen */}
              <rect x="10" y="0" width="44" height="26" rx="3" fill="#1E293B" stroke="#475569" strokeWidth="1.5" />
              <rect x="13" y="3" width="38" height="20" rx="1.5" fill="#0EA5E9" opacity="0.85" />
              {/* Glowing code lines */}
              <line x1="16" y1="8" x2="32" y2="8" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="16" y1="13" x2="44" y2="13" stroke="#FDE047" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="16" y1="18" x2="38" y2="18" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
              {/* Base */}
              <polygon points="4,26 60,26 56,32 8,32" fill="#334155" stroke="#475569" strokeWidth="1" />
            </g>
          )}

          {config.deskItem === 'coffee_mug' && (
            <g transform="translate(100, 140)">
              {/* Coffee Cup */}
              <rect x="0" y="6" width="18" height="18" rx="3" fill="#DC2626" />
              <path d="M 18 10 Q 24 14 18 18" stroke="#DC2626" strokeWidth="3" fill="none" />
              {/* Hot Steam Animation */}
              <path
                d="M 6 4 Q 4 0 6 -4 M 12 4 Q 14 0 12 -4"
                stroke="rgba(255,255,255,0.6)"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
                className="anim-pulse-subtle"
              />
            </g>
          )}

          {config.deskItem === 'tea_cup' && (
            <g transform="translate(100, 144)">
              <ellipse cx="10" cy="18" rx="14" ry="4" fill="#94A3B8" />
              <path d="M 2 12 Q 10 20 18 12 Z" fill="#059669" />
              <line x1="10" y1="12" x2="16" y2="7" stroke="#F59E0B" strokeWidth="1.5" />
            </g>
          )}

          {config.deskItem === 'book_stack' && (
            <g transform="translate(26, 146)">
              {/* Bottom Book */}
              <rect x="0" y="10" width="34" height="7" rx="2" fill="#1E3A8A" />
              {/* Middle Book */}
              <rect x="3" y="4" width="30" height="6" rx="2" fill="#B45309" />
              {/* Top Open Book */}
              <path d="M 6 4 Q 17 0 17 4 Q 28 0 28 4 L 26 2 Q 17 -1 17 2 Q 17 -1 8 2 Z" fill="#F8FAFC" />
            </g>
          )}

          {config.deskItem === 'desk_lamp' && (
            <g transform="translate(24, 126)">
              {/* Lamp pole */}
              <path d="M 8 36 L 8 16 Q 8 6 18 6" stroke="#475569" strokeWidth="3" fill="none" strokeLinecap="round" />
              {/* Lamp Head */}
              <path d="M 16 2 L 28 10 L 16 14 Z" fill="#F59E0B" />
              {/* Warm light cone */}
              <polygon points="26,8 52,38 32,38" fill="rgba(251, 191, 36, 0.2)" />
              {/* Lamp base */}
              <rect x="2" y="34" width="12" height="4" rx="2" fill="#334155" />
            </g>
          )}

          {config.deskItem === 'succulent' && (
            <g transform="translate(102, 142)">
              {/* Terracotta pot */}
              <polygon points="2,14 16,14 14,24 4,24" fill="#EA580C" />
              {/* Succulent leaves */}
              <circle cx="9" cy="12" r="5" fill="#10B981" />
              <circle cx="5" cy="11" r="4" fill="#059669" />
              <circle cx="13" cy="11" r="4" fill="#059669" />
              <circle cx="9" cy="7" r="4" fill="#34D399" />
            </g>
          )}
        </g>
      </svg>
    </div>
  );
};
