import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { HealthRecord } from '../types';
import { format } from 'date-fns';
import { Scale, Activity, Droplets, Heart } from 'lucide-react';

interface RecordComparisonProps {
  records: HealthRecord[];
}

export const RecordComparison: React.FC<RecordComparisonProps> = ({ records }) => {
  // We need at least 2 records to compare, and we'll take at most 5 recent ones
  // records is already sorted oldest to newest from the Dashboard fetch logic
  const comparisonData = records.slice(-5);
  
  if (comparisonData.length < 2) {
    return null;
  }

  // Formatting data for comparison
  const formattedData = comparisonData.map(r => {
    const safeName = (r.patientName || 'Patient').split(' ')[0] || 'Patient';
    const dateStr = r.timestamp ? format(r.timestamp.toDate(), 'MMM d') : 'Unknown';
    
    return {
      name: `${safeName} (${dateStr})`,
      fullDate: r.timestamp ? format(r.timestamp.toDate(), 'MMM d, p') : 'Unknown',
      systolic: r.systolicBP || 0,
      diastolic: r.diastolicBP || 0,
      glucose: r.glucose || 0,
      cholesterol: r.cholesterol || 0,
      heartRate: r.heartRate || 0,
      bmi: r.bmi || 0,
    };
  });

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Comparative Analysis</h3>
        <p className="text-xs text-slate-500 font-medium italic">Comparing recent {comparisonData.length} records across key clinical metrics</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Blood Pressure Comparison */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex flex-col h-[350px]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500">
              <Activity size={18} />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-200">Blood Pressure</h4>
              <p className="text-[10px] text-slate-500 font-bold uppercase">Systolic vs Diastolic (mmHg)</p>
            </div>
          </div>
          
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
                />
                <Tooltip 
                  cursor={{ fill: '#ffffff05' }}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)' }}
                  labelStyle={{ color: '#94a3b8', fontSize: '10px', fontWeight: 800, marginBottom: '4px', textTransform: 'uppercase' }}
                  itemStyle={{ fontSize: '11px', fontWeight: 600 }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 700, paddingTop: '20px', textTransform: 'uppercase' }} />
                <Bar dataKey="systolic" name="Systolic" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="diastolic" name="Diastolic" fill="#f87171" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Glucose & Cholesterol Comparison */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex flex-col h-[350px]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <Droplets size={18} />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-200">Metabolic Profile</h4>
              <p className="text-[10px] text-slate-500 font-bold uppercase">Glucose & Cholesterol (mg/dL)</p>
            </div>
          </div>
          
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
                />
                <Tooltip 
                  cursor={{ fill: '#ffffff05' }}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)' }}
                  labelStyle={{ color: '#94a3b8', fontSize: '10px', fontWeight: 800, marginBottom: '4px', textTransform: 'uppercase' }}
                  itemStyle={{ fontSize: '11px', fontWeight: 600 }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 700, paddingTop: '20px', textTransform: 'uppercase' }} />
                <Bar dataKey="glucose" name="Glucose" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="cholesterol" name="Cholesterol" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Heart Rate Comparison */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex flex-col h-[350px]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Heart size={18} />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-200">Heart Rate Analysis</h4>
              <p className="text-[10px] text-slate-500 font-bold uppercase">Resting Pulse (BPM)</p>
            </div>
          </div>
          
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
                />
                <Tooltip 
                  cursor={{ fill: '#ffffff05' }}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)' }}
                  labelStyle={{ color: '#94a3b8', fontSize: '10px', fontWeight: 800, marginBottom: '4px', textTransform: 'uppercase' }}
                  itemStyle={{ fontSize: '11px', fontWeight: 600 }}
                />
                <Bar dataKey="heartRate" name="Heart Rate" radius={[4, 4, 0, 0] as any}>
                  {formattedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* BMI Comparison */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex flex-col h-[350px]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
              <Scale size={18} />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-200">Body Composition</h4>
              <p className="text-[10px] text-slate-500 font-bold uppercase">Body Mass Index (BMI)</p>
            </div>
          </div>
          
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
                />
                <Tooltip 
                  cursor={{ fill: '#ffffff05' }}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)' }}
                  labelStyle={{ color: '#94a3b8', fontSize: '10px', fontWeight: 800, marginBottom: '4px', textTransform: 'uppercase' }}
                  itemStyle={{ fontSize: '11px', fontWeight: 600 }}
                />
                <Bar dataKey="bmi" name="BMI" radius={[4, 4, 0, 0] as any}>
                  {formattedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
