import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { SessionType, HistoryRecord } from '../types/pomodoro';
import { storageService } from '../services/storageService';
import { soundManager } from '../utils/audioSynth';
import { formatDateDDMMYYYY, formatTimeHHMMSS, getWeekdayName } from '../utils/timeFormatter';
import confetti from 'canvas-confetti';

interface PomodoroContextType {
  workMinutes: number;
  breakMinutes: number;
  setWorkMinutes: (m: number) => void;
  setBreakMinutes: (m: number) => void;
  currentTask: string;
  setCurrentTask: (task: string) => void;
  isWorkTime: boolean;
  isRunning: boolean;
  remainingSeconds: number;
  totalSeconds: number;
  statusText: string;
  selectedSound: string;
  setSelectedSound: (s: string) => void;
  startTimer: () => boolean;
  pauseTimer: () => void;
  resetTimer: () => void;
  onSeatConnectedStart: (task: string, workMins: number, breakMins: number) => void;
}

const PomodoroContext = createContext<PomodoroContextType | undefined>(undefined);

export const PomodoroProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [workMinutes, setWorkMinutesState] = useState<number>(25);
  const [breakMinutes, setBreakMinutesState] = useState<number>(5);
  const [currentTask, setCurrentTask] = useState<string>('');
  const [isWorkTime, setIsWorkTime] = useState<boolean>(true);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(25 * 60);
  const [totalSeconds, setTotalSeconds] = useState<number>(25 * 60);
  const [selectedSound, setSelectedSoundState] = useState<string>(() => {
    return storageService.loadSettings().sound || 'warning.mp3';
  });

  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<Date | null>(null);

  // Synchronize initial seconds when not running
  const setWorkMinutes = (m: number) => {
    const val = Math.max(1, Math.min(180, m));
    setWorkMinutesState(val);
    if (!isRunning && isWorkTime) {
      setRemainingSeconds(val * 60);
      setTotalSeconds(val * 60);
    }
  };

  const setBreakMinutes = (m: number) => {
    const val = Math.max(1, Math.min(60, m));
    setBreakMinutesState(val);
    if (!isRunning && !isWorkTime) {
      setRemainingSeconds(val * 60);
      setTotalSeconds(val * 60);
    }
  };

  const setSelectedSound = (snd: string) => {
    setSelectedSoundState(snd);
    const settings = storageService.loadSettings();
    storageService.saveSettings({ ...settings, sound: snd });
    soundManager.play(snd);
  };

  const startTimer = (): boolean => {
    if (isRunning) return true;

    if (!currentTask.trim()) {
      return false; // Task is required
    }

    if (!startTimeRef.current) {
      startTimeRef.current = new Date();
    }

    setIsRunning(true);
    return true;
  };

  const pauseTimer = () => {
    setIsRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const resetTimer = () => {
    pauseTimer();
    setIsWorkTime(true);
    startTimeRef.current = null;
    const initialSecs = workMinutes * 60;
    setRemainingSeconds(initialSecs);
    setTotalSeconds(initialSecs);
  };

  const onSeatConnectedStart = (task: string, workMins: number, breakMins: number) => {
    setCurrentTask(task);
    setWorkMinutes(workMins);
    setBreakMinutes(breakMins);
    setIsWorkTime(true);
    setRemainingSeconds(workMins * 60);
    setTotalSeconds(workMins * 60);
    startTimeRef.current = new Date();
    setIsRunning(true);
  };

  // Main countdown loop
  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            // Session complete!
            handleSessionDone();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, isWorkTime, workMinutes, breakMinutes, currentTask]);

  const handleSessionDone = () => {
    pauseTimer();
    const endTime = new Date();
    const start = startTimeRef.current || new Date();

    // Play chime / alarm
    soundManager.play(selectedSound);

    if (isWorkTime) {
      // Work finished!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Log to history
      const record: HistoryRecord = {
        id: `rec_${Date.now()}`,
        taskDescription: currentTask || 'Çalışma Görevi',
        sessionType: 'Çalışma',
        date: formatDateDDMMYYYY(start),
        startTime: formatTimeHHMMSS(start),
        endTime: formatTimeHHMMSS(endTime),
        durationMinutes: workMinutes,
        weekday: getWeekdayName(start),
        timestamp: Date.now()
      };
      storageService.appendHistory(record);

      // Switch to break
      setIsWorkTime(false);
      const nextSecs = breakMinutes * 60;
      setRemainingSeconds(nextSecs);
      setTotalSeconds(nextSecs);
      startTimeRef.current = new Date();
      setIsRunning(true); // Auto-start break matching desktop app
    } else {
      // Break finished!
      const record: HistoryRecord = {
        id: `rec_${Date.now()}`,
        taskDescription: currentTask || 'Mola',
        sessionType: 'Mola',
        date: formatDateDDMMYYYY(start),
        startTime: formatTimeHHMMSS(start),
        endTime: formatTimeHHMMSS(endTime),
        durationMinutes: breakMinutes,
        weekday: getWeekdayName(start),
        timestamp: Date.now()
      };
      storageService.appendHistory(record);

      // Switch to work
      setIsWorkTime(true);
      const nextSecs = workMinutes * 60;
      setRemainingSeconds(nextSecs);
      setTotalSeconds(nextSecs);
      startTimeRef.current = new Date();
      setIsRunning(true); // Auto-start next work session
    }
  };

  const statusText = !isRunning
    ? (remainingSeconds === totalSeconds ? 'Başlamaya Hazır' : 'Duraklatıldı')
    : (isWorkTime ? 'Çalışma Zamanı!' : 'Mola Zamanı!');

  return (
    <PomodoroContext.Provider
      value={{
        workMinutes,
        breakMinutes,
        setWorkMinutes,
        setBreakMinutes,
        currentTask,
        setCurrentTask,
        isWorkTime,
        isRunning,
        remainingSeconds,
        totalSeconds,
        statusText,
        selectedSound,
        setSelectedSound,
        startTimer,
        pauseTimer,
        resetTimer,
        onSeatConnectedStart,
      }}
    >
      {children}
    </PomodoroContext.Provider>
  );
};

export const usePomodoro = () => {
  const context = useContext(PomodoroContext);
  if (!context) throw new Error('usePomodoro must be used within PomodoroProvider');
  return context;
};
