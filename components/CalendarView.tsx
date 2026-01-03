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
  isSameMonth,
  parseISO
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
  
  // Date-fns missing methods workaround
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

  const getDayEvents = (day: Date) => events.filter(e => isSameDay(parseISO(e.date), day));

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
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
          {(['month', 'list'] as CalendarViewType[]).map((type) => (
            <button 
              key={type}
              onClick={() => setViewType(type)}
              className={`px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
                viewType === type 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
              }`}
            >
              {type} View
            </button>
          ))}
          <div className="w-px h-8 bg-slate-100 mx-2" />
          <div className="flex items-center gap-1">
            <button onClick={() => navigate('prev')} className="p-2.5 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-indigo-600 transition-colors">
              <Icons.Prev size={18}/>
            </button>
            <h3 className="font-black text-slate-900 text-base min-w-[150px] text-center uppercase tracking-tight">
              {format(currentDate, 'MMMM yyyy')}
            </h3>
            <button onClick={() => navigate('next')} className="p-2.5 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-indigo-600 transition-colors">
              <Icons.Next size={18}/>
            </button>
          </div>
        </div>

        {isAdmin && (
          <button 
            onClick={() => { setSelectedEvent(null); setInitialDate(format(new Date(), 'yyyy-MM-dd')); setIsModalOpen(true); }}
            className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95"
          >
            <Icons.Plus size={16} /> New Studio Booking
          </button>
        )}
      </div>

      {/* Month View */}
      {viewType === 'month' && (
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/20 overflow-hidden">
          <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{d}</div>
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
                  className={`group min-h-[140px] p-3 border-b border-r border-slate-100 cursor-pointer transition-all relative
                    ${!isCurMonth ? 'bg-slate-50/30 opacity-40' : 'bg-white hover:bg-indigo-50/20'}
                    ${idx % 7 === 6 ? 'border-r-0' : ''}
                  `}
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className={`text-xs font-black w-8 h-8 flex items-center justify-center rounded-xl transition-all
                      ${today ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : isCurMonth ? 'text-slate-900' : 'text-slate-300'}
                    `}>
                      {format(day, 'd')}
                    </span>
                    {dayEvents.length > 0 && isCurMonth && (
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{dayEvents.length} Event(s)</span>
                    )}
                  </div>
                  <div className="space-y-1.5 overflow-y-auto max-h-[85px] hide-scrollbar">
                    {dayEvents.map(e => (
                      <div 
                        key={e.id} 
                        onClick={(ev) => openEditModal(e, ev)}
                        className="text-[9px] p-2 bg-indigo-50/50 border border-indigo-100/50 rounded-lg text-indigo-700 font-black shadow-sm hover:border-indigo-300 hover:bg-white hover:shadow-md transition-all truncate"
                      >
                        <span className="opacity-60 tabular-nums mr-2">{e.startTime}</span>
                        {e.title}
                      </div>
                    ))}
                  </div>
                  {isAdmin && isCurMonth && (
                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-indigo-600 text-white p-1 rounded-md">
                        <Icons.Plus size={10} />
                      </div>
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
        <div className="space-y-4">
          {events.length === 0 ? (
            <div className="bg-white rounded-[2rem] p-24 text-center border border-slate-200 shadow-sm">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
                <Icons.Calendar size={32} />
              </div>
              <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-[10px]">No Active Bookings</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {events
                .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
                .filter(e => isSameMonth(parseISO(e.date), currentDate))
                .map(e => (
                <div 
                  key={e.id} 
                  onClick={() => openEditModal(e)}
                  className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all cursor-pointer group flex items-center justify-between"
                >
                  <div className="flex items-center gap-8">
                    <div className="flex flex-col items-center justify-center w-20 h-20 bg-slate-50 rounded-[2rem] border border-slate-100 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{format(parseISO(e.date), 'MMM')}</span>
                      <span className="text-3xl font-black tabular-nums">{format(parseISO(e.date), 'dd')}</span>
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{e.title}</h4>
                      <div className="flex items-center gap-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        <span className="flex items-center gap-2"><Icons.Time size={14} className="text-indigo-500" /> {e.startTime} - {e.endTime}</span>
                        <span className="flex items-center gap-2"><Icons.Staff size={14} className="text-indigo-500" /> {e.assignments.length} Crew</span>
                        <span className="flex items-center gap-2 font-black text-indigo-600"><Icons.Money size={14} /> ₱{e.revenue.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="hidden sm:block text-right mr-4">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                      <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase">Confirmed</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-50 text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      <Icons.Next size={20} />
                    </div>
                  </div>
                </div>
              ))}
              {events.filter(e => isSameMonth(parseISO(e.date), currentDate)).length === 0 && (
                <div className="bg-white rounded-[2rem] p-16 text-center border border-slate-200">
                  <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs">No bookings for this month</p>
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