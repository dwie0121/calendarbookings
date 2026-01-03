import { StudioEvent, Staff, ActivityLog } from '../types';

const TABLES = {
  EVENTS: 'db_events',
  STAFF: 'db_staff',
  LOGS: 'db_logs',
  BACKUP: 'db_backup',
  MIGRATIONS: 'db_migrations'
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

  async runMigration(name: string): Promise<boolean> {
    // Ensure all tables exist
    if (!localStorage.getItem(TABLES.EVENTS)) localStorage.setItem(TABLES.EVENTS, '[]');
    if (!localStorage.getItem(TABLES.STAFF)) localStorage.setItem(TABLES.STAFF, '[]');
    if (!localStorage.getItem(TABLES.LOGS)) localStorage.setItem(TABLES.LOGS, '[]');
    
    // Log the migration
    const migrations = await this.query<any>(TABLES.MIGRATIONS);
    const newMigration = {
      id: Date.now().toString(),
      name,
      appliedAt: new Date().toISOString()
    };
    await this.commit(TABLES.MIGRATIONS, [...migrations, newMigration]);
    return true;
  }

  async getMigrations(): Promise<any[]> {
    return this.query(TABLES.MIGRATIONS);
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

  async restoreLastState(): Promise<boolean> {
    return this.restore();
  }

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

export const db = new LocalEngine();
export { TABLES };
