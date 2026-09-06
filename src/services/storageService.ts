import { HistoryRecord, CalendarEvent, DailyGoal, StatsPeriod, StatsData } from '../types/pomodoro';
import { TURKISH_MONTHS, formatDateDDMMYYYY } from '../utils/timeFormatter';
import { firestore, isFirebaseConfigured } from './firebase';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';

const KEYS = {
  HISTORY: 'pomodoro_history',
  EVENTS: 'pomodoro_events',
  GOALS: 'pomodoro_goals',
  SETTINGS: 'pomodoro_settings',
  PROFILE: 'pomodoro_profile',
};

class StorageService {
  private historyCache: HistoryRecord[] | null = null;
  private eventsCache: CalendarEvent[] | null = null;
  private goalsCache: Record<string, DailyGoal> | null = null;

  // --- Helpers ---
  private readJSON<T>(key: string, fallback: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  }

  private writeJSON<T>(key: string, data: T) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn(`[StorageService] Failed to save key: ${key}`, e);
    }
  }

  // --- Sync From Cloud Firestore on Login ---
  public async syncFromFirestore(userUid: string) {
    if (!isFirebaseConfigured || !firestore) return;
    try {
      // 1. History
      const historyCol = collection(firestore, 'users', userUid, 'history');
      const historySnap = await getDocs(historyCol);
      if (!historySnap.empty) {
        const remoteHistory: HistoryRecord[] = [];
        historySnap.forEach(d => remoteHistory.push(d.data() as HistoryRecord));
        const current = this.loadHistory();
        const map = new Map<string, HistoryRecord>();
        remoteHistory.forEach(r => map.set(r.id, r));
        current.forEach(r => map.set(r.id, r));
        const merged = Array.from(map.values()).sort((a, b) => b.timestamp - a.timestamp);
        this.historyCache = merged;
        this.writeJSON(KEYS.HISTORY, merged);
      }

      // 2. Events
      const eventsDocRef = doc(firestore, 'users', userUid, 'settings', 'events');
      const eventsSnap = await getDoc(eventsDocRef);
      if (eventsSnap.exists()) {
        const data = eventsSnap.data();
        if (data && Array.isArray(data.events)) {
          this.eventsCache = data.events;
          this.writeJSON(KEYS.EVENTS, data.events);
        }
      }
    } catch (err) {
      console.warn('[StorageService] Firestore sync error:', err);
    }
  }

  // --- History ---
  public loadHistory(): HistoryRecord[] {
    if (!this.historyCache) {
      this.historyCache = this.readJSON<HistoryRecord[]>(KEYS.HISTORY, []);
    }
    return this.historyCache;
  }

  public appendHistory(record: HistoryRecord, userUid?: string) {
    const list = this.loadHistory();
    list.unshift(record); // newest first
    this.historyCache = list;
    this.writeJSON(KEYS.HISTORY, list);

    if (isFirebaseConfigured && firestore && userUid) {
      try {
        const userDocRef = doc(firestore, 'users', userUid, 'history', record.id);
        setDoc(userDocRef, record).catch(e => console.warn('Firestore history save failed:', e));
      } catch (err) {
        console.warn('Firestore sync error:', err);
      }
    }
  }

  public getWorkMinutesForDate(targetDateStr: string): number {
    return this.loadHistory()
      .filter(r => r.date === targetDateStr && r.sessionType === 'Çalışma')
      .reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);
  }

  // --- Statistics calculation (Exact port of Python DataManager.get_stats) ---
  public getStats(period: StatsPeriod): StatsData {
    const history = this.loadHistory();
    const today = new Date();
    const chartData: { label: string; value: number; subLabel?: string }[] = [];

    const getMinsForDate = (d: Date): number => {
      const dStr = formatDateDDMMYYYY(d);
      return history
        .filter(r => r.date === dStr && r.sessionType === 'Çalışma')
        .reduce((sum, r) => sum + (r.durationMinutes || 0), 0);
    };

    if (period === 'Günlük') {
      const todayStr = formatDateDDMMYYYY(today);
      const blocks: Record<string, number> = {};
      for (let i = 0; i < 24; i += 4) {
        const key = `${String(i).padStart(2, '0')}:00\n${String(i + 4).padStart(2, '0')}:00`;
        blocks[key] = 0;
      }

      history.forEach(r => {
        if (r.date === todayStr && r.sessionType === 'Çalışma') {
          const hour = parseInt(r.startTime.split(':')[0], 10) || 0;
          const blockStart = Math.floor(hour / 4) * 4;
          const key = `${String(blockStart).padStart(2, '0')}:00\n${String(blockStart + 4).padStart(2, '0')}:00`;
          if (blocks[key] !== undefined) {
            blocks[key] += r.durationMinutes;
          }
        }
      });

      for (const [lbl, val] of Object.entries(blocks)) {
        const parts = lbl.split('\n');
        chartData.push({ label: parts[0], subLabel: parts[1], value: val });
      }

    } else if (period === 'Haftalık') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dayStr = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
        chartData.push({
          label: dayStr,
          value: getMinsForDate(d)
        });
      }

    } else if (period === 'Aylık') {
      for (let i = 3; i >= 0; i--) {
        const startD = new Date(today);
        startD.setDate(today.getDate() - (i * 7 + 6));
        const endD = new Date(today);
        endD.setDate(today.getDate() - (i * 7));

        let total = 0;
        for (let j = i * 7; j < i * 7 + 7; j++) {
          const cur = new Date(today);
          cur.setDate(today.getDate() - j);
          total += getMinsForDate(cur);
        }

        const startStr = `${String(startD.getDate()).padStart(2, '0')}/${String(startD.getMonth() + 1).padStart(2, '0')}`;
        const endStr = `${String(endD.getDate()).padStart(2, '0')}/${String(endD.getMonth() + 1).padStart(2, '0')}`;

        chartData.push({
          label: startStr,
          subLabel: endStr,
          value: total
        });
      }

    } else if (period === 'Yıllık') {
      const monthShorts = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
      for (let i = 11; i >= 0; i--) {
        let targetMonth = today.getMonth() - i;
        let targetYear = today.getFullYear();
        if (targetMonth < 0) {
          targetMonth += 12;
          targetYear -= 1;
        }

        let total = 0;
        history.forEach(r => {
          if (r.sessionType === 'Çalışma') {
            const parts = r.date.split('-');
            if (parts.length === 3) {
              const m = parseInt(parts[1], 10) - 1;
              const y = parseInt(parts[2], 10);
              if (m === targetMonth && y === targetYear) {
                total += r.durationMinutes;
              }
            }
          }
        });

        chartData.push({
          label: monthShorts[targetMonth],
          subLabel: `'${String(targetYear).slice(2)}`,
          value: total
        });
      }
    }

    const values = chartData.map(c => c.value);
    const totalMinutes = values.reduce((a, b) => a + b, 0);
    const avgMinutes = values.length > 0 ? totalMinutes / values.length : 0;
    const activeCount = values.filter(v => v > 0).length;

    let bestItem = chartData[0] || { label: '-', value: 0 };
    for (const item of chartData) {
      if (item.value > bestItem.value) {
        bestItem = item;
      }
    }

    return {
      period,
      chartData,
      totalMinutes,
      avgMinutes,
      bestLabel: bestItem.subLabel ? `${bestItem.label} - ${bestItem.subLabel}` : bestItem.label,
      bestMinutes: bestItem.value,
      activeCount,
      totalCount: chartData.length
    };
  }

  // --- Events ---
  public loadEvents(): CalendarEvent[] {
    if (!this.eventsCache) {
      this.eventsCache = this.readJSON<CalendarEvent[]>(KEYS.EVENTS, []);
    }
    return this.eventsCache;
  }

  public saveEvents(events: CalendarEvent[], userUid?: string) {
    this.eventsCache = events;
    this.writeJSON(KEYS.EVENTS, events);

    if (isFirebaseConfigured && firestore && userUid) {
      try {
        const userDocRef = doc(firestore, 'users', userUid, 'settings', 'events');
        setDoc(userDocRef, { events }).catch(e => console.warn('Firestore events save failed:', e));
      } catch (err) {
        console.warn('Firestore events sync error:', err);
      }
    }
  }

  // --- Goals ---
  public loadGoalForDate(dateStr: string): DailyGoal {
    if (!this.goalsCache) {
      this.goalsCache = this.readJSON<Record<string, DailyGoal>>(KEYS.GOALS, {});
    }
    return this.goalsCache[dateStr] || { date: dateStr, tasks: [], targetTime: 0 };
  }

  public saveGoalForDate(dateStr: string, goal: DailyGoal, userUid?: string) {
    if (!this.goalsCache) {
      this.goalsCache = this.readJSON<Record<string, DailyGoal>>(KEYS.GOALS, {});
    }
    this.goalsCache[dateStr] = goal;
    this.writeJSON(KEYS.GOALS, this.goalsCache);

    if (isFirebaseConfigured && firestore && userUid) {
      try {
        const goalDocRef = doc(firestore, 'users', userUid, 'goals', dateStr);
        setDoc(goalDocRef, goal).catch(e => console.warn('Firestore goal save failed:', e));
      } catch (err) {
        console.warn('Firestore goal save failed:', err);
      }
    }
  }

  // --- Settings ---
  public loadSettings(): { theme: string; sound: string } {
    return this.readJSON(KEYS.SETTINGS, {
      theme: 'Varsayılan',
      sound: 'warning.mp3'
    });
  }

  public saveSettings(settings: { theme: string; sound: string }) {
    this.writeJSON(KEYS.SETTINGS, settings);
  }
}

export const storageService = new StorageService();
