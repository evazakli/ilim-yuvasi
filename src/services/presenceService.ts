import { LibraryTable, SeatOccupant, TableReaction } from '../types/library';
import { rtdb, isFirebaseConfigured } from './firebase';
import { ref, onValue, set, remove, onDisconnect, off } from 'firebase/database';

export interface RoomSyncPayload {
  type: 'SEAT_UPDATE' | 'SEAT_LEAVE' | 'REACTION' | 'HEARTBEAT';
  roomId: string;
  tableId: number;
  seatIndex: number;
  occupant?: SeatOccupant | null;
  reaction?: TableReaction;
}

const TOTAL_TABLES = 8;

export function createInitialTables(): LibraryTable[] {
  const tables: LibraryTable[] = [];
  for (let i = 1; i <= TOTAL_TABLES; i++) {
    tables.push({
      id: i,
      number: i,
      name: `Masa ${i}`,
      seats: [null, null, null, null]
    });
  }
  return tables;
}

class PresenceService {
  private channel: BroadcastChannel | null = null;
  private currentRoomId = 'salon_1';
  private tables: LibraryTable[] = createInitialTables();
  private subscribers: Set<(tables: LibraryTable[]) => void> = new Set();
  private mySeat: { tableId: number; seatIndex: number } | null = null;
  private heartbeatTimer: number | null = null;

  constructor() {
    this.initBroadcastChannel();
    this.loadFromStorage();
    this.initFirebaseListeners();
  }

