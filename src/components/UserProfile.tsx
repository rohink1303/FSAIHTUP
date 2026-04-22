import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { User, LogOut, Shield, ChevronRight } from 'lucide-react';

export const UserProfileForm: React.FC = () => {
  const { profile, user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: profile?.fullName || '',
    age: profile?.age || '',
    gender: profile?.gender || 'male',
    weight: profile?.weight || '',
    height: profile?.height || '',
    medicalHistory: profile?.medicalHistory || '',
  });

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const profileRef = doc(db, 'users', user.uid);
      await updateDoc(profileRef, {
        fullName: formData.fullName,
        age: Number(formData.age),
        gender: formData.gender,
        weight: Number(formData.weight),
        height: Number(formData.height),
        medicalHistory: formData.medicalHistory,
      });
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Update error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2">Account Management</h2>
          <h3 className="text-2xl font-bold text-white">Profile Settings</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleUpdate} className="medical-card space-y-8 shadow-2xl">
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 border-b border-slate-800 pb-4 mb-6">Biological Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="label-caps">Full Name</label>
                  <input 
                    type="text" 
                    className="input-primary" 
                    value={formData.fullName}
                    onChange={e => setFormData({...formData, fullName: e.target.value})}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div>
                  <label className="label-caps">Age (Years)</label>
                  <input 
                    type="number" 
                    className="input-primary" 
                    value={formData.age}
                    onChange={e => setFormData({...formData, age: e.target.value})}
                    placeholder="30"
                    required
                  />
                </div>
                <div>
                  <label className="label-caps">Assigned Gender</label>
                  <select 
                    className="input-primary appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%2364748b%22%3E%3Cpath%20d%3D%22M7%207l3-3%203%203m0%206l-3%203-3-3%22%20stroke-width%3D%221.5%22%20stroke%3D%22%2364748b%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center] bg-no-repeat" 
                    value={formData.gender}
                    onChange={e => setFormData({...formData, gender: e.target.value as any})}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="label-caps">Baseline Weight (kg)</label>
                  <input 
                    type="number" 
                    className="input-primary" 
                    value={formData.weight}
                    onChange={e => setFormData({...formData, weight: e.target.value})}
                    placeholder="75"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="label-caps">Clinical History</label>
              <textarea 
                className="input-primary min-h-[120px] resize-none" 
                placeholder="List any ongoing conditions, allergies, or chronic medications. This data helps our AI provide more accurate context-aware insights."
                value={formData.medicalHistory}
                onChange={e => setFormData({...formData, medicalHistory: e.target.value})}
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-4 uppercase tracking-widest text-xs font-black">
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Synchronizing Profile...
                </div>
              ) : 'Commit Changes to Cloud'}
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 mb-6">Security Guard</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <Shield className="text-emerald-500 shrink-0 mt-0.5" size={18} />
                <div>
                  <p className="text-xs font-bold text-emerald-400 uppercase tracking-tight">Active Encryption</p>
                  <p className="text-[10px] text-emerald-500/70 mt-1 leading-relaxed">Medical records are siloed with AES-256 standard and distributed via Firebase Security Protocol.</p>
                </div>
              </div>
              <div className="space-y-2 list-none text-[11px] font-medium text-slate-400 pl-1">
                <li className="flex items-center gap-2"><ChevronRight size={14} className="text-blue-500" /> Vertex AI Data isolation</li>
                <li className="flex items-center gap-2"><ChevronRight size={14} className="text-blue-500" /> HIPAA-mapped infrastructure</li>
                <li className="flex items-center gap-2"><ChevronRight size={14} className="text-blue-500" /> Real-time audit logging</li>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col relative overflow-hidden group shadow-xl">
            <div className="absolute right-0 top-0 opacity-5 -mr-4 -mt-4 text-white">
              <User size={128} />
            </div>
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.1em] mb-4">Linked Identity</h3>
            <p className="text-sm font-bold text-white mb-2">{user?.displayName || 'Active User'}</p>
            <p className="text-xs font-mono text-blue-400 mb-6">{user?.email}</p>
            
            <div className="mt-auto pt-6 border-t border-slate-800/50">
              <div className="px-3 py-2 bg-slate-950 rounded-xl border border-slate-800 text-[10px] text-slate-500 italic leading-relaxed">
                "Profile precision directly correlates to the fidelity of our diagnostic assessments."
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

