
import React, { useState, useEffect } from 'react';
import { StudioEvent, Staff, StaffAssignment } from '../types';
import { Icons, DESIGNATIONS } from '../constants';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: StudioEvent | null;
  staff: Staff[];
  isAdmin?: boolean;
  initialDate?: string;
  onSave: (data: any) => void;
  onDelete?: () => void;
}

const EventModal: React.FC<EventModalProps> = ({ isOpen, onClose, event, staff, isAdmin, initialDate, onSave, onDelete }) => {
  const [formData, setFormData] = useState({
    title: '',
    clientName: '',
    date: initialDate || '',
    startTime: '09:00',
    endTime: '17:00',
    revenue: 0,
    notes: ''
  });

  const [assignments, setAssignments] = useState<StaffAssignment[]>([]);

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        clientName: event.clientName,
        date: event.date,
        startTime: event.startTime,
        endTime: event.endTime,
        revenue: event.revenue,
        notes: event.notes || ''
      });
      setAssignments(event.assignments || []);
    } else if (initialDate) {
      setFormData(prev => ({ ...prev, date: initialDate }));
    }
  }, [event, initialDate]);

  const handleAddAssignment = () => {
    if (!isAdmin) return;
    if (staff.length === 0) return alert("Add staff members first in the 'Team' tab.");
    setAssignments([...assignments, { staffId: staff[0].id, designation: 'Photographer', fee: 0, isPaid: false }]);
  };

  const updateAssignment = (idx: number, field: keyof StaffAssignment, val: any) => {
    if (!isAdmin) return;
    const next = [...assignments];
    next[idx] = { ...next[idx], [field]: val };
    setAssignments(next);
  };

  const removeAssignment = (idx: number) => {
    if (!isAdmin) return;
    setAssignments(assignments.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    onSave({ ...formData, assignments });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">{event ? (isAdmin ? 'Edit Booking' : 'Booking Details') : 'New Booking'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
            <Icons.Prev size={20} className="rotate-90" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 hide-scrollbar">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Event Title</label>
              <input 
                required
                disabled={!isAdmin}
                type="text" 
                value={formData.title} 
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium transition-all disabled:opacity-70"
                placeholder="e.g. Smith Wedding"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Client Name</label>
              <input 
                disabled={!isAdmin}
                type="text" 
                value={formData.clientName} 
                onChange={e => setFormData({ ...formData, clientName: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium transition-all disabled:opacity-70"
                placeholder="Full Name"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Revenue (Php ₱)</label>
              <input 
                disabled={!isAdmin}
                type="number" 
                value={formData.revenue} 
                onChange={e => setFormData({ ...formData, revenue: Number(e.target.value) })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium transition-all text-indigo-600 font-bold disabled:opacity-70"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Date</label>
              <input 
                required
                disabled={!isAdmin}
                type="date" 
                value={formData.date} 
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium transition-all disabled:opacity-70"
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Start</label>
                <input 
                  disabled={!isAdmin}
                  type="time" 
                  value={formData.startTime} 
                  onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium transition-all disabled:opacity-70"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">End</label>
                <input 
                  disabled={!isAdmin}
                  type="time" 
                  value={formData.endTime} 
                  onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium transition-all disabled:opacity-70"
                />
              </div>
            </div>
          </div>

          {/* Staff Assignments */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Team Assignment</label>
              {isAdmin && (
                <button 
                  type="button" 
                  onClick={handleAddAssignment}
                  className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors flex items-center gap-1"
                >
                  <Icons.Plus size={14}/> Add Staff
                </button>
              )}
            </div>
            
            <div className="space-y-3">
              {assignments.map((a, i) => (
                <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex flex-wrap md:flex-nowrap gap-4">
                    <div className="flex-1 min-w-[150px]">
                      <select 
                        disabled={!isAdmin}
                        value={a.staffId} 
                        onChange={e => updateAssignment(i, 'staffId', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm font-medium outline-none disabled:opacity-70"
                      >
                        {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                    <div className="flex-1 min-w-[150px]">
                      <input 
                        disabled={!isAdmin}
                        list="designations"
                        value={a.designation}
                        onChange={e => updateAssignment(i, 'designation', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm font-medium outline-none disabled:opacity-70"
                        placeholder="Designation"
                      />
                      <datalist id="designations">
                        {DESIGNATIONS.map(d => <option key={d} value={d}/>)}
                      </datalist>
                    </div>
                    <div className="w-24">
                      <input 
                        disabled={!isAdmin}
                        type="number" 
                        value={a.fee} 
                        onChange={e => updateAssignment(i, 'fee', Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm font-bold text-orange-600 outline-none disabled:opacity-70"
                        placeholder="Fee (₱)"
                      />
                    </div>
                    {isAdmin && (
                      <div className="flex items-center gap-2">
                        <button 
                          type="button"
                          onClick={() => updateAssignment(i, 'isPaid', !a.isPaid)}
                          className={`p-2 rounded-lg transition-all ${a.isPaid ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-400'}`}
                        >
                          <Icons.Paid size={20} />
                        </button>
                        <button 
                          type="button"
                          onClick={() => removeAssignment(i)}
                          className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Icons.Delete size={20} />
                        </button>
                      </div>
                    )}
                    {!isAdmin && (
                      <div className={`flex items-center px-3 rounded-lg ${a.isPaid ? 'text-green-600 bg-green-50' : 'text-slate-400 bg-slate-100'}`}>
                        <span className="text-[10px] font-black uppercase tracking-widest">{a.isPaid ? 'Paid' : 'Unpaid'}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {assignments.length === 0 && (
                <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-sm">
                  No staff assigned to this event yet.
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Notes</label>
            <textarea 
              disabled={!isAdmin}
              value={formData.notes} 
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium transition-all h-24 disabled:opacity-70"
              placeholder="Additional details..."
            />
          </div>
        </form>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          {event && isAdmin && (
            <button 
              type="button" 
              onClick={onDelete}
              className="text-red-500 font-bold px-6 py-2 rounded-xl hover:bg-red-50 transition-colors"
            >
              Delete
            </button>
          )}
          <div className="flex gap-3 ml-auto">
            <button 
              type="button" 
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-colors"
            >
              {isAdmin ? 'Cancel' : 'Close'}
            </button>
            {isAdmin && (
              <button 
                onClick={handleSubmit}
                className="bg-indigo-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
              >
                Save Event
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventModal;
