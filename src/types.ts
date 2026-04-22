export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  weight?: number; // kg
  height?: number; // cm
  medicalHistory?: string;
  createdAt: any;
}

export interface Patient {
  id?: string;
  userId: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  bloodType?: string;
  timestamp: any;
}

export interface HealthRecord {
  id?: string;
  userId: string;
  patientId?: string; // Optional if we want to link but user says "nothing to do with logged in"
  // Vital Signs
  glucose?: number;
  systolicBP?: number;
  diastolicBP?: number;
  cholesterol?: number;
  weight?: number;
  height?: number;
  bmi?: number;
  heartRate?: number;
  respRate?: number;
  spo2?: number;
  temperature?: number;
  // Lifestyle & Background
  age: number;
  gender: 'male' | 'female' | 'other';
  patientName: string;
  smokingStatus: 'never' | 'former' | 'current';
  alcoholIntake: 'none' | 'moderate' | 'high';
  activityLevel: 'sedentary' | 'moderate' | 'active';
  familyHistory?: string;
  symptoms?: string;
  timestamp: any;
}

export interface PredictionResult {
  disease: string;
  probability: number; // 0 to 1
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
}

export interface Prediction {
  id?: string;
  userId: string;
  recordId: string;
  patientName?: string;
  results: PredictionResult[];
  timestamp: any;
}

export interface Insight {
  id?: string;
  userId: string;
  predictionId: string;
  content: string;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  timestamp: any;
}

export interface Medication {
  id?: string;
  userId: string;
  name: string;
  dosage: string;
  frequency: string;
  purpose?: string;
  startDate?: string;
  active: boolean;
  timestamp: any;
}

export interface HealthGoal {
  id?: string;
  userId: string;
  title: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  category: 'steps' | 'water' | 'sleep' | 'calories' | 'exercise';
  deadline?: any;
  completed: boolean;
  timestamp: any;
}

export interface Vaccination {
  id?: string;
  userId: string;
  name: string;
  date: string;
  provider?: string;
  notes?: string;
  timestamp: any;
}

export interface Appointment {
  id?: string;
  userId: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  location?: string;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  timestamp: any;
}

export interface SymptomLog {
  id?: string;
  userId: string;
  symptom: string;
  intensity: number; // 1-10
  description?: string;
  duration?: string;
  timestamp: any;
}

export interface EmergencyContact {
  id?: string;
  userId: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  notes?: string;
  timestamp: any;
}
