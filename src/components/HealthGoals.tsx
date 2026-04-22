import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { HealthGoal } from '../types';
import { Target, Plus, Trash2, CheckCircle2, Waves, Footprints, Moon, Flame, Dumbbell } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const HealthGoals: React.FC = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<HealthGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    targetValue: 0,
    currentValue: 0,
    unit: '',
    category: 'steps' as const,
  });

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'users', user.uid, 'health_goals'), orderBy('timestamp', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setGoals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HealthGoal)));
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.title) return;

    try {
      await addDoc(collection(db, 'users', user.uid, 'health_goals'), {
        ...formData,
        userId: user.uid,
        completed: false,
        timestamp: serverTimestamp(),
      });
      setFormData({ title: '', targetValue: 0, currentValue: 0, unit: '', category: 'steps' });
      setShowAdd(false);
    } catch (e) {
      console.error("Error adding goal:", e);
    }
  };

  const updateProgress = async (id: string, current: number, target: number) => {
    if (!user) return;
    const newVal = current + 1;
    await updateDoc(doc(db, 'users', user.uid, 'health_goals', id), { 
      currentValue: newVal,
      completed: newVal >= target
    });
  };

  const removeGoal = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'health_goals', id));
  };

  const getIcon = (category: string) => {
    switch (category) {
      case 'water': return <Waves size={20} />;
      case 'steps': return <Footprints size={20} />;
      case 'sleep': return <Moon size={20} />;
      case 'calories': return <Flame size={20} />;
      case 'exercise': return <Dumbbell size={20} />;
      default: return <Target size={20} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Health & Wellness Goals</h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Set and achieve your daily targets</p>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="btn-primary flex items-center gap-2"
        >
          {showAdd ? <CheckCircle2 size={18} /> : <Plus size={18} />}
          {showAdd ? 'View Progress' : 'Set New Goal'}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {showAdd ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl"
          >
            <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Goal Title</label>
                <input 
                  required
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. Daily Water Intake"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category</label>
                <select 
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value as any})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-blue-500 text-white"
                >
                  <option value="steps">Steps</option>
                  <option value="water">Water</option>
                  <option value="sleep">Sleep</option>
                  <option value="exercise">Exercise</option>
                  <option value="calories">Calories</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Value</label>
                <div className="flex gap-2">
                  <input 
                    required
                    type="number" 
                    value={formData.targetValue}
                    onChange={e => setFormData({...formData, targetValue: Number(e.target.value)})}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <input 
                    required
                    type="text" 
                    value={formData.unit}
                    onChange={e => setFormData({...formData, unit: e.target.value})}
                    className="w-24 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="unit"
                  />
                </div>
              </div>
              <div className="md:col-span-2 pt-4">
                <button type="submit" className="w-full btn-primary py-3">Activate Goal</button>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {goals.map((goal) => {
              const progress = Math.min(100, (goal.currentValue / goal.targetValue) * 100);
              return (
                <div 
                  key={goal.id} 
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm hover:border-slate-700 transition-all flex flex-col group relative overflow-hidden"
                >
                  {goal.completed && (
                    <div className="absolute top-2 right-2 text-emerald-400">
                      <CheckCircle2 size={16} />
                    </div>
                  )}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-lg ${goal.completed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'}`}>
                      {getIcon(goal.category)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white tracking-tight">{goal.title}</h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase">{goal.category}</p>
                    </div>
                  </div>
                  
                  <div className="flex-1 mb-6">
                    <div className="flex items-baseline justify-between mb-2">
                      <span className="text-xl font-black text-white">{goal.currentValue} <span className="text-xs font-bold text-slate-500 uppercase ml-0.5">{goal.unit}</span></span>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Goal: {goal.targetValue}</span>
                    </div>
                    <div className="h-2 bg-slate-950 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className={`h-full ${goal.completed ? 'bg-emerald-500' : 'bg-blue-500'} shadow-[0_0_10px_rgba(59,130,246,0.3)]`}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <button 
                      onClick={() => updateProgress(goal.id!, goal.currentValue, goal.targetValue)}
                      disabled={goal.completed}
                      className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all ${
                        goal.completed ? 'bg-slate-800 text-slate-500 italic' : 'bg-slate-950 text-blue-400 border border-slate-800 hover:border-blue-500/50'
                      }`}
                    >
                      {goal.completed ? 'Achieved' : '+ Add Progress'}
                    </button>
                    <button 
                      onClick={() => removeGoal(goal.id!)}
                      className="p-1.5 text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
            {!loading && goals.length === 0 && (
              <div className="col-span-full py-20 text-center bg-slate-900/20 border border-dashed border-slate-800 rounded-3xl">
                <Target size={40} className="mx-auto text-slate-800 mb-4" />
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">No active health goals</p>
                <button onClick={() => setShowAdd(true)} className="mt-4 btn-primary px-6">Create Your First Goal</button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
