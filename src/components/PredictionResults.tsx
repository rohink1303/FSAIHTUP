import React, { useEffect, useState } from 'react';
import { doc, getDoc, collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Prediction, HealthRecord, Insight } from '../types';
import { ChevronLeft, AlertTriangle, ShieldCheck, FileDown, Activity, ArrowLeft, Download } from 'lucide-react';
import Markdown from 'react-markdown';
import { motion } from 'motion/react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const PredictionResults: React.FC<{ predictionId: string; onBack: () => void }> = ({ predictionId, onBack }) => {
  const { user } = useAuth();
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [record, setRecord] = useState<HealthRecord | null>(null);
  const [insight, setInsight] = useState<Insight | null>(null);

  const getClinicalInsights = (pred: Prediction, rec: HealthRecord) => {
    let recommendations: string[] = [];
    
    if (rec.glucose > 140) recommendations.push("High glucose detected. Monitor carbohydrate intake and consult for metabolic screening.");
    if (rec.glucose < 70) recommendations.push("Low blood sugar alert. Ensure consistent nutritional intake.");
    if (rec.systolicBP > 130 || rec.diastolicBP > 90) recommendations.push("Elevated Blood Pressure. Reduce sodium intake and engage in regular cardiovascular monitoring.");
    if (rec.cholesterol > 200) recommendations.push("Cholesterol above optimal limits. Focus on a high-fiber, low-saturated fat diet.");
    if (rec.bmi > 25) recommendations.push("BMI in overweight range. Consider specialized weight management and metabolic assessments.");
    
    const riskDisease = pred.results.find(r => r.probability > 0.6);
    if (riskDisease) {
      recommendations.push(`Primary Risk Factor: ${riskDisease.disease} (${Math.round(riskDisease.probability * 100)}%). Detailed screening for early intervention is recommended.`);
    }

    if (recommendations.length === 0) {
      recommendations.push("Vitals are currently within optimal clinical ranges. Continue maintaining established wellness protocols.");
    }

    return `### Diagnostic Assessment\n\n${recommendations.map(r => `* ${r}`).join('\n')}\n\n**Note: This assessment is based on standard clinical thresholds and statistical risk modeling.**`;
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      const predRef = doc(db, 'users', user.uid, 'predictions', predictionId);
      const predSnap = await getDoc(predRef);
      
      if (predSnap.exists()) {
        const predData = { id: predSnap.id, ...predSnap.data() } as Prediction;
        setPrediction(predData);

        const recRef = doc(db, 'users', user.uid, 'health_records', predData.recordId);
        const recSnap = await getDoc(recRef);
        if (recSnap.exists()) {
          const recData = recSnap.data() as HealthRecord;
          setRecord(recData);

          // Rule-based insights (replaces AI)
          const content = getClinicalInsights(predData, recData);
          setInsight({
            id: 'local-insight',
            userId: user.uid,
            predictionId: predictionId,
            content,
            riskLevel: predData.results.some(r => r.probability > 0.75) ? 'critical' : 'moderate',
            timestamp: serverTimestamp() as any
          });
        }
      }
    };
    fetchData();
  }, [predictionId, user]);

  const downloadPDF = () => {
    if (!prediction || !record) return;
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('HealthAI Analysis Report', 20, 20);
    
    doc.setFontSize(10);
    doc.text(`Patient: ${record.patientName || 'N/A'}`, 20, 30);
    doc.text(`Age: ${record.age || 'N/A'}`, 20, 35);
    doc.text(`Gender: ${record.gender || 'N/A'}`, 20, 40);
    doc.text(`Provider: ${user?.displayName || 'System'}`, 20, 45);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 50);

    doc.setFontSize(14);
    doc.text('Vital Signs & Diagnostics', 20, 60);
    
    autoTable(doc, {
      startY: 65,
      head: [['Metric', 'Value']],
      body: [
        ['Glucose', `${record.glucose} mg/dL`],
        ['Blood Pressure', `${record.systolicBP}/${record.diastolicBP} mmHg`],
        ['Heart Rate', `${record.heartRate || 'N/A'} BPM`],
        ['Oxygen Saturation (SpO2)', `${record.spo2 || 'N/A'}%`],
        ['Temperature', `${record.temperature || 'N/A'} °C`],
        ['Cholesterol', `${record.cholesterol} mg/dL`],
        ['BMI', record.bmi?.toFixed(2) || 'N/A'],
        ['Smoking Status', record.smokingStatus || 'N/A'],
        ['Activity Level', record.activityLevel || 'N/A'],
        ['Symptoms', record.symptoms || 'None reported']
      ]
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.text('Disease Risk Assessment', 20, finalY);
    
    autoTable(doc, {
      startY: finalY + 5,
      head: [['Disease', 'Probability', 'Risk Level']],
      body: prediction.results.map(r => [r.disease, (r.probability * 100).toFixed(1) + '%', r.riskLevel])
    });

    doc.addPage();
    doc.text('AI Insights & Recommendations', 20, 20);
    doc.setFontSize(10);
    const splitText = doc.splitTextToSize(insight?.content || 'No AI insight available yet.', 170);
    doc.text(splitText, 20, 30);

    doc.save(`HealthReport_${predictionId.slice(0, 6)}.pdf`);
  };

  if (!prediction) return <div className="p-8 text-center animate-pulse">Loading analysis...</div>;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Back to Dashboard</span>
        </button>
        <button onClick={downloadPDF} className="btn-secondary flex items-center gap-2">
          <Download size={18} />
          Export Report (.PDF)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Results Matrix */}
        <div className="md:col-span-8 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-widest">Diagnostic Matrix</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Multi-Disease Screening Results</p>
              </div>
              <div className="text-right">
                <span className="block text-[10px] text-blue-400 font-bold uppercase tracking-widest">{record?.patientName}</span>
                <span className="block text-[9px] text-slate-500 font-mono uppercase">{record?.age}Y • {record?.gender}</span>
              </div>
            </div>
            
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {prediction.results.map((result, index) => {
                const colorClass = 
                  result.riskLevel === 'Low' ? 'bg-emerald-500' :
                  result.riskLevel === 'Moderate' ? 'bg-amber-500' : 
                  'bg-red-500';
                
                const textColorClass = 
                  result.riskLevel === 'Low' ? 'text-emerald-400' :
                  result.riskLevel === 'Moderate' ? 'text-amber-400' : 
                  'text-red-400';

                return (
                  <div key={index} className="bg-slate-950/50 border border-slate-800/50 rounded-xl p-4 flex flex-col gap-3 group hover:border-slate-700 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200">{result.disease}</span>
                      <span className={`text-[10px] font-bold uppercase ${textColorClass}`}>{result.riskLevel}</span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 tracking-wider">
                        <span>PROBABILITY</span>
                        <span>{Math.round(result.probability * 100)}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${result.probability * 100}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                          className={`h-full ${colorClass} shadow-[0_0_8px_rgba(0,0,0,0.5)]`}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* AI Insight Sidebar */}
        <div className="md:col-span-4 space-y-6">
          <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-10">
              <Activity size={120} />
            </div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center">
                <Activity size={18} />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-blue-100">Diagnostic Evaluation</h3>
            </div>
            
            {insight ? (
              <div className="markdown-content text-sm leading-relaxed text-blue-50">
                <Markdown>{insight.content}</Markdown>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="h-4 bg-white/10 rounded animate-pulse w-3/4" />
                <div className="h-4 bg-white/10 rounded animate-pulse w-full" />
                <p className="text-[10px] text-blue-200 font-bold uppercase tracking-widest mt-8 animate-pulse text-center">Formulating Assessment...</p>
              </div>
            )}
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Diagnostic Vitals</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
                <span className="text-[9px] font-bold text-slate-500 uppercase">Glucose</span>
                <span className="text-xs font-semibold text-white">{record?.glucose} <span className="text-[9px] text-slate-500">mg/dL</span></span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
                <span className="text-[9px] font-bold text-slate-500 uppercase">Blood Pressure</span>
                <span className="text-xs font-semibold text-white">{record?.systolicBP}/{record?.diastolicBP}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
                <span className="text-[9px] font-bold text-slate-500 uppercase">Heart Rate</span>
                <span className="text-xs font-semibold text-white">{record?.heartRate} <span className="text-[9px] text-slate-500">BPM</span></span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
                <span className="text-[9px] font-bold text-slate-500 uppercase">SpO2</span>
                <span className="text-xs font-semibold text-emerald-500">{record?.spo2}%</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
                <span className="text-[9px] font-bold text-slate-500 uppercase">Cholesterol</span>
                <span className="text-xs font-semibold text-white">{record?.cholesterol}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
                <span className="text-[9px] font-bold text-slate-500 uppercase">BMI</span>
                <span className="text-xs font-semibold text-white">{record?.bmi?.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex gap-4">
        <AlertTriangle className="text-amber-500 shrink-0" size={24} />
        <div>
          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-1">Medical Disclaimer</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            This AI-powered application is intended for health tracking and general wellness screening. 
            It is NOT a medical diagnosis tool. If you have concerns about your health, please consult 
            a qualified healthcare professional immediately.
          </p>
        </div>
      </div>
    </div>
  );
};
