import React, { useState, useMemo } from 'react';
import { storageService } from '../../services/storageService';
import { HistoryRecord } from '../../types/pomodoro';
import { Clock, Calendar, Coffee, Target, ArrowLeft } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface HistoryViewProps {
  onBack: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ onBack }) => {
  const { theme } = useTheme();
  const allHistory = useMemo(() => storageService.loadHistory(), []);

  // Group records by date (DD-MM-YYYY)
  const groupedByDate = useMemo(() => {
    const groups: Record<string, { records: HistoryRecord[]; workMins: number; breakMins: number }> = {};
    for (const r of allHistory) {
      if (!groups[r.date]) {
        groups[r.date] = { records: [], workMins: 0, breakMins: 0 };
      }
      groups[r.date].records.push(r);
      if (r.sessionType === 'Çalışma') {
        groups[r.date].workMins += r.durationMinutes;
      } else {
        groups[r.date].breakMins += r.durationMinutes;
      }
    }
    return groups;
  }, [allHistory]);

  const sortedDates = useMemo(() => {
    return Object.keys(groupedByDate).sort((a, b) => {
      // Parse DD-MM-YYYY
      const [d1, m1, y1] = a.split('-').map(Number);
      const [d2, m2, y2] = b.split('-').map(Number);
      return new Date(y2, m2 - 1, d2).getTime() - new Date(y1, m1 - 1, d1).getTime();
    });
  }, [groupedByDate]);

  const [selectedDate, setSelectedDate] = useState<string>(sortedDates[0] || '');

  const selectedGroup = selectedDate ? groupedByDate[selectedDate] : null;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Geri
        </button>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span>📜 Geçmiş Kayıtlar</span>
        </h2>
      </div>

      {/* 2-Pane Container matching Python CustomTkinter */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[500px]">
        {/* Left Pane: Dates List (col-span-5) */}
        <div className="md:col-span-5 p-4 rounded-2xl bg-[#232A36] border border-slate-700/50 shadow-xl flex flex-col">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-700/60 mb-3">
            <Calendar className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-bold text-slate-200">Tarihler</h3>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[600px]">
            {sortedDates.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-10">Henüz kayıt yok.</p>
            ) : (
              sortedDates.map(dateStr => {
                const group = groupedByDate[dateStr];
                const isSelected = dateStr === selectedDate;
                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`w-full text-left p-3 rounded-xl border transition ${
                      isSelected
                        ? 'border-blue-500 bg-blue-500/15 shadow-md'
                        : 'border-slate-700/60 bg-[#343638]/40 hover:bg-[#343638]/80'
                    }`}
                  >
                    <div className="text-xs font-bold text-white mb-1">{dateStr}</div>
                    <div className="text-[11px] text-slate-300 flex items-center gap-3">
                      <span className="flex items-center gap-1 text-emerald-400">
                        <Target className="w-3 h-3" />
                        {group.workMins} dk çalışma
                      </span>
                      <span className="flex items-center gap-1 text-sky-400">
                        <Coffee className="w-3 h-3" />
                        {group.breakMins} dk mola
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Date Details (col-span-7) */}
        <div className="md:col-span-7 p-4 rounded-2xl bg-[#232A36] border border-slate-700/50 shadow-xl flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-700/60 mb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>📅 {selectedDate ? `${selectedDate} Detayları` : 'Kayıt Seçin'}</span>
            </h3>
            {selectedGroup && (
              <span className="text-xs text-slate-400">
                Toplam {selectedGroup.records.length} seans
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[600px]">
            {!selectedGroup || selectedGroup.records.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-10">Bu tarihte kayıt bulunamadı.</p>
            ) : (
              selectedGroup.records.map(r => {
                const isWork = r.sessionType === 'Çalışma';
                return (
                  <div
                    key={r.id}
                    className={`p-3.5 rounded-xl border transition ${
                      isWork
                        ? 'bg-[#24322D] border-emerald-500/40 shadow-sm'
                        : 'bg-[#242A32] border-sky-500/40 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span>{isWork ? '🎯' : '☕'}</span>
                        <span className="text-xs font-bold text-white truncate max-w-[220px]">
                          {r.taskDescription || (isWork ? 'Çalışma' : 'Mola')}
                        </span>
                      </div>
                      <span
                        className={`text-xs font-mono font-bold ${
                          isWork ? 'text-emerald-400' : 'text-sky-400'
                        }`}
                      >
                        {r.durationMinutes} dk
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-white/5">
                      <span>{r.sessionType}</span>
                      <span className="font-mono">
                        {r.startTime} - {r.endTime} ({r.weekday})
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
