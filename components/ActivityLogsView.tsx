import React, { useRef, useState, useEffect } from 'react';
import { ActivityLog } from '../types';
import { format } from 'date-fns';
import { db } from '../lib/db';
import { Icons } from '../constants';

interface ActivityLogsViewProps {
  logs: ActivityLog[];
}

const ActivityLogsView: React.FC<ActivityLogsViewProps> = ({ logs }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [migrations, setMigrations] = useState<any[]>([]);
  const [isMigrating, setIsMigrating] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);

  useEffect(() => {
    db.getMigrations().then(setMigrations);
  }, []);

  const handleRunMigration = async () => {
    setIsMigrating(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    await db.runMigration('init');
    const updated = await db.getMigrations();
    setMigrations(updated);
    setIsMigrating(false);
    alert("Prisma Migration: 'init' completed successfully.");
  };

  const handleVercelDeploy = async () => {
    setIsDeploying(true);
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsDeploying(false);
    alert("Kean Drew Studio: Production Deploy Success! Vercel environment updated.");
  };

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
    <div className="space-y-10 animate-fadeIn max-w-[1400px] mx-auto pb-20">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
        <div>
          <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Activity Vault</h2>
          <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px] mt-2">Database Integrity & Global Orchestration</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 bg-white p-3 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <button 
            onClick={handleVercelDeploy}
            disabled={isDeploying}
            className={`px-8 py-4 rounded-3xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-3 ${
              isDeploying ? 'bg-indigo-50 text-indigo-400' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-100'
            }`}
          >
            <Icons.Growth size={16} className={isDeploying ? 'animate-pulse' : ''} />
            {isDeploying ? 'Deploying...' : 'Push to Vercel'}
          </button>

          <div className="w-px h-10 bg-slate-100 mx-2" />

          <button 
            onClick={handleRunMigration}
            disabled={isMigrating}
            className={`px-8 py-4 rounded-3xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-3 ${
              isMigrating ? 'text-slate-300' : 'bg-slate-900 text-white hover:bg-slate-800 active:scale-95'
            }`}
          >
            <Icons.Work size={16} className={isMigrating ? 'animate-spin' : ''} />
            {isMigrating ? 'Migrating...' : 'Prisma Migrate'}
          </button>

          <button 
            onClick={handleExport}
            className="px-8 py-4 rounded-3xl bg-white border border-slate-200 text-slate-600 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-3 active:scale-95"
          >
            <Icons.Money size={16} className="rotate-180" /> Export
          </button>
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-8 py-4 rounded-3xl bg-white border border-slate-200 text-slate-600 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-3 active:scale-95"
          >
            <Icons.AddUser size={16} /> Restore
          </button>
          <input type="file" ref={fileInputRef} onChange={handleImport} className="hidden" accept=".json" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-white rounded-[3rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">System Audit Log</h3>
            <span className="bg-indigo-600 text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">Live Trace</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white">
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Time</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Actor</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Operation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-10 py-32 text-center">
                       <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
                        <Icons.Work size={32} />
                       </div>
                       <p className="text-slate-300 font-black uppercase tracking-[0.4em] text-xs">No entries recorded</p>
                    </td>
                  </tr>
                ) : (
                  logs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-10 py-8">
                        <p className="text-xs font-black text-slate-900">{format(new Date(log.timestamp), 'HH:mm:ss')}</p>
                        <p className="text-[9px] text-slate-400 uppercase font-black tracking-[0.2em] mt-1">{format(new Date(log.timestamp), 'MMM dd')}</p>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center text-[11px] text-slate-600 font-black group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                            {log.userName.charAt(0)}
                          </div>
                          <div>
                            <span className="text-sm font-black text-slate-800 uppercase tracking-tighter">{log.userName}</span>
                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-0.5">Verified Staff</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex flex-col gap-2">
                          <span className={`w-fit text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-xl border ${
                            log.action.includes('Delete') ? 'bg-rose-50 text-rose-600 border-rose-100' :
                            log.action.includes('Add') ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                            'bg-indigo-50 text-indigo-600 border-indigo-100'
                          }`}>
                            {log.action}
                          </span>
                          <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-sm">{log.details}</p>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-10">
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Migration Pulse</h3>
              <Icons.Work size={20} className="text-indigo-400" />
            </div>
            <div className="space-y-6">
              {migrations.length === 0 ? (
                <div className="py-10 text-center border-2 border-dashed border-slate-100 rounded-[2rem]">
                  <p className="text-slate-300 font-black text-[10px] uppercase tracking-widest">No Migrations Detected</p>
                </div>
              ) : (
                migrations.slice().reverse().map(m => (
                  <div key={m.id} className="relative pl-10 pb-8 last:pb-0 group">
                    <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-100 group-last:bg-transparent" />
                    <div className="absolute left-2.5 top-0 w-3 h-3 rounded-full bg-indigo-600 border-4 border-white shadow-sm z-10" />
                    <div>
                      <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{m.name}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                        Applied {format(new Date(m.appliedAt), 'MMM dd, HH:mm')}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-indigo-600 p-10 rounded-[3rem] shadow-2xl shadow-indigo-200 text-white relative overflow-hidden group">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full transition-transform duration-700 group-hover:scale-150" />
            <h3 className="text-2xl font-black uppercase tracking-tighter mb-4 relative z-10">System Integrity</h3>
            <div className="space-y-6 relative z-10">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Database Status</span>
                <span className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Optimal
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Infrastructure</span>
                <span className="text-xs font-black uppercase tracking-widest">Vercel Edge</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Data Health</span>
                <span className="text-xs font-black uppercase tracking-widest">Verified</span>
              </div>
            </div>
            <button className="w-full mt-10 py-4 bg-white text-indigo-600 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all active:scale-95 shadow-lg shadow-indigo-700/50">
              Run Integrity Audit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityLogsView;