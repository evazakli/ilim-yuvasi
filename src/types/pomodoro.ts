export type SessionType = 'Çalışma' | 'Mola';

export interface HistoryRecord {
  id: string;
  taskDescription: string;
  sessionType: SessionType;
  date: string;          // DD-MM-YYYY
  startTime: string;     // HH:mm:ss
  endTime: string;       // HH:mm:ss
  durationMinutes: number;
  weekday: string;       // Pzt, Sal, ...
  timestamp: number;     // epoch ms for accurate sorting
}

export interface CalendarEvent {
  id: string;
  name: string;
  date: string;          // DD/MM/YYYY
  time: string;          // HH:mm (optional/default 00:00)
}

export interface GoalTask {
  id: string;
  description: string;
  completed: boolean;
}

export interface DailyGoal {
  date: string;          // YYYY-MM-DD
  tasks: GoalTask[];
  targetTime: number;    // Target in minutes
}

export type StatsPeriod = 'Günlük' | 'Haftalık' | 'Aylık' | 'Yıllık';

export interface StatsData {
  period: StatsPeriod;
  chartData: { label: string; value: number; subLabel?: string }[];
  totalMinutes: number;
  avgMinutes: number;
  bestLabel: string;
  bestMinutes: number;
  activeCount: number;
  totalCount: number;
}
