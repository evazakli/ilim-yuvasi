import React, { useState, useEffect } from 'react';
import { usePomodoro } from '../../context/PomodoroContext';
import { useLibrary } from '../../context/LibraryContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { AnalogClock } from './AnalogClock';
import { SeatIndex } from '../../types/library';
import { storageService } from '../../services/storageService';
import { formatRemainingSeconds, calculateEventCountdown, formatDateDDMMYYYY } from '../../utils/timeFormatter';
import { X, Play, Pause, RotateCcw, LogOut, CheckCircle2, Calendar, Target, Clock } from 'lucide-react';

interface PomodoroModalProps {
  tableId: number;
  seatIndex: SeatIndex;
  isOpen: boolean;
  onClose: () => void;
}

export const PomodoroModal: React.FC<PomodoroModalProps> = ({
  tableId,
  seatIndex,
  isOpen,
  onClose,
}) => {
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
    onSeatConnectedStart,
  } = usePomodoro();

  const { tables, mySeat, sitAtSeat, leaveSeat } = useLibrary();
  const { theme } = useTheme();
  const { user } = useAuth();

  const isMyCurrentSeat = mySeat?.tableId === tableId && mySeat?.seatIndex === seatIndex;
  const currentTable = tables.find(t => t.id === tableId);
  const currentOccupant = currentTable?.seats[seatIndex];

  // Local inputs for custom minutes
  const [inputWork, setInputWork] = useState<string>(String(workMinutes));
  const [inputBreak, setInputBreak] = useState<string>(String(breakMinutes));
  const [inputTask, setInputTask] = useState<string>(currentTask);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Daily goal progress
  const [todayGoalProgress, setTodayGoalProgress] = useState<{
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

  // Upcoming event
  const [upcomingEventStr, setUpcomingEventStr] = useState<string>('');

  // Refresh goal and event countdown
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

    setTodayGoalProgress({ taskStr: tStr, taskPct: tPct, timeStr, timePct });

    // Events
    const events = storageService.loadEvents();
    if (events.length > 0) {
      // Find nearest non-past event
      for (const ev of events) {
        const { countdown, isPast } = calculateEventCountdown(ev.date, ev.time);
        if (!isPast) {
          setUpcomingEventStr(`'${ev.name}': ${countdown}`);
          break;
        }
      }
    }
  }, [isOpen, isRunning]);

  if (!isOpen) return null;

  const handlePreset = (w: number, b: number) => {
    if (isRunning) return;
    setInputWork(String(w));
    setInputBreak(String(b));
    setWorkMinutes(w);
    setBreakMinutes(b);
  };

  const handleStart = () => {
    const taskName = inputTask.trim();
    if (!taskName) {
      setErrorMessage('Lütfen bir görev adı girin.');
      return;
    }

    const wM = parseInt(inputWork, 10) || 25;
    const bM = parseInt(inputBreak, 10) || 5;

    if (wM <= 0 || bM <= 0) {
      setErrorMessage('Süreler sıfırdan büyük olmalıdır.');
      return;
    }

    setErrorMessage('');
    setCurrentTask(taskName);
    setWorkMinutes(wM);
    setBreakMinutes(bM);

    // Sit at this seat if not already seated here
    if (!isMyCurrentSeat) {
      const seated = sitAtSeat(tableId, seatIndex, taskName, wM);
      if (!seated) {
        setErrorMessage('Bu koltuk dolu veya oturulamadı.');
        return;
      }
    }

    onSeatConnectedStart(taskName, wM, bM);
  };

  const handleLeaveAndClose = () => {
    if (isMyCurrentSeat) {
      leaveSeat();
      resetTimer();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-lg rounded-3xl border border-slate-700/60 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        style={{ backgroundColor: theme.primary }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/20">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-sky-400" />
            <div>
              <h3 className="text-sm font-bold text-white">
                Masa {tableId} — Koltuk {seatIndex + 1}
              </h3>
              <p className="text-[11px] text-slate-300">
                {currentOccupant && !isMyCurrentSeat
                  ? `${currentOccupant.displayName} şu an bu masada çalışıyor`
                  : 'İlim yuvasında masaya otur ve odaklan'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
          {/* Analog Clock Canvas */}
          <div className="my-1">
            <AnalogClock
              remainingSeconds={remainingSeconds}
              totalSeconds={totalSeconds}
              size={210}
              bgColor={theme.primary}
            />
          </div>

          {/* Large Digital Timer */}
          <div className="mt-2 text-5xl font-extrabold tracking-tight font-mono text-white select-none">
            {formatRemainingSeconds(remainingSeconds)}
          </div>

          {/* Status Label */}
          <div
            className={`mt-1 text-sm font-semibold tracking-wide ${
              isWorkTime ? 'text-emerald-400' : 'text-sky-400'
            }`}
          >
            {statusText}
          </div>

          {/* Upcoming Event Ticker */}
          {upcomingEventStr && (
            <div
              className="mt-2 text-xs font-bold px-3 py-1 rounded-full bg-white/5 border border-white/10"
              style={{ color: theme.textAccent }}
            >
              📅 {upcomingEventStr}
            </div>
          )}

          {/* Goal Progress Bars */}
          <div className="w-full mt-4 space-y-2.5 px-2">
            {/* Task Goal Progress */}
            <div>
              <div className="flex justify-between text-[11px] text-slate-300 font-medium mb-1">
                <span>{todayGoalProgress.taskStr}</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-300"
                  style={{ width: `${todayGoalProgress.taskPct}%` }}
                />
              </div>
            </div>

            {/* Time Goal Progress */}
            <div>
              <div className="flex justify-between text-[11px] text-slate-300 font-medium mb-1">
                <span>{todayGoalProgress.timeStr}</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${todayGoalProgress.timePct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Task Input */}
          <div className="w-full mt-5">
            <input
              type="text"
              placeholder="Şu anki göreviniz nedir? (Örn: Matematik Tekrarı)"
              value={inputTask}
              disabled={isRunning}
              onChange={(e) => {
                setInputTask(e.target.value);
                setErrorMessage('');
              }}
              className="w-full px-4 py-2.5 rounded-xl bg-black/30 border border-white/10 focus:border-blue-500 text-sm text-white placeholder-slate-400 outline-none transition disabled:opacity-60"
            />
          </div>

          {/* Error notification if empty task */}
          {errorMessage && (
            <p className="text-xs text-rose-400 mt-2 font-medium">{errorMessage}</p>
          )}

          {/* Duration Presets & Inputs */}
          <div className="w-full mt-4 flex flex-col items-center gap-3">
            {/* Preset Buttons */}
            <div className="flex flex-wrap justify-center gap-2">
              {[
                { label: '25 / 5 dk', w: 25, b: 5 },
                { label: '50 / 10 dk', w: 50, b: 10 },
                { label: '90 / 15 dk', w: 90, b: 15 },
              ].map(preset => (
                <button
                  key={preset.label}
                  disabled={isRunning}
                  onClick={() => handlePreset(preset.w, preset.b)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                    parseInt(inputWork, 10) === preset.w && parseInt(inputBreak, 10) === preset.b
                      ? 'bg-blue-600 border-blue-400 text-white shadow'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                  } disabled:opacity-50`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Custom Minutes Inputs */}
            <div className="flex items-center gap-4 text-xs text-slate-300">
              <div className="flex items-center gap-1.5">
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

              <div className="flex items-center gap-1.5">
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
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="p-5 border-t border-white/10 bg-black/20 flex items-center justify-between gap-3">
          {/* Left: Leave Chair */}
          {isMyCurrentSeat ? (
            <button
              onClick={handleLeaveAndClose}
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/15 transition border border-rose-500/30"
            >
              <LogOut className="w-3.5 h-3.5" />
              Masadan Kalk
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              Kapat
            </button>
          )}

          {/* Right: Timer Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={resetTimer}
              className="flex items-center gap-1 px-4 py-2.5 rounded-xl text-xs font-bold text-white transition shadow"
              style={{ backgroundColor: theme.resetButton }}
              title="Zamanlayıcıyı Sıfırla"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Sıfırla
            </button>

            {!isRunning ? (
              <button
                onClick={handleStart}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-bold text-white transition shadow-lg"
                style={{ backgroundColor: theme.button }}
              >
                <Play className="w-4 h-4 fill-white" />
                {isMyCurrentSeat ? 'Başlat' : 'Otur ve Başlat'}
              </button>
            ) : (
              <button
                onClick={pauseTimer}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 transition shadow-lg"
              >
                <Pause className="w-4 h-4 fill-white" />
                Duraklat
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
