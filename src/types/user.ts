import { AvatarConfig } from './avatar';

export interface UserProfile {
  uid: string;
  email?: string | null;
  displayName: string;
  isGuest: boolean;
  avatar: AvatarConfig;
  selectedTheme: string;
  selectedSound: string;
  createdAt: number;
}

export interface UserStats {
  totalWorkMinutes: number;
  totalBreakMinutes: number;
  completedSessions: number;
  currentStreakDays: number;
}
