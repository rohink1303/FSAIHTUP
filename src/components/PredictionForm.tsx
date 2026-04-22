import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { predictDiseases } from '../services/predictionEngine';
import { HealthRecord } from '../types';
import { Activity, Thermometer, Droplets, Info, ArrowRight, ShieldCheck } from 'lucide-react';

export const PredictionForm: React.FC<{ onComplete: (id: string) => void }> = ({ onComplete }) => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    patientName: '',
    age: profile?.age?.toString() || '',
    gender: profile?.gender || 'male',
    glucose: '',
    systolicBP: '',
    diastolicBP: '',
    cholesterol: '',
    weight: profile?.weight?.toString() || '',
    height: profile?.height?.toString() || '',
    heartRate: '',
    respRate: '',
    spo2: '',
    temperature: '',
    smokingStatus: 'never',
    alcoholIntake: 'none',
    activityLevel: 'moderate',
    symptoms: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const weightNum = parseFloat(formData.weight);
      const heightNum = parseFloat(formData.height);
      const bmi = (weightNum && heightNum) ? weightNum / Math.pow(heightNum / 100, 2) : 22;

      const record: HealthRecord = {
        userId: user.uid,
        patientName: formData.patientName || (user.displayName || 'Anonymous'),
        age: parseInt(formData.age) || 30,
        gender: formData.gender as any,
        glucose: parseFloat(formData.glucose) || 90,
        systolicBP: parseFloat(formData.systolicBP) || 120,
        diastolicBP: parseFloat(formData.diastolicBP) || 80,
        cholesterol: parseFloat(formData.cholesterol) || 180,
        heartRate: parseFloat(formData.heartRate) || 72,
        respRate: parseFloat(formData.respRate) || 16,
        spo2: parseFloat(formData.spo2) || 98,
        temperature: parseFloat(formData.temperature) || 36.6,
        smokingStatus: formData.smokingStatus as any,
        alcoholIntake: formData.alcoholIntake as any,
        activityLevel: formData.activityLevel as any,
        weight: weightNum,
        height: heightNum,
        bmi,
        symptoms: formData.symptoms,
        timestamp: serverTimestamp(),
      };

      // Save Record
      const recordRef = await addDoc(collection(db, 'users', user.uid, 'health_records'), record);
      
      // Generate Prediction
      const results = predictDiseases(record);
      const prediction = {
        userId: user.uid,
        recordId: recordRef.id,
        patientName: record.patientName, // Denormalized for high-speed listing
        results,
        timestamp: serverTimestamp(),
      };

      const predictionRef = await addDoc(collection(db, 'users', user.uid, 'predictions'), prediction);
      
      onComplete(predictionRef.id);
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="bg-blue-600 p-8 text-white relative">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Clinical Health Assessment</h2>
              <p className="text-blue-100 text-sm">Provide patient data and diagnostics for global health risk analysis.</p>
            </div>
          </div>
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-blue-200">
            <span>Vertex AI Bio-Engine v2.0</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Analyzing Bio-Signals</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-10">
          {/* Patient Identity */}
          <section className="space-y-6">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400 border-b border-slate-800 pb-2">Patient Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="label-caps">Full Name / Identifier</label>
                <input
                  type="text"
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleInputChange}
                  className="input-primary"
                  placeholder="e.g. John Smith"
                />
              </div>
              <div>
                <label className="label-caps">Age (Years)</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  className="input-primary"
                  required
                />
              </div>
              <div>
                <label className="label-caps">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="input-primary"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Vitals Diagnostics */}
            <div className="space-y-8 text-white">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400 border-b border-slate-800 pb-2">Vitals & Labs</h3>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="label-caps">Glucose (mg/dL)</label>
                  <input
                    type="number"
                    name="glucose"
                    value={formData.glucose}
                    onChange={handleInputChange}
                    className="input-primary"
                    placeholder="90"
                    required
                  />
                </div>
                <div>
                  <label className="label-caps">Total Cholesterol</label>
                  <input
                    type="number"
                    name="cholesterol"
                    value={formData.cholesterol}
                    onChange={handleInputChange}
                    className="input-primary"
                    placeholder="180"
                    required
                  />
                </div>
                <div>
                  <label className="label-caps">Systolic BP</label>
                  <input
                    type="number"
                    name="systolicBP"
                    value={formData.systolicBP}
                    onChange={handleInputChange}
                    className="input-primary"
                    placeholder="120"
                    required
                  />
                </div>
                <div>
                  <label className="label-caps">Diastolic BP</label>
                  <input
                    type="number"
                    name="diastolicBP"
                    value={formData.diastolicBP}
                    onChange={handleInputChange}
                    className="input-primary"
                    placeholder="80"
                    required
                  />
                </div>
                <div>
                  <label className="label-caps">Heart Rate (BPM)</label>
                  <input
                    type="number"
                    name="heartRate"
                    value={formData.heartRate}
                    onChange={handleInputChange}
                    className="input-primary"
                    placeholder="72"
                  />
                </div>
                <div>
                  <label className="label-caps">SpO2 (%)</label>
                  <input
                    type="number"
                    name="spo2"
                    value={formData.spo2}
                    onChange={handleInputChange}
                    className="input-primary"
                    placeholder="98"
                  />
                </div>
              </div>
            </div>

            {/* Biophysics & Lifestyle */}
            <div className="space-y-8">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400 border-b border-slate-800 pb-2">Biophysics & Lifestyle</h3>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="label-caps">Weight (kg)</label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    className="input-primary"
                    required
                  />
                </div>
                <div>
                  <label className="label-caps">Height (cm)</label>
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleInputChange}
                    className="input-primary"
                    required
                  />
                </div>
                <div>
                  <label className="label-caps">Smoking Status</label>
                  <select
                    name="smokingStatus"
                    value={formData.smokingStatus}
                    onChange={handleInputChange}
                    className="input-primary"
                  >
                    <option value="never">Never Smoked</option>
                    <option value="former">Former Smoker</option>
                    <option value="current">Current Smoker</option>
                  </select>
                </div>
                <div>
                  <label className="label-caps">Activity Level</label>
                  <select
                    name="activityLevel"
                    value={formData.activityLevel}
                    onChange={handleInputChange}
                    className="input-primary"
                  >
                    <option value="sedentary">Sedentary</option>
                    <option value="moderate">Moderate</option>
                    <option value="active">Active / Athletic</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="label-caps">Alcohol Consumption</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['none', 'moderate', 'high'].map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, alcoholIntake: level as any }))}
                        className={`py-2 text-[10px] font-black uppercase rounded-lg border transition-all ${
                          formData.alcoholIntake === level 
                            ? 'bg-blue-600 border-blue-500 text-white shadow-lg' 
                            : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="label-caps text-white">Symptoms or Concerns</label>
                <textarea
                  name="symptoms"
                  value={formData.symptoms}
                  onChange={handleInputChange}
                  className="input-primary h-24 resize-none"
                  placeholder="e.g. Chronic cough, chest pain, tremors..."
                />
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-3 text-slate-500">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-tight text-slate-400 leading-none mb-1">Clinic-Grade Privacy</p>
                <p className="text-[9px] text-slate-600 font-mono uppercase tracking-widest">Isolated Tensor Processing</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary min-w-[240px] py-4 flex items-center justify-center gap-3 shadow-xl hover:shadow-blue-900/40"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing Deep Insights...
                </>
              ) : (
                <>
                  <span className="font-black uppercase tracking-tight text-[11px]">Generate Diagnostic View</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

