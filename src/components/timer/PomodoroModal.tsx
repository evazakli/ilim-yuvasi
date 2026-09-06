import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-lg rounded-t-3xl sm:rounded-3xl border-t sm:border border-slate-700/60 shadow-2xl overflow-hidden flex flex-col max-h-[85dvh] sm:max-h-[90vh] animate-slide-up sm:animate-fade-in"
        style={{ backgroundColor: theme.primary }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Pull Handle */}
        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mt-2.5 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 sm:py-3.5 border-b border-white/10 bg-black/30 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
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
            aria-label="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 flex flex-col space-y-3">
          {!isRunning ? (
            /* === SETUP / SITTING DOWN MODE: COMPACT & ZERO-SCROLL === */
            <div className="w-full space-y-2.5 animate-fade-in">
              {/* PRIMARY: Duration Definition Box */}
              <div className="w-full bg-black/30 p-2.5 sm:p-3.5 rounded-2xl border border-white/10 space-y-2 shadow-inner">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>⏱️ Süre Belirleme</span>
                  </label>
                  <span className="text-[10px] sm:text-[11px] font-mono font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full">
                    {inputWork || 25} dk Odak · {inputBreak || 5} dk Mola
                  </span>
                </div>

                {/* Quick Presets */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: '25 / 5 dk', w: 25, b: 5, desc: 'Klasik' },
                    { label: '50 / 10 dk', w: 50, b: 10, desc: 'Derin Odak' },
                    { label: '90 / 15 dk', w: 90, b: 15, desc: 'Blok Etüt' },
                  ].map(preset => {
                    const isSelected =
                      parseInt(inputWork, 10) === preset.w && parseInt(inputBreak, 10) === preset.b;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => handlePreset(preset.w, preset.b)}
                        className={`py-2 px-1 rounded-xl text-xs font-bold transition border text-center flex flex-col items-center justify-center gap-0.5 ${
                          isSelected
                            ? 'bg-blue-600 border-blue-400 text-white shadow-lg ring-1 ring-blue-400 scale-[1.02]'
                            : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <span className="text-xs font-extrabold">{preset.label}</span>
                        <span className="text-[9px] opacity-75 font-normal">{preset.desc}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Minutes Row */}
                <div className="flex items-center justify-around gap-2 bg-black/40 p-2 rounded-xl border border-white/10 text-xs text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 font-medium text-[11px]">Çalışma:</span>
                    <input
                      type="number"
                      min="1"
                      max="180"
                      value={inputWork}
                      onChange={(e) => {
                        setInputWork(e.target.value);
                        const val = parseInt(e.target.value, 10);
                        if (val > 0) setWorkMinutes(val);
                      }}
                      className="w-14 px-2 py-1 rounded-lg bg-black/60 border border-white/20 focus:border-amber-400 text-center font-bold text-white text-xs outline-none"
                    />
                    <span className="text-slate-400 text-[11px]">dk</span>
                  </div>

                  <div className="w-[1px] h-5 bg-white/10" />

                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 font-medium text-[11px]">Mola:</span>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={inputBreak}
                      onChange={(e) => {
                        setInputBreak(e.target.value);
                        const val = parseInt(e.target.value, 10);
                        if (val > 0) setBreakMinutes(val);
                      }}
                      className="w-14 px-2 py-1 rounded-lg bg-black/60 border border-white/20 focus:border-sky-400 text-center font-bold text-white text-xs outline-none"
                    />
                    <span className="text-slate-400 text-[11px]">dk</span>
                  </div>
                </div>
              </div>

              {/* Task Input Section */}
              <div className="w-full bg-black/30 p-2.5 sm:p-3 rounded-2xl border border-white/10 space-y-1.5">
                <label className="text-xs font-bold text-white block">
                  ✍️ Çalışma Göreviniz:
                </label>
                <input
                  type="text"
                  placeholder="Örn: Matematik Soru Çözümü, Tez Yazımı..."
                  value={inputTask}
                  onChange={(e) => {
                    setInputTask(e.target.value);
                    setErrorMessage('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleStart();
                  }}
                  className="w-full px-3 py-2 sm:py-2.5 rounded-xl bg-black/50 border border-white/15 focus:border-blue-500 text-xs sm:text-sm text-white placeholder-slate-400 outline-none transition"
                />
                {errorMessage && (
                  <p className="text-xs text-rose-400 font-medium pt-0.5">{errorMessage}</p>
                )}
              </div>

              {/* Upcoming Event Ticker */}
              {upcomingEventStr && (
                <div
                  className="text-[11px] font-semibold px-3 py-1 rounded-xl bg-white/5 border border-white/10 truncate text-center"
                  style={{ color: theme.textAccent }}
                >
                  📅 {upcomingEventStr}
                </div>
              )}
            </div>
          ) : (
            /* === RUNNING SESSION MODE: BIG COUNTDOWN & CLOCK === */
            <div className="w-full flex flex-col items-center space-y-3 sm:space-y-4 animate-fade-in">
              <div className="hidden sm:block my-1 shrink-0">
                <AnalogClock
                  remainingSeconds={remainingSeconds}
                  totalSeconds={totalSeconds}
                  size={170}
                  bgColor={theme.primary}
                />
              </div>

              <div className="mt-1 text-5xl font-extrabold tracking-tight font-mono text-white select-none">
                {formatRemainingSeconds(remainingSeconds)}
              </div>

              <div
                className={`text-xs sm:text-sm font-semibold tracking-wide ${
                  isWorkTime ? 'text-emerald-400' : 'text-sky-400'
                }`}
              >
                {statusText}
              </div>

              <div className="w-full bg-black/30 p-3 rounded-2xl border border-white/10 text-center">
                <span className="text-[11px] text-slate-400 font-medium">Şu Anki Görev:</span>
                <p className="text-sm font-bold text-white mt-0.5 truncate">
                  {currentTask || 'Odaklanma Seansı'}
                </p>
              </div>

              {upcomingEventStr && (
                <div
                  className="mt-1 text-[11px] font-bold px-3 py-0.5 rounded-full bg-white/5 border border-white/10 truncate max-w-full"
                  style={{ color: theme.textAccent }}
                >
                  📅 {upcomingEventStr}
                </div>
              )}

              {/* Daily Goals Collapsible in Running Mode */}
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
          )}
        </div>

        {/* Action Buttons Sticky Footer */}
        <div className="sticky bottom-0 p-3 sm:p-4 border-t border-white/10 bg-black/40 backdrop-blur-md flex items-center justify-between gap-2 shrink-0 z-20 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]">
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
              Kapat
            </button>
          </div>

          {/* Right: Timer Controls */}
          <div className="flex items-center gap-2">
            {isRunning && (
              <button
                onClick={resetTimer}
                className="flex items-center gap-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold text-white transition shadow"
                style={{ backgroundColor: theme.resetButton }}
                title="Zamanlayıcıyı Sıfırla"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sıfırla</span>
              </button>
            )}

            {!isRunning ? (
              <button
                onClick={handleStart}
                className="flex items-center gap-1.5 px-5 sm:px-6 py-2.5 rounded-xl text-xs font-bold text-white transition shadow-lg hover:brightness-110 active:scale-95"
                style={{ backgroundColor: theme.button }}
              >
                <Play className="w-4 h-4 fill-white" />
                <span>{isMyCurrentSeat ? 'Başlat' : 'Otur ve Başlat'}</span>
              </button>
            ) : (
              <button
                onClick={pauseTimer}
                className="flex items-center gap-1.5 px-5 sm:px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 transition shadow-lg active:scale-95"
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

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};

