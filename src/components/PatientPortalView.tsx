import React, { useState } from 'react';
import { 
  Lock, 
  Fingerprint, 
  Send, 
  CheckCircle2, 
  Activity, 
  Sparkles,
  Stethoscope,
  XCircle
} from 'lucide-react';
import { User as UserType, PatientTransfer, Hospital, DoctorProfile, AuditLog, Appointment } from '../types';
import { submitPatientProblem, getAppointments, cancelAppointment } from '../utils/store';

interface PatientPortalViewProps {
  currentUser: UserType;
  transfers: PatientTransfer[];
  hospitals: Hospital[];
  doctorProfiles: DoctorProfile[];
  auditLogs: AuditLog[];
  onRefresh: () => void;
  onNavigateToTab: (tab: string) => void;
}

export const PatientPortalView: React.FC<PatientPortalViewProps> = ({
  currentUser,
  transfers,
  hospitals,
  doctorProfiles,
  auditLogs,
  onRefresh,
  onNavigateToTab
}) => {
  // Form fields where the patient describes their problem
  const [problemDescription, setProblemDescription] = useState('');
  const [symptomDuration, setSymptomDuration] = useState('2 hours ago');
  const [urgencyLevel, setUrgencyLevel] = useState<'routine' | 'urgent' | 'emergency'>('urgent');
  const [age, setAge] = useState(48);
  const [gender, setGender] = useState<'Female' | 'Male' | 'Other'>('Male');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [knownAllergies, setKnownAllergies] = useState('Penicillin');
  const [currentMedications, setCurrentMedications] = useState('Aspirin 81mg, Atorvastatin 40mg');
  const [preferredHospitalId, setPreferredHospitalId] = useState('HOSP-02');
  const [preferredSpecialty, setPreferredSpecialty] = useState('Interventional Cardiology');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);
  const [sideTab, setSideTab] = useState<'appointments' | 'transfers' | 'history'>('appointments');

  // Filter transfers relevant to this patient (P1024 or current user's name)
  const myTransfers = transfers.filter(
    t => t.patientId === 'P1024' || t.patientName.toLowerCase().includes('john') || t.patientName.toLowerCase().includes(currentUser.name.toLowerCase())
  );

  // Filter audit logs for accesses to this patient's records
  const myAuditLogs = auditLogs.filter(
    l => l.resource.includes('P1024') || l.details.includes('John') || l.userId === currentUser.id
  );

  // Retrieve booked appointments for this patient
  const allAppointments = getAppointments();
  const myAppointments = allAppointments.filter(
    a => a.patientId === currentUser.id || a.patientId === 'P1024' || a.patientName.toLowerCase().includes('john')
  );

  const handleCancelAppt = (apptId: string) => {
    try {
      cancelAppointment(apptId);
      onRefresh();
    } catch (err: any) {
      console.error('Failed to cancel appointment:', err);
    }
  };

  const handleSubmitProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problemDescription.trim()) return;

    setIsSubmitting(true);
    setFeedbackSuccess(null);

    try {
      const newTransfer = await submitPatientProblem({
        patientId: 'P1024',
        patientName: currentUser.name || 'John P.',
        age,
        gender,
        problemDescription,
        symptomDuration,
        urgencyLevel,
        knownAllergies: knownAllergies.split(',').map(s => s.trim()).filter(Boolean),
        currentMedications: currentMedications.split(',').map(s => s.trim()).filter(Boolean),
        bloodGroup,
        preferredHospitalId,
        preferredSpecialty
      });

      setFeedbackSuccess(`Your medical problem has been encrypted with AES-256-GCM, signed with a SHA-256 digest, and routed as Transfer ${newTransfer.id} to ${newTransfer.receivingHospitalName}! A receiving doctor must review and approve it.`);
      setProblemDescription('');
      onRefresh();
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Welcome, {currentUser.name}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Patient P1024 · Describe symptoms below — submissions are encrypted and require doctor approval.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onNavigateToTab('doctor_find')}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs transition-colors shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>Open Doctor Find</span>
        </button>
      </div>

      {feedbackSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-3 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{feedbackSuccess}</div>
        </div>
      )}

      {/* Main Grid: Describe Problem Form (Left) & Status (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Describe Your Problem Intake Form */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center text-sky-700">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Describe Your Medical Problem</h2>
              <p className="text-[11px] text-slate-500">
                Provide clinical details for the attending physician triage team
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmitProblem} className="space-y-4 text-xs">
            {/* Symptoms Description */}
            <div className="space-y-1.5">
              <label className="block text-slate-700 font-bold">
                1. Describe your symptoms and condition: *
              </label>
              <textarea
                required
                rows={4}
                value={problemDescription}
                onChange={e => setProblemDescription(e.target.value)}
                placeholder="E.g., Experiencing sudden crushing central chest pressure radiating to my left arm, accompanied by shortness of breath and sweating. Started while walking up stairs..."
                className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden leading-relaxed"
              />
              <span className="text-[10px] text-slate-400">
                Be as descriptive as possible regarding pain intensity, location, and triggers.
              </span>
            </div>

            {/* Duration and Urgency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  When did symptoms begin?
                </label>
                <input
                  type="text"
                  required
                  value={symptomDuration}
                  onChange={e => setSymptomDuration(e.target.value)}
                  placeholder="e.g. 2 hours ago, yesterday morning"
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Urgency / Severity Level:
                </label>
                <select
                  value={urgencyLevel}
                  onChange={e => setUrgencyLevel(e.target.value as any)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-slate-50 text-xs font-bold"
                >
                  <option value="routine">Routine (Non-urgent referral)</option>
                  <option value="urgent">Urgent (Acute deterioration)</option>
                  <option value="emergency">Emergency (Immediate transfer)</option>
                </select>
              </div>
            </div>

            {/* Medical History: Blood Group, Allergies, Current Medications */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Blood Group:</label>
                <select
                  value={bloodGroup}
                  onChange={e => setBloodGroup(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-slate-50 text-xs font-mono font-bold text-red-700"
                >
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Known Allergies:</label>
                <input
                  type="text"
                  value={knownAllergies}
                  onChange={e => setKnownAllergies(e.target.value)}
                  placeholder="e.g. Penicillin, Latex"
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Current Medications:</label>
                <input
                  type="text"
                  value={currentMedications}
                  onChange={e => setCurrentMedications(e.target.value)}
                  placeholder="e.g. Aspirin 81mg"
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
                />
              </div>
            </div>

            {/* Target Hospital & Specialty */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-100">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Target Hospital:</label>
                <select
                  value={preferredHospitalId}
                  onChange={e => setPreferredHospitalId(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-slate-50 text-xs"
                >
                  {hospitals.map(h => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Department / Specialty:</label>
                <select
                  value={preferredSpecialty}
                  onChange={e => setPreferredSpecialty(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-slate-50 text-xs"
                >
                  <option value="Interventional Cardiology">Interventional Cardiology</option>
                  <option value="Emergency Medicine">Emergency Medicine</option>
                  <option value="Neurology">Neurology & Stroke</option>
                  <option value="Pulmonology">Pulmonology & Critical Care</option>
                  <option value="Trauma Surgery">Trauma Surgery</option>
                </select>
              </div>
            </div>

            {/* Cryptographic Protection Badge */}
            <div className="p-3 bg-sky-50 rounded-xl border border-sky-200 text-sky-950 flex items-center justify-between gap-3 text-[11px]">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-sky-600 shrink-0" />
                <span>Your problem will be client-side encrypted with <strong>AES-256-GCM</strong> and verified with <strong>SHA-256</strong>.</span>
              </div>
              <Fingerprint className="w-4 h-4 text-emerald-600 shrink-0" />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !problemDescription.trim()}
              className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Encrypting & Dispatching...' : 'Encrypt & Submit Medical Problem'}</span>
            </button>
          </form>
        </div>

        {/* Right Column: single tabbed status card */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 lg:sticky lg:top-20">
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-semibold">
              {([
                ['appointments', `Appointments · ${myAppointments.length}`],
                ['transfers', `Transfers · ${myTransfers.length}`],
                ['history', 'Access history'],
              ] as const).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSideTab(id)}
                  className={`flex-1 px-2 py-1.5 rounded-md transition-colors ${
                    sideTab === id ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {sideTab === 'appointments' && (
            <div className="space-y-4">

            {myAppointments.length === 0 ? (
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-center space-y-2">
                <Stethoscope className="w-6 h-6 text-slate-400 mx-auto" />
                <p className="text-xs text-slate-600">No scheduled doctor appointments yet.</p>
                <button
                  type="button"
                  onClick={() => onNavigateToTab('doctor_find')}
                  className="text-xs font-bold text-sky-700 hover:text-sky-800 hover:underline inline-flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5 text-sky-500" />
                  <span>Find doctors with Doctor Find →</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {myAppointments.map(appt => {
                  const isCancelled = appt.status === 'cancelled';
                  return (
                    <div
                      key={appt.id}
                      className={`p-3.5 rounded-xl border text-xs space-y-2 transition-all ${
                        isCancelled
                          ? 'border-slate-200 bg-slate-50 opacity-60'
                          : 'border-emerald-200 bg-emerald-50/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-slate-900">{appt.id}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            isCancelled
                              ? 'bg-slate-200 text-slate-700'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {appt.status}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-700 space-y-0.5">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{appt.doctorName}</span>
                        </div>
                        <div className="text-slate-500">
                          {appt.doctorSpecialty} · {appt.hospitalName}
                        </div>
                        <div className="font-mono text-emerald-800 font-semibold pt-0.5">
                          {appt.appointmentDate} at {appt.appointmentTime}
                        </div>
                        {appt.problemSummary && (
                          <div className="text-[10px] text-slate-500 italic truncate pt-0.5">
                            &ldquo;{appt.problemSummary}&rdquo;
                          </div>
                        )}
                      </div>

                      {!isCancelled && (
                        <div className="pt-2 border-t border-emerald-100 flex items-center justify-between text-[11px]">
                          <span className="text-[10px] text-slate-400 font-mono">Double-booking checked</span>
                          <button
                            type="button"
                            onClick={() => handleCancelAppt(appt.id)}
                            className="text-[11px] text-red-600 hover:text-red-800 font-semibold flex items-center gap-1 hover:underline"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Cancel Slot</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            </div>
            )}
            {sideTab === 'transfers' && (
            <div className="space-y-4">

            <div className="space-y-3">
              {myTransfers.map(t => {
                const isPending = t.status === 'awaiting_approval';
                const isApproved = t.status === 'approved';
                const isTampered = t.integrityStatus === 'tampered';

                return (
                  <div key={t.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-900">{t.id}</span>
                      {isPending && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800">
                          Awaiting Doctor Approval
                        </span>
                      )}
                      {isApproved && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                          Approved & Clinical Data Transferred
                        </span>
                      )}
                      {isTampered && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800">
                          Tamper Detected
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-600 space-y-0.5">
                      <div><strong>Route:</strong> {t.sendingHospitalName} → {t.receivingHospitalName}</div>
                      <div><strong>Assigned Doctor:</strong> {t.receivingDoctorName}</div>
                      <div className="font-mono text-[10px] text-slate-400 truncate">
                        SHA-256 Digest: {t.integrityHash.slice(0, 16)}...
                      </div>
                    </div>

                    <div className="pt-1.5 border-t border-slate-200 text-[10px] text-slate-500 flex items-center justify-between">
                      <span>AES-256-GCM Encrypted</span>
                      <span className="font-mono">{new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            </div>
            )}
            {sideTab === 'history' && (
            <div className="space-y-4">
            <p className="text-[11px] text-slate-500">
              Every access to your records is logged here.
            </p>

            <div className="space-y-2">
              {myAuditLogs.slice(0, 4).map(log => (
                <div key={log.id} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50 text-[11px] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">{log.action}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-slate-600 text-[10px]">{log.details}</div>
                  <div className="text-[10px] text-slate-500 flex items-center justify-between">
                    <span>Actor: {log.userName}</span>
                    <span className="text-emerald-600 font-medium">Verified Access</span>
                  </div>
                </div>
              ))}
            </div>
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
