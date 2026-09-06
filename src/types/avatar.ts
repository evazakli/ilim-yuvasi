export type SkinTone = 'fair' | 'peach' | 'warm' | 'olive' | 'tan' | 'bronze' | 'deep' | 'espresso';
export type HairStyle = 'short' | 'side_part' | 'curly' | 'wavy' | 'bob' | 'bun' | 'ponytail' | 'spiky' | 'braids' | 'hijab' | 'bald';
export type FacialHair = 'none' | 'stubble' | 'beard' | 'moustache' | 'goatee';
export type HairColor = 'black' | 'dark_brown' | 'chestnut' | 'caramel' | 'blonde' | 'platinum' | 'auburn' | 'burgundy' | 'gray' | 'silver' | 'pink' | 'teal';
export type OutfitType = 'hoodie' | 'sweater' | 'shirt' | 'jacket' | 'tshirt' | 'cardigan' | 'vest';
export type OutfitColor = 'navy' | 'emerald' | 'crimson' | 'charcoal' | 'mustard' | 'lavender' | 'cream' | 'mocha' | 'sage' | 'terracotta' | 'royal_blue' | 'pure_black';
export type Accessory = 'none' | 'glasses' | 'round_glasses' | 'headphones' | 'airpods' | 'beanie' | 'scarf' | 'cap';
export type DeskItem = 'coffee_mug' | 'tea_cup' | 'laptop' | 'book_stack' | 'desk_lamp' | 'succulent' | 'cat' | 'notebook_pen';
export type CharacterState = 'idle' | 'working' | 'break';

export interface AvatarConfig {
  skin: SkinTone;
  hairStyle: HairStyle;
  hairColor: HairColor;
  facialHair?: FacialHair;
  outfit: OutfitType;
  outfitColor: OutfitColor;
  accessory: Accessory;
  deskItem: DeskItem;
}

export const DEFAULT_AVATAR: AvatarConfig = {
  skin: 'peach',
  hairStyle: 'short',
  hairColor: 'dark_brown',
  facialHair: 'none',
  outfit: 'hoodie',
  outfitColor: 'emerald',
  accessory: 'headphones',
  deskItem: 'coffee_mug'
};
