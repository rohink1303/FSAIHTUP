import { HealthRecord, PredictionResult } from "../types";

export const predictDiseases = (data: HealthRecord): PredictionResult[] => {
  const bmi = data.bmi || (data.weight && data.height ? data.weight / Math.pow(data.height / 100, 2) : 22);
  const sys = data.systolicBP || 120;
  const dia = data.diastolicBP || 80;
  const gluc = data.glucose || 90;
  const chol = data.cholesterol || 180;
  const age = data.age;
  const smoking = data.smokingStatus;
  const alcohol = data.alcoholIntake;
  const activity = data.activityLevel;
  const hr = data.heartRate || 72;
  const spo2 = data.spo2 || 98;

  const results: PredictionResult[] = [];

  const getRiskLevel = (p: number): 'Low' | 'Moderate' | 'High' | 'Critical' => {
    if (p < 0.2) return 'Low';
    if (p < 0.5) return 'Moderate';
    if (p < 0.8) return 'High';
    return 'Critical';
  };

  // 1. Diabetes
  let diabetesProb = (gluc > 126 ? 0.7 : gluc > 100 ? 0.3 : 0.05) + (bmi > 30 ? 0.15 : 0) + (activity === 'sedentary' ? 0.05 : 0);
  results.push({ disease: "Diabetes", probability: Math.min(diabetesProb, 0.98), riskLevel: getRiskLevel(diabetesProb) });

  // 2. Heart Disease
  let heartProb = (sys > 140 ? 0.2 : 0.05) + (chol > 240 ? 0.2 : 0.05) + (age > 60 ? 0.2 : 0) + (bmi > 32 ? 0.1 : 0) + (smoking === 'current' ? 0.3 : smoking === 'former' ? 0.1 : 0);
  results.push({ disease: "Heart Disease", probability: Math.min(heartProb, 0.95), riskLevel: getRiskLevel(heartProb) });

  // 3. Hypertension
  let hyperProb = (sys > 130 || dia > 80) ? (sys > 140 || dia > 90 ? 0.9 : 0.6) : 0.1;
  if (alcohol === 'high') hyperProb += 0.1;
  results.push({ disease: "Hypertension", probability: Math.min(hyperProb, 0.99), riskLevel: getRiskLevel(hyperProb) });

  // 4. Stroke Risk
  let strokeProb = (sys > 150 ? 0.4 : 0.1) + (age > 65 ? 0.3 : 0) + (heartProb > 0.5 ? 0.2 : 0) + (smoking === 'current' ? 0.2 : 0);
  results.push({ disease: "Stroke Risk", probability: Math.min(strokeProb, 0.9), riskLevel: getRiskLevel(strokeProb) });

  // 5. Kidney Disease
  let kidneyProb = (diabetesProb > 0.6 ? 0.3 : 0.1) + (hyperProb > 0.6 ? 0.3 : 0.1) + (age > 70 ? 0.1 : 0);
  results.push({ disease: "Kidney Disease", probability: Math.min(kidneyProb, 0.85), riskLevel: getRiskLevel(kidneyProb) });

  // 6. Liver Disease
  let liverProb = (data.symptoms?.toLowerCase().includes("jaundice") ? 0.6 : 0.1) + (bmi > 30 ? 0.1 : 0) + (alcohol === 'high' ? 0.4 : alcohol === 'moderate' ? 0.1 : 0);
  results.push({ disease: "Liver Disease", probability: Math.min(liverProb, 0.85), riskLevel: getRiskLevel(liverProb) });

  // 7. Parkinson's (mostly age and some specific symptoms)
  let parkinsonProb = (age > 70 ? 0.15 : 0.02) + (data.symptoms?.toLowerCase().includes("tremor") ? 0.4 : 0);
  results.push({ disease: "Parkinson's Disease", probability: Math.min(parkinsonProb, 0.7), riskLevel: getRiskLevel(parkinsonProb) });

  // 8. Lung Disease
  let lungProb = (smoking === 'current' ? 0.4 : smoking === 'former' ? 0.2 : 0.05) + (data.symptoms?.toLowerCase().includes("cough") ? 0.2 : 0) + (spo2 < 95 ? 0.2 : 0);
  results.push({ disease: "Lung Disease", probability: Math.min(lungProb, 0.85), riskLevel: getRiskLevel(lungProb) });

  // 9. Thyroid Disorder
  let thyroidProb = (data.symptoms?.toLowerCase().includes("fatigue") ? 0.15 : 0.05) + 0.05;
  results.push({ disease: "Thyroid Disorder", probability: thyroidProb, riskLevel: getRiskLevel(thyroidProb) });

  // 10. Cancer Risk
  let cancerProb = (age > 50 ? 0.1 : 0.02) + (smoking === 'current' ? 0.2 : 0) + (data.symptoms?.toLowerCase().includes("weight loss") ? 0.2 : 0);
  results.push({ disease: "Cancer Risk", probability: Math.min(cancerProb, 0.7), riskLevel: getRiskLevel(cancerProb) });

  return results;
};
