import { StudioEvent, Staff, ActivityLog } from '../types';

const STORAGE_KEYS = {
  EVENTS: 'kean_drew_events_v1',
  STAFF: 'kean_drew_staff_v1',
  LOGS: 'kean_drew_logs_v1',
  USER: 'kean_drew_user_v1',
  BACKUP: 'kean_drew_backup_v1'
};

class LocalDB {
  private async get<T>(key: string): Promise<T[]> {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  private async save<T>(key: string, data: T[]): Promise<void> {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // Events
  async getEvents(): Promise<StudioEvent[]> {
    return this.get<StudioEvent>(STORAGE_KEYS.EVENTS);
  }
  async saveEvents(events: StudioEvent[]): Promise<void> {
    await this.save(STORAGE_KEYS.EVENTS, events);
    // Auto-create a rolling "last known good state" backup
    this.createAutoBackup();
  }

  // Staff
  async getStaff(): Promise<Staff[]> {
    return this.get<Staff>(STORAGE_KEYS.STAFF);
  }
  async saveStaff(staff: Staff[]): Promise<void> {
    await this.save(STORAGE_KEYS.STAFF, staff);
  }

  // Logs
  async getLogs(): Promise<ActivityLog[]> {
    return this.get<ActivityLog>(STORAGE_KEYS.LOGS);
  }
  async saveLogs(logs: ActivityLog[]): Promise<void> {
    await this.save(STORAGE_KEYS.LOGS, logs);
  }

  // Auth/Session
  getCurrentUser(): Staff | null {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    return data ? JSON.parse(data) : null;
  }
  setCurrentUser(user: Staff | null): void {
    if (user) localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEYS.USER);
  }

  // Backup & Restore
  private createAutoBackup() {
    const state = {
      events: localStorage.getItem(STORAGE_KEYS.EVENTS),
      staff: localStorage.getItem(STORAGE_KEYS.STAFF),
      logs: localStorage.getItem(STORAGE_KEYS.LOGS),
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.BACKUP, JSON.stringify(state));
  }

  async restoreLastState(): Promise<boolean> {
    const backup = localStorage.getItem(STORAGE_KEYS.BACKUP);
    if (!backup) return false;
    const { events, staff, logs } = JSON.parse(backup);
    if (events) localStorage.setItem(STORAGE_KEYS.EVENTS, events);
    if (staff) localStorage.setItem(STORAGE_KEYS.STAFF, staff);
    if (logs) localStorage.setItem(STORAGE_KEYS.LOGS, logs);
    return true;
  }

  exportData(): string {
    const data = {
      events: localStorage.getItem(STORAGE_KEYS.EVENTS),
      staff: localStorage.getItem(STORAGE_KEYS.STAFF),
      logs: localStorage.getItem(STORAGE_KEYS.LOGS),
      version: '1.0'
    };
    return JSON.stringify(data);
  }

  async importData(json: string): Promise<boolean> {
    try {
      const data = JSON.parse(json);
      if (data.events) localStorage.setItem(STORAGE_KEYS.EVENTS, data.events);
      if (data.staff) localStorage.setItem(STORAGE_KEYS.STAFF, data.staff);
      if (data.logs) localStorage.setItem(STORAGE_KEYS.LOGS, data.logs);
      return true;
    } catch (e) {
      return false;
    }
  }
}

export const db = new LocalDB();