  private initBroadcastChannel() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel('virtual_library_presence');
      this.channel.onmessage = (event) => {
        this.handleRemoteMessage(event.data);
      };
    }

    // Window beforeunload hook to release seat immediately
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        if (this.mySeat) {
          this.leaveSeat(this.mySeat.tableId, this.mySeat.seatIndex);
        }
      });
    }
  }

  private loadFromStorage() {
    try {
      const saved = localStorage.getItem(`room_tables_${this.currentRoomId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === TOTAL_TABLES) {
          this.tables = parsed;
        }
      }
    } catch {
      // fallback to initial
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(`room_tables_${this.currentRoomId}`, JSON.stringify(this.tables));
    } catch {
      // ignore
    }
  }

  private initFirebaseListeners() {
    if (isFirebaseConfigured && rtdb) {
      const roomRef = ref(rtdb, `rooms/${this.currentRoomId}`);
      onValue(roomRef, (snapshot) => {
        const data = snapshot.val();
        if (data && data.tables) {
          this.tables = data.tables;
          this.saveToStorage();
          this.notifySubscribers();
        }
      });
    }
  }

  public subscribe(callback: (tables: LibraryTable[]) => void): () => void {
    this.subscribers.add(callback);
    callback(this.tables);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  private notifySubscribers() {
    this.subscribers.forEach(cb => cb([...this.tables]));
  }

  private broadcast(payload: RoomSyncPayload) {
    if (this.channel) {
      this.channel.postMessage(payload);
    }

    if (isFirebaseConfigured && rtdb) {
      const tableRef = ref(rtdb, `rooms/${payload.roomId}/tables/${payload.tableId - 1}/seats/${payload.seatIndex}`);
      if (payload.type === 'SEAT_LEAVE') {
        remove(tableRef).catch(console.warn);
      } else if (payload.occupant) {
        set(tableRef, payload.occupant).catch(console.warn);
        onDisconnect(tableRef).remove();
      }
    }
  }

  private handleRemoteMessage(payload: RoomSyncPayload) {
    if (payload.roomId !== this.currentRoomId) return;

    const table = this.tables.find(t => t.id === payload.tableId);
    if (!table) return;

    if (payload.type === 'SEAT_UPDATE' || payload.type === 'HEARTBEAT') {
      if (payload.occupant) {
        table.seats[payload.seatIndex] = payload.occupant;
      }
    } else if (payload.type === 'SEAT_LEAVE') {
      table.seats[payload.seatIndex] = null;
    } else if (payload.type === 'REACTION' && payload.reaction) {
      const occupant = table.seats[payload.seatIndex];
      if (occupant) {
        occupant.activeReaction = payload.reaction;
      }
    }

    this.saveToStorage();
    this.notifySubscribers();
  }

  public sitDown(tableId: number, seatIndex: number, occupant: SeatOccupant) {
    const table = this.tables.find(t => t.id === tableId);
    if (!table) return false;

    // If seat already taken by someone else
    if (table.seats[seatIndex] && table.seats[seatIndex]?.uid !== occupant.uid) {
      return false;
    }

    // Leave existing seat if already seated elsewhere
    if (this.mySeat) {
      this.leaveSeat(this.mySeat.tableId, this.mySeat.seatIndex);
    }

    table.seats[seatIndex] = occupant;
    this.mySeat = { tableId, seatIndex };
    this.saveToStorage();
    this.notifySubscribers();

    this.broadcast({
      type: 'SEAT_UPDATE',
      roomId: this.currentRoomId,
      tableId,
      seatIndex,
      occupant
    });

    this.startHeartbeat();
    return true;
  }

  public updateMySeatStatus(occupant: Partial<SeatOccupant>) {
    if (!this.mySeat) return;
    const { tableId, seatIndex } = this.mySeat;
    const table = this.tables.find(t => t.id === tableId);
    if (!table || !table.seats[seatIndex]) return;

    table.seats[seatIndex] = {
      ...table.seats[seatIndex]!,
      ...occupant
    };

    this.saveToStorage();
    this.notifySubscribers();

    this.broadcast({
      type: 'SEAT_UPDATE',
      roomId: this.currentRoomId,
      tableId,
      seatIndex,
      occupant: table.seats[seatIndex]
    });
  }

  public sendReaction(emoji: string, senderUid: string, senderName: string) {
    if (!this.mySeat) return;
    const { tableId, seatIndex } = this.mySeat;
    const reaction: TableReaction = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      senderUid,
      senderName,
      emoji,
      timestamp: Date.now()
    };

    const table = this.tables.find(t => t.id === tableId);
    if (table && table.seats[seatIndex]) {
      table.seats[seatIndex]!.activeReaction = reaction;
      this.notifySubscribers();
    }

    this.broadcast({
      type: 'REACTION',
      roomId: this.currentRoomId,
      tableId,
      seatIndex,
      reaction
    });

    // Clear reaction after 3 seconds
    setTimeout(() => {
      if (table && table.seats[seatIndex]?.activeReaction?.id === reaction.id) {
        delete table.seats[seatIndex]!.activeReaction;
        this.notifySubscribers();
      }
    }, 3000);
  }

  public leaveSeat(tableId: number, seatIndex: number) {
    const table = this.tables.find(t => t.id === tableId);
    if (table) {
      table.seats[seatIndex] = null;
    }

    if (this.mySeat?.tableId === tableId && this.mySeat?.seatIndex === seatIndex) {
      this.mySeat = null;
      this.stopHeartbeat();
    }

    this.saveToStorage();
    this.notifySubscribers();

    this.broadcast({
      type: 'SEAT_LEAVE',
      roomId: this.currentRoomId,
      tableId,
      seatIndex
    });
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatTimer = window.setInterval(() => {
      if (this.mySeat) {
        const { tableId, seatIndex } = this.mySeat;
        const table = this.tables.find(t => t.id === tableId);
        const occupant = table?.seats[seatIndex];
        if (occupant) {
          this.broadcast({
            type: 'HEARTBEAT',
            roomId: this.currentRoomId,
            tableId,
            seatIndex,
            occupant
          });
        }
      }
    }, 15000);
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  public getMySeat(): { tableId: number; seatIndex: number } | null {
    return this.mySeat;
  }
}

export const presenceService = new PresenceService();
