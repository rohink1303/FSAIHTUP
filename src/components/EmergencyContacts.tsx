import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { EmergencyContact } from '../types';
import { Shield, Plus, Trash2, Phone, Mail, User, Heart, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const EmergencyContacts: React.FC = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    phone: '',
    email: '',
    notes: '',
  });

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'users', user.uid, 'emergency_contacts'), orderBy('timestamp', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setContacts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EmergencyContact)));
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.name || !formData.phone) return;

    try {
      await addDoc(collection(db, 'users', user.uid, 'emergency_contacts'), {
        ...formData,
        userId: user.uid,
        timestamp: serverTimestamp(),
      });
      setFormData({ name: '', relationship: '', phone: '', email: '', notes: '' });
      setShowAdd(false);
    } catch (e) {
      console.error("Error adding contact:", e);
    }
  };

  const removeContact = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'emergency_contacts', id));
  };

  return (
    <div className="space-y-6">
      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center text-red-500 shrink-0">
          <AlertTriangle size={24} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-red-500 uppercase tracking-widest">Emergency Readiness</h3>
          <p className="text-xs text-slate-400 mt-1">Keep your primary contacts and medical emergency info up to date for quick access.</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">ICE Contacts</h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">In Case of Emergency Contacts</p>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="btn-primary flex items-center gap-2"
        >
          {showAdd ? <User size={18} /> : <Plus size={18} />}
          {showAdd ? 'Close Form' : 'Add Contact'}
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
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contact Name</label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500" placeholder="Full Name" />
                </div>
              </div>
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Relationship</label>
                <div className="relative">
                  <Heart size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input required type="text" value={formData.relationship} onChange={e => setFormData({...formData, relationship: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500" placeholder="e.g. Spouse, Parent, Doctor" />
                </div>
              </div>
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone Number</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500" placeholder="+1 (555) 000-0000" />
                </div>
              </div>
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email (Optional)</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500" placeholder="email@example.com" />
                </div>
              </div>
              <div className="md:col-span-2 space-y-1.5 text-left">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Medical Notes / Instructions</label>
                <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500 min-h-[80px]" placeholder="e.g. Primary Physician, Blood Type A+, Allergies to Penicillin..." />
              </div>
              <div className="md:col-span-2">
                <button type="submit" className="w-full btn-primary py-3">Register Contact</button>
              </div>
            </form>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contacts.map((contact) => (
              <div key={contact.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-blue-500/30 transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center text-blue-500">
                      <User size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">{contact.name}</h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{contact.relationship}</p>
                    </div>
                  </div>
                  <button onClick={() => removeContact(contact.id!)} className="p-2 text-slate-800 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <div className="space-y-2">
                  <a href={`tel:${contact.phone}`} className="flex items-center gap-3 p-2.5 bg-slate-950 rounded-xl border border-slate-800/50 hover:bg-slate-800 transition-colors">
                    <Phone size={14} className="text-emerald-500" />
                    <span className="text-xs font-bold text-slate-300">{contact.phone}</span>
                  </a>
                  {contact.email && (
                    <a href={`mailto:${contact.email}`} className="flex items-center gap-3 p-2.5 bg-slate-950 rounded-xl border border-slate-800/50 hover:bg-slate-800 transition-colors">
                      <Mail size={14} className="text-blue-500" />
                      <span className="text-xs font-bold text-slate-300 truncate">{contact.email}</span>
                    </a>
                  )}
                </div>

                {contact.notes && (
                  <div className="mt-4 p-3 bg-red-500/5 border border-red-500/10 rounded-xl">
                    <p className="text-[10px] text-red-500/70 leading-relaxed font-medium">
                      <AlertTriangle size={10} className="inline mr-1 mb-0.5" />
                      {contact.notes}
                    </p>
                  </div>
                )}
              </div>
            ))}
            {!loading && contacts.length === 0 && (
              <div className="md:col-span-2 py-12 text-center bg-slate-900/30 border border-dashed border-slate-800 rounded-3xl">
                <Shield size={40} className="mx-auto text-slate-800 mb-4" />
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">No emergency contacts saved</p>
              </div>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
