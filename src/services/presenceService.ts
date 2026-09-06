import { LibraryTable, SeatOccupant, TableReaction } from '../types/library';
import { rtdb, firestore, isFirebaseConfigured } from './firebase';
import { ref, onValue, set, remove, onDisconnect } from 'firebase/database';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

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

    // Window beforeunload and pagehide hooks to release seat on tab close / navigation
    if (typeof window !== 'undefined') {
      const handleUnload = () => {
        if (this.mySeat) {
          this.leaveSeat(this.mySeat.tableId, this.mySeat.seatIndex);
        }
      };
      window.addEventListener('beforeunload', handleUnload);
      window.addEventListener('pagehide', handleUnload);
    }
  }

  private normalizeTables(rawTables: any[]): LibraryTable[] {
    const initial = createInitialTables();
    if (!Array.isArray(rawTables)) return initial;

    return initial.map((initTable, idx) => {
      const rawTable = rawTables[idx] || rawTables.find((t: any) => t && t.id === initTable.id);
      if (!rawTable) return initTable;

      const rawSeats = Array.isArray(rawTable.seats) ? rawTable.seats : [];
      const seats: (SeatOccupant | null)[] = [
        rawSeats[0] || null,
        rawSeats[1] || null,
        rawSeats[2] || null,
        rawSeats[3] || null,
      ];

      return {
        id: initTable.id,
        number: initTable.number,
        name: rawTable.name || initTable.name,
        seats,
      };
    });
  }

  private cleanStaleOccupants() {
    const now = Date.now();
    let changed = false;
    for (const table of this.tables) {
      for (let s = 0; s < table.seats.length; s++) {
        const occupant = table.seats[s];
        if (occupant) {
          const maxLifeMs = ((occupant.durationSeconds || 1500) + 1800) * 1000;
          if (now - occupant.startedAt > maxLifeMs) {
            table.seats[s] = null;
            changed = true;
          }
        }
      }
    }
    if (changed) {
      this.saveToStorage();
    }
  }

  private loadFromStorage() {
    try {
      const saved = localStorage.getItem(`room_tables_${this.currentRoomId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.tables = this.normalizeTables(parsed);
      }
      this.cleanStaleOccupants();

      // Load saved seat
      const savedMySeat = localStorage.getItem(`room_my_seat_${this.currentRoomId}`);
      if (savedMySeat) {
        const seat = JSON.parse(savedMySeat);
        if (seat && typeof seat.tableId === 'number' && typeof seat.seatIndex === 'number') {
          const table = this.tables.find(t => t.id === seat.tableId);
          if (table && table.seats[seat.seatIndex]) {
            this.mySeat = seat;
          } else {
            localStorage.removeItem(`room_my_seat_${this.currentRoomId}`);
            this.mySeat = null;
          }
        }
      }
    } catch {
      this.tables = createInitialTables();
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
    // 1. Realtime Database Listener
    if (isFirebaseConfigured && rtdb) {
      try {
        const roomRef = ref(rtdb, `rooms/${this.currentRoomId}`);
        onValue(roomRef, (snapshot) => {
          const data = snapshot.val();
          if (data && data.tables) {
            this.tables = this.normalizeTables(data.tables);
            this.saveToStorage();
            this.notifySubscribers();
          }
        }, (error) => {
          console.warn('[Firebase RTDB] Okuma izni reddedildi veya hata:', error);
        });
      } catch (err) {
        console.warn('[Firebase RTDB] Listener hatası:', err);
      }
    }

    // 2. Cloud Firestore Real-time Listener (Hybrid fallback & cross-sync)
    if (isFirebaseConfigured && firestore) {
      try {
        const roomDocRef = doc(firestore, 'rooms', this.currentRoomId);
        onSnapshot(roomDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data && data.tables) {
              this.tables = this.normalizeTables(data.tables);
              this.saveToStorage();
              this.notifySubscribers();
            }
          }
        }, (error) => {
          console.warn('[Firebase Firestore] Okuma izni reddedildi veya hata:', error);
        });
      } catch (err) {
        console.warn('[Firebase Firestore] Listener hatası:', err);
      }
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

    // 1. Realtime Database write
    if (isFirebaseConfigured && rtdb) {
      try {
        const tableRef = ref(rtdb, `rooms/${payload.roomId}/tables/${payload.tableId - 1}/seats/${payload.seatIndex}`);
        if (payload.type === 'SEAT_LEAVE') {
          remove(tableRef).catch(e => console.warn('[Firebase RTDB] Koltuk silme hatası:', e));
        } else if (payload.occupant) {
          set(tableRef, payload.occupant).catch(e => console.warn('[Firebase RTDB] Koltuk güncelleme hatası:', e));
          try {
            onDisconnect(tableRef).remove();
          } catch {}
        }
      } catch (err) {
        console.warn('[Firebase RTDB] Broadcast hatası:', err);
      }
    }

    // 2. Cloud Firestore write (Sync entire room state so any client receives update instantly)
    if (isFirebaseConfigured && firestore) {
      try {
        const roomDocRef = doc(firestore, 'rooms', payload.roomId);
        setDoc(roomDocRef, {
          tables: this.tables,
          lastUpdated: Date.now()
        }, { merge: true }).catch(e => {
          console.warn('[Firebase Firestore] Masa güncelleme hatası (Kuralları kontrol edin):', e);
        });
      } catch (err) {
        console.warn('[Firebase Firestore] Broadcast hatası:', err);
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

  public sitDown(tableId: number, seatIndex: number, occupant: SeatOccupant): boolean {
    const table = this.tables.find(t => t.id === tableId);
    if (!table) return false;

    // Check if seat already taken by someone else (allow if expired)
    const existing = table.seats[seatIndex];
    if (existing && existing.uid !== occupant.uid) {
      const isExpired = Date.now() - existing.startedAt > ((existing.durationSeconds || 1500) + 600) * 1000;
      if (!isExpired) {
        return false;
      }
    }

    // Step 1: Clean any existing seat belonging to this user across all tables
    for (const t of this.tables) {
      for (let s = 0; s < t.seats.length; s++) {
        if (t.seats[s]?.uid === occupant.uid) {
          t.seats[s] = null;
          this.broadcast({
            type: 'SEAT_LEAVE',
            roomId: this.currentRoomId,
            tableId: t.id,
            seatIndex: s
          });
        }
      }
    }

    // Step 2: Occupy the requested seat
    table.seats[seatIndex] = occupant;
    this.mySeat = { tableId, seatIndex };

    // Step 3: Persist both tables and mySeat
    this.saveToStorage();
    try {
      localStorage.setItem(`room_my_seat_${this.currentRoomId}`, JSON.stringify(this.mySeat));
    } catch {}

    // Step 4: Notify React and peers
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

  public leaveSeat(tableId?: number, seatIndex?: number, uid?: string) {
    // 1. If explicit table and seat specified, vacate it
    if (tableId !== undefined && seatIndex !== undefined) {
      const table = this.tables.find(t => t.id === tableId);
      if (table && table.seats[seatIndex]) {
        table.seats[seatIndex] = null;
      }
      this.broadcast({
        type: 'SEAT_LEAVE',
        roomId: this.currentRoomId,
        tableId,
        seatIndex
      });
    }

    // 2. If uid provided, vacate any seat matching this uid across all tables
    if (uid) {
      for (const t of this.tables) {
        for (let s = 0; s < t.seats.length; s++) {
          if (t.seats[s]?.uid === uid) {
            t.seats[s] = null;
            this.broadcast({
              type: 'SEAT_LEAVE',
              roomId: this.currentRoomId,
              tableId: t.id,
              seatIndex: s
            });
          }
        }
      }
    }

    // 3. Clear mySeat reference if it matched or if no specific seat was given
    if (
      (tableId === undefined && seatIndex === undefined) ||
      (this.mySeat && tableId === this.mySeat.tableId && seatIndex === this.mySeat.seatIndex) ||
      uid
    ) {
      this.mySeat = null;
      this.stopHeartbeat();
      try {
        localStorage.removeItem(`room_my_seat_${this.currentRoomId}`);
      } catch {}
    }

    this.saveToStorage();
    this.notifySubscribers();
  }

  public leaveAllSeatsForUser(uid: string) {
    this.leaveSeat(undefined, undefined, uid);
  }

  public findSeatForUser(uid: string): { tableId: number; seatIndex: number } | null {
    if (!uid) return null;
    for (const table of this.tables) {
      for (let s = 0; s < table.seats.length; s++) {
        if (table.seats[s]?.uid === uid) {
          this.mySeat = { tableId: table.id, seatIndex: s };
          try {
            localStorage.setItem(`room_my_seat_${this.currentRoomId}`, JSON.stringify(this.mySeat));
          } catch {}
          return this.mySeat;
        }
      }
    }
    return null;
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
