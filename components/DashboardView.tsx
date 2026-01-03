
import React, { useMemo } from 'react';
import { StudioEvent, Staff } from '../types';
import { Icons } from '../constants';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  Cell
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

  // Chart Data: Group Revenue by Month
  const chartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    const data = months.map((month, idx) => {
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
    return data;
  }, [events]);

  const StatCard = ({ label, value, icon: Icon, colorClass }: any) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
      <div className={`p-3 rounded-xl ${colorClass}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-slate-800">₱{value.toLocaleString()}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Business Overview (Philippines)</h2>
        <p className="text-sm text-slate-500">{new Date().getFullYear()} Summary (PHP)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          label="Total Revenue" 
          value={stats.totalRevenue} 
          icon={Icons.Money} 
          colorClass="bg-green-50 text-green-600" 
        />
        <StatCard 
          label="Staff Expenses" 
          value={stats.totalExpenses} 
          icon={Icons.Staff} 
          colorClass="bg-orange-50 text-orange-600" 
        />
        <StatCard 
          label="Net Profit" 
          value={stats.netProfit} 
          icon={Icons.Growth} 
          colorClass="bg-indigo-50 text-indigo-600" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Revenue vs Profit Trend (₱)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProf" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                <Tooltip 
                  formatter={(value: number) => [`₱${value.toLocaleString()}`, '']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ stroke: '#e2e8f0' }}
                />
                <Area type="monotone" dataKey="Revenue" stroke="#4f46e5" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
                <Area type="monotone" dataKey="Profit" stroke="#10b981" fillOpacity={1} fill="url(#colorProf)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Staff Payout Status */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Staff Fee Summary</h3>
          <div className="overflow-y-auto max-h-[300px] pr-2 space-y-4">
            {staff.length === 0 ? (
              <p className="text-slate-400 text-center py-10">No staff records yet.</p>
            ) : (
              staff.map(member => {
                const s = stats.staffFees[member.id] || { earned: 0, paid: 0 };
                const unpaid = s.earned - s.paid;
                return (
                  <div key={member.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold uppercase">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{member.name}</p>
                        <p className="text-xs text-slate-500">{member.baseDesignation}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-800">₱{s.earned.toLocaleString()}</p>
                      <p className={`text-xs font-medium ${unpaid > 0 ? 'text-red-500' : 'text-green-600'}`}>
                        {unpaid > 0 ? `Unpaid: ₱${unpaid.toLocaleString()}` : 'Fully Paid'}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
