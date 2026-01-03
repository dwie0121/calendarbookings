import React, { useState } from 'react';
import { StudioEvent, Staff, CalendarViewType } from '../types';
import { Icons } from '../constants';
import EventModal from './EventModal';
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
  
  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const monthEnd = endOfMonth(monthStart);
  
  const calendarStart = new Date(monthStart);
  calendarStart.setDate(monthStart.getDate() - monthStart.getDay());
  
  const calendarEnd = endOfWeek(monthEnd);
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

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

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Dynamic Control Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex flex-wrap items-center gap-4 bg-white p-2.5 rounded-[2rem] border border-slate-200 shadow-sm backdrop-blur-xl bg-white/80">
          <div className="flex bg-slate-100/80 p-1.5 rounded-2xl">
            {(['month', 'list'] as CalendarViewType[]).map((type) => (
              <button 
                key={type}
                onClick={() => setViewType(type)}
                className={`px-7 py-2.5 text-[11px] font-black uppercase tracking-[0.2em] rounded-xl transition-all duration-300 ${
                  viewType === type 
                  ? 'bg-white text-indigo-600 shadow-md shadow-indigo-100 scale-105' 
                  : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          
          <div className="w-px h-8 bg-slate-200 mx-1 hidden sm:block" />
          
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('prev')} className="p-3 hover:bg-slate-50 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all active:scale-90">
              <Icons.Prev size={20}/>
            </button>
            <h3 className="font-black text-slate-900 text-base min-w-[160px] text-center uppercase tracking-tight">
              {format(currentDate, 'MMMM yyyy')}
            </h3>
            <button onClick={() => navigate('next')} className="p-3 hover:bg-slate-50 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all active:scale-90">
              <Icons.Next size={20}/>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isAdmin && (
            <button 
              onClick={() => { setSelectedEvent(null); setInitialDate(format(new Date(), 'yyyy-MM-dd')); setIsModalOpen(true); }}
              className="bg-indigo-600 text-white px-10 py-4 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 hover:bg-indigo-700 hover:shadow-2xl hover:shadow-indigo-200 transition-all active:scale-95"
            >
              <Icons.Plus size={18} /> Add Booking
            </button>
          )}
        </div>
      </div>

      {/* Grid Container */}
      <div className="relative">
        {viewType === 'month' && (
          <div className="bg-white rounded-[3rem] border border-slate-200 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] overflow-hidden animate-scaleIn">
            <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/30">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">{d}</div>
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
                    className={`group min-h-[170px] p-5 border-b border-r border-slate-50 cursor-pointer transition-all relative
                      ${!isCurMonth ? 'bg-slate-50/20 opacity-20 pointer-events-none' : 'bg-white hover:bg-slate-50/50'}
                      ${idx % 7 === 6 ? 'border-r-0' : ''}
                      ${idx >= days.length - 7 ? 'border-b-0' : ''}
                    `}
                  >
                    <div className="flex justify-between items-start mb-5">
                      <span className={`text-xs font-black w-9 h-9 flex items-center justify-center rounded-2xl transition-all duration-500
                        ${today ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-300 scale-110 rotate-3' : isCurMonth ? 'text-slate-900 group-hover:scale-110' : 'text-slate-300'}
                      `}>
                        {format(day, 'd')}
                      </span>
                      {dayEvents.length > 0 && isCurMonth && (
                        <div className="flex -space-x-1.5 translate-y-1">
                          {dayEvents.slice(0, 3).map((_, i) => (
                            <div key={i} className="w-2.5 h-2.5 rounded-full bg-indigo-500 border-2 border-white shadow-sm" />
                          ))}
                          {dayEvents.length > 3 && (
                            <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-black text-slate-600 border-2 border-white">
                              +{dayEvents.length - 3}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 overflow-y-auto max-h-[90px] hide-scrollbar">
                      {dayEvents.map(e => (
                        <div 
                          key={e.id} 
                          onClick={(ev) => openEditModal(e, ev)}
                          className="text-[10px] p-3 bg-white border border-slate-100 rounded-2xl text-slate-800 font-black shadow-sm group-hover:border-indigo-100 group-hover:shadow-md group-hover:translate-x-1 transition-all truncate flex items-center gap-3"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                          <span className="opacity-40 tabular-nums shrink-0">{e.startTime}</span>
                          <span className="truncate uppercase tracking-tighter">{e.title}</span>
                        </div>
                      ))}
                    </div>

                    {isAdmin && isCurMonth && dayEvents.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                         <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center scale-75 group-hover:scale-100 transition-transform">
                           <Icons.Plus size={20} className="text-indigo-400" />
                         </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {viewType === 'list' && (
          <div className="space-y-6 max-w-5xl mx-auto animate-fadeIn">
            {events.length === 0 ? (
              <div className="bg-white rounded-[4rem] py-40 text-center border border-slate-100 shadow-xl shadow-slate-100/50">
                <div className="w-28 h-28 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-10 text-slate-200">
                  <Icons.Calendar size={48} />
                </div>
                <h4 className="text-2xl font-black text-slate-900 uppercase tracking-[0.5em] mb-4">No Bookings</h4>
                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest max-w-xs mx-auto leading-relaxed">The studio is currently available. Add your first session to begin tracking.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {events
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .filter(e => isSameMonth(new Date(e.date), currentDate))
                  .map(e => (
                  <div 
                    key={e.id} 
                    onClick={() => openEditModal(e)}
                    className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(79,70,229,0.1)] hover:border-indigo-100 hover:-translate-y-2 transition-all duration-500 cursor-pointer group flex flex-col sm:flex-row items-center justify-between gap-10"
                  >
                    <div className="flex items-center gap-10 w-full sm:w-auto">
                      <div className="flex flex-col items-center justify-center w-24 h-24 bg-slate-50 rounded-[2rem] border border-slate-100 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shrink-0 shadow-sm">
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] opacity-50 mb-1">{format(new Date(e.date), 'MMM')}</span>
                        <span className="text-4xl font-black tabular-nums">{format(new Date(e.date), 'dd')}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <h4 className="text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{e.title}</h4>
                          <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Shoot</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-[11px] font-black text-slate-400 uppercase tracking-[0.1em]">
                          <span className="flex items-center gap-2.5"><Icons.Time size={16} className="text-indigo-400" /> {e.startTime} - {e.endTime}</span>
                          <span className="flex items-center gap-2.5"><Icons.Staff size={16} className="text-indigo-400" /> {e.assignments.length} Crew Assigned</span>
                          <span className="flex items-center gap-2.5 font-black text-indigo-600 bg-indigo-50/50 px-3 py-1 rounded-lg border border-indigo-100/50"><Icons.Money size={16} /> ₱{e.revenue.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 w-full sm:w-auto justify-end border-t sm:border-t-0 border-slate-50 pt-6 sm:pt-0">
                       <div className="text-right mr-2 hidden sm:block">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-1.5">Confirmation</p>
                        <span className="text-[11px] font-black text-emerald-600 bg-emerald-50 px-6 py-2 rounded-full uppercase border border-emerald-100 shadow-sm">Verified</span>
                      </div>
                      <div className="p-5 rounded-3xl bg-slate-50 text-slate-300 group-hover:bg-indigo-600 group-hover:text-white group-hover:rotate-45 transition-all duration-500 shadow-sm">
                        <Icons.Next size={24} />
                      </div>
                    </div>
                  </div>
                ))}
                {events.filter(e => isSameMonth(new Date(e.date), currentDate)).length === 0 && (
                  <div className="bg-white rounded-[3rem] py-24 text-center border border-slate-100 border-dashed">
                    <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-xs">Zero events scheduled for {format(currentDate, 'MMMM')}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

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