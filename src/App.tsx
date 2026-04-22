/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { 
  Activity, 
  History, 
  User as UserIcon, 
  LayoutDashboard, 
  PlusCircle, 
  LogOut,
  ChevronRight,
  TrendingUp,
  FileText,
  AlertCircle,
  Pill,
  Target,
  Shield,
  Calendar,
  Book,
  Calculator
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Dashboard } from './components/Dashboard';
import { PredictionForm } from './components/PredictionForm';
import { PredictionResults } from './components/PredictionResults';
import { HistoryView } from './components/HistoryView';
import { UserProfileForm } from './components/UserProfile';
import { MedicationManager } from './components/MedicationManager';
import { HealthGoals } from './components/HealthGoals';
import { VaccinationRecords } from './components/VaccinationRecords';
import { AppointmentLog } from './components/AppointmentLog';
import { SymptomJournal } from './components/SymptomJournal';
import { EmergencyContacts } from './components/EmergencyContacts';
import { HealthCalculators } from './components/HealthCalculators';

function AppContent() {
  const { user, profile, loading, signInWithGoogle, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'predict' | 'history' | 'profile' | 'meds' | 'goals' | 'vaccines' | 'appointments' | 'symptoms' | 'emergency' | 'calculators'>('dashboard');
  const [currentPredictionId, setCurrentPredictionId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-blue-500">
        <Activity className="w-12 h-12 animate-pulse" />
      </div>
    );
  }

  const navigateToResult = (id: string) => {
    setCurrentPredictionId(id);
    setActiveTab('predict');
  };

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-200 font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900/50 hidden md:flex flex-col sticky top-0 h-screen shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8 select-none">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">V</div>
            <span className="text-xl font-bold tracking-tight text-white leading-none">Vitalis AI</span>
          </div>
          
          <nav className="space-y-1">
            <SidebarLink 
              icon={<LayoutDashboard size={18} />} 
              label="Dashboard" 
              active={activeTab === 'dashboard' && !currentPredictionId} 
              onClick={() => { setActiveTab('dashboard'); setCurrentPredictionId(null); }} 
            />
            <SidebarLink 
              icon={<PlusCircle size={18} />} 
              label="New Prediction" 
              active={activeTab === 'predict'} 
              onClick={() => { setActiveTab('predict'); setCurrentPredictionId(null); }} 
            />
            <SidebarLink 
              icon={<History size={18} />} 
              label="Reports & History" 
              active={activeTab === 'history'} 
              onClick={() => { setActiveTab('history'); setCurrentPredictionId(null); }} 
            />
            <div className="pt-4 pb-2 px-3">
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">Health Tools</span>
            </div>
            <SidebarLink 
              icon={<Pill size={18} />} 
              label="Medications" 
              active={activeTab === 'meds'} 
              onClick={() => { setActiveTab('meds'); setCurrentPredictionId(null); }} 
            />
            <SidebarLink 
              icon={<Target size={18} />} 
              label="Health Goals" 
              active={activeTab === 'goals'} 
              onClick={() => { setActiveTab('goals'); setCurrentPredictionId(null); }} 
            />
            <SidebarLink 
              icon={<Shield size={18} />} 
              label="Vaccinations" 
              active={activeTab === 'vaccines'} 
              onClick={() => { setActiveTab('vaccines'); setCurrentPredictionId(null); }} 
            />
            <SidebarLink 
              icon={<Calendar size={18} />} 
              label="Appointments" 
              active={activeTab === 'appointments'} 
              onClick={() => { setActiveTab('appointments'); setCurrentPredictionId(null); }} 
            />
            <SidebarLink 
              icon={<Book size={18} />} 
              label="Symptom Journal" 
              active={activeTab === 'symptoms'} 
              onClick={() => { setActiveTab('symptoms'); setCurrentPredictionId(null); }} 
            />
            <SidebarLink 
              icon={<Calculator size={18} />} 
              label="Medical Tools" 
              active={activeTab === 'calculators'} 
              onClick={() => { setActiveTab('calculators'); setCurrentPredictionId(null); }} 
            />
            <SidebarLink 
              icon={<Shield size={18} />} 
              label="Emergency Contacts" 
              active={activeTab === 'emergency'} 
              onClick={() => { setActiveTab('emergency'); setCurrentPredictionId(null); }} 
            />
            <SidebarLink 
              icon={<UserIcon size={18} />} 
              label="Profile Settings" 
              active={activeTab === 'profile'} 
              onClick={() => { setActiveTab('profile'); setCurrentPredictionId(null); }} 
            />
          </nav>
        </div>
        
        <div className="mt-auto p-6 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-emerald-500 flex items-center justify-center text-[10px] font-bold text-white shadow-lg uppercase">
              {profile?.fullName?.split(' ').map(n => n[0]).join('') || 'G'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{profile?.fullName || 'Guest'}</p>
              <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 truncate">Public Access</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto">
        {/* Header */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/30 flex items-center justify-between px-8 shrink-0 sticky top-0 z-10 backdrop-blur-md">
          <h1 className="text-lg font-semibold text-white tracking-tight">
            {activeTab === 'dashboard' ? 'Personalized Health Dashboard' : 
             activeTab === 'predict' ? 'Multi-Disease Prediction Engine' :
             activeTab === 'history' ? 'Health Records & Reports' : 
             activeTab === 'meds' ? 'Medication Management' :
             activeTab === 'goals' ? 'Health & Wellness Goals' :
             activeTab === 'vaccines' ? 'Immunization History' :
             activeTab === 'appointments' ? 'Medical Appointments' :
             activeTab === 'symptoms' ? 'Symptom Journal & Tracking' :
             activeTab === 'emergency' ? 'Emergency Information' :
             activeTab === 'calculators' ? 'Health Calculators & Tools' :
             'Update Your Health Profile'}
          </h1>
          <div className="flex items-center gap-4">
            <div className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider hidden sm:block">
              Clinical Assessment: Active
            </div>
            <div className="text-slate-500 text-xs italic hidden lg:block">System sync: Just now</div>
          </div>
        </header>

        <section className="flex-1 p-8 max-w-7xl mx-auto w-full">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Dashboard onNewPrediction={() => setActiveTab('predict')} onViewResult={navigateToResult} />
              </motion.div>
            )}
            {activeTab === 'predict' && (
              <motion.div
                key="predict"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {currentPredictionId ? (
                  <PredictionResults 
                    predictionId={currentPredictionId} 
                    onBack={() => { setCurrentPredictionId(null); setActiveTab('history'); }} 
                  />
                ) : (
                  <PredictionForm onComplete={(id) => setCurrentPredictionId(id)} />
                )}
              </motion.div>
            )}
            {activeTab === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <HistoryView onViewResult={navigateToResult} />
              </motion.div>
            )}
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <UserProfileForm />
              </motion.div>
            )}
            {activeTab === 'meds' && (
              <motion.div
                key="meds"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <MedicationManager />
              </motion.div>
            )}
            {activeTab === 'goals' && (
              <motion.div
                key="goals"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <HealthGoals />
              </motion.div>
            )}
            {activeTab === 'vaccines' && (
              <motion.div
                key="vaccines"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <VaccinationRecords />
              </motion.div>
            )}
            {activeTab === 'appointments' && (
              <motion.div
                key="appointments"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <AppointmentLog />
              </motion.div>
            )}
            {activeTab === 'symptoms' && (
              <motion.div
                key="symptoms"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <SymptomJournal />
              </motion.div>
            )}
            {activeTab === 'emergency' && (
              <motion.div
                key="emergency"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <EmergencyContacts />
              </motion.div>
            )}
            {activeTab === 'calculators' && (
              <motion.div
                key="calculators"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <HealthCalculators />
              </motion.div>
            )}
          </AnimatePresence>
        </section>
        
        {/* Mobile Navigation */}
        <nav className="md:hidden bg-slate-900 border-t border-slate-800 p-2 flex items-center justify-around sticky bottom-0 z-10 shadow-2xl">
          <MobileLink icon={<LayoutDashboard size={20} />} label="Home" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <MobileLink icon={<PlusCircle size={24} />} label="Add" active={activeTab === 'predict'} onClick={() => { setActiveTab('predict'); setCurrentPredictionId(null); }} />
          <MobileLink icon={<History size={20} />} label="History" active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
        </nav>
      </main>
    </div>
  );
}

function SidebarLink({ icon, label, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
        active 
          ? 'bg-slate-800 text-white shadow-sm' 
          : 'text-slate-400 hover:text-white hover:bg-slate-800'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function MobileLink({ icon, label, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 p-2 min-w-[64px] ${
        active ? 'text-brand-primary' : 'text-gray-400'
      }`}
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

