import React, { useState } from 'react';
import { StudioEvent, Staff, CalendarViewType } from '../types';
import { Icons } from '../constants';
import EventModal from './EventModal';
import { db } from '../lib/db';
import { 
  format, 
  addMonths, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  endOfWeek,
  isToday,
  isSameMonth
} from 'date-fns';

interface CalendarProps {
  events: StudioEvent[];
  staff: Staff[];
  isAdmin?: boolean;
  onAddEvent: (e: StudioEvent) => void;
  onUpdateEvent: (e: StudioEvent) => void;
  onDeleteEvent: (id: string) => void;
}

const CalendarView: React.FC<CalendarProps> = ({ events, staff, isAdmin, onAddEvent, onUpdateEvent, onDeleteEvent }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<CalendarViewType>('month');
  const [selectedEvent, setSelectedEvent] = useState<StudioEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialDate, setInitialDate] = useState<string | undefined>();
  const [isRestoring, setIsRestoring] = useState(false);
  
  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const monthEnd = endOfMonth(monthStart);
  
  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };

  const calendarStart = getStartOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Fix: Replaced parseISO with new Date() to resolve the missing export error from date-fns
  const getDayEvents = (day: Date) => events.filter(e => isSameDay(new Date(e.date), day));

  const handleDayClick = (day: Date) => {
    if (!isAdmin) return;
    setInitialDate(format(day, 'yyyy-MM-dd'));
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  const openEditModal = (e: StudioEvent, ev?: React.MouseEvent) => {
    ev?.stopPropagation();
    setSelectedEvent(e);
    setInitialDate(undefined);
    setIsModalOpen(true);
  };

  const navigate = (direction: 'next' | 'prev') => {
    setCurrentDate(addMonths(currentDate, direction === 'next' ? 1 : -1));
  };

  const handleRestore = async () => {
    if (!window.confirm("Restore to last known good state? Current changes might be lost.")) return;
    setIsRestoring(true);
    const success = await db.restoreLastState();
    if (success) {
      window.location.reload(); // Refresh to reload state from storage
    } else {
      alert("No backup found.");
      setIsRestoring(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-[1.5rem] border border-slate-200 shadow-sm">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {(['month', 'list'] as CalendarViewType[]).map((type) => (
              <button 
                key={type}
                onClick={() => setViewType(type)}
                className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                  viewType === type 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          
          <div className="w-px h-6 bg-slate-200 mx-2 hidden sm:block" />
          
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('prev')} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-indigo-600 transition-colors">
              <Icons.Prev size={18}/>
            </button>
            <h3 className="font-black text-slate-900 text-sm sm:text-base min-w-[140px] text-center uppercase tracking-tighter">
              {format(currentDate, 'MMMM yyyy')}
            </h3>
            <button onClick={() => navigate('next')} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-indigo-600 transition-colors">
              <Icons.Next size={18}/>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <button 
              onClick={handleRestore}
              disabled={isRestoring}
              className="px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all flex items-center gap-2"
              title="Restore to last good state"
            >
              <Icons.Work size={14} className={isRestoring ? 'animate-spin' : ''} />
              Restore
            </button>
          )}
          {isAdmin && (
            <button 
              onClick={() => { setSelectedEvent(null); setInitialDate(format(new Date(), 'yyyy-MM-dd')); setIsModalOpen(true); }}
              className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95"
            >
              <Icons.Plus size={16} /> New Booking
            </button>
          )}
        </div>
      </div>

      {/* Month View */}
      {viewType === 'month' && (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/40 overflow-hidden">
          <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="py-5 text-center text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 border-collapse">
            {days.map((day, idx) => {
              const dayEvents = getDayEvents(day);
              const isCurMonth = isSameMonth(day, monthStart);
              const today = isToday(day);

              return (
                <div 
                  key={day.toString()} 
                  onClick={() => handleDayClick(day)}
                  className={`group min-h-[160px] p-4 border-b border-r border-slate-100 cursor-pointer transition-all relative
                    ${!isCurMonth ? 'bg-slate-50/40 opacity-30 grayscale pointer-events-none' : 'bg-white hover:bg-indigo-50/30'}
                    ${idx % 7 === 6 ? 'border-r-0' : ''}
                    ${idx >= days.length - 7 ? 'border-b-0' : ''}
                  `}
                >
                  <div className="flex justify-between items-center mb-4">
                    <span className={`text-xs font-black w-8 h-8 flex items-center justify-center rounded-xl transition-all
                      ${today ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-300 scale-110' : isCurMonth ? 'text-slate-900' : 'text-slate-300'}
                    `}>
                      {format(day, 'd')}
                    </span>
                    {dayEvents.length > 0 && isCurMonth && (
                      <div className="flex -space-x-1">
                        {dayEvents.slice(0, 3).map((_, i) => (
                          <div key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-500 border border-white" />
                        ))}
                        {dayEvents.length > 3 && <span className="text-[8px] font-black text-slate-400 ml-1">+{dayEvents.length - 3}</span>}
                      </div>
                    )}
                  </div>
                  <div className="space-y-1.5 overflow-y-auto max-h-[100px] hide-scrollbar">
                    {dayEvents.map(e => (
                      <div 
                        key={e.id} 
                        onClick={(ev) => openEditModal(e, ev)}
                        className="text-[9px] p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-700 font-black shadow-sm group-hover:bg-white group-hover:border-indigo-100 group-hover:text-indigo-600 transition-all truncate flex items-center gap-2"
                      >
                        <span className="w-1 h-1 rounded-full bg-indigo-400 shrink-0" />
                        <span className="opacity-60 tabular-nums">{e.startTime}</span>
                        <span className="truncate uppercase">{e.title}</span>
                      </div>
                    ))}
                  </div>
                  {isAdmin && isCurMonth && dayEvents.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-50/10">
                       <Icons.Plus size={16} className="text-indigo-300" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* List View */}
      {viewType === 'list' && (
        <div className="space-y-4 max-w-4xl mx-auto">
          {events.length === 0 ? (
            <div className="bg-white rounded-[3rem] py-32 text-center border border-slate-200 shadow-sm animate-fadeIn">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-200">
                <Icons.Calendar size={40} />
              </div>
              <h4 className="text-xl font-black text-slate-300 uppercase tracking-[0.5em]">No Bookings</h4>
              <p className="text-slate-400 mt-2 text-xs font-bold uppercase tracking-widest">Start by adding a session on the calendar</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {events
                // Fix: Replaced parseISO with new Date() to resolve missing export error from date-fns
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .filter(e => isSameMonth(new Date(e.date), currentDate))
                .map(e => (
                <div 
                  key={e.id} 
                  onClick={() => openEditModal(e)}
                  className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:border-indigo-200 hover:-translate-y-1 transition-all cursor-pointer group flex flex-col sm:flex-row items-center justify-between gap-6"
                >
                  <div className="flex items-center gap-8 w-full sm:w-auto">
                    {/* Fix: Replaced parseISO with new Date() to resolve missing export error from date-fns */}
                    <div className="flex flex-col items-center justify-center w-20 h-20 bg-slate-100 rounded-[1.5rem] border border-slate-200 group-hover:bg-indigo-600 group-hover:text-white transition-all shrink-0">
                      <span className="text-[9px] font-black uppercase tracking-widest opacity-60">{format(new Date(e.date), 'MMM')}</span>
                      <span className="text-3xl font-black tabular-nums">{format(new Date(e.date), 'dd')}</span>
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight truncate max-w-[250px]">{e.title}</h4>
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <span className="flex items-center gap-2"><Icons.Time size={14} className="text-indigo-400" /> {e.startTime} - {e.endTime}</span>
                        <span className="flex items-center gap-2"><Icons.Staff size={14} className="text-indigo-400" /> {e.assignments.length} Crew</span>
                        <span className="flex items-center gap-2 font-black text-indigo-600"><Icons.Money size={14} /> ₱{e.revenue.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 w-full sm:w-auto justify-end border-t sm:border-t-0 border-slate-50 pt-4 sm:pt-0">
                     <div className="text-right mr-2">
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Status</p>
                      <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full uppercase border border-emerald-100">Confirmed</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      <Icons.Next size={20} />
                    </div>
                  </div>
                </div>
              ))}
              {/* Fix: Replaced parseISO with new Date() to resolve missing export error from date-fns */}
              {events.filter(e => isSameMonth(new Date(e.date), currentDate)).length === 0 && (
                <div className="bg-white rounded-[3rem] py-20 text-center border border-slate-200 border-dashed">
                  <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs">No active bookings for this month</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <EventModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          event={selectedEvent}
          staff={staff}
          isAdmin={isAdmin}
          initialDate={initialDate}
          onSave={(data) => {
            if (selectedEvent) onUpdateEvent({ ...selectedEvent, ...data });
            else onAddEvent({ ...data, id: Date.now().toString() });
            setIsModalOpen(false);
          }}
          onDelete={() => {
            if (selectedEvent) onDeleteEvent(selectedEvent.id);
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default CalendarView;