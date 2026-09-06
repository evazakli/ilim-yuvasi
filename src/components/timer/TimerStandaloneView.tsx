import React, { useState, useEffect } from 'react';
import { usePomodoro } from '../../context/PomodoroContext';
import { useTheme } from '../../context/ThemeContext';
import { AnalogClock } from './AnalogClock';
import { storageService } from '../../services/storageService';
import { formatRemainingSeconds, calculateEventCountdown, formatDateDDMMYYYY } from '../../utils/timeFormatter';
import { Play, Pause, RotateCcw, Clock, Target, Calendar } from 'lucide-react';

interface TimerStandaloneViewProps {
  onNavigate: (view: 'history' | 'calendar' | 'goals' | 'stats' | 'settings') => void;
}

export const TimerStandaloneView: React.FC<TimerStandaloneViewProps> = ({ onNavigate }) => {
  const {
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
    startTimer,
    pauseTimer,
    resetTimer,
  } = usePomodoro();

  const { theme } = useTheme();

  const [inputWork, setInputWork] = useState<string>(String(workMinutes));
  const [inputBreak, setInputBreak] = useState<string>(String(breakMinutes));
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Daily goal progress
  const [goalProgress, setGoalProgress] = useState<{
    taskStr: string;
    taskPct: number;
    timeStr: string;
    timePct: number;
  }>({
    taskStr: 'Günlük Görevler: Belirlenmedi',
    taskPct: 0,
    timeStr: 'Günlük Çalışma: Belirlenmedi',
    timePct: 0,
  });

  const [eventCountdownStr, setEventCountdownStr] = useState<string>('');

  useEffect(() => {
    const today = new Date();
    const todayIso = today.toISOString().split('T')[0];
    const todayDdMmYyyy = formatDateDDMMYYYY(today);

    // Goal
    const goal = storageService.loadGoalForDate(todayIso);
    let tStr = 'Günlük Görevler: Belirlenmedi';
    let tPct = 0;
    if (goal.tasks && goal.tasks.length > 0) {
      const completed = goal.tasks.filter(t => t.completed).length;
      tPct = Math.min(100, Math.round((completed / goal.tasks.length) * 100));
      tStr = `Günlük Görevler: ${completed}/${goal.tasks.length} (%${tPct})`;
    }

    let timeStr = 'Günlük Çalışma: Belirlenmedi';
    let timePct = 0;
    if (goal.targetTime && goal.targetTime > 0) {
      const currentWorkMins = storageService.getWorkMinutesForDate(todayDdMmYyyy);
      timePct = Math.min(100, Math.round((currentWorkMins / goal.targetTime) * 100));
      timeStr = `Günlük Çalışma: ${currentWorkMins}/${goal.targetTime} dk (%${timePct})`;
    }

    setGoalProgress({ taskStr: tStr, taskPct: tPct, timeStr, timePct });

    // Events
    const events = storageService.loadEvents();
    if (events.length > 0) {
      for (const ev of events) {
        const { countdown, isPast } = calculateEventCountdown(ev.date, ev.time);
        if (!isPast) {
          setEventCountdownStr(`'${ev.name}': ${countdown}`);
          break;
        }
      }
    }
  }, [isRunning]);

  const handleStart = () => {
    if (!currentTask.trim()) {
      setErrorMsg('Lütfen bir görev girin.');
      return;
    }
    const w = parseInt(inputWork, 10) || 25;
    const b = parseInt(inputBreak, 10) || 5;
    if (w <= 0 || b <= 0) {
      setErrorMsg('Süreler sıfırdan büyük olmalıdır.');
      return;
    }

    setErrorMsg('');
    setWorkMinutes(w);
    setBreakMinutes(b);
    startTimer();
  };

  return (
    <div className="max-w-md mx-auto p-4 md:p-6 animate-fade-in flex flex-col items-center">
      {/* Main Content Card with rounded corners matching Python CustomTkinter (corner_radius=20) */}
      <div
        className="w-full p-6 md:p-8 rounded-[24px] shadow-2xl border border-white/10 flex flex-col items-center select-none"
        style={{ backgroundColor: theme.primary }}
      >
        {/* Analog Clock */}
        <div className="my-1">
          <AnalogClock
            remainingSeconds={remainingSeconds}
            totalSeconds={totalSeconds}
            size={240}
            bgColor={theme.primary}
          />
        </div>

        {/* Digital Timer Display */}
        <div className="mt-3 text-6xl font-extrabold tracking-tight font-mono text-white">
          {formatRemainingSeconds(remainingSeconds)}
        </div>

        {/* Status Label */}
        <div
          className={`mt-1 text-base font-semibold ${
            isWorkTime ? 'text-[#6CCF59]' : 'text-[#59A5CF]'
          }`}
        >
          {statusText}
        </div>

        {/* Event Countdown Label */}
        <div
          className="mt-2 text-xs font-bold text-center"
          style={{ color: theme.textAccent }}
        >
          {eventCountdownStr || 'Yaklaşan etkinlik yok'}
        </div>

        {/* Goal Progress Bars */}
        <div className="w-full mt-4 space-y-2.5">
          {/* Task Goal */}
          <div>
            <div className="text-xs text-slate-300 font-medium mb-1">
              {goalProgress.taskStr}
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${goalProgress.taskPct}%` }}
              />
            </div>
          </div>

          {/* Time Goal */}
          <div>
            <div className="text-xs text-slate-300 font-medium mb-1">
              {goalProgress.timeStr}
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${goalProgress.timePct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Task Entry Input */}
        <div className="w-full mt-5">
          <input
            type="text"
            placeholder="Şu anki göreviniz nedir?"
            disabled={isRunning}
            value={currentTask}
            onChange={(e) => {
              setCurrentTask(e.target.value);
              setErrorMsg('');
            }}
            className="w-full px-4 py-2.5 rounded-xl bg-black/30 border border-white/15 focus:border-blue-500 text-sm text-white placeholder-slate-400 outline-none transition disabled:opacity-60"
          />
        </div>

        {errorMsg && (
          <p className="text-xs text-rose-400 mt-2 font-medium">{errorMsg}</p>
        )}

        {/* Time Inputs (Çalışma dk, Mola dk) */}
        <div className="flex items-center gap-6 mt-4 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <span>Çalışma (dk):</span>
            <input
              type="number"
              min="1"
              max="180"
              disabled={isRunning}
              value={inputWork}
              onChange={(e) => setInputWork(e.target.value)}
              className="w-14 px-2 py-1 rounded-lg bg-black/30 border border-white/15 text-center font-bold text-white outline-none disabled:opacity-50"
            />
          </div>

          <div className="flex items-center gap-2">
            <span>Mola (dk):</span>
            <input
              type="number"
              min="1"
              max="60"
              disabled={isRunning}
              value={inputBreak}
              onChange={(e) => setInputBreak(e.target.value)}
              className="w-14 px-2 py-1 rounded-lg bg-black/30 border border-white/15 text-center font-bold text-white outline-none disabled:opacity-50"
            />
          </div>
        </div>

        {/* Main Buttons (Başlat & Sıfırla) */}
        <div className="flex items-center gap-4 mt-6">
          {!isRunning ? (
            <button
              onClick={handleStart}
              className="px-8 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg transition flex items-center gap-2"
              style={{ backgroundColor: theme.button }}
            >
              <Play className="w-4 h-4 fill-white" />
              Başlat
            </button>
          ) : (
            <button
              onClick={pauseTimer}
              className="px-8 py-2.5 rounded-xl text-sm font-bold text-white bg-amber-600 hover:bg-amber-500 shadow-lg transition flex items-center gap-2"
            >
              <Pause className="w-4 h-4 fill-white" />
              Duraklat
            </button>
          )}

          <button
            onClick={resetTimer}
            className="px-8 py-2.5 rounded-xl text-sm font-bold text-white shadow transition flex items-center gap-2"
            style={{ backgroundColor: theme.resetButton }}
          >
            <RotateCcw className="w-4 h-4" />
            Sıfırla
          </button>
        </div>

        {/* Desktop Utility Buttons row (Geçmiş, Takvim, Hedefler, İstatistik, Ayarlar) */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-8 pt-5 border-t border-white/10 w-full">
          {[
            { id: 'history', label: 'Geçmiş' },
            { id: 'calendar', label: 'Takvim' },
            { id: 'goals', label: 'Hedefler' },
            { id: 'stats', label: 'İstatistik' },
            { id: 'settings', label: 'Ayarlar' },
          ].map(btn => (
            <button
              key={btn.id}
              onClick={() => onNavigate(btn.id as any)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white shadow-sm transition hover:opacity-90"
              style={{ backgroundColor: theme.secondaryButton }}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
