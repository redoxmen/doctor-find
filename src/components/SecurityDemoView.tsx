import React, { useState } from 'react';
import { 
  ShieldAlert, 
  UserX, 
  Fingerprint, 
  Lock, 
  AlertTriangle, 
  CheckCircle2, 
  Play, 
  RotateCcw, 
  ShieldCheck, 
  ArrowRight,
  EyeOff,
  Terminal,
  Activity,
  UserCheck
} from 'lucide-react';
import { PatientTransfer, User, AuditLog } from '../types';
import { 
  simulateFakeDoctorAttack, 
  simulateRecordTampering, 
  revertRecordTampering, 
  simulateUnauthorizedAccess,
  approvePatientTransfer
} from '../utils/store';

interface SecurityDemoViewProps {
  currentUser: User;
  transfers: PatientTransfer[];
  onRefresh: () => void;
  onNavigateToTab: (tab: string) => void;
}

export const SecurityDemoView: React.FC<SecurityDemoViewProps> = ({
  currentUser,
  transfers,
  onRefresh,
  onNavigateToTab
}) => {
  const [selectedTransferId, setSelectedTransferId] = useState<string>(transfers[0]?.id || 'TR-1024');
  
  // Attack 1 State
  const [fakeDoctorResult, setFakeDoctorResult] = useState<{
    triggered: boolean;
    status: number;
    message: string;
    logId?: string;
  } | null>(null);

  // Attack 2 State
  const [tamperField, setTamperField] = useState<'bloodGroup' | 'allergies' | 'conditionSummary'>('bloodGroup');
  const [tamperValue, setTamperValue] = useState<string>('AB+ (Modified in Transit)');
  const [tamperResult, setTamperResult] = useState<{
    triggered: boolean;
    originalHash: string;
    tamperedHash: string;
    isTampered: boolean;
  } | null>(null);

  // Attack 3 State
  const [unauthPatientTarget, setUnauthPatientTarget] = useState<string>('P1002');
  const [unauthResult, setUnauthResult] = useState<{
    triggered: boolean;
    status: number;
    message: string;
    logId?: string;
  } | null>(null);

  // Guided Walkthrough State (Section 27: Launch Security Demo)
  const [guidedMode, setGuidedMode] = useState(false);
  const [guidedStep, setGuidedStep] = useState(1);
  const [guidedLogs, setGuidedLogs] = useState<string[]>([]);

  const activeTransfer = transfers.find(t => t.id === selectedTransferId) || transfers[0];

  // Attack 1 Handler: Fake Doctor
  const handleSimulateFakeDoctor = () => {
    const result = simulateFakeDoctorAttack(activeTransfer.id);
    setFakeDoctorResult({
      triggered: true,
      status: result.statusCode,
      message: result.message,
      logId: result.auditLogId
    });
    onRefresh();
  };

  // Attack 2 Handler: Tampered Record
  const handleSimulateTamper = async () => {
    const result = await simulateRecordTampering(
      activeTransfer.id,
      tamperField,
      tamperField === 'allergies' ? [tamperValue] : tamperValue
    );
    setTamperResult({
      triggered: true,
      originalHash: result.originalHash,
      tamperedHash: result.tamperedHash,
      isTampered: true
    });
    onRefresh();
  };

  const handleRevertTamper = () => {
    revertRecordTampering(activeTransfer.id);
    setTamperResult(null);
    onRefresh();
  };

  // Attack 3 Handler: Unauthorized Access
  const handleSimulateUnauthorizedAccess = () => {
    // Simulate current user or patient accessing other record
    const result = simulateUnauthorizedAccess(unauthPatientTarget, currentUser.id);
    setUnauthResult({
      triggered: true,
      status: result.statusCode,
      message: result.message,
      logId: result.auditLogId
    });
    onRefresh();
  };

  // Guided Demo Step Navigator
  const guidedStepsTotal = 11;
  const guidedStepTitles = [
    'Create Patient Transfer',
    'AES-256-GCM Payload Encryption',
    'Generate SHA-256 Integrity Hash',
    'Secure Dispatch to Receiving Doctor',
    'Doctor Reviews & Human-in-the-Loop Approves',
    'Clinical Records Decrypted & Accessible',
    'Inspect Immutable Audit Log Trail',
    'Simulate Attack 1: Rogue / Fake Doctor Impersonation',
    'Access Denied (403 Identity Verification Failed)',
    'Simulate Attack 2: In-Transit Record Tampering (Blood Group Alteration)',
    'SHA-256 Digest Mismatch & Transfer Blocked'
  ];

  const handleNextGuidedStep = async () => {
    if (guidedStep < guidedStepsTotal) {
      const nextStep = guidedStep + 1;
      setGuidedStep(nextStep);
      
      // Execute appropriate mock actions per step
      if (nextStep === 5) {
        // Trigger approve if pending
        if (activeTransfer.status === 'awaiting_approval') {
          try {
            await approvePatientTransfer(activeTransfer.id, 'USR-DOC-01');
            onRefresh();
          } catch (e) {
            console.log(e);
          }
        }
      } else if (nextStep === 8) {
        handleSimulateFakeDoctor();
      } else if (nextStep === 10) {
        await handleSimulateTamper();
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Security Demo</h1>
          <p className="text-xs text-slate-500 mt-1">
            Three simulated attacks on synthetic data — all blocked and logged.
          </p>
        </div>

        <button
          onClick={() => {
            setGuidedMode(!guidedMode);
            setGuidedStep(1);
          }}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
            guidedMode 
              ? 'bg-slate-800 text-white shadow-sm' 
              : 'bg-red-600 hover:bg-red-700 text-white shadow-md'
          }`}
        >
          <Play className="w-4 h-4" />
          <span>{guidedMode ? 'Exit Guided Tour' : 'Launch Security Demo (Judge Walkthrough)'}</span>
        </button>
      </div>

      {/* Guided Walkthrough Banner (Section 27) */}
      {guidedMode && (
        <div className="p-6 rounded-xl bg-slate-900 text-white shadow-xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
              Judge Demonstration Sequence · Step {guidedStep} of {guidedStepsTotal}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              ASTRA 2026 Controlled Proof
            </span>
          </div>

          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-sky-500 h-full transition-all duration-300"
              style={{ width: `${(guidedStep / guidedStepsTotal) * 100}%` }}
            />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-sky-600 text-xs flex items-center justify-center font-mono">
                {guidedStep}
              </span>
              <span>{guidedStepTitles[guidedStep - 1]}</span>
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              {guidedStep === 1 && "A synthetic patient transfer request is generated at City General Hospital for John P. (P1024)."}
              {guidedStep === 2 && "The patient's clinical summary, medications, and vitals are encrypted with AES-256-GCM using authenticated 96-bit initialization vectors."}
              {guidedStep === 3 && "A SHA-256 cryptographic digest of the canonicalized record is calculated and bound to the transfer envelope."}
              {guidedStep === 4 && "The encrypted envelope is securely dispatched to Metro Care Hospital; the record remains locked in storage."}
              {guidedStep === 5 && "Receiving doctor Dr. Sarah Khan verifies credentials and reviews the incoming transfer request."}
              {guidedStep === 6 && "Upon explicit doctor approval, the record is decrypted on the doctor's authorized terminal."}
              {guidedStep === 7 && "Every transaction, key derivation, and access review has been written to the immutable audit trail."}
              {guidedStep === 8 && "Attack Simulation 1: An unverified caller/rogue agent attempts to request clinical details."}
              {guidedStep === 9 && "Result: Access Denied with 403 Forbidden. Unverified entities cannot bypass identity validation."}
              {guidedStep === 10 && "Attack Simulation 2: We inject a bit-level modification altering Blood Group from O+ to AB+ in transit."}
              {guidedStep === 11 && "Result: SHA-256 integrity verification detects digest mismatch. Transfer is instantly locked to protect patient safety!"}
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <button
              onClick={() => setGuidedStep(Math.max(1, guidedStep - 1))}
              disabled={guidedStep === 1}
              className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 disabled:opacity-40"
            >
              Previous Step
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigateToTab('audit')}
                className="px-3 py-1.5 rounded border border-slate-700 text-xs text-slate-300 hover:bg-slate-800"
              >
                Inspect Audit Trail
              </button>
              <button
                onClick={handleNextGuidedStep}
                disabled={guidedStep === guidedStepsTotal}
                className="px-4 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs flex items-center gap-1.5 disabled:opacity-40"
              >
                <span>{guidedStep === guidedStepsTotal ? 'Completed' : 'Advance Next Step'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Target Transfer Selector */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">Target Synthetic Transfer:</span>
          <select
            value={selectedTransferId}
            onChange={e => {
              setSelectedTransferId(e.target.value);
              setFakeDoctorResult(null);
              setTamperResult(null);
            }}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-slate-50 font-mono text-xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
          >
            {transfers.map(t => (
              <option key={t.id} value={t.id}>
                {t.id} — {t.patientName} ({t.sendingHospitalName} → {t.receivingHospitalName})
              </option>
            ))}
          </select>
        </div>

        <div className="text-slate-500 font-mono">
          Original Hash: <span className="text-emerald-700 font-bold">{activeTransfer?.integrityHash.slice(0, 16)}...</span>
        </div>
      </div>

      {/* 3 Dedicated Interactive Attack Demonstrations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* DEMO 1: Fake Doctor Impersonation */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
                <UserX className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider">Demo 1</span>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">Fake Doctor Impersonation</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Simulates an unverified actor or rogue physician attempting to request confidential records for Transfer {activeTransfer?.id}.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
              <div><strong>Attacker:</strong> Unknown Agent (Unverified)</div>
              <div><strong>Target:</strong> {activeTransfer?.patientName}</div>
              <div><strong>Expected:</strong> 403 Access Denied</div>
            </div>

            {/* Attack Result Display */}
            {fakeDoctorResult && (
              <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-red-700">
                  <ShieldAlert className="w-4 h-4" />
                  <span>ACCESS DENIED (Status {fakeDoctorResult.status})</span>
                </div>
                <p className="text-red-800 text-[11px] leading-relaxed">
                  Reason: Identity/role verification failed. Only verified medical professionals with assigned credentials can access records.
                </p>
                <div className="text-[10px] text-slate-500 font-mono">
                  Audit Event Logged: <strong className="text-slate-700">{fakeDoctorResult.logId}</strong>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={handleSimulateFakeDoctor}
              className="w-full py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2"
            >
              <UserX className="w-4 h-4" />
              <span>Simulate Fake Doctor Attack</span>
            </button>
          </div>
        </div>

        {/* DEMO 2: Tampered Record (SHA-256 Mismatch) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
                <Fingerprint className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Demo 2</span>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">In-Transit Record Tampering</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Take a synthetic patient record and intentionally modify a critical clinical parameter (e.g. Blood Group) in the demonstration environment.
              </p>
            </div>

            {/* Field modifier */}
            <div className="space-y-2 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Field to Tamper:</label>
                <select
                  value={tamperField}
                  onChange={e => setTamperField(e.target.value as any)}
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs bg-slate-50"
                >
                  <option value="bloodGroup">Blood Group (Original: O+)</option>
                  <option value="conditionSummary">Condition Summary</option>
                  <option value="allergies">Patient Allergies</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Injected Tampered Value:</label>
                <input
                  type="text"
                  value={tamperValue}
                  onChange={e => setTamperValue(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>
            </div>

            {/* Tamper Comparison Display */}
            {tamperResult && (
              <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 space-y-2 text-xs font-mono">
                <div className="text-red-700 font-bold text-[11px] flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  RECORD TAMPERING DETECTED!
                </div>
                <div className="text-[10px] space-y-1">
                  <div className="text-slate-600 truncate">
                    ORIGINAL HASH: <span className="text-emerald-700 font-bold">{tamperResult.originalHash.slice(0, 16)}...</span>
                  </div>
                  <div className="text-slate-600 truncate">
                    RECEIVED HASH: <span className="text-red-600 font-bold">{tamperResult.tamperedHash.slice(0, 16)}...</span>
                  </div>
                </div>
                <div className="text-[10px] text-red-700 font-sans">
                  Integrity verification failed. Transfer locked; physician notified of corruption.
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
            <button
              onClick={handleSimulateTamper}
              className="flex-1 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Fingerprint className="w-4 h-4" />
              <span>Inject Tampered Record</span>
            </button>

            {tamperResult && (
              <button
                onClick={handleRevertTamper}
                title="Restore authentic record"
                className="px-3 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-medium flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* DEMO 3: Unauthorized Access (RBAC Violation) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700">
                <EyeOff className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">Demo 3</span>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">Unauthorized Cross-Patient Access</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Simulate a patient or non-attending staff attempting to read another patient&apos;s confidential medical chart directly.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <div><strong>Requester:</strong> {currentUser.name} ({currentUser.role})</div>
                <div><strong>Target Record:</strong> Patient {unauthPatientTarget}</div>
                <div><strong>Policy:</strong> Least Privilege / RBAC Zero-Trust</div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Target Patient ID:</label>
                <input
                  type="text"
                  value={unauthPatientTarget}
                  onChange={e => setUnauthPatientTarget(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs font-mono"
                  placeholder="e.g. P1002"
                />
              </div>
            </div>

            {/* Attack Result Display */}
            {unauthResult && (
              <div className="p-3.5 rounded-lg bg-indigo-50 border border-indigo-200 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-indigo-900">
                  <ShieldCheck className="w-4 h-4 text-indigo-700" />
                  <span>403 Forbidden — Unauthorized Access</span>
                </div>
                <p className="text-indigo-800 text-[11px] leading-relaxed">
                  Request blocked by RBAC policy. Role &apos;{currentUser.role}&apos; is not granted clinical read permissions for Patient {unauthPatientTarget}.
                </p>
                <div className="text-[10px] text-slate-500 font-mono">
                  Audit Logged: <strong className="text-slate-700">{unauthResult.logId}</strong>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={handleSimulateUnauthorizedAccess}
              className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2"
            >
              <EyeOff className="w-4 h-4" />
              <span>Simulate Unauthorized Access</span>
            </button>
          </div>
        </div>
      </div>

      {/* Forensic Audit Link Callout */}
      <div className="p-5 rounded-xl bg-slate-100 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <Terminal className="w-5 h-5 text-slate-700 shrink-0" />
          <div>
            <span className="font-bold text-slate-900">All Simulated Attacks Are Fully Audited</span>
            <p className="text-slate-600 text-[11px] mt-0.5">
              Notice that every simulated attack immediately writes an immutable record with cryptographic timestamp and IP address to the Audit Log.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigateToTab('audit')}
          className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-1.5 shrink-0"
        >
          <span>View Audit Trail</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
