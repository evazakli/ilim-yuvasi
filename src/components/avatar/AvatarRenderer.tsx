import React from 'react';
import {
  AvatarConfig,
  CharacterState,
  SkinTone,
  HairColor,
  OutfitColor,
  HairStyle,
  FacialHair,
  OutfitType,
  Accessory,
  DeskItem
} from '../../types/avatar';

interface AvatarRendererProps {
  config: AvatarConfig;
  state?: CharacterState;
  size?: number; // width in pixels
  className?: string;
}

// 8 Rich Skin Tones with Base, Shadow, and Highlight
const SKIN_COLORS: Record<SkinTone, { base: string; shadow: string; highlight: string }> = {
  fair: { base: '#FFEADB', shadow: '#F4D2BC', highlight: '#FFF5EE' },
  peach: { base: '#F7CEB6', shadow: '#E4B499', highlight: '#FDECE2' },
  warm: { base: '#E8BA97', shadow: '#D29F78', highlight: '#F4D5BD' },
  olive: { base: '#D8B18A', shadow: '#BF9369', highlight: '#E5C7A7' },
  tan: { base: '#B58150', shadow: '#966333', highlight: '#C99767' },
  bronze: { base: '#945C33', shadow: '#78441F', highlight: '#AA7146' },
  deep: { base: '#6B4025', shadow: '#4F2A14', highlight: '#845334' },
  espresso: { base: '#422616', shadow: '#2D170B', highlight: '#5A3520' },
};

// 12 Hair Colors with Base, Highlight, and Dark Shade
const HAIR_COLORS: Record<HairColor, { base: string; highlight: string; dark: string }> = {
  black: { base: '#18181B', highlight: '#2E2E33', dark: '#0C0C0E' },
  dark_brown: { base: '#3B2418', highlight: '#563829', dark: '#24140C' },
  chestnut: { base: '#633B27', highlight: '#845239', dark: '#482717' },
  caramel: { base: '#9B683B', highlight: '#BA8454', dark: '#754B24' },
  blonde: { base: '#E2B144', highlight: '#F6CF6B', dark: '#B78822' },
  platinum: { base: '#E2E8F0', highlight: '#FFFFFF', dark: '#94A3B8' },
  auburn: { base: '#8F351D', highlight: '#B24B2F', dark: '#6A200B' },
  burgundy: { base: '#6A1B2E', highlight: '#8D2941', dark: '#460C1B' },
  gray: { base: '#64748B', highlight: '#94A3B8', dark: '#475569' },
  silver: { base: '#CBD5E1', highlight: '#F1F5F9', dark: '#94A3B8' },
  pink: { base: '#EC4899', highlight: '#F472B6', dark: '#BE185D' },
  teal: { base: '#0D9488', highlight: '#2DD4BF', dark: '#0F766E' },
};

