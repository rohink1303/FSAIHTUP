import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Medication } from '../types';
import { Pill, Plus, Trash2, CheckCircle2, History, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const MedicationManager: React.FC = () => {
  const { user } = useAuth();
  const [meds, setMeds] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: '',
    purpose: '',
    startDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'users', user.uid, 'medications'), orderBy('timestamp', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setMeds(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Medication)));
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.name) return;

    try {
      await addDoc(collection(db, 'users', user.uid, 'medications'), {
        ...formData,
        userId: user.uid,
        active: true,
        timestamp: serverTimestamp(),
      });
      setFormData({ name: '', dosage: '', frequency: '', purpose: '', startDate: new Date().toISOString().split('T')[0] });
      setShowAdd(false);
    } catch (e) {
      console.error("Error adding medication:", e);
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid, 'medications', id), { active: !current });
  };

  const removeMed = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'medications', id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Medication Manager</h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Track your active prescriptions</p>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="btn-primary flex items-center gap-2"
        >
          {showAdd ? <History size={18} /> : <Plus size={18} />}
          {showAdd ? 'View List' : 'Add Medication'}
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
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Medication Name</label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. Metformin"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dosage</label>
                <input 
                  type="text" 
                  value={formData.dosage}
                  onChange={e => setFormData({...formData, dosage: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. 500mg"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Frequency</label>
                <input 
                  type="text" 
                  value={formData.frequency}
                  onChange={e => setFormData({...formData, frequency: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. Twice daily"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Start Date</label>
                <input 
                  type="date" 
                  value={formData.startDate}
                  onChange={e => setFormData({...formData, startDate: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Purpose (Optional)</label>
                <input 
                  type="text" 
                  value={formData.purpose}
                  onChange={e => setFormData({...formData, purpose: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. Blood sugar control"
                />
              </div>
              <div className="md:col-span-2 pt-4">
                <button type="submit" className="w-full btn-primary py-3">Save Medication</button>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {meds.map((med) => (
              <div 
                key={med.id} 
                className={`bg-slate-900 border ${med.active ? 'border-slate-800' : 'border-slate-800/50 opacity-60'} rounded-2xl p-5 flex items-start gap-4 transition-all hover:border-slate-700 group`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${med.active ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-800 text-slate-500'}`}>
                  <Pill size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-white truncate">{med.name}</h3>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${med.active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                      {med.active ? 'Active' : 'Stopped'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium mb-2">{med.dosage} • {med.frequency}</p>
                  {med.purpose && (
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mb-4 italic">
                      <AlertCircle size={10} />
                      {med.purpose}
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => toggleActive(med.id!, med.active)}
                      className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 p-1 px-2 rounded-lg transition-colors ${med.active ? 'hover:bg-amber-500/10 text-amber-500' : 'hover:bg-emerald-500/10 text-emerald-500'}`}
                    >
                      <CheckCircle2 size={12} />
                      {med.active ? 'Stop' : 'Restart'}
                    </button>
                    <button 
                      onClick={() => removeMed(med.id!)}
                      className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 p-1 px-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors ml-auto opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={12} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {!loading && meds.length === 0 && (
              <div className="col-span-full py-12 text-center bg-slate-900/30 border border-dashed border-slate-800 rounded-3xl">
                <Pill size={48} className="mx-auto text-slate-800 mb-4" />
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">No medications logged</p>
                <button onClick={() => setShowAdd(true)} className="mt-4 text-blue-500 text-xs font-bold uppercase tracking-widest hover:underline transition-all">Add your first prescription</button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
