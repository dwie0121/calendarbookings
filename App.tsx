import React, { useState, useEffect } from 'react';
import { Staff, StudioEvent, ViewMode, ActivityLog } from './types';
import { Icons } from './constants';
import { prisma } from './lib/prisma';
import DashboardView from './components/DashboardView';
import CalendarView from './components/CalendarView';
import StaffView from './components/StaffView';
import ActivityLogsView from './components/ActivityLogsView';

const DEFAULT_USER: Staff = {
  id: 'system-admin',
  name: 'Studio Manager',
  contact: 'Administrative',
  baseDesignation: 'Studio Owner',
  isAdmin: true
};

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewMode>('dashboard');
  const [events, setEvents] = useState<StudioEvent[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Sign-in options removed: App now uses a persistent administrative session.
  const currentUser = DEFAULT_USER;

  useEffect(() => {
    const init = async () => {
      try {
        const [evs, stf, lgs] = await Promise.all([
          prisma.event.findMany(),
          prisma.staff.findMany(),
          prisma.log.findMany()
        ]);
        setEvents(evs);
        setStaff(stf);
        setLogs(lgs);
        
        // Ensure the default user exists in the staff list if it's empty
        if (stf.length === 0) {
          await prisma.staff.create(DEFAULT_USER);
          setStaff([DEFAULT_USER]);
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error("Initialization failed:", error);
        setIsInitialized(true); 
      }
    };
    init();
  }, []);

  const logActivity = async (action: string, details: string) => {
    const newLog: ActivityLog = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.name,
      action,
      details,
      timestamp: new Date().toISOString(),
    };
    await prisma.log.create(newLog);
    const updatedLogs = await prisma.log.findMany();
    setLogs(updatedLogs);
  };

  const addEvent = async (event: StudioEvent) => {
    await prisma.event.create(event);
    setEvents(await prisma.event.findMany());
    logActivity('Added Booking', `Created: ${event.title}`);
  };

  const updateEvent = async (updatedEvent: StudioEvent) => {
    await prisma.event.update(updatedEvent.id, updatedEvent);
    setEvents(await prisma.event.findMany());
    logActivity('Updated Booking', `Modified: ${updatedEvent.title}`);
  };

  const deleteEvent = async (id: string) => {
    const event = events.find(e => e.id === id);
    await prisma.event.delete(id);
    setEvents(await prisma.event.findMany());
    logActivity('Deleted Booking', `Removed: ${event?.title || id}`);
  };

  const addStaff = async (s: Staff) => {
    await prisma.staff.create(s);
    setStaff(await prisma.staff.findMany());
    logActivity('Added Team Member', `Added: ${s.name}`);
  };

  const updateStaff = async (updatedMember: Staff) => {
    await prisma.staff.update(updatedMember.id, updatedMember);
    setStaff(await prisma.staff.findMany());
    logActivity('Updated Team Member', `Modified: ${updatedMember.name}`);
  };

  const deleteStaff = async (id: string) => {
    if (!window.confirm("Permanently remove this team member? All historical data remains.")) return;
    const member = staff.find(s => s.id === id);
    await prisma.staff.delete(id);
    setStaff(await prisma.staff.findMany());
    logActivity('Deleted Team Member', `Removed: ${member?.name || id}`);
  };

  if (!isInitialized) return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-6">
      <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-indigo-400 font-black uppercase tracking-[0.4em] text-[10px]">Synchronizing Studio Data</p>
    </div>
  );

  const NavItem = ({ icon: Icon, label, id, adminOnly }: { icon: any, label: string, id: ViewMode, adminOnly?: boolean }) => {
    if (adminOnly && !currentUser?.isAdmin) return null;
    return (
      <button 
        onClick={() => setActiveView(id)}
        className={`flex flex-col items-center justify-center py-2 px-8 transition-all relative group ${
          activeView === id ? 'text-indigo-600' : 'text-slate-400 hover:text-indigo-400'
        }`}
      >
        <Icon size={22} className={`mb-1.5 transition-transform duration-500 ${activeView === id ? 'scale-110 -translate-y-0.5' : 'group-hover:scale-105'}`} />
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">{label}</span>
        {activeView === id && (
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-1 bg-indigo-600 rounded-t-full shadow-[0_-4px_10px_rgba(79,70,229,0.4)]" />
        )}
      </button>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-indigo-100">
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-[1440px] mx-auto px-8 flex items-center justify-between h-24">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[1.25rem] flex items-center justify-center text-white font-black text-2xl rotate-3 shadow-xl shadow-indigo-100/50">K</div>
            <div className="hidden lg:block">
              <h1 className="font-black text-xl text-slate-900 tracking-tight uppercase">Kean Drew Studio</h1>
              <div className="flex items-center gap-2.5 mt-0.5">
                 <span className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-600">
                  System Administrator
                </span>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{currentUser.name}</span>
              </div>
            </div>
          </div>
          
          <nav className="flex items-center bg-slate-100/50 rounded-[2rem] p-1.5 border border-slate-200/50">
            <NavItem id="dashboard" icon={Icons.Dashboard} label="Pulse" />
            <NavItem id="calendar" icon={Icons.Calendar} label="Bookings" />
            <NavItem id="staff" icon={Icons.Staff} label="Crew" />
            <NavItem id="logs" icon={Icons.Work} label="Vault" adminOnly />
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-8 py-12">
        <div className="animate-fadeIn transition-opacity duration-500">
          {activeView === 'dashboard' && <DashboardView events={events} staff={staff} />}
          {activeView === 'calendar' && (
            <CalendarView 
              events={events} 
              staff={staff} 
              isAdmin={currentUser.isAdmin}
              onAddEvent={addEvent} 
              onUpdateEvent={updateEvent} 
              onDeleteEvent={deleteEvent} 
            />
          )}
          {activeView === 'staff' && (
            <StaffView 
              staff={staff} 
              events={events}
              isAdmin={currentUser.isAdmin}
              onAddStaff={addStaff} 
              onUpdateStaff={updateStaff} 
              onDeleteStaff={deleteStaff} 
              onUpdateEvent={updateEvent}
            />
          )}
          {activeView === 'logs' && currentUser.isAdmin && <ActivityLogsView logs={logs} />}
        </div>
      </main>

      <footer className="max-w-[1440px] mx-auto w-full px-8 py-16 text-center">
        <div className="h-px bg-slate-100 mb-10 w-full" />
        <p className="text-[10px] font-black uppercase tracking-[0.6em] text-slate-300">
          Kean Drew Studio • Prisma Engine v1.0 • Built-in SQL Persistence
        </p>
      </footer>
    </div>
  );
};

export default App;