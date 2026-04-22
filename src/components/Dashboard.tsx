import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot, getDocs, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { HealthRecord, Prediction } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Activity, ChevronRight, TrendingUp, Pill, Target, CheckCircle2, Calendar, Book, Shield, Phone } from 'lucide-react';
import { format } from 'date-fns';
import { RecordComparison } from './RecordComparison';
import { Medication, HealthGoal, Appointment, SymptomLog, EmergencyContact } from '../types';

export const Dashboard: React.FC<{ onNewPrediction: () => void; onViewResult: (id: string) => void }> = ({ onNewPrediction, onViewResult }) => {
  const { user } = useAuth();
  const [recentRecords, setRecentRecords] = useState<HealthRecord[]>([]);
  const [recentPredictions, setRecentPredictions] = useState<Prediction[]>([]);
  const [activeMeds, setActiveMeds] = useState<Medication[]>([]);
  const [activeGoals, setActiveGoals] = useState<HealthGoal[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [recentSymptoms, setRecentSymptoms] = useState<SymptomLog[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const recordsQuery = query(
      collection(db, 'users', user.uid, 'health_records'),
      orderBy('timestamp', 'desc'),
      limit(10)
    );

    const predictionsQuery = query(
      collection(db, 'users', user.uid, 'predictions'),
      orderBy('timestamp', 'desc'),
      limit(5)
    );

    const medsQuery = query(
      collection(db, 'users', user.uid, 'medications'),
      orderBy('timestamp', 'desc'),
      limit(3)
    );

    const goalsQuery = query(
      collection(db, 'users', user.uid, 'health_goals'),
      orderBy('timestamp', 'desc'),
      limit(3)
    );

    const appointmentsQuery = query(
      collection(db, 'users', user.uid, 'appointments'),
      where('status', '==', 'scheduled'),
      orderBy('date', 'asc'),
      limit(2)
    );

    const symptomsQuery = query(
      collection(db, 'users', user.uid, 'symptoms'),
      orderBy('timestamp', 'desc'),
      limit(1)
    );

    const contactsQuery = query(
      collection(db, 'users', user.uid, 'emergency_contacts'),
      limit(1)
    );

    const unsubRecords = onSnapshot(recordsQuery, (snapshot) => {
      setRecentRecords(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HealthRecord)).reverse());
      setLoading(false);
    });

    const unsubPredictions = onSnapshot(predictionsQuery, (snapshot) => {
      setRecentPredictions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Prediction)));
    });

    const unsubMeds = onSnapshot(medsQuery, (snapshot) => {
      setActiveMeds(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Medication)));
    });

    const unsubGoals = onSnapshot(goalsQuery, (snapshot) => {
      setActiveGoals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HealthGoal)));
    });

    const unsubAppointments = onSnapshot(appointmentsQuery, (snapshot) => {
      setUpcomingAppointments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment)));
    });

    const unsubSymptoms = onSnapshot(symptomsQuery, (snapshot) => {
      setRecentSymptoms(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SymptomLog)));
    });

    const unsubContacts = onSnapshot(contactsQuery, (snapshot) => {
      setEmergencyContacts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EmergencyContact)));
    });

    return () => {
      unsubRecords();
      unsubPredictions();
      unsubMeds();
      unsubGoals();
      unsubAppointments();
      unsubSymptoms();
      unsubContacts();
    };
  }, [user]);

  const latestRecord = recentRecords[recentRecords.length - 1];

  const calculateHealthScore = (r: HealthRecord) => {
    let score = 100;
    if (r.glucose && (r.glucose > 140 || r.glucose < 70)) score -= 15;
    if (r.systolicBP && (r.systolicBP > 130 || r.systolicBP < 90)) score -= 15;
    if (r.cholesterol && r.cholesterol > 200) score -= 10;
    if (r.bmi && (r.bmi > 25 || r.bmi < 18.5)) score -= 10;
    return Math.max(score, 40);
  };

  // Map data for chart with safety and composite health score
  const chartData = recentRecords.map(r => ({
    name: r.timestamp ? format(r.timestamp.toDate(), 'MMM d') : 'N/A',
    glucose: r.glucose || 0,
    systolicBP: r.systolicBP || 0,
    healthScore: calculateHealthScore(r),
    fullDate: r.timestamp ? format(r.timestamp.toDate(), 'PPP') : 'Unknown'
  }));

  const currentScore = latestRecord ? calculateHealthScore(latestRecord) : null;

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard 
          label="Health Score" 
          value={currentScore ? currentScore.toString() : '--'} 
          unit="/100"
          status={currentScore ? (currentScore >= 80 ? 'Healthy' : currentScore >= 60 ? 'Fair' : 'Bad') : ''}
          color={currentScore && currentScore >= 70 ? 'emerald' : 'amber'}
        />
        <StatCard 
          label="Blood Glucose" 
          value={latestRecord?.glucose ? latestRecord.glucose.toString() : '--'} 
          unit="mg/dL"
          status={latestRecord?.glucose ? (latestRecord.glucose < 100 ? 'Normal' : 'High') : ''}
          color="emerald"
        />
        <StatCard 
          label="Blood Pressure" 
          value={latestRecord?.systolicBP ? `${latestRecord.systolicBP}/${latestRecord.diastolicBP}` : '--/--'} 
          unit="mmHg"
          status={latestRecord?.systolicBP ? (latestRecord.systolicBP < 120 ? 'Optimal' : 'Elevated') : ''}
          color="emerald"
        />
        <StatCard 
          label="Cholesterol" 
          value={latestRecord?.cholesterol ? latestRecord.cholesterol.toString() : '--'} 
          unit="mg/dL"
          status={latestRecord?.cholesterol ? (latestRecord.cholesterol < 200 ? 'Desirable' : 'Moderate') : ''}
          color="amber"
        />
        <StatCard 
          label="BMI Index" 
          value={latestRecord?.bmi ? latestRecord.bmi.toFixed(1) : '--'} 
          unit="kg/m²"
          status={latestRecord?.bmi ? (latestRecord.bmi < 25 ? 'Healthy' : 'Overweight') : ''}
          color="emerald"
        />
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Chart Area */}
        <div className="col-span-12 lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col min-h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Health Score Trend</h3>
              {currentScore && (
                <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Current Score: <span className={currentScore >= 70 ? 'text-emerald-400' : 'text-amber-400'}>{currentScore}/100</span></p>
              )}
            </div>
            <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest">
              <span className="flex items-center gap-1.5 text-blue-400"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Health Score</span>
              <span className="flex items-center gap-1.5 text-slate-600"><span className="w-2 h-2 rounded-full bg-slate-700"></span> Glucose</span>
            </div>
          </div>
          <div className="flex-1 min-h-[300px] flex items-center justify-center">
            {recentRecords.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
                  />
                  <YAxis 
                    domain={[0, 100]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)' }}
                    labelStyle={{ color: '#94a3b8', fontSize: '10px', fontWeight: 800, marginBottom: '4px', textTransform: 'uppercase' }}
                    itemStyle={{ fontSize: '11px', fontWeight: 600 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="healthScore" 
                    stroke="#3b82f6" 
                    fillOpacity={1} 
                    fill="url(#colorScore)" 
                    strokeWidth={3} 
                    name="Score"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="glucose" 
                    stroke="#334155" 
                    strokeWidth={1.5} 
                    dot={false}
                    strokeDasharray="5 5"
                    name="Glucose"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center gap-4 text-center opacity-40">
                <Activity size={48} className="text-slate-700" />
                <div>
                  <p className="text-sm font-bold text-slate-400">No Assessment Data Yet</p>
                  <p className="text-xs text-slate-600">Start by logging your health vitals below</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Prediction Fast Access */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <div className="bg-blue-600 rounded-2xl p-6 shadow-xl shadow-blue-900/20 flex-1 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
              <Activity className="w-32 h-32" />
            </div>
            <h3 className="text-xs font-bold text-blue-100 uppercase tracking-widest mb-4">Clinical Health Assessment</h3>
            <div className="text-white font-medium text-lg leading-snug mb-6">
              {currentScore ? (
                <>
                  Your vitals suggest a <span className="underline underline-offset-4 decoration-blue-300">
                    {currentScore >= 80 ? 'Very High' : currentScore >= 60 ? 'Optimal' : 'Low'}
                  </span> level of clinical stability based on current metrics.
                </>
              ) : (
                "No health records found yet to establish a baseline assessment."
              )}
            </div>
            
            <div className="space-y-3">
              <button onClick={onNewPrediction} className="w-full flex items-center justify-between px-4 py-3 bg-white text-slate-950 rounded-xl font-bold text-xs shadow-lg hover:bg-slate-100 transition-colors">
                Initialize Diagnostic Vitals
                <ChevronRight size={16} />
              </button>
              <div className="bg-blue-500/30 p-3 rounded-xl border border-blue-400/20 text-blue-50 text-[11px] leading-relaxed italic">
                {currentScore && currentScore < 70 
                  ? "A score of " + currentScore + " indicates several vitals are outside optimal ranges. Please review the diagnostic matrix."
                  : "Scanning your biological data for pattern variations and metric deviations..."}
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Recent Reports</h3>
            <div className="space-y-3">
              {recentPredictions.slice(0, 3).map((p) => (
                <button 
                  key={p.id}
                  onClick={() => onViewResult(p.id!)}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-slate-800/50 hover:border-blue-500/50 transition-all group"
                >
                  <div className="flex flex-col items-start gap-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{format(p.timestamp.toDate(), 'MMM d, p')}</span>
                    <span className="text-xs font-semibold text-slate-200">Assessment: {p.id?.slice(0, 8).toUpperCase()}</span>
                  </div>
                  <ChevronRight size={14} className="text-slate-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                </button>
              ))}
              {recentPredictions.length === 0 && <p className="text-xs text-slate-600 italic">No records found yet.</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Comparative Analysis Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Pill size={12} className="text-blue-500" /> Medications
            </h3>
            <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded uppercase">Active</span>
          </div>
          <div className="space-y-2">
            {activeMeds.filter(m => m.active).slice(0, 2).map(med => (
              <div key={med.id} className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800/50">
                <p className="text-[11px] font-bold text-white truncate">{med.name}</p>
                <p className="text-[9px] text-slate-500 mt-0.5">{med.dosage} • {med.frequency}</p>
              </div>
            ))}
            {activeMeds.filter(m => m.active).length === 0 && <p className="text-[9px] text-slate-600 italic">None logged</p>}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Target size={12} className="text-emerald-500" /> Goals
            </h3>
            <span className="text-[9px] font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded uppercase">Track</span>
          </div>
          <div className="space-y-3">
            {activeGoals.slice(0, 2).map(goal => {
              const progress = Math.min(100, (goal.currentValue / goal.targetValue) * 100);
              return (
                <div key={goal.id} className="space-y-1">
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="font-bold text-slate-300 truncate">{goal.title}</span>
                    <span className="font-bold text-slate-500">{Math.round(progress)}%</span>
                  </div>
                  <div className="h-1 bg-slate-950 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              );
            })}
            {activeGoals.length === 0 && <p className="text-[9px] text-slate-600 italic">None set</p>}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Calendar size={12} className="text-amber-500" /> Appointments
            </h3>
            <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded uppercase">Upcoming</span>
          </div>
          <div className="space-y-2">
            {upcomingAppointments.map(app => (
              <div key={app.id} className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800/50">
                <p className="text-[11px] font-bold text-white truncate">{app.doctorName}</p>
                <p className="text-[9px] text-slate-500 mt-0.5">{format(new Date(app.date), 'MMM d')} @ {app.time}</p>
              </div>
            ))}
            {upcomingAppointments.length === 0 && <p className="text-[9px] text-slate-600 italic">No scheduled visits</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Book size={12} className="text-blue-500" /> Recent Symptom
              </h3>
              <span className="text-[9px] font-bold text-slate-600 uppercase">Journal Entry</span>
            </div>
            {recentSymptoms.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm font-bold text-white tracking-tight">{recentSymptoms[0].symptom}</p>
                <div className="flex items-center gap-2">
                  <div className={`h-1 flex-1 rounded-full bg-slate-950 overflow-hidden`}>
                     <div className={`h-full bg-blue-500`} style={{ width: `${recentSymptoms[0].intensity * 10}%` }} />
                  </div>
                  <span className="text-[9px] font-black text-slate-500">INT {recentSymptoms[0].intensity}/10</span>
                </div>
                <p className="text-[10px] text-slate-500 italic line-clamp-1">"{recentSymptoms[0].description}"</p>
              </div>
            ) : (
                <p className="text-[10px] text-slate-600 italic">No symptoms logged recently.</p>
            )}
          </div>
        </div>

        <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-red-500 flex items-center gap-2">
              <Shield size={12} /> Primary ICE Contact
            </h3>
          </div>
          {emergencyContacts.length > 0 ? (
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500">
                <Phone size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{emergencyContacts[0].name}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest truncate">{emergencyContacts[0].relationship} • {emergencyContacts[0].phone}</p>
              </div>
              <a href={`tel:${emergencyContacts[0].phone}`} className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                 <Phone size={14} />
              </a>
            </div>
          ) : (
            <p className="text-[10px] text-slate-700 italic">No emergency information configured.</p>
          )}
        </div>
      </div>

      <RecordComparison records={recentRecords} />
    </div>
  );
};

function StatCard({ label, value, unit, status, color }: any) {
  const statusColor = color === 'emerald' ? 'text-emerald-400' : 'text-amber-400';
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-center shadow-sm">
      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-0.5">{label}</span>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-black text-white">{value}</span>
        <span className="text-[10px] text-slate-500 font-bold uppercase">{unit}</span>
        {status && <span className={`ml-auto text-[10px] font-bold uppercase ${statusColor}`}>{status}</span>}
      </div>
    </div>
  );
}

