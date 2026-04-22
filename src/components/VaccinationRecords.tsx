import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Vaccination } from '../types';
import { Shield, Plus, Trash2, Calendar, User, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

export const VaccinationRecords: React.FC = () => {
  const { user } = useAuth();
  const [vaccines, setVaccines] = useState<Vaccination[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    date: new Date().toISOString().split('T')[0],
    provider: '',
    notes: '',
  });

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'users', user.uid, 'vaccinations'), orderBy('date', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setVaccines(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vaccination)));
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.name) return;

    try {
      await addDoc(collection(db, 'users', user.uid, 'vaccinations'), {
        ...formData,
        userId: user.uid,
        timestamp: serverTimestamp(),
      });
      setFormData({ name: '', date: new Date().toISOString().split('T')[0], provider: '', notes: '' });
      setShowAdd(false);
    } catch (e) {
      console.error("Error adding vaccination:", e);
    }
  };

  const removeVaccine = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'vaccinations', id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Immunization Records</h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Keep track of your vaccination history</p>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="btn-primary flex items-center gap-2"
        >
          {showAdd ? <FileText size={18} /> : <Plus size={18} />}
          {showAdd ? 'View Records' : 'Log Vaccination'}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {showAdd ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl"
          >
            <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vaccine Name</label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. COVID-19 Booster, Influenza"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Administration Date</label>
                <input 
                  required
                  type="date" 
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Provider / Clinic</label>
                <input 
                  type="text" 
                  value={formData.provider}
                  onChange={e => setFormData({...formData, provider: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. City Central Hospital"
                />
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Notes</label>
                <textarea 
                  rows={2}
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Any reactions or next dose date..."
                />
              </div>
              <div className="md:col-span-2 pt-2">
                <button type="submit" className="w-full btn-primary py-3">Log Vaccination</button>
              </div>
            </form>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {vaccines.map((v) => (
              <motion.div 
                layout
                key={v.id} 
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center gap-6 group hover:border-blue-500/30 transition-all"
              >
                <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center shrink-0 border border-emerald-500/20">
                  <Shield size={24} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 flex-1 gap-4 items-center">
                  <div>
                    <h3 className="font-bold text-white tracking-tight">{v.name}</h3>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase mt-0.5">
                      <Calendar size={10} />
                      {format(new Date(v.date), 'MMMM d, yyyy')}
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-2">
                    <User size={14} className="text-slate-600" />
                    {v.provider || 'N/A Provider'}
                  </div>
                  <div className="text-xs text-slate-500 italic truncate pr-8">
                    {v.notes || 'No additional notes recorded.'}
                  </div>
                </div>
                <button 
                  onClick={() => removeVaccine(v.id!)}
                  className="p-2 text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </motion.div>
            ))}
            {!loading && vaccines.length === 0 && (
              <div className="py-20 text-center bg-slate-900/30 border border-dashed border-slate-800 rounded-3xl">
                <Shield size={48} className="mx-auto text-slate-800 mb-4" />
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">No immunization history found</p>
                <button onClick={() => setShowAdd(true)} className="mt-4 text-blue-500 text-xs font-bold uppercase tracking-widest hover:underline">Start logging your vaccines</button>
              </div>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
