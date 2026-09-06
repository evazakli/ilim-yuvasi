export type SkinTone = 'fair' | 'peach' | 'olive' | 'tan' | 'deep';
export type HairStyle = 'short' | 'curly' | 'wavy' | 'bob' | 'bun' | 'ponytail' | 'spiky' | 'bald';
export type HairColor = 'black' | 'dark_brown' | 'chestnut' | 'blonde' | 'auburn' | 'gray' | 'pink' | 'teal';
export type OutfitType = 'hoodie' | 'sweater' | 'shirt' | 'jacket' | 'tshirt' | 'cardigan';
export type OutfitColor = 'navy' | 'emerald' | 'crimson' | 'charcoal' | 'mustard' | 'lavender' | 'cream' | 'mocha';
export type Accessory = 'none' | 'glasses' | 'headphones' | 'beanie' | 'scarf' | 'round_glasses';
export type DeskItem = 'coffee_mug' | 'tea_cup' | 'laptop' | 'book_stack' | 'desk_lamp' | 'succulent';
export type CharacterState = 'idle' | 'working' | 'break';

export interface AvatarConfig {
  skin: SkinTone;
  hairStyle: HairStyle;
  hairColor: HairColor;
  outfit: OutfitType;
  outfitColor: OutfitColor;
  accessory: Accessory;
  deskItem: DeskItem;
}

export const DEFAULT_AVATAR: AvatarConfig = {
  skin: 'peach',
  hairStyle: 'short',
  hairColor: 'dark_brown',
  outfit: 'hoodie',
  outfitColor: 'emerald',
  accessory: 'headphones',
  deskItem: 'coffee_mug'
};
