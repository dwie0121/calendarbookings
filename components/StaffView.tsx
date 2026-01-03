
import React, { useState } from 'react';
import { Staff, StudioEvent } from '../types';
import { Icons, DESIGNATIONS } from '../constants';

interface StaffViewProps {
  staff: Staff[];
  events: StudioEvent[];
  isAdmin?: boolean;
  onAddStaff: (s: Staff) => void;
  onUpdateStaff: (s: Staff) => void;
  onDeleteStaff: (id: string) => void;
  onUpdateEvent: (e: StudioEvent) => void;
}

const StaffView: React.FC<StaffViewProps> = ({ staff, events, isAdmin, onAddStaff, onUpdateStaff, onDeleteStaff, onUpdateEvent }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', contact: '', baseDesignation: DESIGNATIONS[0], isAdmin: false });

  const resetForm = () => {
    setFormData({ name: '', contact: '', baseDesignation: DESIGNATIONS[0], isAdmin: false });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleEdit = (s: Staff) => {
    if (!isAdmin) return;
    setFormData({ name: s.name, contact: s.contact, baseDesignation: s.baseDesignation, isAdmin: !!s.isAdmin });
    setEditingId(s.id);
    setIsAdding(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (editingId) {
      onUpdateStaff({ ...formData, id: editingId });
    } else {
      onAddStaff({ ...formData, id: Date.now().toString() });
    }
    resetForm();
  };

  const markAllAsPaid = (staffId: string) => {
    if (!isAdmin) return;
    events.forEach(event => {
      const updatedAssignments = event.assignments.map(a => {
        if (a.staffId === staffId) return { ...a, isPaid: true };
        return a;
      });
      if (JSON.stringify(updatedAssignments) !== JSON.stringify(event.assignments)) {
        onUpdateEvent({ ...event, assignments: updatedAssignments });
      }
    });
  };

  const getStaffSummary = (staffId: string) => {
    let totalEarned = 0;
    let totalPaid = 0;
    events.forEach(e => {
      e.assignments.forEach(a => {
        if (a.staffId === staffId) {
          totalEarned += Number(a.fee || 0);
          if (a.isPaid) totalPaid += Number(a.fee || 0);
        }
      });
    });
    return { totalEarned, totalPaid, unpaid: totalEarned - totalPaid };
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Team Management (Php ₱)</h2>
        {!isAdding && isAdmin && (
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
          >
            <Icons.AddUser size={18} /> Add Staff
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-white p-8 rounded-3xl border-2 border-indigo-100 shadow-xl animate-scaleIn">
          <h3 className="text-lg font-bold text-slate-800 mb-6">{editingId ? 'Edit Team Member' : 'New Team Member'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
              <input 
                required
                type="text" 
                value={formData.name} 
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                placeholder="Staff Member Name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Default Role</label>
              <select 
                value={formData.baseDesignation} 
                onChange={e => setFormData({ ...formData, baseDesignation: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                {DESIGNATIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Contact Info</label>
              <input 
                type="text" 
                value={formData.contact} 
                onChange={e => setFormData({ ...formData, contact: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                placeholder="Phone or Email"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Permissions</label>
              <div 
                onClick={() => setFormData({ ...formData, isAdmin: !formData.isAdmin })}
                className={`w-full px-4 py-3 border rounded-xl flex items-center justify-between cursor-pointer transition-all ${formData.isAdmin ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-200'}`}
              >
                <span className={`text-xs font-bold ${formData.isAdmin ? 'text-indigo-600' : 'text-slate-400'}`}>Admin Access</span>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.isAdmin ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'}`}>
                  {formData.isAdmin && <Icons.Paid size={12} className="text-white" />}
                </div>
              </div>
            </div>
            <div className="md:col-span-4 flex justify-end gap-3 mt-4">
              <button 
                type="button" 
                onClick={resetForm}
                className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="bg-indigo-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100"
              >
                {editingId ? 'Save Changes' : 'Add Member'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {staff.map(member => {
          const stats = getStaffSummary(member.id);
          return (
            <div key={member.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 hover:border-indigo-200 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl ${member.isAdmin ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-indigo-50 text-indigo-600'}`}>
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xl font-bold text-slate-800 leading-tight">{member.name}</h4>
                      {member.isAdmin && (
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">Admin</span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-indigo-500">{member.baseDesignation}</p>
                    <p className="text-xs text-slate-400 font-medium mt-1">{member.contact || 'No contact info'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-slate-50 p-3 rounded-xl">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Earned</p>
                    <p className="text-lg font-bold text-slate-800">₱{stats.totalEarned.toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Outstanding</p>
                    <p className={`text-lg font-bold ${stats.unpaid > 0 ? 'text-orange-500' : 'text-green-600'}`}>
                      ₱{stats.unpaid.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex md:flex-col justify-between items-end gap-2 pt-2">
                {isAdmin && (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEdit(member)}
                      className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                      title="Edit Staff"
                    >
                      <Icons.Edit size={18} />
                    </button>
                    <button 
                      onClick={() => onDeleteStaff(member.id)}
                      className="p-2.5 text-slate-400 hover:text-red-50 hover:bg-red-50 rounded-xl transition-all"
                      title="Delete Staff"
                    >
                      <Icons.Delete size={18} />
                    </button>
                  </div>
                )}
                {isAdmin && stats.unpaid > 0 && (
                  <button 
                    onClick={() => markAllAsPaid(member.id)}
                    className="w-full md:w-auto text-[10px] font-black uppercase tracking-widest text-white bg-green-500 px-4 py-2.5 rounded-lg hover:bg-green-600 shadow-md shadow-green-100 transition-all"
                  >
                    Mark All Paid
                  </button>
                )}
                {!isAdmin && stats.unpaid > 0 && (
                  <div className="text-[10px] font-black uppercase tracking-widest text-orange-500 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-100">
                    Payment Pending
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {staff.length === 0 && (
          <div className="lg:col-span-2 text-center py-20 bg-white rounded-3xl border border-slate-200 border-dashed">
            <p className="text-slate-400 font-medium">No team members yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffView;
