import React, { useState, useMemo } from 'react';
import { storageService } from '../../services/storageService';
import { StatsPeriod } from '../../types/pomodoro';
import { formatDateDDMMYYYY } from '../../utils/timeFormatter';
import { ArrowLeft, BarChart3, Clock, TrendingUp, Trophy, Flame } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface StatsViewProps {
  onBack: () => void;
}

export const StatsView: React.FC<StatsViewProps> = ({ onBack }) => {
  const { theme } = useTheme();
  const [period, setPeriod] = useState<StatsPeriod>('Haftalık');

  const stats = useMemo(() => {
    return storageService.getStats(period);
  }, [period]);

  const todayStr = useMemo(() => {
    const d = new Date();
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
  }, []);

  // Calculate nice max for chart Y scale
  const maxVal = Math.max(1, ...stats.chartData.map(c => c.value));
  const niceMax = maxVal > 15 ? Math.ceil(maxVal / 15) * 15 : 60;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 animate-fade-in">
      {/* Header & Period Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Geri
          </button>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>📊 İstatistikler</span>
          </h2>
        </div>

        {/* Period Segmented Buttons */}
        <div className="flex rounded-xl bg-[#1A202C] p-1 border border-slate-700">
          {(['Günlük', 'Haftalık', 'Aylık', 'Yıllık'] as StatsPeriod[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                period === p ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Toplam Süre */}
        <div className="p-4 rounded-2xl bg-[#232A36] border border-slate-700/60 shadow-lg relative overflow-hidden">
          <div className="w-full h-1 bg-[#e67e22] absolute top-0 left-0" />
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mb-1">
            <Clock className="w-3.5 h-3.5 text-[#e67e22]" />
            Toplam Süre
          </div>
          <div className="text-xl font-extrabold text-white font-mono">{stats.totalMinutes} dk</div>
        </div>

        {/* Ortalama */}
        <div className="p-4 rounded-2xl bg-[#232A36] border border-slate-700/60 shadow-lg relative overflow-hidden">
          <div className="w-full h-1 bg-[#3498db] absolute top-0 left-0" />
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-[#3498db]" />
            Ortalama
          </div>
          <div className="text-xl font-extrabold text-white font-mono">{stats.avgMinutes.toFixed(1)} dk</div>
        </div>

        {/* En İyi Gün */}
        <div className="p-4 rounded-2xl bg-[#232A36] border border-slate-700/60 shadow-lg relative overflow-hidden">
          <div className="w-full h-1 bg-[#f1c40f] absolute top-0 left-0" />
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mb-1">
            <Trophy className="w-3.5 h-3.5 text-[#f1c40f]" />
            En İyi
          </div>
          <div className="text-xs font-bold text-white truncate" title={stats.bestLabel}>
            {stats.bestLabel}
          </div>
          <div className="text-sm font-mono font-bold text-amber-400">{stats.bestMinutes} dk</div>
        </div>

        {/* Aktif Seans Sayısı */}
        <div className="p-4 rounded-2xl bg-[#232A36] border border-slate-700/60 shadow-lg relative overflow-hidden">
          <div className="w-full h-1 bg-[#e74c3c] absolute top-0 left-0" />
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mb-1">
            <Flame className="w-3.5 h-3.5 text-[#e74c3c]" />
            Aktif
          </div>
          <div className="text-xl font-extrabold text-white font-mono">
            {stats.activeCount} / {stats.totalCount}
          </div>
        </div>
      </div>

      {/* Dynamic Bar Chart Card */}
      <div className="p-6 rounded-2xl bg-[#232A36] border border-slate-700/60 shadow-xl">
        <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-sky-400" />
          {period} Aktivite Grafiği
        </h3>

        {/* Chart SVG */}
        <div className="w-full h-64 relative select-none">
          <svg viewBox="0 0 700 240" className="w-full h-full overflow-visible">
            {/* Grid horizontal dashed lines */}
            {[0, 1, 2, 3, 4].map(idx => {
              const y = 20 + idx * 45;
              const val = Math.round(niceMax * (1 - idx / 4));
              return (
                <g key={idx}>
                  <line
                    x1="60"
                    y1={y}
                    x2="680"
                    y2={y}
                    stroke="#3E4145"
                    strokeDasharray="2 4"
                    strokeWidth="1"
                  />
                  <text
                    x="50"
                    y={y + 4}
                    textAnchor="end"
                    fill="#888888"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {val} dk
                  </text>
                </g>
              );
            })}

            {/* Bottom Base Line */}
            <line x1="60" y1="200" x2="680" y2="200" stroke="#555555" strokeWidth="2" />

            {/* Bars */}
            {stats.chartData.map((item, idx) => {
              const n = stats.chartData.length;
              const avail = 620; // 680 - 60
              const gap = avail / n;
              const barW = Math.max(12, Math.min(36, gap * 0.6));
              const xCenter = 60 + gap * idx + gap / 2;
              const barHeight = (item.value / niceMax) * 180;
              const y = 200 - barHeight;

              const isTodayBar = item.label.includes(todayStr) || (item.subLabel && item.subLabel.includes(todayStr));
              const barColor = isTodayBar ? '#2ECC71' : '#3498DB';

              return (
                <g key={idx} className="transition-all duration-300">
                  {/* Bar Rectangle with Rounded Top */}
                  {item.value > 0 && (
                    <>
                      <rect
                        x={xCenter - barW / 2}
                        y={y}
                        width={barW}
                        height={barHeight}
                        rx="4"
                        fill={barColor}
                        className="hover:opacity-85 transition"
                      />
                      {/* Value pill above bar */}
                      <text
                        x={xCenter}
                        y={y - 6}
                        textAnchor="middle"
                        fill="#FFFFFF"
                        fontSize="10"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {item.value}
                      </text>
                    </>
                  )}

                  {/* X Axis Labels */}
                  <text
                    x={xCenter}
                    y="216"
                    textAnchor="middle"
                    fill="#AAAAAA"
                    fontSize="10"
                  >
                    {item.label}
                  </text>
                  {item.subLabel && (
                    <text
                      x={xCenter}
                      y="230"
                      textAnchor="middle"
                      fill="#777777"
                      fontSize="9"
                    >
                      {item.subLabel}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
};
