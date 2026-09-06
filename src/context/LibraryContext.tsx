import React, { createContext, useContext, useState, useEffect } from 'react';
import { LibraryTable, SeatOccupant, SeatIndex } from '../types/library';
import { presenceService } from '../services/presenceService';
import { useAuth } from './AuthContext';
import { usePomodoro } from './PomodoroContext';

interface LibraryContextType {
  tables: LibraryTable[];
  mySeat: { tableId: number; seatIndex: number } | null;
  totalActiveCount: number;
  sitAtSeat: (tableId: number, seatIndex: SeatIndex, task: string, durationMinutes: number) => boolean;
  leaveSeat: (targetTableId?: number, targetSeatIndex?: number) => void;
  sendReaction: (emoji: string) => void;
  selectedSeatForModal: { tableId: number; seatIndex: SeatIndex } | null;
  setSelectedSeatForModal: (val: { tableId: number; seatIndex: SeatIndex } | null) => void;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export const LibraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tables, setTables] = useState<LibraryTable[]>([]);
  const [mySeat, setMySeat] = useState<{ tableId: number; seatIndex: number } | null>(null);
  const [selectedSeatForModal, setSelectedSeatForModal] = useState<{ tableId: number; seatIndex: SeatIndex } | null>(null);

  const { user } = useAuth();
  const { isRunning, isWorkTime, remainingSeconds, totalSeconds, currentTask, resetTimer } = usePomodoro();

  useEffect(() => {
    const unsub = presenceService.subscribe((updatedTables) => {
      setTables(updatedTables);
      let seat = presenceService.getMySeat();
      if (!seat && user) {
        seat = presenceService.findSeatForUser(user.uid);
      }
      setMySeat(seat);
    });
    return () => unsub();
  }, [user?.uid]);

  // Calculate total active students in the library
  const totalActiveCount = tables.reduce((acc, table) => {
    return acc + table.seats.filter(s => s !== null).length;
  }, 0);

  // Sync active pomodoro state to occupant record
  useEffect(() => {
    if (mySeat) {
      presenceService.updateMySeatStatus({
        characterState: isRunning ? (isWorkTime ? 'working' : 'break') : 'idle',
        remainingSeconds,
        currentTask,
        sessionType: isWorkTime ? 'Çalışma' : 'Mola'
      });
    }
  }, [isRunning, isWorkTime, remainingSeconds, currentTask, mySeat]);

  const sitAtSeat = (tableId: number, seatIndex: SeatIndex, task: string, durationMinutes: number): boolean => {
    if (!user) return false;

    const occupant: SeatOccupant = {
      uid: user.uid,
      displayName: user.displayName || 'Öğrenci',
      avatar: user.avatar,
      characterState: 'working',
      currentTask: task || 'Odaklanma',
      startedAt: Date.now(),
      durationSeconds: durationMinutes * 60,
      remainingSeconds: durationMinutes * 60,
      sessionType: 'Çalışma'
    };

    const ok = presenceService.sitDown(tableId, seatIndex, occupant);
    if (ok) {
      setMySeat({ tableId, seatIndex });
    }
    return ok;
  };

  const leaveSeat = (targetTableId?: number, targetSeatIndex?: number) => {
    if (targetTableId !== undefined && targetSeatIndex !== undefined) {
      presenceService.leaveSeat(targetTableId, targetSeatIndex, user?.uid);
    } else if (mySeat) {
      presenceService.leaveSeat(mySeat.tableId, mySeat.seatIndex, user?.uid);
    } else if (user) {
      presenceService.leaveAllSeatsForUser(user.uid);
    }
    setMySeat(null);
    resetTimer();
  };

  const sendReaction = (emoji: string) => {
    if (user && mySeat) {
      presenceService.sendReaction(emoji, user.uid, user.displayName);
    }
  };

  return (
    <LibraryContext.Provider
      value={{
        tables,
        mySeat,
        totalActiveCount,
        sitAtSeat,
        leaveSeat,
        sendReaction,
        selectedSeatForModal,
        setSelectedSeatForModal,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
};

export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (!context) throw new Error('useLibrary must be used within LibraryProvider');
  return context;
};
