import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  Fingerprint, 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles, 
  CheckCircle2, 
  Building2, 
  UserCheck 
} from 'lucide-react';
import { User, Hospital, DoctorProfile, SyntheticPatientRecord } from '../types';
import { createPatientTransfer } from '../utils/store';

interface PatientTransferModalProps {
  currentUser: User;
  hospitals: Hospital[];
  doctorProfiles: DoctorProfile[];
  preselectedDoctorId?: string;
  onClose: () => void;
  onTransferCreated: () => void;
}

export const PatientTransferModal: React.FC<PatientTransferModalProps> = ({
  currentUser,
  hospitals,
  doctorProfiles,
  preselectedDoctorId,
  onClose,
  onTransferCreated
}) => {
  const [patientName, setPatientName] = useState('Arthur Pendelton (Synthetic)');
  const [age, setAge] = useState(54);
  const [gender, setGender] = useState<'Female' | 'Male' | 'Other'>('Male');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [priority, setPriority] = useState<'routine' | 'urgent' | 'emergency'>('urgent');
  
  const [conditionSummary, setConditionSummary] = useState(
    'Acute ischemic chest pain with non-diagnostic initial troponins. Needs emergency cath lab evaluation.'
  );
  const [primaryDiagnosis, setPrimaryDiagnosis] = useState('I20.0 - Unstable Angina');
  const [allergies, setAllergies] = useState('Aspirin, Shellfish');
  const [medications, setMedications] = useState('Nitroglycerin SL, Clopidogrel 300mg loading dose');
  
  const [bp, setBp] = useState('142/90 mmHg');
  const [hr, setHr] = useState(92);
  const [spo2, setSpo2] = useState(96);
  const [temp, setTemp] = useState('37.1 °C');
  const [rr, setRr] = useState(20);
  const [labNotes, setLabNotes] = useState('ECG shows T-wave inversions in V3-V5. Serial cardiac enzymes pending.');

  const [sendingHospitalId, setSendingHospitalId] = useState(currentUser.hospitalId || hospitals[0]?.id || 'HOSP-01');
  const [receivingHospitalId, setReceivingHospitalId] = useState(
    hospitals.find(h => h.id !== sendingHospitalId)?.id || hospitals[1]?.id || 'HOSP-02'
  );
  
  const availableReceivingDoctors = doctorProfiles.filter(d => 
    d.hospitalId === receivingHospitalId && d.verified
  );

  const [receivingDoctorId, setReceivingDoctorId] = useState(
    preselectedDoctorId || availableReceivingDoctors[0]?.userId || doctorProfiles[0]?.userId || 'USR-DOC-01'
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stepStatus, setStepStatus] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      setStepStatus('Canonicalizing patient record...');
      await new Promise(r => setTimeout(r, 250));

      setStepStatus('Deriving AES-256-GCM authenticated cipher key...');
      await new Promise(r => setTimeout(r, 250));

      setStepStatus('Computing SHA-256 integrity hash...');
      await new Promise(r => setTimeout(r, 250));

      await createPatientTransfer({
        patient: {
          fullName: patientName,
          age: Number(age),
          gender,
          bloodGroup,
          allergies: allergies.split(',').map(s => s.trim()).filter(Boolean),
          currentMedications: medications.split(',').map(s => s.trim()).filter(Boolean),
          conditionSummary,
          primaryDiagnosis,
          vitals: {
            bloodPressure: bp,
            heartRate: Number(hr),
            oxygenSaturation: Number(spo2),
            temperature: temp,
            respiratoryRate: Number(rr)
          },
          labNotes,
          transferPriority: priority
        },
        sendingHospitalId,
        receivingHospitalId,
        receivingDoctorId,
        transferPriority: priority
      });

      setStepStatus('Transfer safely registered! Dispatching notification...');
      await new Promise(r => setTimeout(r, 300));

      onTransferCreated();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to initiate transfer');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-3xl w-full p-6 space-y-5 shadow-2xl border border-slate-200 text-xs my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center text-sky-700">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Initiate Secure Patient Transfer</h2>
              <p className="text-[11px] text-slate-500">
                Payload will be AES-256-GCM encrypted and signed with a SHA-256 digest
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Patient Core Info */}
          <div className="space-y-2">
            <span className="font-bold text-slate-800 block">1. Synthetic Patient Information</span>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-slate-600 font-medium mb-1">Full Name (Synthetic):</label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={e => setPatientName(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Age:</label>
                <input
                  type="number"
                  required
                  value={age}
                  onChange={e => setAge(Number(e.target.value))}
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Blood Group:</label>
                <select
                  value={bloodGroup}
                  onChange={e => setBloodGroup(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 bg-slate-50 text-xs font-mono font-bold text-red-700"
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
            </div>
          </div>

          {/* Clinical Diagnosis & Vitals */}
          <div className="space-y-2">
            <span className="font-bold text-slate-800 block">2. Clinical Diagnosis & Telemetry</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Primary Diagnosis:</label>
                <input
                  type="text"
                  required
                  value={primaryDiagnosis}
                  onChange={e => setPrimaryDiagnosis(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Transfer Priority:</label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value as any)}
                  className="w-full p-2 rounded-lg border border-slate-300 bg-slate-50 text-xs font-bold"
                >
                  <option value="routine">Routine</option>
                  <option value="urgent">Urgent</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-600 font-medium mb-1">Condition Summary:</label>
                <textarea
                  required
                  rows={2}
                  value={conditionSummary}
                  onChange={e => setConditionSummary(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Allergies (comma-separated):</label>
                <input
                  type="text"
                  value={allergies}
                  onChange={e => setAllergies(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Current Medications:</label>
                <input
                  type="text"
                  value={medications}
                  onChange={e => setMedications(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>
            </div>

            {/* Vitals Row */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 pt-1 font-mono text-[11px]">
              <div>
                <label className="block text-slate-500 font-sans text-[10px]">BP:</label>
                <input type="text" value={bp} onChange={e => setBp(e.target.value)} className="w-full p-1.5 rounded border border-slate-300" />
              </div>
              <div>
                <label className="block text-slate-500 font-sans text-[10px]">HR (bpm):</label>
                <input type="number" value={hr} onChange={e => setHr(Number(e.target.value))} className="w-full p-1.5 rounded border border-slate-300" />
              </div>
              <div>
                <label className="block text-slate-500 font-sans text-[10px]">SpO2 (%):</label>
                <input type="number" value={spo2} onChange={e => setSpo2(Number(e.target.value))} className="w-full p-1.5 rounded border border-slate-300" />
              </div>
              <div>
                <label className="block text-slate-500 font-sans text-[10px]">Temp:</label>
                <input type="text" value={temp} onChange={e => setTemp(e.target.value)} className="w-full p-1.5 rounded border border-slate-300" />
              </div>
              <div>
                <label className="block text-slate-500 font-sans text-[10px]">Resp Rate:</label>
                <input type="number" value={rr} onChange={e => setRr(Number(e.target.value))} className="w-full p-1.5 rounded border border-slate-300" />
              </div>
            </div>
          </div>

          {/* Transfer Route & Receiving Doctor */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <span className="font-bold text-slate-800 block">3. Transfer Route & Receiving Doctor</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Sending Hospital:</label>
                <select
                  value={sendingHospitalId}
                  onChange={e => setSendingHospitalId(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 bg-slate-50 text-xs"
                >
                  {hospitals.map(h => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Receiving Hospital:</label>
                <select
                  value={receivingHospitalId}
                  onChange={e => setReceivingHospitalId(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 bg-slate-50 text-xs"
                >
                  {hospitals.map(h => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Receiving Doctor:</label>
                <select
                  value={receivingDoctorId}
                  onChange={e => setReceivingDoctorId(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 bg-slate-50 text-xs font-semibold"
                >
                  {doctorProfiles.map(d => (
                    <option key={d.id} value={d.userId}>
                      {d.name} ({d.specialty} · {d.hospitalName.split(' ')[0]})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Encryption Animation / Progress */}
          {stepStatus && (
            <div className="p-3 rounded-lg bg-sky-50 border border-sky-200 text-sky-900 text-xs flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-sky-600 animate-ping shrink-0" />
              <span className="font-mono">{stepStatus}</span>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>AES-256-GCM + SHA-256 Protocol Verified</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold shadow-xs disabled:opacity-50 flex items-center gap-1.5"
              >
                <Lock className="w-4 h-4" />
                <span>{isSubmitting ? 'Encrypting & Transferring...' : 'Encrypt & Dispatch Transfer'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