// 12 Outfit Colors with Base, Dark, and Trim
const OUTFIT_COLORS: Record<OutfitColor, { base: string; dark: string; trim: string }> = {
  navy: { base: '#1E3A8A', dark: '#172554', trim: '#60A5FA' },
  emerald: { base: '#065F46', dark: '#022C22', trim: '#34D399' },
  crimson: { base: '#991B1B', dark: '#450A0A', trim: '#F87171' },
  charcoal: { base: '#334155', dark: '#1E293B', trim: '#94A3B8' },
  mustard: { base: '#B45309', dark: '#78350F', trim: '#FBBF24' },
  lavender: { base: '#6D28D9', dark: '#4C1D95', trim: '#A78BFA' },
  cream: { base: '#D97706', dark: '#92400E', trim: '#FDE68A' },
  mocha: { base: '#573824', dark: '#382315', trim: '#D7B49E' },
  sage: { base: '#476355', dark: '#2F453A', trim: '#86A896' },
  terracotta: { base: '#A34832', dark: '#78301E', trim: '#E07E65' },
  royal_blue: { base: '#2563EB', dark: '#1D4ED8', trim: '#93C5FD' },
  pure_black: { base: '#18181B', dark: '#09090B', trim: '#52525B' },
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
  const facialHair = config.facialHair || 'none';

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
        {/* Soft Ambient Grounding Shadow */}
        <ellipse cx="80" cy="176" rx="44" ry="7" fill="rgba(0,0,0,0.24)" />

        {/* --- BACK HAIR (Volume behind head & shoulders) --- */}
        {config.hairStyle === 'bun' && (
          <g fill={hair.base}>
            <circle cx="80" cy="24" r="19" fill={hair.base} />
            <circle cx="80" cy="24" r="16" fill={hair.highlight} opacity="0.25" />
            <path d="M 72 20 Q 80 14 88 20" stroke={hair.highlight} strokeWidth="2" fill="none" strokeLinecap="round" />
            <ellipse cx="80" cy="36" rx="12" ry="5" fill="#F59E0B" />
          </g>
        )}

        {config.hairStyle === 'ponytail' && (
          <g fill={hair.base}>
            <path
              d="M 82 38 C 96 34 116 42 122 66 C 126 84 118 106 112 118 C 106 104 112 80 106 62 C 100 48 88 42 80 40 Z"
              fill={hair.base}
            />
            <path
              d="M 92 42 C 106 48 116 66 114 94"
              stroke={hair.highlight}
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              opacity="0.75"
            />
            <ellipse cx="82" cy="40" rx="6" ry="7" fill="#EC4899" />
          </g>
        )}

        {config.hairStyle === 'wavy' && (
          <g fill={hair.base}>
            <path
              d="M 46 60 C 32 75 32 108 42 138 C 50 128 54 100 52 74 Z"
              fill={hair.dark}
            />
            <path
              d="M 114 60 C 128 75 128 108 118 138 C 110 128 106 100 108 74 Z"
              fill={hair.dark}
            />
          </g>
        )}

        {config.hairStyle === 'bob' && (
          <path
            d="M 46 64 C 40 82 42 104 56 104 C 64 104 60 84 56 70 Z M 114 64 C 120 82 118 104 104 104 C 96 104 100 84 104 70 Z"
            fill={hair.dark}
          />
        )}

        {config.hairStyle === 'braids' && (
          <g fill={hair.dark}>
            <path d="M 44 68 C 36 90 38 122 44 145 C 50 145 48 110 52 80 Z" />
            <path d="M 116 68 C 124 90 122 122 116 145 C 110 145 112 110 108 80 Z" />
          </g>
        )}

        {config.hairStyle === 'hijab' && (
          <g fill={hair.dark}>
            <path
              d="M 38 72 C 28 94 26 128 40 148 C 50 154 110 154 120 148 C 134 128 132 94 122 72 Z"
            />
          </g>
        )}

        {/* --- BODY & OUTFITS --- */}
        <g className={isWorking ? 'anim-reading origin-bottom' : ''}>
          <path
            d="M 44 135 C 44 105 116 105 116 135 L 126 170 L 34 170 Z"
            fill={outfit.base}
          />

          {config.outfit === 'hoodie' && (
            <g>
              <path d="M 54 154 L 106 154 L 100 170 L 60 170 Z" fill={outfit.dark} opacity="0.4" />
              <path d="M 66 112 Q 80 134 94 112 Q 80 123 66 112 Z" fill={outfit.trim} />
              <line x1="73" y1="120" x2="72" y2="142" stroke={outfit.trim} strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="72" cy="143" r="1.5" fill="#E2E8F0" />
              <line x1="87" y1="120" x2="88" y2="142" stroke={outfit.trim} strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="88" cy="143" r="1.5" fill="#E2E8F0" />
            </g>
          )}

          {config.outfit === 'sweater' && (
            <g>
              <path d="M 64 110 Q 80 122 96 110" stroke={outfit.trim} strokeWidth="5" fill="none" strokeLinecap="round" />
              <path d="M 75 128 L 80 133 L 85 128 M 75 140 L 80 145 L 85 140" stroke={outfit.dark} strokeWidth="2" fill="none" opacity="0.4" />
            </g>
          )}

          {config.outfit === 'shirt' && (
            <g>
              <polygon points="63,110 80,126 75,108" fill={outfit.trim} />
              <polygon points="97,110 80,126 85,108" fill={outfit.trim} />
              <line x1="80" y1="126" x2="80" y2="170" stroke={outfit.dark} strokeWidth="3" />
              <circle cx="80" cy="135" r="1.5" fill="#FFFFFF" />
              <circle cx="80" cy="147" r="1.5" fill="#FFFFFF" />
              <circle cx="80" cy="159" r="1.5" fill="#FFFFFF" />
            </g>
          )}

          {config.outfit === 'jacket' && (
            <g>
              <polygon points="68,110 80,132 92,110" fill="#FFFFFF" />
              <path d="M 52 120 L 72 146 L 52 170 Z" fill={outfit.dark} opacity="0.5" />
              <path d="M 108 120 L 88 146 L 108 170 Z" fill={outfit.dark} opacity="0.5" />
              <line x1="72" y1="146" x2="72" y2="170" stroke={outfit.trim} strokeWidth="2" />
              <line x1="88" y1="146" x2="88" y2="170" stroke={outfit.trim} strokeWidth="2" />
            </g>
          )}

          {config.outfit === 'cardigan' && (
            <g>
              <polygon points="66,110 80,136 94,110" fill="#F8FAFC" />
              <path d="M 64 110 L 80 144 L 96 110" stroke={outfit.trim} strokeWidth="4" fill="none" />
              <circle cx="80" cy="152" r="2" fill={outfit.trim} />
              <circle cx="80" cy="162" r="2" fill={outfit.trim} />
            </g>
          )}

          {config.outfit === 'vest' && (
            <g>
              <line x1="44" y1="135" x2="116" y2="135" stroke={outfit.dark} strokeWidth="2" opacity="0.5" />
              <line x1="40" y1="150" x2="120" y2="150" stroke={outfit.dark} strokeWidth="2" opacity="0.5" />
              <line x1="38" y1="162" x2="122" y2="162" stroke={outfit.dark} strokeWidth="2" opacity="0.5" />
              <line x1="80" y1="114" x2="80" y2="170" stroke="#CBD5E1" strokeWidth="2.5" />
            </g>
          )}

          {config.outfit === 'tshirt' && (
            <path d="M 68 110 Q 80 120 92 110" stroke={outfit.dark} strokeWidth="3" fill="none" strokeLinecap="round" />
          )}

          {/* Neck */}
          <rect x="73" y="98" width="14" height="15" rx="3" fill={skin.shadow} />

          {/* Scarf */}
          {config.accessory === 'scarf' && (
            <g>
              <ellipse cx="80" cy="116" rx="26" ry="10" fill="#DC2626" />
              <ellipse cx="80" cy="116" rx="24" ry="8" fill="#B91C1C" />
              <path d="M 86 118 L 88 152 L 76 152 L 76 118 Z" fill="#991B1B" />
              <line x1="77" y1="152" x2="77" y2="156" stroke="#F87171" strokeWidth="1.5" />
              <line x1="80" y1="152" x2="80" y2="156" stroke="#F87171" strokeWidth="1.5" />
              <line x1="83" y1="152" x2="83" y2="156" stroke="#F87171" strokeWidth="1.5" />
              <line x1="86" y1="152" x2="86" y2="156" stroke="#F87171" strokeWidth="1.5" />
            </g>
          )}
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
            // Focused, looking downward at desk
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
              <ellipse cx="71" cy="73" rx="3.2" ry="4.2" fill="#1E293B" />
              <circle cx="72" cy="71.5" r="1.2" fill="#FFFFFF" />
              <ellipse cx="89" cy="73" rx="3.2" ry="4.2" fill="#1E293B" />
              <circle cx="90" cy="71.5" r="1.2" fill="#FFFFFF" />
            </g>
          )}

          {/* Eyebrows */}
          <path d="M 66 65 Q 72 63 77 65" stroke={hair.base} strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <path d="M 83 65 Q 88 63 94 65" stroke={hair.base} strokeWidth="2.2" fill="none" strokeLinecap="round" />

          {/* Nose */}
          <path d="M 79 76 Q 82 81 78 83" stroke={skin.shadow} strokeWidth="2" fill="none" strokeLinecap="round" />

          {/* Cheeks Blush */}
          <ellipse cx="64" cy="80" rx="4" ry="2.5" fill="rgba(244, 63, 94, 0.25)" />
          <ellipse cx="96" cy="80" rx="4" ry="2.5" fill="rgba(244, 63, 94, 0.25)" />

          {/* Gentle Smile */}
          <path
            d={isBreak ? "M 74 89 Q 80 96 86 89" : "M 75 89 Q 80 93 85 89"}
            stroke="#943734"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />

          {/* --- FACIAL HAIR --- */}
          {facialHair === 'stubble' && (
            <g>
              {/* Jaw 5 o'clock shadow */}
              <path
                d="M 54 84 C 54 102 65 106 80 106 C 95 106 106 102 106 84 C 105 97 95 104 80 104 C 65 104 55 97 54 84 Z"
                fill={hair.dark}
                opacity="0.32"
              />
              {/* Upper lip shadow */}
              <path
                d="M 71 86 Q 80 84 89 86 Q 80 88 71 86 Z"
                fill={hair.dark}
                opacity="0.3"
              />
            </g>
          )}

          {facialHair === 'beard' && (
            <g fill={hair.base}>
              {/* Full groomed beard hugging jaw & chin */}
              <path
                d="M 52 78 C 52 106 64 116 80 116 C 96 116 108 106 108 78 C 106 96 96 106 80 106 C 64 106 54 96 52 78 Z"
              />
              {/* Connecting moustache */}
              <path
                d="M 69 87 Q 80 83 91 87 Q 85 91 80 89 Q 75 91 69 87 Z"
              />
              {/* Soul patch */}
              <ellipse cx="80" cy="95" rx="3.5" ry="2.2" fill={hair.dark} />
            </g>
          )}

          {facialHair === 'moustache' && (
            <g fill={hair.base}>
              <path
                d="M 67 87 Q 74 83 80 86 Q 86 83 93 87 Q 87 92 80 88 Q 73 92 67 87 Z"
              />
              <path
                d="M 67 87 Q 64 89 63 87 M 93 87 Q 96 89 97 87"
                stroke={hair.base}
                strokeWidth="2"
                strokeLinecap="round"
              />
            </g>
          )}

          {facialHair === 'goatee' && (
            <g fill={hair.base}>
              {/* Neat moustache */}
              <path
                d="M 70 87 Q 80 84 90 87 Q 80 89 70 87 Z"
              />
              {/* Goatee chin patch */}
              <path
                d="M 72 94 L 88 94 C 87 109 84 113 80 113 C 76 113 73 109 72 94 Z"
              />
            </g>
          )}

          {/* --- GLASSES ACCESSORY --- */}
          {(config.accessory === 'glasses' || config.accessory === 'round_glasses') && (
            <g stroke="#334155" strokeWidth="2" fill="none">
              {config.accessory === 'glasses' ? (
                <>
                  <rect x="63" y="67" width="16" height="12" rx="3" stroke="#1E293B" strokeWidth="2.2" fill="rgba(255,255,255,0.25)" />
                  <rect x="81" y="67" width="16" height="12" rx="3" stroke="#1E293B" strokeWidth="2.2" fill="rgba(255,255,255,0.25)" />
                  <line x1="79" y1="72" x2="81" y2="72" stroke="#1E293B" strokeWidth="2.2" />
                </>
              ) : (
                <>
                  <circle cx="71" cy="73" r="8.5" stroke="#B45309" strokeWidth="2.2" fill="rgba(255,255,255,0.2)" />
                  <circle cx="89" cy="73" r="8.5" stroke="#B45309" strokeWidth="2.2" fill="rgba(255,255,255,0.2)" />
                  <line x1="79" y1="73" x2="81" y2="73" stroke="#B45309" strokeWidth="2" />
                </>
              )}
            </g>
          )}

          {/* --- FULL CRANIAL DOME HAIRSTYLES (Completely enclosing skull, no bald spots) --- */}
          {config.hairStyle === 'short' && (
            <g>
              <path
                d="M 49 72 C 47 46 53 26 80 25 C 107 26 113 46 111 72 C 105 60 95 55 80 55 C 65 55 55 60 49 72 Z"
                fill={hair.base}
              />
              <path
                d="M 52 68 C 58 58 68 54 80 54 C 92 54 102 58 108 68 C 102 61 92 57 80 57 C 68 57 58 61 52 68 Z"
                fill={hair.dark}
              />
              <path
                d="M 62 36 Q 80 30 98 36"
                stroke={hair.highlight}
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                opacity="0.6"
              />
            </g>
          )}

          {config.hairStyle === 'side_part' && (
            <g>
              <path
                d="M 49 72 C 47 44 54 26 76 24 C 106 25 113 46 111 72 C 108 58 98 52 82 52 C 68 52 58 58 49 72 Z"
                fill={hair.base}
              />
              <path
                d="M 64 52 C 70 38 88 34 106 42 C 111 50 110 62 108 68 C 102 58 92 52 80 52 C 72 52 66 56 64 52 Z"
                fill={hair.dark}
              />
              <line x1="62" y1="52" x2="60" y2="40" stroke={hair.dark} strokeWidth="1.5" opacity="0.8" />
              <path
                d="M 68 34 Q 86 36 100 42"
                stroke={hair.highlight}
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                opacity="0.65"
              />
            </g>
          )}

          {config.hairStyle === 'curly' && (
            <g fill={hair.base}>
              {/* Volumetric curly masses forming the cranial dome */}
              <circle cx="56" cy="36" r="14" />
              <circle cx="72" cy="26" r="15" />
              <circle cx="90" cy="27" r="14" />
              <circle cx="104" cy="38" r="13" />
              <circle cx="48" cy="50" r="12" />
              <circle cx="112" cy="50" r="12" />
              <circle cx="48" cy="64" r="10" />
              <circle cx="112" cy="64" r="10" />
              <circle cx="62" cy="46" r="12" />
              <circle cx="80" cy="40" r="13" />
              <circle cx="98" cy="46" r="12" />
              {/* Forehead curl tendrils */}
              <circle cx="68" cy="56" r="7" fill={hair.dark} />
              <circle cx="80" cy="54" r="7.5" fill={hair.dark} />
              <circle cx="92" cy="56" r="7" fill={hair.dark} />
              {/* Highlights */}
              <circle cx="70" cy="24" r="5" fill={hair.highlight} opacity="0.4" />
              <circle cx="88" cy="25" r="4.5" fill={hair.highlight} opacity="0.4" />
              <circle cx="56" cy="34" r="4" fill={hair.highlight} opacity="0.4" />
            </g>
          )}

          {config.hairStyle === 'wavy' && (
            <g>
              <path
                d="M 48 68 C 46 40 54 28 80 26 C 106 28 114 40 112 68 C 106 52 94 48 80 50 C 66 48 54 52 48 68 Z"
                fill={hair.base}
              />
              <path
                d="M 52 64 C 44 76 46 96 52 108 C 55 96 56 82 58 70 Z"
                fill={hair.base}
              />
              <path
                d="M 108 64 C 116 76 114 96 108 108 C 105 96 104 82 102 70 Z"
                fill={hair.base}
              />
              <path
                d="M 64 36 Q 80 32 96 36"
                stroke={hair.highlight}
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                opacity="0.6"
              />
            </g>
          )}

          {config.hairStyle === 'bob' && (
            <g>
              <path
                d="M 46 72 C 45 40 52 28 80 26 C 108 28 115 40 114 72 L 114 92 C 108 94 104 84 102 74 C 92 64 68 64 58 74 C 56 84 52 94 46 92 Z"
                fill={hair.base}
              />
              <path
                d="M 54 62 C 62 58 72 58 80 58 C 88 58 98 58 106 62 C 100 66 88 64 80 64 C 72 64 60 66 54 62 Z"
                fill={hair.dark}
              />
              <path
                d="M 60 38 Q 80 33 100 38"
                stroke={hair.highlight}
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                opacity="0.6"
              />
            </g>
          )}

          {config.hairStyle === 'bun' && (
            <g>
              <path
                d="M 49 72 C 47 44 55 32 80 30 C 105 32 113 44 111 72 C 105 60 95 54 80 54 C 65 54 55 60 49 72 Z"
                fill={hair.base}
              />
              <path d="M 58 64 Q 68 44 76 34" stroke={hair.highlight} strokeWidth="1.5" fill="none" opacity="0.45" />
              <path d="M 102 64 Q 92 44 84 34" stroke={hair.highlight} strokeWidth="1.5" fill="none" opacity="0.45" />
              <path d="M 80 54 L 80 32" stroke={hair.highlight} strokeWidth="1.5" fill="none" opacity="0.45" />
            </g>
          )}

          {config.hairStyle === 'ponytail' && (
            <g>
              <path
                d="M 49 72 C 47 44 55 32 80 30 C 105 32 113 44 111 72 C 105 60 95 54 80 54 C 65 54 55 60 49 72 Z"
                fill={hair.base}
              />
              <path d="M 64 42 Q 80 36 96 42" stroke={hair.highlight} strokeWidth="2.5" fill="none" opacity="0.55" />
            </g>
          )}

          {config.hairStyle === 'spiky' && (
            <g>
              <path
                d="M 48 70 L 44 48 L 40 38 L 50 40 L 52 24 L 64 32 L 74 18 L 84 28 L 96 18 L 98 32 L 110 26 L 108 42 L 118 42 L 112 70 C 104 60 94 56 80 56 C 66 56 56 60 48 70 Z"
                fill={hair.base}
              />
              <polygon points="52,38 64,28 68,38" fill={hair.highlight} opacity="0.35" />
              <polygon points="72,28 78,20 84,28" fill={hair.highlight} opacity="0.5" />
              <polygon points="90,30 96,22 102,32" fill={hair.highlight} opacity="0.35" />
              <path
                d="M 52 66 L 60 56 L 68 62 L 76 54 L 84 62 L 92 56 L 100 62 L 108 66 C 96 58 84 56 80 56 C 76 56 64 58 52 66 Z"
                fill={hair.dark}
              />
            </g>
          )}

          {config.hairStyle === 'braids' && (
            <g>
              <path
                d="M 48 70 C 47 44 54 28 80 26 C 106 28 113 44 112 70 C 105 60 95 56 80 56 C 65 56 55 60 48 70 Z"
                fill={hair.base}
              />
              <line x1="80" y1="26" x2="80" y2="56" stroke={hair.dark} strokeWidth="1.8" />
              <path d="M 80 26 Q 72 38 68 58" stroke={hair.dark} strokeWidth="1.8" fill="none" />
              <path d="M 80 26 Q 88 38 92 58" stroke={hair.dark} strokeWidth="1.8" fill="none" />
              <path d="M 80 26 Q 62 42 56 64" stroke={hair.dark} strokeWidth="1.8" fill="none" />
              <path d="M 80 26 Q 98 42 104 64" stroke={hair.dark} strokeWidth="1.8" fill="none" />
              {/* Gold braid cuffs */}
              <rect x="42" y="94" width="6" height="3" rx="1" fill="#F59E0B" />
              <rect x="42" y="122" width="6" height="3" rx="1" fill="#F59E0B" />
              <rect x="112" y="94" width="6" height="3" rx="1" fill="#F59E0B" />
              <rect x="112" y="122" width="6" height="3" rx="1" fill="#F59E0B" />
            </g>
          )}

          {config.hairStyle === 'hijab' && (
            <g>
              {/* Top wrap hood completely covering skull from y=24 */}
              <path
                d="M 48 76 C 46 26 114 26 112 76 C 106 50 96 52 80 52 C 64 52 54 50 48 76 Z"
                fill={hair.base}
              />
              {/* Inner underscarf cap */}
              <path
                d="M 58 54 Q 80 48 102 54 Q 80 52 58 54 Z"
                fill={skin.shadow}
                opacity="0.4"
              />
              {/* Left side drape */}
              <path
                d="M 48 72 C 46 88 48 108 60 120 C 53 102 51 86 53 72 Z"
                fill={hair.base}
              />
              {/* Right side drape */}
              <path
                d="M 112 72 C 114 88 112 108 100 120 C 107 102 109 86 107 72 Z"
                fill={hair.base}
              />
              {/* Chin wrap framing */}
              <path
                d="M 58 102 Q 80 118 102 102 Q 80 112 58 102 Z"
                fill={hair.base}
              />
              {/* Drape crease folds & highlight */}
              <path
                d="M 56 42 Q 80 34 104 42"
                stroke={hair.highlight}
                strokeWidth="2"
                fill="none"
                opacity="0.5"
              />
            </g>
          )}

          {config.hairStyle === 'bald' && (
            <g>
              {/* Polished scalp shine on bare head */}
              <ellipse
                cx="73"
                cy="52"
                rx="10"
                ry="4"
                fill="#FFFFFF"
                opacity="0.22"
                transform="rotate(-18 73 52)"
              />
            </g>
          )}

          {/* --- HEADWEAR & EAR ACCESSORIES --- */}
          {config.accessory === 'beanie' && (
            <g>
              <ellipse cx="80" cy="46" rx="31" ry="18" fill="#475569" />
              <rect x="50" y="44" width="60" height="12" rx="4" fill="#334155" />
              <circle cx="80" cy="27" r="6" fill="#64748B" />
            </g>
          )}

          {config.accessory === 'cap' && (
            <g>
              <path
                d="M 48 64 C 46 32 114 32 112 64 Z"
                fill="#1E293B"
              />
              <circle cx="80" cy="32" r="3" fill="#0EA5E9" />
              <path
                d="M 44 64 C 54 58 106 58 116 64 C 118 68 110 71 80 71 C 50 71 42 68 44 64 Z"
                fill="#0F172A"
              />
              <path
                d="M 80 34 L 80 62"
                stroke="#334155"
                strokeWidth="1.5"
              />
            </g>
          )}

          {config.accessory === 'headphones' && (
            <g>
              <path
                d="M 50 74 C 48 33 112 33 110 74"
                stroke="#0F172A"
                strokeWidth="5"
                fill="none"
                strokeLinecap="round"
              />
              <rect x="46" y="66" width="8" height="20" rx="4" fill="#38BDF8" stroke="#0F172A" strokeWidth="2" />
              <rect x="106" y="66" width="8" height="20" rx="4" fill="#38BDF8" stroke="#0F172A" strokeWidth="2" />
            </g>
          )}

          {config.accessory === 'airpods' && (
            <g>
              <circle cx="51" cy="76" r="3" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="0.8" />
              <path d="M 51 77 L 49 84" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
              <circle cx="109" cy="76" r="3" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="0.8" />
              <path d="M 109 77 L 111 84" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
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
              <rect x="10" y="0" width="44" height="26" rx="3" fill="#1E293B" stroke="#475569" strokeWidth="1.5" />
              <rect x="13" y="3" width="38" height="20" rx="1.5" fill="#0EA5E9" opacity="0.85" />
              <line x1="16" y1="8" x2="32" y2="8" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="16" y1="13" x2="44" y2="13" stroke="#FDE047" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="16" y1="18" x2="38" y2="18" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
              <polygon points="4,26 60,26 56,32 8,32" fill="#334155" stroke="#475569" strokeWidth="1" />
            </g>
          )}

          {config.deskItem === 'coffee_mug' && (
            <g transform="translate(100, 140)">
              <rect x="0" y="6" width="18" height="18" rx="3" fill="#DC2626" />
              <path d="M 18 10 Q 24 14 18 18" stroke="#DC2626" strokeWidth="3" fill="none" />
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

          {/* Authentic Turkish Tea Glass (İnce Belli Çay Bardağı) */}
          {config.deskItem === 'tea_cup' && (
            <g transform="translate(100, 138)">
              {/* Saucer */}
              <ellipse cx="12" cy="24" rx="14" ry="4" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
              <ellipse cx="12" cy="24" rx="11" ry="3" fill="none" stroke="#DC2626" strokeWidth="1" strokeDasharray="3 3" />
              
              {/* Glass Shadow */}
              <ellipse cx="12" cy="22" rx="6" ry="2" fill="rgba(0,0,0,0.15)" />

              {/* Waist-curved glass body */}
              <path
                d="M 6 4 C 6 10 9 13 8 18 C 7 21 8 22 12 22 C 16 22 17 21 16 18 C 15 13 18 10 18 4 Z"
                fill="rgba(255,255,255,0.25)"
                stroke="rgba(255,255,255,0.7)"
                strokeWidth="1"
              />
              {/* Deep amber brewed tea */}
              <path
                d="M 6.8 9 C 7 11 9 13 8.3 18 C 7.8 20.8 8.5 21.2 12 21.2 C 15.5 21.2 16.2 20.8 15.7 18 C 15 13 17 11 17.2 9 Z"
                fill="#B91C1C"
                opacity="0.88"
              />
              {/* Tea rim highlight */}
              <ellipse cx="12" cy="9" rx="4.5" ry="1.2" fill="#F59E0B" />
              {/* Lemon slice */}
              <path d="M 12 6 A 3 3 0 0 1 15 9 L 12 9 Z" fill="#FDE047" opacity="0.9" />
              {/* Steam */}
              <path
                d="M 10 2 Q 8 -2 10 -6 M 14 2 Q 16 -2 14 -6"
                stroke="rgba(255,255,255,0.6)"
                strokeWidth="1.2"
                fill="none"
                strokeLinecap="round"
                className="anim-pulse-subtle"
              />
            </g>
          )}

          {/* Adorable Curled Sleeping Desk Cat */}
          {config.deskItem === 'cat' && (
            <g transform="translate(14, 144)">
              <ellipse cx="18" cy="18" rx="16" ry="11" fill="#F59E0B" />
              <path d="M 14 9 Q 16 14 14 18 M 19 8 Q 21 13 19 18 M 24 9 Q 25 14 23 18" stroke="#D97706" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              <circle cx="9" cy="15" r="9" fill="#F59E0B" />
              <polygon points="2,11 6,5 8,10" fill="#F59E0B" stroke="#D97706" strokeWidth="0.8" />
              <polygon points="10,10 12,5 16,11" fill="#F59E0B" stroke="#D97706" strokeWidth="0.8" />
              <polygon points="4,10 6,7 7,10" fill="#FDA4AF" />
              <path d="M 5 16 Q 7 18 9 16" stroke="#78350F" strokeWidth="1.2" fill="none" strokeLinecap="round" />
              <polygon points="7,17 8,17 7.5,18" fill="#FDA4AF" />
              <path d="M 33 20 C 35 15 32 11 28 11" stroke="#F59E0B" strokeWidth="4" fill="none" strokeLinecap="round" />
              <text x="2" y="4" fill="#93C5FD" fontSize="8" fontWeight="bold" fontFamily="sans-serif" className="anim-pulse-subtle">z</text>
              <text x="7" y="-2" fill="#93C5FD" fontSize="10" fontWeight="bold" fontFamily="sans-serif" className="anim-pulse-subtle">Z</text>
            </g>
          )}

          {/* Open Notebook & Brass Fountain Pen */}
          {config.deskItem === 'notebook_pen' && (
            <g transform="translate(18, 146)">
              <rect x="0" y="4" width="36" height="22" rx="2" fill="#78350F" />
              <rect x="2" y="5" width="15" height="20" rx="1" fill="#FEF3C7" />
              <rect x="19" y="5" width="15" height="20" rx="1" fill="#FEF3C7" />
              <line x1="18" y1="4" x2="18" y2="26" stroke="#451A03" strokeWidth="1.5" />
              <line x1="4" y1="9" x2="15" y2="9" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round" />
              <line x1="4" y1="13" x2="13" y2="13" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round" />
              <line x1="4" y1="17" x2="15" y2="17" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round" />
              <line x1="21" y1="9" x2="32" y2="9" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round" />
              <line x1="21" y1="13" x2="30" y2="13" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round" />
              <line x1="21" y1="17" x2="28" y2="17" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round" />
              <path d="M 33 2 L 38 22" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" />
              <polygon points="38,22 39,26 37,24" fill="#1E293B" />
            </g>
          )}

          {config.deskItem === 'book_stack' && (
            <g transform="translate(26, 146)">
              <rect x="0" y="10" width="34" height="7" rx="2" fill="#1E3A8A" />
              <rect x="3" y="4" width="30" height="6" rx="2" fill="#B45309" />
              <path d="M 6 4 Q 17 0 17 4 Q 28 0 28 4 L 26 2 Q 17 -1 17 2 Q 17 -1 8 2 Z" fill="#F8FAFC" />
            </g>
          )}

          {config.deskItem === 'desk_lamp' && (
            <g transform="translate(24, 126)">
              <path d="M 8 36 L 8 16 Q 8 6 18 6" stroke="#475569" strokeWidth="3" fill="none" strokeLinecap="round" />
              <path d="M 16 2 L 28 10 L 16 14 Z" fill="#F59E0B" />
              <polygon points="26,8 52,38 32,38" fill="rgba(251, 191, 36, 0.2)" />
              <rect x="2" y="34" width="12" height="4" rx="2" fill="#334155" />
            </g>
          )}

          {config.deskItem === 'succulent' && (
            <g transform="translate(102, 142)">
              <polygon points="2,14 16,14 14,24 4,24" fill="#EA580C" />
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
