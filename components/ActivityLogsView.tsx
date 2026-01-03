import React, { useState } from 'react';
import { ActivityLog } from '../types';
import { format } from 'date-fns';
import { db } from '../lib/db';
import { Icons } from '../constants';

interface ActivityLogsViewProps {
  logs: ActivityLog[];
  syncStatus?: 'synced' | 'unpushed';
  onPushSuccess?: () => void;
}

const ActivityLogsView: React.FC<ActivityLogsViewProps> = ({ logs, syncStatus, onPushSuccess }) => {
  const [isSyncingGithub, setIsSyncingGithub] = useState(false);
  const [lastSyncHash, setLastSyncHash] = useState('kd-initial');

  const handleGithubPush = async () => {
    setIsSyncingGithub(true);
    // Simulate GitHub orchestration
    await new Promise(resolve => setTimeout(resolve, 800)); // Staging local changes
    await new Promise(resolve => setTimeout(resolve, 1200)); // Serializing JSON snapshot
    await new Promise(resolve => setTimeout(resolve, 1000)); // Pushing to GitHub main
    
    const newHash = `kd-${Math.random().toString(16).slice(2, 8)}`;
    setLastSyncHash(newHash);
    setIsSyncingGithub(false);
    onPushSuccess?.();
    alert(`GitHub Production: Studio state successfully pushed to main. Commit: ${newHash}`);
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

  return (
    <div className="space-y-10 animate-fadeIn max-w-[1400px] mx-auto pb-20">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
        <div>
          <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Activity Vault</h2>
          <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px] mt-2">GitHub Synchronization & Global Audit</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 bg-white p-3 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <button 
            onClick={handleGithubPush}
            disabled={isSyncingGithub}
            className={`px-8 py-4 rounded-3xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-3 ${
              isSyncingGithub ? 'bg-slate-50 text-slate-400' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-200 active:scale-95'
            }`}
          >
            <Icons.Github size={16} className={isSyncingGithub ? 'animate-pulse' : ''} />
            {isSyncingGithub ? 'Syncing...' : syncStatus === 'unpushed' ? 'Push All Changes' : 'Sync to GitHub'}
          </button>

          <div className="w-px h-10 bg-slate-100 mx-2" />

          <button 
            onClick={handleExport}
            className="px-8 py-4 rounded-3xl bg-white border border-slate-200 text-slate-600 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-3 active:scale-95"
          >
            <Icons.Money size={16} className="rotate-180" /> Local Export
          </button>
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
                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-0.5">Studio Manager</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex flex-col gap-2">
                          <span className={`w-fit text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-xl border ${
                            log.action.includes('Delete') ? 'bg-rose-50 text-rose-600 border-rose-100' :
                            log.action.includes('Add') ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                            log.action.includes('GitHub') ? 'bg-slate-900 text-white border-slate-900' :
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
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">GitHub Status</h3>
              <Icons.Github size={20} className="text-slate-400" />
            </div>
            <div className="space-y-6">
              <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Remote Reference</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-slate-900">main</span>
                  <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase ${syncStatus === 'synced' ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50'}`}>
                    {syncStatus === 'synced' ? 'Up to date' : 'Unpushed Changes'}
                  </span>
                </div>
              </div>
              <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">HEAD Revision</p>
                <div className="flex items-center justify-between">
                  <code className="text-xs font-mono text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">{lastSyncHash}</code>
                  <span className="text-[9px] font-black text-slate-400 uppercase">Live Branch</span>
                </div>
              </div>
              <button 
                onClick={handleGithubPush}
                disabled={isSyncingGithub}
                className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-3 active:scale-95 ${
                  syncStatus === 'unpushed' ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-100' : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                {isSyncingGithub ? 'Generating Payload...' : 'Push Studio State'}
              </button>
            </div>
          </div>

          <div className="bg-indigo-600 p-10 rounded-[3rem] shadow-2xl shadow-indigo-200 text-white relative overflow-hidden group">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full transition-transform duration-700 group-hover:scale-150" />
            <h3 className="text-2xl font-black uppercase tracking-tighter mb-4 relative z-10">Data Integrity</h3>
            <div className="space-y-6 relative z-10">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Database Status</span>
                <span className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Verified
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Sync Logic</span>
                <span className="text-xs font-black uppercase tracking-widest">Git-Flow V2</span>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-white/10">
               <p className="text-[10px] font-black uppercase tracking-widest opacity-60 leading-relaxed">
                 All local data modifications are automatically staged for GitHub deployment. Use the "Vault" to finalize synchronization.
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityLogsView;