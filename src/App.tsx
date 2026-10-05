import React, { useState, useEffect } from 'react';
import { 
  getCurrentState, 
  getCurrentUser, 
  setCurrentUser, 
  initializeStore, 
  subscribeToStore, 
  SEED_HOSPITALS, 
  SEED_DOCTOR_PROFILES 
} from './utils/store';
import { SystemStatusBar } from './components/SystemStatusBar';
import { Navbar } from './components/Navbar';
import { LandingView } from './components/LandingView';
import { DashboardView } from './components/DashboardView';
import { TransfersListView } from './components/TransfersListView';
import { DoctorApprovalView } from './components/DoctorApprovalView';
import { SecurityDemoView } from './components/SecurityDemoView';
import { AuditLogView } from './components/AuditLogView';
import { DoctorAvailabilityView } from './components/DoctorAvailabilityView';
import { SecurityArchitectureView } from './components/SecurityArchitectureView';
import { JudgeBriefView } from './components/JudgeBriefView';
import { LoginView } from './components/LoginView';
import { PatientPortalView } from './components/PatientPortalView';
import { DoctorFindView } from './components/DoctorFindView';
import { PatientTransferModal } from './components/PatientTransferModal';

export default function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentTab, setCurrentTab] = useState<string>('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedTransferId, setSelectedTransferId] = useState<string | undefined>(undefined);
  const [preselectedDoctorId, setPreselectedDoctorId] = useState<string | undefined>(undefined);

  // Trigger re-render on store updates
  const [, setTick] = useState(0);

  useEffect(() => {
    async function boot() {
      await initializeStore();
      setIsInitialized(true);
    }
    boot();

    const unsubscribe = subscribeToStore(() => {
      setTick(t => t + 1);
    });
    return unsubscribe;
  }, []);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="font-mono text-xs text-sky-400">Booting Doctor Find Cryptographic Engine...</div>
      </div>
    );
  }

  const state = getCurrentState();
  const currentUser = getCurrentUser();
  const pendingApprovalsCount = state.transfers.filter(t => t.status === 'awaiting_approval').length;

  const handleSelectTransferForReview = (transferId: string) => {
    setSelectedTransferId(transferId);
    setCurrentTab('approval');
  };

  const handleInitiateTransferToDoctor = (doctorId: string) => {
    setPreselectedDoctorId(doctorId);
    setIsTransferModalOpen(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentTab('login');
  };

  const handleLogin = (userId: string) => {
    setCurrentUser(userId);
    setIsLoggedIn(true);
    const user = getCurrentUser();
    // Animated login gate routes by verified role:
    // doctor -> clinical approval inbox, admin -> SecOps dashboard, patient -> portal.
    if (user.role === 'patient') {
      setCurrentTab('patient_portal');
    } else if (user.role === 'doctor') {
      setCurrentTab('approval');
    } else {
      setCurrentTab('dashboard');
    }
  };

  // Logged-out auth gate: animated scroll login takes over the full screen
  // (it ships its own brand bar, so the app Navbar/StatusBar are skipped).
  if (isInitialized && !isLoggedIn && currentTab === 'login') {
    return (
      <LoginView
        onLogin={handleLogin}
        onContinueAsGuest={() => setCurrentTab('landing')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Banner & Cyber Status Bar */}
      <SystemStatusBar />

      {/* Main Top Navigation Bar with Role Scoping & Logout */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={tab => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        currentUser={currentUser}
        onLogout={handleLogout}
        isLoggedIn={isLoggedIn}
        onOpenNewTransfer={() => {
          setPreselectedDoctorId(undefined);
          setIsTransferModalOpen(true);
        }}
        pendingApprovalsCount={pendingApprovalsCount}
      />

      {/* Main Viewport Content */}
      <main className="flex-1">
        {currentTab === 'login' && (
          <LoginView
            onLogin={handleLogin}
            onContinueAsGuest={() => setCurrentTab('landing')}
          />
        )}

        {currentTab === 'patient_portal' && (
          <PatientPortalView
            currentUser={currentUser}
            transfers={state.transfers}
            hospitals={SEED_HOSPITALS}
            doctorProfiles={SEED_DOCTOR_PROFILES}
            auditLogs={state.auditLogs}
            onRefresh={() => setTick(t => t + 1)}
            onNavigateToTab={tab => setCurrentTab(tab)}
          />
        )}

        {currentTab === 'doctor_find' && (
          <DoctorFindView
            currentUser={currentUser}
            onNavigateToTab={tab => setCurrentTab(tab)}
            onAppointmentBooked={() => setTick(t => t + 1)}
          />
        )}

        {currentTab === 'landing' && (
          <LandingView
            onEnterPortal={() => {
              if (currentUser.role !== 'doctor') {
                setCurrentUser('USR-DOC-01');
              }
              setIsLoggedIn(true);
              setCurrentTab('approval');
            }}
            onLaunchDemo={() => {
              if (currentUser.role !== 'admin') {
                setCurrentUser('USR-ADMIN-01');
              }
              setIsLoggedIn(true);
              setCurrentTab('demo');
            }}
            onViewArchitecture={() => {
              if (currentUser.role !== 'admin') {
                setCurrentUser('USR-ADMIN-01');
              }
              setIsLoggedIn(true);
              setCurrentTab('architecture');
            }}
            onOpenPatientPortal={() => {
              if (currentUser.role !== 'patient') {
                setCurrentUser('USR-PAT-01');
              }
              setIsLoggedIn(true);
              setCurrentTab('patient_portal');
            }}
            onOpenLogin={() => setCurrentTab('login')}
          />
        )}

        {currentTab === 'dashboard' && (
          <DashboardView
            currentUser={currentUser}
            transfers={state.transfers}
            doctorProfiles={SEED_DOCTOR_PROFILES}
            auditLogs={state.auditLogs}
            securityEvents={state.securityEvents}
            onOpenNewTransfer={() => {
              setPreselectedDoctorId(undefined);
              setIsTransferModalOpen(true);
            }}
            onNavigateToTab={tab => setCurrentTab(tab)}
            onSelectTransferForReview={handleSelectTransferForReview}
          />
        )}

        {currentTab === 'transfers' && (
          <TransfersListView
            currentUser={currentUser}
            transfers={state.transfers}
            onOpenNewTransfer={() => {
              setPreselectedDoctorId(undefined);
              setIsTransferModalOpen(true);
            }}
            onSelectTransferForReview={handleSelectTransferForReview}
          />
        )}

        {currentTab === 'approval' && (
          <DoctorApprovalView
            currentUser={currentUser}
            transfers={state.transfers}
            selectedTransferId={selectedTransferId}
            onRefresh={() => setTick(t => t + 1)}
            onNavigateToDemo={() => setCurrentTab('demo')}
          />
        )}

        {currentTab === 'demo' && (
          <SecurityDemoView
            currentUser={currentUser}
            transfers={state.transfers}
            onRefresh={() => setTick(t => t + 1)}
            onNavigateToTab={tab => setCurrentTab(tab)}
          />
        )}

        {currentTab === 'audit' && (
          <AuditLogView logs={state.auditLogs} />
        )}

        {currentTab === 'availability' && (
          <DoctorAvailabilityView
            doctorProfiles={SEED_DOCTOR_PROFILES}
            hospitals={SEED_HOSPITALS}
            onInitiateTransferToDoctor={handleInitiateTransferToDoctor}
          />
        )}

        {currentTab === 'architecture' && (
          <SecurityArchitectureView />
        )}

        {currentTab === 'judge_guide' && (
          <JudgeBriefView
            onNavigateToDemo={() => setCurrentTab('demo')}
            onNavigateToApproval={() => setCurrentTab('approval')}
          />
        )}
      </main>

      {/* Patient Transfer Creation Modal */}
      {isTransferModalOpen && (
        <PatientTransferModal
          currentUser={currentUser}
          hospitals={SEED_HOSPITALS}
          doctorProfiles={SEED_DOCTOR_PROFILES}
          preselectedDoctorId={preselectedDoctorId}
          onClose={() => setIsTransferModalOpen(false)}
          onTransferCreated={() => {
            setTick(t => t + 1);
            setCurrentTab('transfers');
          }}
        />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-semibold text-slate-800">Doctor Find</span> · ASTRA 2026 Cyber in Healthcare Hackathon
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Challenge: <strong className="text-slate-700">TBD — Confirm with organizers</strong></span>
            <span>·</span>
            <span>Track: <strong className="text-slate-700">Data, Privacy + Trust</strong></span>
            <span>·</span>
            <span className="text-amber-600 font-medium">Synthetic Healthcare Data Only</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
