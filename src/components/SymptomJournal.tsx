import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { SymptomLog } from '../types';
import { Book, Plus, Trash2, AlertCircle, Calendar, Clock, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

export const SymptomJournal: React.FC = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<SymptomLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    symptom: '',
    intensity: 5,
    description: '',
    duration: '',
  });

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'users', user.uid, 'symptoms'), orderBy('timestamp', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SymptomLog)));
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.symptom) return;

    try {
      await addDoc(collection(db, 'users', user.uid, 'symptoms'), {
        ...formData,
        userId: user.uid,
        timestamp: serverTimestamp(),
      });
      setFormData({ symptom: '', intensity: 5, description: '', duration: '' });
      setShowAdd(false);
    } catch (e) {
      console.error("Error adding symptom log:", e);
    }
  };

  const removeLog = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'symptoms', id));
  };

  const getIntensityColor = (intensity: number) => {
    if (intensity <= 3) return 'bg-emerald-500';
    if (intensity <= 7) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getIntensityLabel = (intensity: number) => {
    if (intensity <= 3) return 'Mild';
    if (intensity <= 7) return 'Moderate';
    return 'Severe';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Symptom Journal</h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Track variations in your physical well-being</p>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="btn-primary flex items-center gap-2"
        >
          {showAdd ? <AlertCircle size={18} /> : <Plus size={18} />}
          {showAdd ? 'Close' : 'Log Symptom'}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {showAdd ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl"
          >
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Symptom Name</label>
                  <input 
                    required 
                    type="text" 
                    value={formData.symptom} 
                    onChange={e => setFormData({...formData, symptom: e.target.value})} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500" 
                    placeholder="e.g. Headache, Joint Pain" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Duration</label>
                  <input 
                    type="text" 
                    value={formData.duration} 
                    onChange={e => setFormData({...formData, duration: e.target.value})} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500" 
                    placeholder="e.g. 2 hours, Since morning" 
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Intensity: {formData.intensity} ({getIntensityLabel(formData.intensity)})</label>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  value={formData.intensity} 
                  onChange={e => setFormData({...formData, intensity: parseInt(e.target.value)})} 
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-[8px] text-slate-600 font-black uppercase">
                  <span>Mild</span>
                  <span>Moderate</span>
                  <span>Severe</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Notes / Description</label>
                <textarea 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-blue-500 min-h-[100px]" 
                  placeholder="Describe how you feel, any triggers, etc."
                />
              </div>

              <button type="submit" className="w-full btn-primary py-3">Save Entry</button>
            </form>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 group hover:border-blue-500/30 transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${getIntensityColor(log.intensity)}`}>
                      <Activity size={20} className="text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-white tracking-tight">{log.symptom}</h3>
                        <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${getIntensityColor(log.intensity)} text-white`}>
                          Level {log.intensity}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                        <span className="flex items-center gap-1"><Calendar size={10} /> {log.timestamp ? format(log.timestamp.toDate(), 'MMM d, yyyy') : 'Recently'}</span>
                        <span className="flex items-center gap-1"><Clock size={10} /> {log.timestamp ? format(log.timestamp.toDate(), 'p') : ''}</span>
                        {log.duration && <span className="text-blue-400">Duration: {log.duration}</span>}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => removeLog(log.id!)} className="p-2 text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                    <Trash2 size={18} />
                  </button>
                </div>
                {log.description && (
                  <div className="mt-4 p-3 bg-slate-950/50 rounded-xl border border-slate-800/50">
                    <p className="text-xs text-slate-400 leading-relaxed italic">"{log.description}"</p>
                  </div>
                )}
              </div>
            ))}

            {!loading && logs.length === 0 && (
              <div className="py-16 text-center bg-slate-900/30 border border-dashed border-slate-800 rounded-3xl">
                <Book size={48} className="mx-auto text-slate-800 mb-4" />
                <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Your journal is empty</p>
                <p className="text-[10px] text-slate-700 mt-1 uppercase font-bold tracking-tighter">Log symptoms to track patterns over time</p>
              </div>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
