import { StudioEvent, Staff, ActivityLog } from '../types';

const STORAGE_KEYS = {
  EVENTS: 'kean_drew_events_v1',
  STAFF: 'kean_drew_staff_v1',
  LOGS: 'kean_drew_logs_v1',
  USER: 'kean_drew_user_v1'
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

  // Auth/Session (Temporary for MVP)
  getCurrentUser(): Staff | null {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    return data ? JSON.parse(data) : null;
  }
  setCurrentUser(user: Staff | null): void {
    if (user) localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEYS.USER);
  }
}

export const db = new LocalDB();