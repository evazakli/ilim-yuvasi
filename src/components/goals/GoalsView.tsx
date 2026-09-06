import React, { useState, useEffect } from 'react';
import { storageService } from '../../services/storageService';
import { DailyGoal, GoalTask } from '../../types/pomodoro';
import { TURKISH_MONTHS, formatDateDDMMYYYY } from '../../utils/timeFormatter';
import { ArrowLeft, ChevronLeft, ChevronRight, Calendar, CheckSquare, Clock, Plus, Trash2, Check } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface GoalsViewProps {
  onBack: () => void;
}

export const GoalsView: React.FC<GoalsViewProps> = ({ onBack }) => {
  const { theme } = useTheme();
  const [viewingDate, setViewingDate] = useState<Date>(new Date());
  const [goal, setGoal] = useState<DailyGoal>({ date: '', tasks: [], targetTime: 0 });
  const [goalType, setGoalType] = useState<'task' | 'time'>('task');
  const [newTaskText, setNewTaskText] = useState<string>('');
  const [targetTimeInput, setTargetTimeInput] = useState<string>('0');
  const [saveFeedback, setSaveFeedback] = useState<string>('');

  const today = new Date();
  const isToday =
    viewingDate.getFullYear() === today.getFullYear() &&
    viewingDate.getMonth() === today.getMonth() &&
    viewingDate.getDate() === today.getDate();

  const viewingIso = viewingDate.toISOString().split('T')[0];
  const viewingDdMmYyyy = formatDateDDMMYYYY(viewingDate);

  // Reload goal whenever viewing date changes
  useEffect(() => {
    const loaded = storageService.loadGoalForDate(viewingIso);
    setGoal(loaded);
    setTargetTimeInput(String(loaded.targetTime || 0));
    setSaveFeedback('');
  }, [viewingIso]);

  const handlePrevDay = () => {
    const d = new Date(viewingDate);
    d.setDate(d.getDate() - 1);
    setViewingDate(d);
  };

  const handleNextDay = () => {
    if (!isToday) {
      const d = new Date(viewingDate);
      d.setDate(d.getDate() + 1);
      setViewingDate(d);
    }
  };

  const handleGoToday = () => {
    setViewingDate(new Date());
  };

  // Task-based goals
  const handleAddTask = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isToday || !newTaskText.trim()) return;

    const newTask: GoalTask = {
      id: `task_${Date.now()}`,
      description: newTaskText.trim(),
      completed: false
    };

    const updatedGoal: DailyGoal = {
      ...goal,
      date: viewingIso,
      tasks: [...(goal.tasks || []), newTask]
    };

    setGoal(updatedGoal);
    storageService.saveGoalForDate(viewingIso, updatedGoal);
    setNewTaskText('');
  };

  const handleToggleTask = (index: number) => {
    if (!isToday) return;
    const tasks = [...goal.tasks];
    tasks[index].completed = !tasks[index].completed;

    const updatedGoal = { ...goal, tasks };
    setGoal(updatedGoal);
    storageService.saveGoalForDate(viewingIso, updatedGoal);
  };

  const handleDeleteTask = (index: number) => {
    if (!isToday) return;
    const tasks = goal.tasks.filter((_, i) => i !== index);

    const updatedGoal = { ...goal, tasks };
    setGoal(updatedGoal);
    storageService.saveGoalForDate(viewingIso, updatedGoal);
  };

  // Time-based goals
  const handleSaveTimeGoal = () => {
    if (!isToday) return;
    const val = parseInt(targetTimeInput, 10);
    if (isNaN(val) || val < 0) {
      setSaveFeedback('✖ Geçersiz Değer');
      return;
    }

    const updatedGoal: DailyGoal = {
      ...goal,
      date: viewingIso,
      targetTime: val
    };

    setGoal(updatedGoal);
    storageService.saveGoalForDate(viewingIso, updatedGoal);
    setSaveFeedback('✔ Hedef Kaydedildi');
    setTimeout(() => setSaveFeedback(''), 2500);
  };

  // Past day calculation
  const completedTaskCount = (goal.tasks || []).filter(t => t.completed).length;
  const totalTaskCount = (goal.tasks || []).length;
  const taskProgress = totalTaskCount > 0 ? completedTaskCount / totalTaskCount : 0;

  const actualWorkMinutes = storageService.getWorkMinutesForDate(viewingDdMmYyyy);
  const timeProgress = goal.targetTime > 0 ? Math.min(1.0, actualWorkMinutes / goal.targetTime) : 0;

  return (
    <div className="max-w-3xl mx-auto p-3.5 sm:p-6 md:p-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Geri
        </button>
        <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
          <span>🎯 Günlük Hedefler</span>
        </h2>
      </div>

      {/* Date Navigation Bar */}
      <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-2xl bg-[#232A36] border border-slate-700/60 shadow-lg mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevDay}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-700 transition"
            title="Önceki Gün"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <span className="text-sm font-bold text-white px-2">
            {viewingDate.getDate()} {TURKISH_MONTHS[viewingDate.getMonth() + 1]} {viewingDate.getFullYear()}
          </span>

          <button
            onClick={handleNextDay}
            disabled={isToday}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition"
            title="Sonraki Gün"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={handleGoToday}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold text-sky-400 hover:text-white bg-sky-500/15 hover:bg-sky-500/30 transition border border-sky-500/30"
        >
          Bugün
        </button>
      </div>

      {/* Content Area */}
      {isToday ? (
        /* TODAY'S GOALS SETTER */
        <div className="p-4 sm:p-6 rounded-2xl bg-[#232A36] border border-slate-700/60 shadow-xl space-y-4 sm:space-y-6">
          {/* Segmented Button */}
          <div className="flex rounded-xl bg-[#1A202C] p-1 border border-slate-700">
            <button
              onClick={() => setGoalType('task')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                goalType === 'task' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              Görev Bazlı Hedef
            </button>
            <button
              onClick={() => setGoalType('time')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                goalType === 'time' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Çalışma Süresi Bazlı
            </button>
          </div>

          {goalType === 'task' ? (
            /* Task Based Editor */
            <div className="space-y-4">
              <form onSubmit={handleAddTask} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Bugün neyi tamamlayacaksınız? (Yeni görev ekle...)"
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#1A202C] border border-slate-700 focus:border-blue-500 text-xs text-white placeholder-slate-400 outline-none transition"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow transition flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Ekle
                </button>
              </form>

              {/* Task Checklist */}
              <div className="space-y-2 pt-2">
                {goal.tasks.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-8 italic">
                    Henüz görev eklenmedi.
                  </p>
                ) : (
                  goal.tasks.map((task, idx) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-[#1A202C] border border-slate-700/60 transition group hover:border-slate-600"
                    >
                      <label className="flex items-center gap-3 cursor-pointer flex-1 min-w-0 pr-2">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => handleToggleTask(idx)}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer accent-blue-600"
                        />
                        <span
                          className={`text-xs transition truncate ${
                            task.completed ? 'line-through text-slate-500' : 'text-slate-200'
                          }`}
                        >
                          {task.description}
                        </span>
                      </label>

                      <button
                        onClick={() => handleDeleteTask(idx)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition"
                        title="Görevi Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            /* Time Based Editor */
            <div className="flex flex-col items-center justify-center py-6 space-y-4">
              <p className="text-xs text-slate-300 font-medium">Bugünkü çalışma hedefiniz (dakika):</p>
              <input
                type="number"
                min="0"
                step="5"
                value={targetTimeInput}
                onChange={(e) => setTargetTimeInput(e.target.value)}
                className="w-32 py-2.5 px-3 rounded-xl bg-[#1A202C] border border-slate-700 text-center font-bold text-lg text-white outline-none focus:border-blue-500"
              />
              <button
                onClick={handleSaveTimeGoal}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md transition"
              >
                Hedefi Kaydet
              </button>
              {saveFeedback && (
                <p
                  className={`text-xs font-bold transition ${
                    saveFeedback.includes('✔') ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {saveFeedback}
                </p>
              )}
            </div>
          )}
        </div>
      ) : (
        /* PAST DAY GOALS REPORT */
        <div className="space-y-6">
          {/* Task Report Card */}
          <div className="p-6 rounded-2xl bg-[#232A36] border border-slate-700/60 shadow-xl space-y-3">
            <h3 className="text-sm font-bold text-white">Görev Bazlı Hedef Raporu</h3>
            {totalTaskCount > 0 ? (
              <>
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Tamamlanma: {completedTaskCount}/{totalTaskCount}</span>
                  <span className="font-mono font-bold text-emerald-400">%{Math.round(taskProgress * 100)}</span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${taskProgress * 100}%` }}
                  />
                </div>
                <div className="space-y-1.5 pt-2">
                  {goal.tasks.map((task) => (
                    <div key={task.id} className="flex items-center gap-2 text-xs text-slate-300 py-1 border-b border-white/5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          task.completed ? 'bg-emerald-400' : 'bg-rose-400'
                        }`}
                      />
                      <span className={task.completed ? 'line-through text-slate-500' : ''}>
                        {task.description}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-xs text-slate-400 italic py-3">Bu gün için görev bazlı hedef tanımlanmamış.</p>
            )}
          </div>

          {/* Time Report Card */}
          <div className="p-6 rounded-2xl bg-[#232A36] border border-slate-700/60 shadow-xl space-y-3">
            <h3 className="text-sm font-bold text-white">Süre Bazlı Hedef Raporu</h3>
            {goal.targetTime > 0 ? (
              <>
                <div className="flex justify-between text-xs text-slate-300">
                  <span>İlerleme: {actualWorkMinutes} / {goal.targetTime} dakika</span>
                  <span className="font-mono font-bold text-blue-400">%{Math.round(timeProgress * 100)}</span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${timeProgress * 100}%` }}
                  />
                </div>
              </>
            ) : (
              <p className="text-xs text-slate-400 italic py-3">Bu gün için süre bazlı hedef tanımlanmamış.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
