
import React, { useState } from 'react';
import { Icons } from '../constants';

interface LoginViewProps {
  onLogin: (name: string, passcode?: string) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [passcode, setPasscode] = useState('');

  const isAdminKey = passcode.toUpperCase() === 'KEANDREW';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onLogin(name.trim(), passcode.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-6 selection:bg-indigo-500 selection:text-white">
      <div className="max-w-md w-full bg-white rounded-[3rem] p-10 md:p-14 shadow-2xl animate-scaleIn border border-white/20">
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2rem] flex items-center justify-center text-white font-black text-5xl shadow-2xl shadow-indigo-500/40 mx-auto mb-8 rotate-3 transition-transform hover:rotate-0 duration-500">
            K
          </div>
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-2">Kean Drew</h1>
          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Studio Access Management</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-5">
            <div className="relative">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Staff Identity</label>
              <div className="relative group">
                <input 
                  required
                  autoFocus
                  type="text" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-500 focus:bg-white transition-all font-bold text-lg text-slate-800"
                  placeholder="Enter First Name"
                />
                <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300">
                  <Icons.Staff size={20} />
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="flex justify-between items-center mb-3 ml-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Admin Passcode</label>
                {isAdminKey && (
                  <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1 animate-pulse">
                    <Icons.Paid size={10} /> Key Recognized
                  </span>
                )}
              </div>
              <div className="relative">
                <input 
                  type="password" 
                  value={passcode}
                  onChange={e => setPasscode(e.target.value)}
                  className={`w-full px-6 py-5 bg-slate-50 border-2 rounded-2xl outline-none transition-all font-bold text-lg tracking-widest
                    ${isAdminKey ? 'border-emerald-200 focus:border-emerald-500 bg-emerald-50/30' : 'border-slate-100 focus:border-indigo-600 focus:bg-white'}
                  `}
                  placeholder="••••••••"
                />
                <div className={`absolute right-5 top-1/2 -translate-y-1/2 transition-colors ${isAdminKey ? 'text-emerald-500' : 'text-slate-300'}`}>
                  <Icons.Work size={20} />
                </div>
              </div>
              <p className="mt-3 text-[9px] text-slate-400 font-bold uppercase tracking-wider ml-1 leading-relaxed">
                Use "KEANDREW" passcode to unlock administrative privileges.
              </p>
            </div>
          </div>

          <button 
            type="submit"
            className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3
              ${isAdminKey 
                ? 'bg-emerald-600 text-white shadow-emerald-200 hover:bg-emerald-700' 
                : 'bg-indigo-600 text-white shadow-indigo-100 hover:bg-indigo-700'}
            `}
          >
            {isAdminKey ? 'Verified Admin Login' : 'Enter Studio'}
          </button>
        </form>

        <div className="mt-12 pt-8 border-t border-slate-50 text-center">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
            Authorized Personnel Only<br/>
            <span className="text-slate-300">Session logging is active in the Philippines</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
