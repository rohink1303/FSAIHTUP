import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Appointment } from '../types';
import { Calendar, Plus, Trash2, MapPin, Stethoscope, Clock, CheckCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

export const AppointmentLog: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    doctorName: '',
    specialty: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    location: '',
    notes: '',
  });

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'users', user.uid, 'appointments'), orderBy('date', 'asc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setAppointments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment)));
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.doctorName) return;

    try {
      await addDoc(collection(db, 'users', user.uid, 'appointments'), {
        ...formData,
        userId: user.uid,
        status: 'scheduled',
        timestamp: serverTimestamp(),
      });
      setFormData({ doctorName: '', specialty: '', date: new Date().toISOString().split('T')[0], time: '10:00', location: '', notes: '' });
      setShowAdd(false);
    } catch (e) {
      console.error("Error adding appointment:", e);
    }
  };

  const updateStatus = async (id: string, status: 'completed' | 'cancelled' | 'scheduled') => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid, 'appointments', id), { status });
  };

  const removeAppointment = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'appointments', id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Appointment Log</h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Manage your clinical visits and consultations</p>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="btn-primary flex items-center gap-2"
        >
          {showAdd ? <XCircle size={18} /> : <Plus size={18} />}
          {showAdd ? 'Close Form' : 'Schedule Visit'}
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
            <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Doctor Name</label>
                <input required type="text" value={formData.doctorName} onChange={e => setFormData({...formData, doctorName: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500" placeholder="e.g. Dr. Sarah Smith" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Specialty</label>
                <input type="text" value={formData.specialty} onChange={e => setFormData({...formData, specialty: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500" placeholder="e.g. Cardiology" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</label>
                <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Time</label>
                <input type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Location</label>
                <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500" placeholder="e.g. Medical Plaza, Room 302" />
              </div>
              <div className="md:col-span-2 pt-2">
                <button type="submit" className="w-full btn-primary py-3">Log Appointment</button>
              </div>
            </form>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {appointments.map((app) => (
              <div key={app.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between group hover:border-blue-500/30 transition-all">
                <div className="flex items-center gap-5">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${app.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'}`}>
                    <Calendar size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white tracking-tight">{app.doctorName}</h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                      <span className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        <Stethoscope size={10} /> {app.specialty || 'General Practice'}
                      </span>
                      <span className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        <Clock size={10} /> {format(new Date(app.date), 'MMM d')} @ {app.time}
                      </span>
                      {app.location && (
                        <span className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                          <MapPin size={10} /> {app.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {app.status === 'scheduled' ? (
                    <button onClick={() => updateStatus(app.id!, 'completed')} className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all" title="Mark as Completed">
                      <CheckCircle size={20} />
                    </button>
                  ) : (
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${app.status === 'completed' ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-500 bg-slate-800'}`}>
                      {app.status}
                    </span>
                  )}
                  <button onClick={() => removeAppointment(app.id!)} className="p-2 text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                     <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
            {!loading && appointments.length === 0 && (
              <div className="py-16 text-center bg-slate-900/30 border border-dashed border-slate-800 rounded-3xl">
                <Calendar size={48} className="mx-auto text-slate-800 mb-4" />
                <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">No appointments logged</p>
                <button onClick={() => setShowAdd(true)} className="mt-4 text-blue-500 text-xs font-bold uppercase tracking-widest hover:underline">Schedule your next visit</button>
              </div>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
