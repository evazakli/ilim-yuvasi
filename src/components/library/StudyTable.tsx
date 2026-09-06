import React from 'react';
import { LibraryTable, SeatIndex } from '../../types/library';
import { StudySeat } from './StudySeat';

interface StudyTableProps {
  table: LibraryTable;
  onSeatClick: (tableId: number, seatIndex: SeatIndex) => void;
  onLeaveClick: (tableId: number, seatIndex: SeatIndex) => void;
}

export const StudyTable: React.FC<StudyTableProps> = ({
  table,
  onSeatClick,
  onLeaveClick,
}) => {
  const seats = table.seats;

  return (
    <div className="relative flex flex-col items-center p-3.5 rounded-3xl glass-panel glass-card-hover shadow-2xl w-full max-w-[280px]">
      {/* Table Minimalist Badge */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 px-3 py-0.5 rounded-full bg-[#181B26] border border-white/[0.12] text-amber-300 font-bold text-[11px] shadow-lg flex items-center gap-1.5 whitespace-nowrap">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        <span>{table.name}</span>
      </div>

      {/* Top 2 Seats (Seat 0 & Seat 1) */}
      <div className="flex justify-around items-end w-full gap-5 mb-2 z-10">
        <StudySeat
          tableId={table.id}
          seatIndex={0}
          occupant={seats[0]}
          onSeatClick={onSeatClick}
          onLeaveClick={onLeaveClick}
        />
        <StudySeat
          tableId={table.id}
          seatIndex={1}
          occupant={seats[1]}
          onSeatClick={onSeatClick}
          onLeaveClick={onLeaveClick}
        />
      </div>

      {/* Central Contemporary Architectural Study Desk Surface */}
      <div className="relative w-full h-24 rounded-2xl desk-surface flex items-center justify-center p-2 my-1 overflow-hidden shadow-inner">
        {/* Subtle Top Edge Chamfer Light */}
        <div className="absolute inset-x-3 top-0.5 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

        {/* Minimalist Emerald/Forest Desk Felt Mat */}
        <div className="relative w-full h-full rounded-xl desk-felt-mat flex items-center justify-between px-3.5 py-1">
          {/* Left Ornament: Modern Study Notebook */}
          <div className="flex flex-col items-center opacity-75 select-none pointer-events-none">
            <div className="w-8 h-5 rounded-sm bg-[#FDFBF7] shadow-sm border border-slate-700/40 flex items-center justify-center">
              <div className="w-[1px] h-full bg-slate-300" />
            </div>
            <span className="text-[7px] text-emerald-200/60 font-mono mt-0.5">Notlar</span>
          </div>

          {/* Center: Modern Minimalist Brass Banker's Lamp */}
          <div className="relative flex flex-col items-center select-none pointer-events-none">
            {/* Diffused Warm Ambient Light Cone */}
            <div className="absolute -top-4 w-24 h-16 rounded-full desk-lamp-glow pointer-events-none" />

            {/* Lamp Shade with Warm Glow */}
            <div className="w-11 h-3.5 rounded-full bg-emerald-800 border border-emerald-400/60 shadow-md flex items-center justify-center relative z-10">
              <div className="w-7 h-1 bg-amber-200 rounded-full blur-[0.5px]" />
            </div>
            {/* Brass Stand & Weighted Base */}
            <div className="w-1 h-5 bg-gradient-to-b from-amber-400 to-amber-600 shadow" />
            <div className="w-7 h-1.5 rounded-full bg-gradient-to-r from-amber-600 via-amber-300 to-amber-600 shadow border border-amber-700/60" />
          </div>

          {/* Right Ornament: Quiet Coffee / Tea Mug */}
          <div className="flex flex-col items-center opacity-75 select-none pointer-events-none">
            <div className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-600/60 border border-amber-300/40" />
            </div>
            <span className="text-[7px] text-emerald-200/60 font-mono mt-0.5">Kahve</span>
          </div>
        </div>
      </div>

      {/* Bottom 2 Seats (Seat 2 & Seat 3) */}
      <div className="flex justify-around items-start w-full gap-5 mt-2 z-10">
        <StudySeat
          tableId={table.id}
          seatIndex={2}
          occupant={seats[2]}
          onSeatClick={onSeatClick}
          onLeaveClick={onLeaveClick}
        />
        <StudySeat
          tableId={table.id}
          seatIndex={3}
          occupant={seats[3]}
          onSeatClick={onSeatClick}
          onLeaveClick={onLeaveClick}
        />
      </div>
    </div>
  );
};
