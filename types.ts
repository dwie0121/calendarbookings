
export type UserRole = 'admin' | 'staff';

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface Staff {
  id: string;
  name: string;
  contact: string;
  baseDesignation: string;
  isAdmin?: boolean;
}

export interface StaffAssignment {
  staffId: string;
  designation: string;
  fee: number;
  isPaid: boolean;
}

export interface StudioEvent {
  id: string;
  title: string;
  clientName: string;
  date: string; // ISO format
  startTime: string;
  endTime: string;
  revenue: number; // What the studio charges the client
  assignments: StaffAssignment[];
  notes?: string;
}

export type ViewMode = 'dashboard' | 'calendar' | 'staff' | 'logs';
export type CalendarViewType = 'month' | 'year' | 'list';
