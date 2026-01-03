
import { StudioEvent, Staff, ActivityLog } from '../types';

const TABLES = {
  EVENTS: 'db_events',
  STAFF: 'db_staff',
  LOGS: 'db_logs',
  BACKUP: 'db_backup'
};

class LocalEngine {
  async query<T>(table: string): Promise<T[]> {
    const data = localStorage.getItem(table);
    return data ? JSON.parse(data) : [];
  }

  async commit<T>(table: string, data: T[]): Promise<void> {
    localStorage.setItem(table, JSON.stringify(data));
    this.autoBackup();
  }

  private autoBackup() {
    const snapshot = {
      events: localStorage.getItem(TABLES.EVENTS),
      staff: localStorage.getItem(TABLES.STAFF),
      logs: localStorage.getItem(TABLES.LOGS),
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(TABLES.BACKUP, JSON.stringify(snapshot));
  }

  async restore(): Promise<boolean> {
    try {
      const backup = localStorage.getItem(TABLES.BACKUP);
      if (!backup) return false;
      const data = JSON.parse(backup);
      const { events, staff, logs } = data;
      if (events) localStorage.setItem(TABLES.EVENTS, events);
      if (staff) localStorage.setItem(TABLES.STAFF, staff);
      if (logs) localStorage.setItem(TABLES.LOGS, logs);
      return true;
    } catch (e) {
      console.error("Restore failed:", e);
      return false;
    }
  }

  // Added methods used in components/CalendarView.tsx
  async restoreLastState(): Promise<boolean> {
    return this.restore();
  }

  // Added methods used in components/ActivityLogsView.tsx
  exportData(): string {
    const snapshot = {
      events: localStorage.getItem(TABLES.EVENTS),
      staff: localStorage.getItem(TABLES.STAFF),
      logs: localStorage.getItem(TABLES.LOGS),
      timestamp: new Date().toISOString()
    };
    return JSON.stringify(snapshot);
  }

  async importData(json: string): Promise<boolean> {
    try {
      const data = JSON.parse(json);
      if (data.events) localStorage.setItem(TABLES.EVENTS, data.events);
      if (data.staff) localStorage.setItem(TABLES.STAFF, data.staff);
      if (data.logs) localStorage.setItem(TABLES.LOGS, data.logs);
      return true;
    } catch (e) {
      console.error("Import failed:", e);
      return false;
    }
  }
}

// Renamed from 'engine' to 'db' to match component imports
export const db = new LocalEngine();
export { TABLES };
