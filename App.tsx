
import React, { useState, useEffect } from 'react';
import { Staff, StudioEvent, ViewMode, ActivityLog } from './types';
import { Icons } from './constants';
import DashboardView from './components/DashboardView';
import CalendarView from './components/CalendarView';
import StaffView from './components/StaffView';
import ActivityLogsView from './components/ActivityLogsView';
import LoginView from './components/LoginView';

const STORAGE_KEY_EVENTS = 'kean_drew_events_v1';
const STORAGE_KEY_STAFF = 'kean_drew_staff_v1';
const STORAGE_KEY_LOGS = 'kean_drew_logs_v1';
const STORAGE_KEY_USER = 'kean_drew_current_user_v1';
const ADMIN_PASSCODE = 'KEANDREW';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewMode>('dashboard');
  const [events, setEvents] = useState<StudioEvent[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [currentUser, setCurrentUser] = useState<Staff | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Load data on mount
  useEffect(() => {
    try {
      const savedEvents = localStorage.getItem(STORAGE_KEY_EVENTS);
      const savedStaff = localStorage.getItem(STORAGE_KEY_STAFF);
      const savedLogs = localStorage.getItem(STORAGE_KEY_LOGS);
      const savedUser = localStorage.getItem(STORAGE_KEY_USER);

      if (savedEvents) setEvents(JSON.parse(savedEvents));
      if (savedStaff) setStaff(JSON.parse(savedStaff));
      if (savedLogs) setLogs(JSON.parse(savedLogs));
      if (savedUser) setCurrentUser(JSON.parse(savedUser));
      
      setLastSaved(new Date());
    } catch (e) {
      console.error("Failed to load data from local storage", e);
    }
  }, []);

  // Save data on change
  useEffect(() => {
    setIsSaving(true);
    const timeout = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(events));
      localStorage.setItem(STORAGE_KEY_STAFF, JSON.stringify(staff));
      localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
      if (currentUser) {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEY_USER);
      }
      setLastSaved(new Date());
      setIsSaving(false);
      
      setShowToast(true);
      const toastTimeout = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(toastTimeout);
    }, 800);
    return () => clearTimeout(timeout);
  }, [events, staff, logs, currentUser]);

  const logActivity = (action: string, details: string) => {
    if (!currentUser) return;
    const newLog: ActivityLog = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.name,
      action,
      details,
      timestamp: new Date().toISOString(),
    };
    setLogs(prev => [newLog, ...prev].slice(0, 500));
  };

  const addEvent = (event: StudioEvent) => {
    setEvents(prev => [...prev, event]);
    logActivity('Added Booking', `Created booking: ${event.title}`);
  };

  const updateEvent = (updated: StudioEvent) => {
    setEvents(prev => prev.map(e => e.id === updated.id ? updated : e));
    logActivity('Updated Booking', `Modified booking: ${updated.title}`);
  };

  const deleteEvent = (id: string) => {
    const event = events.find(e => e.id === id);
    setEvents(prev => prev.filter(e => e.id !== id));
    logActivity('Deleted Booking', `Removed booking: ${event?.title || id}`);
  };

  const addStaff = (s: Staff) => {
    setStaff(prev => [...prev, s]);
    logActivity('Added Team Member', `Added new staff: ${s.name}`);
  };

  const updateStaff = (updated: Staff) => {
    setStaff(prev => prev.map(s => s.id === updated.id ? updated : s));
    logActivity('Updated Team Member', `Modified staff details: ${updated.name}`);
  };

  const deleteStaff = (id: string) => {
    if (!window.confirm("Are you sure? This will remove this staff member from all future assignments.")) return;
    const member = staff.find(s => s.id === id);
    setStaff(prev => prev.filter(s => s.id !== id));
    setEvents(prev => prev.map(e => ({
      ...e,
      assignments: e.assignments.filter(a => a.staffId !== id)
    })));
    logActivity('Deleted Team Member', `Removed staff: ${member?.name || id}`);
  };

  const handleLogin = (name: string, passcode?: string) => {
    const isPasscodeCorrect = passcode === ADMIN_PASSCODE;

    // First user setup
    if (staff.length === 0) {
      if (!isPasscodeCorrect) {
        alert("Enter the valid Admin Passcode (KEANDREW) to setup the studio owner account.");
        return;
      }
      const firstAdmin: Staff = {
        id: 'admin-' + Date.now(),
        name,
        contact: 'Primary Owner',
        baseDesignation: 'Studio Owner',
        isAdmin: true
      };
      setStaff([firstAdmin]);
      setCurrentUser(firstAdmin);
      logActivity('Initial Login', 'First user registered as Admin with verified key');
      return;
    }

    // Existing user matching
    const found = staff.find(s => s.name.toLowerCase().includes(name.toLowerCase()));
    
    if (found) {
      // If they provide the correct passcode, ensure they have admin rights for the session
      const userToLogin = { ...found, isAdmin: found.isAdmin || isPasscodeCorrect };
      setCurrentUser(userToLogin);
      logActivity('Login', `User ${found.name} signed in ${isPasscodeCorrect ? '(Admin Verified)' : '(Staff)'}`);
    } else {
      alert("Name not found in Team list. Please ask an Admin to add you.");
    }
  };

  const handleLogout = () => {
    logActivity('Logout', `User ${currentUser?.name} signed out`);
    setCurrentUser(null);
    setActiveView('dashboard');
  };

  const NavItem = ({ icon: Icon, label, id, adminOnly }: { icon: any, label: string, id: ViewMode, adminOnly?: boolean }) => {
    if (adminOnly && !currentUser?.isAdmin) return null;
    return (
      <button 
        onClick={() => setActiveView(id)}
        className={`flex flex-col items-center justify-center py-2 px-6 transition-all duration-300 relative group ${
          activeView === id 
            ? 'text-indigo-600' 
            : 'text-slate-400 hover:text-indigo-400'
        }`}
      >
        <Icon size={20} className={`mb-1 transition-transform duration-300 ${activeView === id ? 'scale-110' : 'group-hover:scale-105'}`} />
        <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
        {activeView === id && (
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-indigo-600 rounded-t-full" />
        )}
      </button>
    );
  };

  if (!currentUser) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-indigo-100 selection:text-indigo-700">
      <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${showToast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700">
          <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
            <Icons.Paid size={14} className="text-white" />
          </div>
          <span className="text-sm font-bold tracking-tight">System Synchronized</span>
        </div>
      </div>

      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-indigo-200 rotate-3 transition-transform">
              K
            </div>
            <div className="hidden sm:block">
              <h1 className="font-black text-xl text-slate-900 tracking-tight leading-none uppercase">Kean Drew</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[10px] font-bold tracking-widest uppercase ${currentUser.isAdmin ? 'text-indigo-600' : 'text-slate-500'}`}>
                  {currentUser.isAdmin ? 'KEANDREW Verified' : 'Staff Access'}
                </span>
                <span className={`w-1.5 h-1.5 rounded-full ${isSaving ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`} />
                <span className="text-[10px] text-slate-400 font-medium">
                  Hi, {currentUser.name}
                </span>
              </div>
            </div>
          </div>

          <nav className="flex items-center bg-slate-50/50 rounded-2xl p-1 border border-slate-100">
            <NavItem id="dashboard" icon={Icons.Dashboard} label="Pulse" />
            <NavItem id="calendar" icon={Icons.Calendar} label="Book" />
            <NavItem id="staff" icon={Icons.Staff} label="Team" />
            <NavItem id="logs" icon={Icons.Work} label="Logs" adminOnly />
            
            <button 
              onClick={handleLogout}
              className="flex flex-col items-center justify-center py-2 px-6 text-slate-400 hover:text-red-500 transition-colors"
            >
              <Icons.Prev size={20} className="mb-1" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Exit</span>
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        <div className="transition-all duration-500 ease-in-out">
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
          {activeView === 'logs' && currentUser.isAdmin && (
            <ActivityLogsView logs={logs} />
          )}
        </div>
      </main>

      <footer className="max-w-7xl mx-auto w-full px-6 py-8 text-center text-slate-400">
        <p className="text-xs font-medium tracking-wide">© {new Date().getFullYear()} Kean Drew Studio Management System • Connected as {currentUser.name}</p>
      </footer>
    </div>
  );
};

export default App;
