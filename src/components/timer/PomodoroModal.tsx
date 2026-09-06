import React, { useState, useEffect } from 'react';
import { usePomodoro } from '../../context/PomodoroContext';
import { useLibrary } from '../../context/LibraryContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { AnalogClock } from './AnalogClock';
import { SeatIndex } from '../../types/library';
import { storageService } from '../../services/storageService';
import { formatRemainingSeconds, calculateEventCountdown, formatDateDDMMYYYY } from '../../utils/timeFormatter';
import { X, Play, Pause, RotateCcw, LogOut, CheckCircle2, Calendar, Target, Clock, ChevronDown, ChevronUp } from 'lucide-react';

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

  const currentTable = tables.find(t => t.id === tableId);
  const currentOccupant = currentTable?.seats[seatIndex];
  const isMyCurrentSeat = Boolean(
    (mySeat?.tableId === tableId && mySeat?.seatIndex === seatIndex) ||
    (user && currentOccupant && currentOccupant.uid === user.uid)
  );

  // Responsive state
  const [isMobile, setIsMobile] = useState<boolean>(() => typeof window !== 'undefined' ? window.innerWidth < 640 : false);
  const [showGoals, setShowGoals] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Local inputs for custom minutes
  const [inputWork, setInputWork] = useState<string>(String(workMinutes));
  const [inputBreak, setInputBreak] = useState<string>(String(breakMinutes));
  const [inputTask, setInputTask] = useState<string>(currentTask);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Sync inputs whenever modal opens or chair changes
  useEffect(() => {
    if (isOpen) {
      if (currentOccupant) {
        setInputTask(currentOccupant.currentTask || currentTask || '');
        if (currentOccupant.durationSeconds > 0) {
          setInputWork(String(Math.round(currentOccupant.durationSeconds / 60)));
        }
      } else {
        setInputTask(currentTask || '');
        setInputWork(String(workMinutes || 25));
        setInputBreak(String(breakMinutes || 5));
      }
      setErrorMessage('');
    }
  }, [isOpen, tableId, seatIndex]);

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

    // Sit at this seat and refresh occupant info
    const seated = sitAtSeat(tableId, seatIndex, taskName, wM);
    if (!seated) {
      setErrorMessage('Bu koltuk dolu veya oturulamadı.');
      return;
    }

    onSeatConnectedStart(taskName, wM, bM);
    // Automatically close modal so the user sees their seat and the entire library hall
    onClose();
  };

  const handleLeaveAndClose = () => {
    leaveSeat(tableId, seatIndex);
    resetTimer();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-lg rounded-3xl border border-slate-700/60 shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[90vh]"
        style={{ backgroundColor: theme.primary }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10 bg-black/30 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-bold text-white truncate">
                Masa {tableId} — Koltuk {seatIndex + 1}
              </h3>
              <p className="text-[10px] sm:text-[11px] text-slate-300 truncate">
                {currentOccupant && !isMyCurrentSeat
                  ? `${currentOccupant.displayName} çalışıyor`
                  : 'Süreyi belirleyin ve odaklanmaya başlayın'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col items-center space-y-4">
          {/* Clock & Timer Presentation */}
          <div className="flex flex-col items-center select-none w-full">
            {/* Analog Clock - Hidden on small mobile to keep inputs above fold without scrolling */}
            <div className="hidden sm:block my-1 shrink-0">
              <AnalogClock
                remainingSeconds={remainingSeconds}
                totalSeconds={totalSeconds}
                size={180}
                bgColor={theme.primary}
              />
            </div>

            {/* Digital Timer */}
            <div className="mt-1 text-4xl sm:text-5xl font-extrabold tracking-tight font-mono text-white select-none">
              {formatRemainingSeconds(remainingSeconds)}
            </div>

            {/* Status Label */}
            <div
              className={`text-xs sm:text-sm font-semibold tracking-wide ${
                isWorkTime ? 'text-emerald-400' : 'text-sky-400'
              }`}
            >
              {statusText}
            </div>

            {/* Upcoming Event Ticker */}
            {upcomingEventStr && (
              <div
                className="mt-1.5 text-[11px] font-bold px-3 py-0.5 rounded-full bg-white/5 border border-white/10 truncate max-w-full"
                style={{ color: theme.textAccent }}
              >
                📅 {upcomingEventStr}
              </div>
            )}
          </div>

          {/* PRIMARY WORKFLOW: Task Input & Duration Definition */}
          <div className="w-full bg-black/25 p-3.5 sm:p-4 rounded-2xl border border-white/10 space-y-3">
            {/* Task Input */}
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                ✍️ Çalışma Görevi:
              </label>
              <input
                type="text"
                placeholder="Örn: Matematik Soru Çözümü, Tez Yazımı..."
                value={inputTask}
                disabled={isRunning}
                onChange={(e) => {
                  setInputTask(e.target.value);
                  setErrorMessage('');
                }}
                className="w-full px-3.5 py-2 sm:py-2.5 rounded-xl bg-black/40 border border-white/15 focus:border-blue-500 text-xs sm:text-sm text-white placeholder-slate-400 outline-none transition disabled:opacity-60"
              />
            </div>

            {/* Error notification */}
            {errorMessage && (
              <p className="text-xs text-rose-400 font-medium">{errorMessage}</p>
            )}

            {/* Duration Presets & Inputs */}
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1.5">
                ⏱️ Süre Belirleme:
              </label>

              {/* Quick Preset Buttons */}
              <div className="grid grid-cols-3 gap-2 mb-2.5">
                {[
                  { label: '25 / 5 dk', w: 25, b: 5 },
                  { label: '50 / 10 dk', w: 50, b: 10 },
                  { label: '90 / 15 dk', w: 90, b: 15 },
                ].map(preset => {
                  const isSelected =
                    parseInt(inputWork, 10) === preset.w && parseInt(inputBreak, 10) === preset.b;
                  return (
                    <button
                      key={preset.label}
                      disabled={isRunning}
                      onClick={() => handlePreset(preset.w, preset.b)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition border text-center ${
                        isSelected
                          ? 'bg-blue-600 border-blue-400 text-white shadow-md'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                      } disabled:opacity-50`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>

              {/* Custom Minutes Inputs */}
              <div className="flex items-center justify-around gap-2 bg-black/30 p-2 rounded-xl border border-white/10 text-xs text-slate-300">
                <div className="flex items-center gap-1.5">
                  <span>Çalışma:</span>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    disabled={isRunning}
                    value={inputWork}
                    onChange={(e) => setInputWork(e.target.value)}
                    className="w-14 px-2 py-1 rounded-lg bg-black/50 border border-white/20 text-center font-bold text-white outline-none disabled:opacity-50"
                  />
                  <span className="text-slate-400 text-[11px]">dk</span>
                </div>

                <div className="w-[1px] h-5 bg-white/10" />

                <div className="flex items-center gap-1.5">
                  <span>Mola:</span>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    disabled={isRunning}
                    value={inputBreak}
                    onChange={(e) => setInputBreak(e.target.value)}
                    className="w-14 px-2 py-1 rounded-lg bg-black/50 border border-white/20 text-center font-bold text-white outline-none disabled:opacity-50"
                  />
                  <span className="text-slate-400 text-[11px]">dk</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECONDARY: Collapsible Daily Goals & Progress */}
          <div className="w-full">
            <button
              onClick={() => setShowGoals(!showGoals)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs text-slate-300 transition"
            >
              <div className="flex items-center gap-2">
                <Target className="w-3.5 h-3.5 text-blue-400" />
                <span>Günlük Hedef & İlerleme Özeti</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                <span>%{todayGoalProgress.taskPct}</span>
                {showGoals ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </div>
            </button>

            {showGoals && (
              <div className="mt-2 p-3 rounded-xl bg-black/20 border border-white/10 space-y-2.5 animate-fade-in">
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
            )}
          </div>
        </div>

        {/* Action Buttons Sticky Footer */}
        <div className="sticky bottom-0 p-3 sm:p-4 border-t border-white/10 bg-black/40 backdrop-blur-md flex items-center justify-between gap-2 shrink-0 z-20">
          {/* Left: Leave Chair or Close */}
          <div className="flex items-center gap-1.5">
            {(mySeat || isMyCurrentSeat) && (
              <button
                type="button"
                onClick={handleLeaveAndClose}
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-rose-300 hover:text-white bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 shadow-sm transition"
                title="Masadaki yerinizi bırakın ve sayacı sıfırlayın"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Masadan Kalk</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              {mySeat ? 'Kapat' : 'Kapat'}
            </button>
          </div>

          {/* Right: Timer Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={resetTimer}
              className="flex items-center gap-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold text-white transition shadow"
              style={{ backgroundColor: theme.resetButton }}
              title="Zamanlayıcıyı Sıfırla"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sıfırla</span>
            </button>

            {!isRunning ? (
              <button
                onClick={handleStart}
                className="flex items-center gap-1.5 px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-xs font-bold text-white transition shadow-lg"
                style={{ backgroundColor: theme.button }}
              >
                <Play className="w-4 h-4 fill-white" />
                <span>{isMyCurrentSeat ? 'Başlat' : 'Otur ve Başlat'}</span>
              </button>
            ) : (
              <button
                onClick={pauseTimer}
                className="flex items-center gap-1.5 px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 transition shadow-lg"
              >
                <Pause className="w-4 h-4 fill-white" />
                <span>Duraklat</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

