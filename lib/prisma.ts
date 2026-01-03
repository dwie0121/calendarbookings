
import { db, TABLES } from './db';
import { StudioEvent, Staff, ActivityLog } from '../types';

/**
 * MOCK PRISMA CLIENT
 * This simulates the Prisma API used in the 'prisma-postgres' template.
 * Switch the 'db' calls to 'supabase' calls when ready.
 */
export const prisma = {
  event: {
    findMany: async () => db.query<StudioEvent>(TABLES.EVENTS),
    create: async (data: StudioEvent) => {
      const all = await db.query<StudioEvent>(TABLES.EVENTS);
      const updated = [...all, data];
      await db.commit(TABLES.EVENTS, updated);
      return data;
    },
    update: async (id: string, data: Partial<StudioEvent>) => {
      const all = await db.query<StudioEvent>(TABLES.EVENTS);
      const updated = all.map(e => e.id === id ? { ...e, ...data } : e);
      await db.commit(TABLES.EVENTS, updated);
      return updated.find(e => e.id === id);
    },
    delete: async (id: string) => {
      const all = await db.query<StudioEvent>(TABLES.EVENTS);
      const updated = all.filter(e => e.id !== id);
      await db.commit(TABLES.EVENTS, updated);
      return true;
    }
  },
  staff: {
    findMany: async () => db.query<Staff>(TABLES.STAFF),
    create: async (data: Staff) => {
      const all = await db.query<Staff>(TABLES.STAFF);
      const updated = [...all, data];
      await db.commit(TABLES.STAFF, updated);
      return data;
    },
    update: async (id: string, data: Partial<Staff>) => {
      const all = await db.query<Staff>(TABLES.STAFF);
      const updated = all.map(s => s.id === id ? { ...s, ...data } : s);
      await db.commit(TABLES.STAFF, updated);
      return updated.find(s => s.id === id);
    },
    delete: async (id: string) => {
      const all = await db.query<Staff>(TABLES.STAFF);
      const updated = all.filter(s => s.id !== id);
      await db.commit(TABLES.STAFF, updated);
      return true;
    }
  },
  log: {
    findMany: async () => db.query<ActivityLog>(TABLES.LOGS),
    create: async (data: ActivityLog) => {
      const all = await db.query<ActivityLog>(TABLES.LOGS);
      const updated = [data, ...all].slice(0, 100);
      await db.commit(TABLES.LOGS, updated);
      return data;
    }
  }
};
