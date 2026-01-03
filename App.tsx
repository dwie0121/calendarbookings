import React, { useState, useEffect } from 'react';
import { Staff, StudioEvent, ViewMode, ActivityLog } from './types';
import { Icons } from './constants';
import { db } from './lib/db';
import DashboardView from './components/DashboardView';
import CalendarView from './components/CalendarView';
import StaffView from './components/StaffView';
import ActivityLogsView from './components/ActivityLogsView';
import LoginView from './components/LoginView';

const ADMIN_PASSCODE = 'KEANDREW';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewMode>('dashboard');
  const [events, setEvents] = useState<StudioEvent[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [currentUser, setCurrentUser] = useState<Staff | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize data
  useEffect(() => {
    const init = async () => {
      const [evs, stf, lgs] = await Promise.all([
        db.getEvents(),
        db.getStaff(),
        db.getLogs()
      ]);
      setEvents(evs);
      setStaff(stf);
      setLogs(lgs);
      setCurrentUser(db.getCurrentUser());
      setIsInitialized(true);
    };
    init();
  }, []);

  const logActivity = async (action: string, details: string) => {
    if (!currentUser) return;
    const newLog: ActivityLog = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.name,
      action,
      details,
      timestamp: new Date().toISOString(),
    };
    const updatedLogs = [newLog, ...logs].slice(0, 100);
    setLogs(updatedLogs);
    await db.saveLogs(updatedLogs);
  };

  const addEvent = async (event: StudioEvent) => {
    const updated = [...events, event];
    setEvents(updated);
    await db.saveEvents(updated);
    logActivity('Added Booking', `Created: ${event.title}`);
  };

  const updateEvent = async (updatedEvent: StudioEvent) => {
    const updated = events.map(e => e.id === updatedEvent.id ? updatedEvent : e);
    setEvents(updated);
    await db.saveEvents(updated);
    logActivity('Updated Booking', `Modified: ${updatedEvent.title}`);
  };

  const deleteEvent = async (id: string) => {
    const event = events.find(e => e.id === id);
    const updated = events.filter(e => e.id !== id);
    setEvents(updated);
    await db.saveEvents(updated);
    logActivity('Deleted Booking', `Removed: ${event?.title || id}`);
  };

  const addStaff = async (s: Staff) => {
    const updated = [...staff, s];
    setStaff(updated);
    await db.saveStaff(updated);
    logActivity('Added Team Member', `Added: ${s.name}`);
  };

  const updateStaff = async (updatedMember: Staff) => {
    const updated = staff.map(s => s.id === updatedMember.id ? updatedMember : s);
    setStaff(updated);
    await db.saveStaff(updated);
    logActivity('Updated Team Member', `Modified: ${updatedMember.name}`);
  };

  const deleteStaff = async (id: string) => {
    if (!window.confirm("Are you sure? This will permanently remove this team member.")) return;
    const member = staff.find(s => s.id === id);
    const updated = staff.filter(s => s.id !== id);
    setStaff(updated);
    await db.saveStaff(updated);
    logActivity('Deleted Team Member', `Removed: ${member?.name || id}`);
  };

  const handleLogin = (name: string, passcode?: string) => {
    const isPasscodeCorrect = passcode?.toUpperCase() === ADMIN_PASSCODE;
    
    // Initial Setup
    if (staff.length === 0) {
      if (!isPasscodeCorrect) {
        alert("Enter the Admin Passcode (KEANDREW) to initialize your studio.");
        return;
      }
      const firstAdmin: Staff = {
        id: 'admin-' + Date.now(),
        name,
        contact: 'Studio Manager',
        baseDesignation: 'Studio Owner',
        isAdmin: true
      };
      setStaff([firstAdmin]);
      db.saveStaff([firstAdmin]);
      setCurrentUser(firstAdmin);
      db.setCurrentUser(firstAdmin);
      return;
    }

    const found = staff.find(s => s.name.toLowerCase().includes(name.toLowerCase()));
    if (found) {
      const user = { ...found, isAdmin: found.isAdmin || isPasscodeCorrect };
      setCurrentUser(user);
      db.setCurrentUser(user);
      logActivity('Login', `User ${found.name} signed in`);
    } else {
      alert("Name not found. Please contact an Admin to be added to the team.");
    }
  };

  const handleLogout = () => {
    logActivity('Logout', `${currentUser?.name} signed out`);
    setCurrentUser(null);
    db.setCurrentUser(null);
    setActiveView('dashboard');
  };

  if (!isInitialized) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!currentUser) return <LoginView onLogin={handleLogin} />;

  const NavItem = ({ icon: Icon, label, id, adminOnly }: { icon: any, label: string, id: ViewMode, adminOnly?: boolean }) => {
    if (adminOnly && !currentUser?.isAdmin) return null;
    return (
      <button 
        onClick={() => setActiveView(id)}
        className={`flex flex-col items-center justify-center py-2 px-6 transition-all relative group ${
          activeView === id ? 'text-indigo-600' : 'text-slate-400 hover:text-indigo-400'
        }`}
      >
        <Icon size={20} className={`mb-1 transition-transform ${activeView === id ? 'scale-110' : 'group-hover:scale-105'}`} />
        <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
        {activeView === id && (
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-indigo-600 rounded-t-full" />
        )}
      </button>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-indigo-100">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-20">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-xl flex items-center justify-center text-white font-black text-xl rotate-3 shadow-lg shadow-indigo-100">K</div>
            <div className="hidden sm:block">
              <h1 className="font-black text-lg text-slate-900 tracking-tight uppercase">Kean Drew Studio</h1>
              <div className="flex items-center gap-2">
                 <span className={`text-[9px] font-black uppercase tracking-widest ${currentUser.isAdmin ? 'text-indigo-600' : 'text-slate-400'}`}>
                  {currentUser.isAdmin ? 'Administrator' : 'Staff Access'}
                </span>
                <span className="w-1 h-1 rounded-full bg-emerald-500" />
                <span className="text-[9px] text-slate-500 font-bold uppercase">{currentUser.name}</span>
              </div>
            </div>
          </div>
          <nav className="flex items-center bg-slate-100/50 rounded-2xl p-1 border border-slate-200/50">
            <NavItem id="dashboard" icon={Icons.Dashboard} label="Pulse" />
            <NavItem id="calendar" icon={Icons.Calendar} label="Bookings" />
            <NavItem id="staff" icon={Icons.Staff} label="Team" />
            <NavItem id="logs" icon={Icons.Work} label="History" adminOnly />
            <button onClick={handleLogout} className="flex flex-col items-center justify-center py-2 px-6 text-slate-400 hover:text-rose-500 transition-colors">
              <Icons.Prev size={20} className="mb-1" />
              <span className="text-[10px] font-black uppercase tracking-widest">Exit</span>
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10">
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
      </main>

      <footer className="max-w-7xl mx-auto w-full px-6 py-10 text-center border-t border-slate-100">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Kean Drew Studio Manager • Engine v1.0 • Built-in DB</p>
      </footer>
    </div>
  );
};

export default App;