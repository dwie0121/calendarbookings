import React, { useRef } from 'react';
import { ActivityLog } from '../types';
import { format } from 'date-fns';
import { db } from '../lib/db';
import { Icons } from '../constants';

interface ActivityLogsViewProps {
  logs: ActivityLog[];
}

const ActivityLogsView: React.FC<ActivityLogsViewProps> = ({ logs }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = db.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kean-drew-studio-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const json = event.target?.result as string;
      const success = await db.importData(json);
      if (success) {
        alert("Database restored successfully!");
        window.location.reload();
      } else {
        alert("Invalid backup file.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Activity Vault</h2>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">System Audit Logs & Maintenance</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExport}
            className="px-6 py-3 rounded-2xl bg-white border border-slate-200 text-slate-600 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2"
          >
            <Icons.Money size={14} className="rotate-180" /> Export JSON
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-3 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2"
          >
            <Icons.Work size={14} /> Import Data
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImport} 
            className="hidden" 
            accept=".json" 
          />
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Timestamp</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Identity</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Action</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Event Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-slate-300 font-black uppercase tracking-[0.4em] text-xs">
                    The audit trail is currently empty
                  </td>
                </tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-8 py-6 whitespace-nowrap">
                      <p className="text-xs font-black text-slate-900">{format(new Date(log.timestamp), 'HH:mm:ss')}</p>
                      <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mt-0.5">{format(new Date(log.timestamp), 'MMM dd, yyyy')}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center text-[10px] text-indigo-600 font-black group-hover:bg-indigo-600 group-hover:text-white transition-all">
                          {log.userName.charAt(0)}
                        </div>
                        <span className="text-xs font-bold text-slate-800 uppercase tracking-tight">{log.userName}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border ${
                        log.action.includes('Delete') ? 'bg-red-50 text-red-600 border-red-100' :
                        log.action.includes('Add') ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        'bg-indigo-50 text-indigo-600 border-indigo-100'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">{log.details}</p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Showing {logs.length} operations</p>
           <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Built-in LocalDB Engine v1.0</p>
        </div>
      </div>
    </div>
  );
};

export default ActivityLogsView;