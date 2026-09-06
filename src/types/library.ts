import { AvatarConfig, CharacterState } from './avatar';

export type SeatIndex = 0 | 1 | 2 | 3;

export interface TableReaction {
  id: string;
  senderUid: string;
  senderName: string;
  emoji: string;
  timestamp: number;
}

export interface SeatOccupant {
  uid: string;
  displayName: string;
  avatar: AvatarConfig;
  characterState: CharacterState;
  currentTask: string;
  startedAt: number;        // epoch ms
  durationSeconds: number;  // total duration
  remainingSeconds: number;
  sessionType: 'Çalışma' | 'Mola';
  activeReaction?: TableReaction;
}

export interface LibraryTable {
  id: number;
  number: number;
  name: string;
  seats: (SeatOccupant | null)[];
}

export type HallTheme = 'classic_wood' | 'winter_garden' | 'night_study';

export interface LibraryHall {
  id: string;
  name: string;
  theme: HallTheme;
  tables: LibraryTable[];
}
