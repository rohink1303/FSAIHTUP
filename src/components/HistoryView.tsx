import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Prediction } from '../types';
import { FileText, ChevronRight, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';

export const HistoryView: React.FC<{ onViewResult: (id: string) => void }> = ({ onViewResult }) => {
  const { user } = useAuth();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'users', user.uid, 'predictions'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPredictions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Prediction)));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8">
        <h2 className="text-2xl font-bold text-white tracking-tight uppercase tracking-[0.1em] text-xs font-black text-slate-500 mb-2">Health Archive</h2>
        <h3 className="text-2xl font-bold text-white">Reports & History</h3>
        <p className="text-slate-400 text-sm mt-2">Access your historical diagnostic data and AI-generated health reports.</p>
      </div>

      <div className="medical-card p-0 overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="relative flex-1 max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Filter by ID or date..." 
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl outline-none focus:ring-1 focus:ring-blue-600 font-medium text-white placeholder:text-slate-700" 
            />
          </div>
          <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 px-4 py-2 hover:bg-slate-800 rounded-xl transition-all">
            <Filter size={14} />
            Sort Options
          </button>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-600 animate-pulse font-bold tracking-widest uppercase text-xs">Accessing Records...</div>
        ) : predictions.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-16 h-16 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center mx-auto mb-4 text-slate-700">
              <FileText size={32} />
            </div>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No Records Found</p>
            <p className="text-sm text-slate-600 mt-1 max-w-[200px] mx-auto">Perform your first assessment to begin tracking.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {predictions.map((p) => (
              <button 
                key={p.id} 
                onClick={() => onViewResult(p.id!)}
                className="w-full flex items-center justify-between p-5 hover:bg-slate-800/30 transition-all group"
              >
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center text-blue-500 shadow-inner group-hover:scale-110 transition-transform">
                    <FileText size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{format(p.timestamp.toDate(), 'PPP p')}</p>
                    <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">Patient: {p.patientName || 'Anonymous'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-8">
                  <div className="hidden sm:flex items-center gap-2">
                    {p.results.filter(r => r.probability > 0.4).slice(0, 2).map((r, i) => (
                      <span key={i} className="text-[8px] px-2 py-0.5 border border-slate-700 text-slate-400 rounded-full font-black uppercase tracking-tight">
                        {r.disease}
                      </span>
                    ))}
                    {p.results.filter(r => r.probability > 0.4).length > 2 && (
                      <span className="text-[8px] text-slate-600 font-bold">+{p.results.filter(r => r.probability > 0.4).length - 2}</span>
                    )}
                  </div>
                  <ChevronRight size={18} className="text-slate-700 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

