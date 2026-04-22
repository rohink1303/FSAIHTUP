import React, { useState } from 'react';
import { Calculator, Scale, Ruler, Activity, Droplets, Info, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const HealthCalculators: React.FC = () => {
  const [activeTool, setActiveTool] = useState<'bmi' | 'bmr' | 'water'>('bmi');
  
  // BMI State
  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(170);
  
  // BMR State
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [age, setAge] = useState(30);
  const [activity, setActivity] = useState(1.2); // Sedentary

  const calculateBMI = () => {
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-400' };
    if (bmi < 25) return { label: 'Normal', color: 'text-emerald-400' };
    if (bmi < 30) return { label: 'Overweight', color: 'text-amber-400' };
    return { label: 'Obese', color: 'text-red-400' };
  };

  const calculateBMR = () => {
    // Mifflin-St Jeor Equation
    let bmr;
    if (gender === 'male') {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }
    return Math.round(bmr);
  };

  const calculateWaterRes = () => {
    // Basic calculation: roughly 35ml per kg of body weight
    return (weight * 0.035).toFixed(1);
  };

  const bmiValue = parseFloat(calculateBMI());
  const bmiCategory = getBMICategory(bmiValue);
  const bmrValue = calculateBMR();
  const tdeeValue = Math.round(bmrValue * activity);

  return (
    <div className="space-y-6">
      <div className="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6">
        <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-500 shrink-0">
          <Calculator size={32} />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-xl font-bold text-white tracking-tight">Clinical Toolset</h2>
          <p className="text-sm text-slate-400 mt-1 max-w-lg">Calculate essential body metrics and metabolic rates using standard clinical formulas.</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
        {[
          { id: 'bmi', label: 'BMI Index', icon: Scale },
          { id: 'bmr', label: 'Metabolism', icon: Activity },
          { id: 'water', label: 'Hydration', icon: Droplets }
        ].map(tool => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id as any)}
            className={`flex items-center gap-3 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shrink-0 ${
              activeTool === tool.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                : 'bg-slate-900 text-slate-500 border border-slate-800 hover:border-slate-700'
            }`}
          >
            <tool.icon size={16} />
            {tool.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Input Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Calculator Inputs</h3>
            <div className="w-8 h-8 rounded-full bg-slate-950 flex items-center justify-center border border-slate-800">
              <Calculator size={14} className="text-slate-600" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span>Body Weight (kg)</span>
                <span className="text-white">{weight} kg</span>
              </div>
              <input type="range" min="30" max="250" value={weight} onChange={e => setWeight(parseInt(e.target.value))} className="w-full accent-blue-600" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span>Height (cm)</span>
                <span className="text-white">{height} cm</span>
              </div>
              <input type="range" min="100" max="250" value={height} onChange={e => setHeight(parseInt(e.target.value))} className="w-full accent-blue-600" />
            </div>

            {activeTool === 'bmr' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 pt-2">
                <div className="flex gap-4">
                  <button onClick={() => setGender('male')} className={`flex-1 py-3 rounded-xl border font-bold text-xs uppercase tracking-widest transition-all ${gender === 'male' ? 'bg-blue-600/10 border-blue-600 text-blue-500' : 'bg-slate-950 border-slate-800 text-slate-600'}`}>Male</button>
                  <button onClick={() => setGender('female')} className={`flex-1 py-3 rounded-xl border font-bold text-xs uppercase tracking-widest transition-all ${gender === 'female' ? 'bg-pink-600/10 border-pink-600 text-pink-500' : 'bg-slate-950 border-slate-800 text-slate-600'}`}>Female</button>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <span>Age</span>
                    <span className="text-white">{age} years</span>
                  </div>
                  <input type="range" min="1" max="120" value={age} onChange={e => setAge(parseInt(e.target.value))} className="w-full accent-blue-600" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Activity Level</label>
                  <select value={activity} onChange={e => setActivity(parseFloat(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none">
                    <option value={1.2}>Sedentary (Office job)</option>
                    <option value={1.375}>Lightly Active (1-3 days/week)</option>
                    <option value={1.55}>Moderate (3-5 days/week)</option>
                    <option value={1.725}>Very Active (6-7 days/week)</option>
                    <option value={1.9}>Athlete (Elite training)</option>
                  </select>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Results Card */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {activeTool === 'bmi' && (
              <motion.div 
                key="bmi" 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }}
                className="bg-slate-950 border border-slate-800 rounded-3xl p-8 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 mb-8">Body Mass Index</h4>
                <div className="text-center space-y-2">
                  <div className="text-6xl font-black text-white">{bmiValue}</div>
                  <div className={`text-xs font-black uppercase tracking-[0.3em] ${bmiCategory.color}`}>
                    {bmiCategory.label}
                  </div>
                </div>
                
                <div className="mt-8 pt-8 border-t border-slate-800/50 space-y-4">
                  <div className="flex items-center gap-3 text-slate-500">
                    <Info size={14} className="shrink-0" />
                    <p className="text-[10px] uppercase font-bold tracking-wider leading-relaxed">
                      BMI is a screening tool, not a diagnostic. It doesn't measure body fat directly.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTool === 'bmr' && (
              <motion.div 
                key="bmr" 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="bg-slate-950 border border-slate-800 rounded-3xl p-8">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 mb-6">Basal Metabolic Rate</h4>
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-5xl font-black text-white">{bmrValue}</span>
                    <span className="text-[10px] font-black text-slate-500 uppercase">kcal/day</span>
                  </div>
                  <p className="text-[9px] text-center text-slate-600 font-bold uppercase mt-2">Energy burned at complete rest</p>
                </div>
                
                <div className="bg-blue-600 rounded-3xl p-8 text-white shadow-xl shadow-blue-600/20">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200 mb-6 font-medium">Daily Energy Expenditure</h4>
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-5xl font-black">{tdeeValue}</span>
                    <span className="text-[10px] font-black text-blue-200 uppercase">kcal/day</span>
                  </div>
                  <p className="text-[9px] text-center text-blue-100 font-bold uppercase mt-2">Total energy needed for current activity level</p>
                </div>
              </motion.div>
            )}

            {activeTool === 'water' && (
              <motion.div 
                key="water" 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }}
                className="bg-slate-950 border border-slate-800 rounded-3xl p-8"
              >
                 <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-700 mb-10">Recommended Hydration</h4>
                 <div className="flex items-center gap-8 px-4">
                   <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                      <div className="absolute inset-0 bg-blue-500/10 rounded-full animate-pulse" />
                      <Droplets size={40} className="text-blue-500" />
                   </div>
                   <div className="space-y-1">
                      <div className="text-4xl font-black text-white">{calculateWaterRes()}L</div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Daily Intake target</div>
                      <p className="text-[8px] font-bold text-slate-700 uppercase mt-2">Estimated base on body weight (35ml/kg)</p>
                   </div>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
