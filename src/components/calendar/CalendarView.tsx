import React, { useState, useEffect } from 'react';
import { storageService } from '../../services/storageService';
import { CalendarEvent } from '../../types/pomodoro';
import { maskDateInput, maskTimeInput, calculateEventCountdown } from '../../utils/timeFormatter';
import { ArrowLeft, Calendar as CalendarIcon, Clock, Plus, Trash2, AlertCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface CalendarViewProps {
  onBack: () => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ onBack }) => {
  const { theme } = useTheme();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [name, setName] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');
  const [timeStr, setTimeStr] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    setEvents(storageService.loadEvents());
  }, []);

  const handleDateChange = (val: string) => {
    setDateStr(maskDateInput(val));
    setError('');
  };

  const handleTimeChange = (val: string) => {
    setTimeStr(maskTimeInput(val));
    setError('');
  };

  const handleAddEvent = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!name.trim() || !dateStr.trim()) {
      setError('Etkinlik adı ve tarihi boş bırakılamaz.');
      return;
    }

    const { isPast } = calculateEventCountdown(dateStr, timeStr || '00:00');
    if (isPast) {
      setError('Geçmiş bir tarih için etkinlik ekleyemezsiniz.');
      return;
    }

    const newEvent: CalendarEvent = {
      id: `ev_${Date.now()}`,
      name: name.trim(),
      date: dateStr,
      time: timeStr.trim() || '00:00'
    };

    const updated = [...events, newEvent];
    setEvents(updated);
    storageService.saveEvents(updated);

    setName('');
    setDateStr('');
    setTimeStr('');
    setError('');
  };

  const handleDeleteEvent = (id: string) => {
    const updated = events.filter(ev => ev.id !== id);
    setEvents(updated);
    storageService.saveEvents(updated);
  };

  return (
    <div className="max-w-4xl mx-auto p-3.5 sm:p-6 md:p-8 animate-fade-in">
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
          <span>📅 Takvim & Etkinlik Geri Sayımı</span>
        </h2>
      </div>

      {/* Add Event Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#232A36] border border-slate-700/60 shadow-xl mb-4 sm:mb-6">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4 text-sky-400" />
          Yeni Etkinlik Ekle
        </h3>

        <form onSubmit={handleAddEvent} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-5">
            <input
              type="text"
              placeholder="Etkinlik Adı (Örn: Sınav, Proje Teslimi)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#1A202C] border border-slate-700 focus:border-blue-500 text-xs text-white placeholder-slate-400 outline-none transition"
            />
          </div>

          <div className="sm:col-span-3">
            <input
              type="text"
              placeholder="GG/AA/YYYY"
              value={dateStr}
              maxLength={10}
              onChange={(e) => handleDateChange(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#1A202C] border border-slate-700 focus:border-blue-500 text-xs font-mono text-white placeholder-slate-400 outline-none text-center transition"
            />
          </div>

          <div className="sm:col-span-2">
            <input
              type="text"
              placeholder="SS:DD (Opsiyonel)"
              value={timeStr}
              maxLength={5}
              onChange={(e) => handleTimeChange(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#1A202C] border border-slate-700 focus:border-blue-500 text-xs font-mono text-white placeholder-slate-400 outline-none text-center transition"
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full h-full py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md transition flex items-center justify-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Ekle
            </button>
          </div>
        </form>

        {error && (
          <div className="flex items-center gap-1.5 text-xs text-rose-400 mt-3 font-medium">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Events List */}
      <div className="p-5 rounded-2xl bg-[#232A36] border border-slate-700/60 shadow-xl">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-emerald-400" />
          Kaydedilen Etkinlikler ({events.length})
        </h3>

        <div className="space-y-3">
          {events.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">Hiç etkinlik eklenmemiş.</p>
          ) : (
            events.map(ev => {
              const { countdown, isPast } = calculateEventCountdown(ev.date, ev.time);
              return (
                <div
                  key={ev.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-[#1A202C] border border-sky-600/30 hover:border-sky-500/60 transition shadow-sm gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-sky-400 truncate">{ev.name}</div>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">
                      {ev.date} {ev.time !== '00:00' ? ev.time : ''}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <span
                      className={`text-xs font-mono font-bold px-3 py-1 rounded-full ${
                        isPast
                          ? 'bg-slate-800 text-slate-400'
                          : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {countdown}
                    </span>

                    <button
                      onClick={() => handleDeleteEvent(ev.id)}
                      className="p-1.5 rounded-lg text-rose-400 hover:text-white hover:bg-rose-600/20 transition"
                      title="Etkinliği Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
