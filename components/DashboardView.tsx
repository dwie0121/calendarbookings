import React, { useMemo } from 'react';
import { StudioEvent, Staff } from '../types';
import { Icons } from '../constants';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area
} from 'recharts';

interface DashboardProps {
  events: StudioEvent[];
  staff: Staff[];
}

const DashboardView: React.FC<DashboardProps> = ({ events, staff }) => {
  const stats = useMemo(() => {
    let totalRevenue = 0;
    let totalExpenses = 0;
    const staffFees: Record<string, { earned: number, paid: number }> = {};

    staff.forEach(s => {
      staffFees[s.id] = { earned: 0, paid: 0 };
    });

    events.forEach(event => {
      totalRevenue += Number(event.revenue || 0);
      event.assignments.forEach(a => {
        totalExpenses += Number(a.fee || 0);
        if (staffFees[a.staffId]) {
          staffFees[a.staffId].earned += Number(a.fee || 0);
          if (a.isPaid) staffFees[a.staffId].paid += Number(a.fee || 0);
        }
      });
    });

    return {
      totalRevenue,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
      staffFees
    };
  }, [events, staff]);

  const chartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    return months.map((month, idx) => {
      const filtered = events.filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === idx && d.getFullYear() === currentYear;
      });
      const revenue = filtered.reduce((acc, curr) => acc + Number(curr.revenue || 0), 0);
      const expense = filtered.reduce((acc, curr) => {
        return acc + curr.assignments.reduce((sum, a) => sum + Number(a.fee || 0), 0);
      }, 0);
      return {
        name: month,
        Revenue: revenue,
        Profit: revenue - expense
      };
    });
  }, [events]);

  const StatCard = ({ label, value, icon: Icon, colorClass }: any) => (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-2xl hover:border-indigo-100 transition-all duration-500 group overflow-hidden relative">
      <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-slate-50/50 group-hover:scale-150 transition-transform duration-700`} />
      <div className="flex items-center gap-6 relative z-10">
        <div className={`p-4 rounded-2xl ${colorClass} shadow-lg transition-transform group-hover:rotate-12`}>
          <Icon size={28} />
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">{label}</p>
          <p className="text-3xl font-black text-slate-900 tabular-nums tracking-tighter">₱{value.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-10 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Studio Pulse</h2>
            <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live System
            </div>
          </div>
          <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px] mt-2 flex items-center gap-2">
            Kean Drew Infrastructure • Fiscal Year {new Date().getFullYear()}
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-white p-3 rounded-[2rem] border border-slate-100 shadow-sm">
           <div className="px-4 text-right border-r border-slate-100">
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Efficiency</p>
              <p className="text-sm font-black text-indigo-600">98.4%</p>
           </div>
           <div className="px-4">
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Last Deploy</p>
              <p className="text-sm font-black text-slate-900">Recently</p>
           </div>
           <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
             <Icons.Growth size={20} />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard 
          label="Gross Revenue" 
          value={stats.totalRevenue} 
          icon={Icons.Money} 
          colorClass="bg-indigo-600 text-white" 
        />
        <StatCard 
          label="Payroll Costs" 
          value={stats.totalExpenses} 
          icon={Icons.Staff} 
          colorClass="bg-orange-500 text-white" 
        />
        <StatCard 
          label="Estimated Profit" 
          value={stats.netProfit} 
          icon={Icons.Paid} 
          colorClass="bg-emerald-500 text-white" 
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-100/30">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Performance Spectrum</h3>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Monthly Revenue vs Profit Analysis</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-600" />
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Profit</span>
              </div>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProf" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#f8fafc" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fontWeight: 900, fill: '#94a3b8'}} 
                  dy={15} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fontWeight: 900, fill: '#94a3b8'}} 
                  tickFormatter={(val) => `₱${val > 999 ? (val/1000).toFixed(1) + 'k' : val}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '24px', 
                    border: 'none', 
                    boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)',
                    padding: '16px',
                    fontFamily: 'Inter, sans-serif'
                  }}
                  itemStyle={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase' }}
                  labelStyle={{ fontSize: '10px', fontWeight: 900, color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' }}
                  cursor={{ stroke: '#e2e8f0', strokeWidth: 2 }}
                />
                <Area type="monotone" dataKey="Revenue" stroke="#4f46e5" fillOpacity={1} fill="url(#colorRev)" strokeWidth={4} />
                <Area type="monotone" dataKey="Profit" stroke="#10b981" fillOpacity={1} fill="url(#colorProf)" strokeWidth={4} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-100/30">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Team Payouts</h3>
            <Icons.Staff size={20} className="text-slate-300" />
          </div>
          <div className="space-y-5 overflow-y-auto max-h-[380px] pr-2 hide-scrollbar">
            {staff.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-slate-300 font-black uppercase tracking-[0.2em] text-[10px]">No Crew Data Available</p>
              </div>
            ) : (
              staff.map(member => {
                const s = stats.staffFees[member.id] || { earned: 0, paid: 0 };
                const unpaid = s.earned - s.paid;
                const progress = s.earned > 0 ? (s.paid / s.earned) * 100 : 100;

                return (
                  <div key={member.id} className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100 hover:border-indigo-100 transition-colors group">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 font-black text-sm shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-sm uppercase tracking-tight">{member.name}</p>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{member.baseDesignation}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-slate-900 text-sm tabular-nums">₱{s.earned.toLocaleString()}</p>
                        <p className={`text-[9px] font-black uppercase tracking-widest ${unpaid > 0 ? 'text-orange-500' : 'text-emerald-600'}`}>
                          {unpaid > 0 ? `₱${unpaid.toLocaleString()} Left` : 'Cleared'}
                        </p>
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${unpaid > 0 ? 'bg-orange-400' : 'bg-emerald-500'}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <div className="mt-8 pt-8 border-t border-slate-100">
             <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200">
                Generate Payroll Export
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;