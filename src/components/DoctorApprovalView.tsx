import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  Lock, 
  Fingerprint, 
  AlertTriangle, 
  Heart, 
  Activity, 
  FileText, 
  UserCheck, 
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Calendar,
  Clock,
  User,
  Check
} from 'lucide-react';
import { PatientTransfer, User as UserType, SyntheticPatientRecord, Appointment } from '../types';
import { approvePatientTransfer, rejectPatientTransfer, getAppointments, updateAppointmentStatus } from '../utils/store';

interface DoctorApprovalViewProps {
  currentUser: UserType;
  transfers: PatientTransfer[];
  selectedTransferId?: string;
  onRefresh: () => void;
  onNavigateToDemo: () => void;
}

export const DoctorApprovalView: React.FC<DoctorApprovalViewProps> = ({
  currentUser,
  transfers,
  selectedTransferId,
  onRefresh,
  onNavigateToDemo
}) => {
  const [viewMode, setViewMode] = useState<'transfers' | 'appointments'>('transfers');

  // If a specific transfer was selected, focus it; otherwise pick first pending
  const [activeTransferId, setActiveTransferId] = useState<string>(
    selectedTransferId || transfers.find(t => t.status === 'awaiting_approval')?.id || transfers[0]?.id || ''
  );
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('Bed capacity constrained in Intensive Cardiac Care Unit.');
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const activeTransfer = transfers.find(t => t.id === activeTransferId) || transfers[0];

  // Retrieve appointments for this doctor (or all for admin)
  const doctorAppointments = getAppointments(
    currentUser.role === 'admin' ? undefined : (currentUser.id === 'USR-DOC-02' ? 'DOC-01' : currentUser.id)
  );

  const handleApprove = async () => {
    if (!activeTransfer) return;
    setIsProcessing(true);
    setFeedbackMessage(null);
    try {
      const result = await approvePatientTransfer(activeTransfer.id, currentUser.id);
      setFeedbackMessage({
        type: 'success',
        text: `Transfer ${activeTransfer.id} approved — identity validated, SHA-256 verified, payload decrypted.`
      });
      onRefresh();
    } catch (err: any) {
      setFeedbackMessage({
        type: 'error',
        text: err.message || 'Approval failed'
      });
      onRefresh();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = () => {
    if (!activeTransfer) return;
    try {
      rejectPatientTransfer(activeTransfer.id, currentUser.id, rejectionReason);
      setRejectionModalOpen(false);
      setFeedbackMessage({
        type: 'success',
        text: `Transfer ${activeTransfer.id} rejected. Sensitive medical data remains sealed.`
      });
      onRefresh();
    } catch (err: any) {
      setFeedbackMessage({
        type: 'error',
        text: err.message || 'Rejection failed'
      });
    }
  };

  if (!activeTransfer) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800">No Patient Transfers Found</h2>
        <p className="text-xs text-slate-500 mt-1">Create a synthetic patient transfer to review.</p>
      </div>
    );
  }

  const isPending = activeTransfer.status === 'awaiting_approval';
  const isApproved = activeTransfer.status === 'approved';
  const isRejected = activeTransfer.status === 'rejected';
  const isTampered = activeTransfer.integrityStatus === 'tampered' || activeTransfer.status === 'tamper_flagged';

  // Check if current user is authorized doctor
  const isAssignedDoctor = currentUser.id === activeTransfer.receivingDoctorId || currentUser.role === 'admin';
  const isUnverified = !currentUser.verified;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Clinical Approval Inbox</h1>
          <p className="text-xs text-slate-500 mt-1">
            {currentUser.name} · {currentUser.hospitalName}
          </p>
        </div>

        {/* View Mode Toggle: Transfers vs Appointments */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setViewMode('transfers')}
            className={`py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition-all ${
              viewMode === 'transfers'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
            <span>Transfer Approvals</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800 font-mono">
              {transfers.filter(t => t.status === 'awaiting_approval').length}
            </span>
          </button>

          <button
            onClick={() => setViewMode('appointments')}
            className={`py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition-all ${
              viewMode === 'appointments'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            <span>Patient Appointments</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-sky-100 text-sky-800 font-mono">
              {doctorAppointments.length}
            </span>
          </button>
        </div>
      </div>

      {/* APPOINTMENTS VIEW MODE */}
      {viewMode === 'appointments' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden space-y-4 p-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <div>
                <h2 className="text-sm font-bold text-slate-900">Upcoming Consultations</h2>
                <p className="text-[11px] text-slate-500">
                  Booked via Laya AI · double-booking prevented
                </p>
              </div>
            </div>

            <div className="text-xs text-slate-500 tabular-nums">
              <strong className="text-slate-800">{doctorAppointments.length}</strong> scheduled
            </div>
          </div>

          {doctorAppointments.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No appointments currently scheduled for your clinic.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Patient</th>
                    <th className="px-4 py-3">Slot</th>
                    <th className="px-4 py-3">Problem</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal">
                  {doctorAppointments.map(apt => (
                    <tr key={apt.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        {apt.patientName}
                        <div className="text-[10px] text-slate-400 font-mono">{apt.patientId}</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-700 tabular-nums whitespace-nowrap">
                        {apt.appointmentDate} · {apt.appointmentTime}
                      </td>
                      <td className="px-4 py-3 text-slate-600 truncate max-w-[200px]" title={apt.problemSummary}>
                        {apt.problemSummary || 'Clinical Consultation'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          apt.status === 'confirmed'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : apt.status === 'completed'
                            ? 'bg-sky-100 text-sky-800 border border-sky-200'
                            : apt.status === 'cancelled'
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          {apt.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right space-x-1.5 whitespace-nowrap">
                        {apt.status !== 'completed' && apt.status !== 'cancelled' && (
                          <button
                            onClick={() => {
                              updateAppointmentStatus(apt.id, 'completed');
                              onRefresh();
                            }}
                            className="px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-[11px] transition-colors"
                          >
                            Mark Completed
                          </button>
                        )}
                        {apt.status !== 'cancelled' && (
                          <button
                            onClick={() => {
                              updateAppointmentStatus(apt.id, 'cancelled');
                              onRefresh();
                            }}
                            className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px] transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-500">
            Double-booking prevention active · Views are audit-logged
          </div>
        </div>
      )}

      {/* TRANSFERS VIEW MODE (Existing Human-in-the-loop review) */}
      {viewMode === 'transfers' && (
        <>
          {/* Transfer picker */}
          <div className="flex items-center gap-2 text-xs">
            <label htmlFor="transfer-picker" className="text-slate-500 font-medium whitespace-nowrap">
              Transfer:
            </label>
            <select
              id="transfer-picker"
              value={activeTransfer.id}
              onChange={(e) => {
                setActiveTransferId(e.target.value);
                setFeedbackMessage(null);
              }}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
            >
              {transfers.map(t => (
                <option key={t.id} value={t.id}>
                  {t.id} · {t.patientId} · {t.status.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

      {/* Security Feedback Banner */}
      {feedbackMessage && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-start gap-3 ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}
        >
          {feedbackMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <div className="font-semibold">{feedbackMessage.text}</div>
          </div>
        </div>
      )}

      {/* Main Review Card */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {/* Compact status strip */}
        <div className="px-5 py-4 border-b border-slate-200 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
          <div>
            <span className="font-mono font-bold text-slate-900 tabular-nums">{activeTransfer.id}</span>
            <span className="text-slate-500"> · {activeTransfer.patientName}</span>
          </div>
          {isTampered ? (
            <span className="inline-flex items-center gap-1.5 font-bold text-xs text-red-700">
              <AlertTriangle className="w-3.5 h-3.5" />
              Tampered — blocked
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 font-medium text-xs text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
              SHA-256 verified
            </span>
          )}
          <span className={`px-2 py-0.5 rounded font-bold text-[11px] uppercase ${
            activeTransfer.transferPriority === 'emergency'
              ? 'bg-red-100 text-red-800'
              : activeTransfer.transferPriority === 'urgent'
              ? 'bg-amber-100 text-amber-800'
              : 'bg-sky-100 text-sky-800'
          }`}>
            {activeTransfer.transferPriority}
          </span>
          {isPending && <span className="font-semibold text-amber-700">Awaiting approval</span>}
          {isApproved && <span className="font-semibold text-emerald-700">Approved</span>}
          {isRejected && <span className="font-semibold text-slate-500">Rejected</span>}
          <span className="ml-auto font-mono text-[11px] text-slate-400 tabular-nums" title={activeTransfer.integrityHash}>
            {activeTransfer.integrityHash.slice(0, 12)}…
          </span>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-5">
          {/* Route — single line */}
          <p className="text-xs text-slate-500">
            {activeTransfer.sendingHospitalName} → {activeTransfer.receivingHospitalName} · Receiving: <strong className="text-slate-800">{activeTransfer.receivingDoctorName}</strong>
          </p>

          {/* Warning for unverified session */}
          {isUnverified && (
            <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <p>
                <strong>Unverified session.</strong> Approval attempts will be blocked (403) and logged as a security event.
              </p>
            </div>
          )}

          {/* Pending Approval & Action Buttons */}
          {isPending && (
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-xs text-slate-600">
                  Records stay encrypted until you explicitly approve this admission.
                </p>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setRejectionModalOpen(true)}
                    disabled={isProcessing}
                    className="px-4 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span>Reject Transfer</span>
                  </button>

                  <button
                    onClick={handleApprove}
                    disabled={isProcessing}
                    className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isProcessing ? 'Verifying & Decrypting...' : 'Approve & Decrypt Record'}</span>
                  </button>
                </div>
              </div>

              {/* Ciphertext Preview before approval */}
              <div className="px-3 py-2.5 bg-slate-900 rounded-lg text-slate-300 text-xs font-mono flex items-center justify-between gap-3">
                <span className="flex items-center gap-1.5 text-sky-400 text-[11px]">
                  <Lock className="w-3.5 h-3.5" />
                  AES-256-GCM locked
                </span>
                <span className="text-[11px] text-slate-400 truncate" title={activeTransfer.encryptedPayload.ciphertext}>
                  {activeTransfer.encryptedPayload.ciphertext.substring(0, 64)}…
                </span>
              </div>
            </div>
          )}

          {/* Approved & Decrypted Medical Record View */}
          {isApproved && activeTransfer.decryptedRecord && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-base font-bold text-slate-900">
                    Decrypted Clinical Patient Record
                  </h3>
                </div>
                <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  Authorized & Decrypted
                </span>
              </div>

              {/* Patient Demographics & Vitals */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 text-xs space-y-1">
                  <span className="text-slate-500 font-medium">Full Name (Synthetic)</span>
                  <div className="text-sm font-bold text-slate-900">{activeTransfer.decryptedRecord.fullName}</div>
                  <div className="text-slate-500">Age: {activeTransfer.decryptedRecord.age} · Gender: {activeTransfer.decryptedRecord.gender}</div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 text-xs space-y-1">
                  <span className="text-slate-500 font-medium">Blood Group</span>
                  <div className="text-base font-bold text-red-600 font-mono">{activeTransfer.decryptedRecord.bloodGroup}</div>
                  <div className="text-[11px] text-slate-500">Integrity verified via SHA-256</div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 text-xs space-y-1">
                  <span className="text-slate-500 font-medium">Vitals Baseline</span>
                  <div className="font-mono text-slate-900 font-semibold">BP: {activeTransfer.decryptedRecord.vitals.bloodPressure}</div>
                  <div className="text-[11px] text-slate-500 font-mono">HR: {activeTransfer.decryptedRecord.vitals.heartRate} bpm · SpO2: {activeTransfer.decryptedRecord.vitals.oxygenSaturation}%</div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 text-xs space-y-1">
                  <span className="text-slate-500 font-medium">Allergies</span>
                  <div className="text-red-700 font-medium">
                    {activeTransfer.decryptedRecord.allergies.join(', ') || 'No known allergies'}
                  </div>
                  <div className="text-[11px] text-slate-500">Verified at triage</div>
                </div>
              </div>

              {/* Diagnosis & Medications */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                  <span className="font-semibold text-slate-900 block">Condition Summary & Diagnosis</span>
                  <p className="text-slate-700 leading-relaxed font-medium">
                    {activeTransfer.decryptedRecord.primaryDiagnosis}
                  </p>
                  <p className="text-slate-600 leading-relaxed">
                    {activeTransfer.decryptedRecord.conditionSummary}
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                  <span className="font-semibold text-slate-900 block">Current Medications & Lab Notes</span>
                  <ul className="list-disc pl-4 space-y-1 text-slate-700">
                    {activeTransfer.decryptedRecord.currentMedications.map((med, idx) => (
                      <li key={idx}>{med}</li>
                    ))}
                  </ul>
                  <p className="text-[11px] text-slate-500 border-t border-slate-200 pt-2 mt-2">
                    <strong>Lab Notes:</strong> {activeTransfer.decryptedRecord.labNotes}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tampered Record Warning (if simulation active) */}
          {isTampered && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-red-900">
                    Integrity failure — possible tampering detected
                  </h3>
                  <p className="text-red-800 leading-relaxed">
                    The received SHA-256 digest does not match the original from
                    <strong> {activeTransfer.sendingHospitalName}</strong>. Decrypted records are locked to protect patient safety.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-white rounded-lg border border-red-200 font-mono text-[11px] space-y-1 break-all">
                <div className="text-slate-600">
                  Original: <span className="text-emerald-700 font-bold">{activeTransfer.integrityHash}</span>
                </div>
                <div className="text-slate-600">
                  Received: <span className="text-red-600 font-bold">{activeTransfer.tamperedHash || 'MISMATCH_DETECTED'}</span>
                </div>
              </div>

              <div className="pt-1">
                <button
                  onClick={onNavigateToDemo}
                  className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
                >
                  <span>Inspect in Security Demo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Transfer history */}
          <div className="border-t border-slate-200 pt-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Transfer history
            </h4>
            <div className="space-y-2">
              {activeTransfer.history.map((h, i) => (
                <div key={i} className="flex items-start gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-sky-600 mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800">{h.stage}</span>
                      <span className="text-slate-400 font-mono text-[10px] tabular-nums">
                        {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] mt-0.5">{h.note}</p>
                    <span className="text-[10px] text-slate-400">By {h.actor} ({h.role})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      </>
      )}

      {/* Rejection Modal */}
      {rejectionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200 text-xs">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              Reject Patient Transfer Request
            </h3>
            <p className="text-slate-600">
              Provide a medical or logistical reason for declining transfer {activeTransfer.id}. This will be logged to the immutable audit trail.
            </p>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Rejection Reason</label>
              <textarea
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                rows={3}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectionModalOpen(false)}
                className="px-3.5 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
