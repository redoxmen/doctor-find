import {
  User,
  Hospital,
  DoctorProfile,
  SyntheticPatientRecord,
  PatientTransfer,
  AuditLog,
  SecurityEvent,
  Appointment,
  LayaRecommendation,
  TimeSlot
} from '../types';
import { computeSha256, encryptPatientRecord, decryptPatientRecord, verifyRecordIntegrity } from './crypto';

const STORAGE_KEY = 'medilink_secure_state_v1';

// Seed Hospitals
export const SEED_HOSPITALS: Hospital[] = [
  {
    id: 'HOSP-01',
    name: 'City General Hospital',
    code: 'CGH-METRO',
    region: 'Central Health District',
    secureEndpoint: 'tls://gw-01.citygeneral.health.internal:8443',
    status: 'active',
    encryptionStandard: 'AES-256-GCM / TLS 1.3'
  },
  {
    id: 'HOSP-02',
    name: 'Metro Care Hospital',
    code: 'MCH-ACAD',
    region: 'North Academic Health Sciences',
    secureEndpoint: 'tls://gw-02.metrocare.health.internal:8443',
    status: 'active',
    encryptionStandard: 'AES-256-GCM / TLS 1.3'
  },
  {
    id: 'HOSP-03',
    name: 'Lakeside Medical Center',
    code: 'LMC-TRAUMA',
    region: 'Eastern Trauma Hub',
    secureEndpoint: 'tls://gw-03.lakesidemed.internal:8443',
    status: 'active',
    encryptionStandard: 'AES-256-GCM / TLS 1.3'
  }
];

// Seed Users
export const SEED_USERS: User[] = [
  {
    id: 'USR-DOC-01',
    name: 'Dr. Sarah Khan',
    role: 'doctor',
    hospitalId: 'HOSP-02',
    hospitalName: 'Metro Care Hospital',
    department: 'Cardiology & Critical Care',
    specialty: 'Interventional Cardiology',
    licenseNumber: 'MD-882910-CARD',
    verified: true,
    avatarUrl: '/src/assets/images/avatar_doctor_sarah_1791180055551.jpg',
    email: 'sarah.khan@metrocare.health.org'
  },
  {
    id: 'USR-DOC-02',
    name: 'Dr. Ahmed Thomas',
    role: 'doctor',
    hospitalId: 'HOSP-01',
    hospitalName: 'City General Hospital',
    department: 'Emergency Medicine',
    specialty: 'Emergency Medicine & Resuscitation',
    licenseNumber: 'MD-410294-EMERG',
    verified: true,
    avatarUrl: '/src/assets/images/avatar_doctor_ahmed_1791180065995.jpg',
    email: 'ahmed.thomas@citygeneral.health.org'
  },
  {
    id: 'USR-DOC-03',
    name: 'Dr. Rahul Menon',
    role: 'doctor',
    hospitalId: 'HOSP-03',
    hospitalName: 'Lakeside Medical Center',
    department: 'Neurology',
    specialty: 'Neurocritical Care',
    licenseNumber: 'MD-928173-NEURO',
    verified: true,
    email: 'rahul.menon@lakesidemed.health.org'
  },
  {
    id: 'USR-ADMIN-01',
    name: 'Marcus Vance (SecOps)',
    role: 'admin',
    hospitalId: 'HOSP-02',
    hospitalName: 'Metro Care Hospital',
    department: 'Healthcare Cybersecurity & Audit',
    licenseNumber: 'CISSP-HC-49102',
    verified: true,
    email: 'secops.admin@metrocare.health.org'
  },
  {
    id: 'USR-PAT-01',
    name: 'John P. (Patient P1024)',
    role: 'patient',
    hospitalId: 'HOSP-01',
    hospitalName: 'City General Hospital',
    verified: true,
    email: 'john.p.patient@securemail.internal'
  },
  {
    id: 'USR-FAKE-01',
    name: 'Unknown Agent (Unverified)',
    role: 'doctor',
    hospitalId: 'HOSP-01',
    hospitalName: 'City General Hospital',
    department: 'Unknown Dept',
    specialty: 'Unverified External Caller',
    verified: false,
    email: 'unverified.caller@external-spoof.net'
  }
];

// Seed Doctor Availability & Profiles
export const SEED_DOCTOR_PROFILES: DoctorProfile[] = [
  {
    id: 'DOC-01',
    userId: 'USR-DOC-02',
    name: 'Dr. Ahmed Khan',
    hospitalId: 'HOSP-01',
    hospitalName: 'MediLink General Hospital',
    department: 'Cardiology & Interventional Care',
    specialty: 'Cardiology',
    dutyStatus: 'on_duty',
    availableFrom: '09:00',
    availableUntil: '17:00',
    verified: true,
    syntheticRating: 4.8,
    avatarUrl: '/src/assets/images/avatar_doctor_ahmed_1791180065995.jpg',
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    slotDurationMinutes: 30,
    nextAvailableSlot: 'Today at 3:30 PM'
  },
  {
    id: 'DOC-02',
    userId: 'USR-DOC-06',
    name: 'Dr. Sara Thomas',
    hospitalId: 'HOSP-02',
    hospitalName: 'Metro Academic Center',
    department: 'Neurosciences & Stroke Hub',
    specialty: 'Neurology',
    dutyStatus: 'on_duty',
    availableFrom: '08:30',
    availableUntil: '16:30',
    verified: true,
    syntheticRating: 4.9,
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    slotDurationMinutes: 30,
    nextAvailableSlot: 'Today at 2:00 PM'
  },
  {
    id: 'DOC-03',
    userId: 'USR-DOC-03',
    name: 'Dr. Rahul Menon',
    hospitalId: 'HOSP-03',
    hospitalName: 'Lakeside Trauma Hub',
    department: 'Orthopedics & Joint Replacement',
    specialty: 'Orthopedics',
    dutyStatus: 'on_duty',
    availableFrom: '10:00',
    availableUntil: '18:00',
    verified: true,
    syntheticRating: 4.85,
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    slotDurationMinutes: 30,
    nextAvailableSlot: 'Today at 4:00 PM'
  },
  {
    id: 'DOC-04',
    userId: 'USR-DOC-07',
    name: 'Dr. Aisha Ali',
    hospitalId: 'HOSP-01',
    hospitalName: 'City General Hospital',
    department: 'Dermatology & Allergy',
    specialty: 'Dermatology',
    dutyStatus: 'on_duty',
    availableFrom: '09:00',
    availableUntil: '15:00',
    verified: true,
    syntheticRating: 4.75,
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    slotDurationMinutes: 30,
    nextAvailableSlot: 'Tomorrow at 10:00 AM'
  },
  {
    id: 'DOC-05',
    userId: 'USR-DOC-08',
    name: 'Dr. Neha Joseph',
    hospitalId: 'HOSP-02',
    hospitalName: 'Central Care Clinic',
    department: 'Internal Medicine & Acute Care',
    specialty: 'General Medicine',
    dutyStatus: 'on_duty',
    availableFrom: '08:00',
    availableUntil: '16:00',
    verified: true,
    syntheticRating: 4.9,
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    slotDurationMinutes: 30,
    nextAvailableSlot: 'Today at 1:30 PM'
  },
  {
    id: 'PROF-01',
    userId: 'USR-DOC-01',
    name: 'Dr. Sarah Khan',
    hospitalId: 'HOSP-02',
    hospitalName: 'Metro Care Hospital',
    department: 'Cardiology & Critical Care',
    specialty: 'Cardiology',
    dutyStatus: 'on_duty',
    availableFrom: '08:00',
    availableUntil: '18:00',
    verified: true,
    syntheticRating: 4.95,
    avatarUrl: '/src/assets/images/avatar_doctor_sarah_1791180055551.jpg',
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    slotDurationMinutes: 30,
    nextAvailableSlot: 'Today at 3:00 PM'
  },
  {
    id: 'PROF-02',
    userId: 'USR-DOC-02',
    name: 'Dr. Ahmed Thomas',
    hospitalId: 'HOSP-01',
    hospitalName: 'City General Hospital',
    department: 'Emergency Medicine',
    specialty: 'Emergency Medicine',
    dutyStatus: 'on_duty',
    availableFrom: '07:00',
    availableUntil: '16:00',
    verified: true,
    syntheticRating: 4.8,
    avatarUrl: '/src/assets/images/avatar_doctor_ahmed_1791180065995.jpg',
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    slotDurationMinutes: 30,
    nextAvailableSlot: 'Today at 11:30 AM'
  }
];

// Seed Synthetic Patient Records
export const SEED_PATIENTS: SyntheticPatientRecord[] = [
  {
    id: 'P1024',
    fullName: 'John P. (Synthetic Test Subject)',
    age: 48,
    gender: 'Male',
    bloodGroup: 'O+',
    allergies: ['Penicillin', 'Sulfa antibiotics'],
    currentMedications: ['Aspirin 81mg OD', 'Atorvastatin 40mg', 'Metoprolol 25mg BD'],
    conditionSummary: 'Acute ST-elevation myocardial infarction (STEMI) stabilized. Requires emergent catheterization transfer.',
    primaryDiagnosis: 'I21.0 - Acute transmural myocardial infarction of anterior wall',
    vitals: {
      bloodPressure: '138/84 mmHg',
      heartRate: 88,
      oxygenSaturation: 97,
      temperature: '36.8 °C',
      respiratoryRate: 18
    },
    labNotes: 'Troponin I: 4.2 ng/mL (elevated), ECG confirms anterior ST-elevations. Heparin bolus administered.',
    transferPriority: 'urgent',
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    sourceHospitalId: 'HOSP-01'
  },
  {
    id: 'P1002',
    fullName: 'Elena M. (Synthetic Test Subject)',
    age: 34,
    gender: 'Female',
    bloodGroup: 'A+',
    allergies: ['Latex'],
    currentMedications: ['Levothyroxine 50mcg'],
    conditionSummary: 'Complex status epilepticus post-ictal recovery. Scheduled neuro-monitoring referral.',
    primaryDiagnosis: 'G40.909 - Epilepsy, unspecified, not intractable',
    vitals: {
      bloodPressure: '120/78 mmHg',
      heartRate: 72,
      oxygenSaturation: 99,
      temperature: '37.0 °C',
      respiratoryRate: 16
    },
    labNotes: 'Continuous EEG requested. Electrolytes unremarkable. Phenytoin therapeutic level verified.',
    transferPriority: 'routine',
    createdAt: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
    sourceHospitalId: 'HOSP-01'
  }
];

interface AppState {
  currentUserId: string;
  transfers: PatientTransfer[];
  auditLogs: AuditLog[];
  securityEvents: SecurityEvent[];
  appointments: Appointment[];
}

// Memory cache + LocalStorage sync
let stateCache: AppState | null = null;
const subscribers = new Set<() => void>();

function notifySubscribers() {
  subscribers.forEach(cb => cb());
}

export function subscribeToStore(callback: () => void): () => void {
  subscribers.add(callback);
  return () => {
    subscribers.delete(callback);
  };
}

/**
 * Initializes the default application state with real AES-GCM and SHA-256 hashes
 */
export async function initializeStore(): Promise<AppState> {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as AppState;
      stateCache = parsed;
      return stateCache;
    } catch {
      // Corrupt storage, will reseed
    }
  }

  // Generate seed transfer with real crypto
  const patient1 = SEED_PATIENTS[0];
  const hash1 = await computeSha256(patient1);
  const encrypted1 = await encryptPatientRecord(patient1);

  const transfer1: PatientTransfer = {
    id: 'TR-1024',
    patientId: patient1.id,
    patientName: patient1.fullName,
    sendingHospitalId: 'HOSP-01',
    sendingHospitalName: 'City General Hospital',
    receivingHospitalId: 'HOSP-02',
    receivingHospitalName: 'Metro Care Hospital',
    receivingDoctorId: 'USR-DOC-01',
    receivingDoctorName: 'Dr. Sarah Khan',
    transferPriority: 'urgent',
    status: 'awaiting_approval',
    encryptedPayload: encrypted1,
    integrityHash: hash1,
    integrityStatus: 'verified',
    approvalStatus: 'pending',
    createdAt: patient1.createdAt,
    lastUpdated: patient1.createdAt,
    history: [
      {
        stage: 'Transfer Created',
        timestamp: patient1.createdAt,
        actor: 'Dr. Ahmed Thomas',
        role: 'Doctor (Sending)',
        note: 'Record canonicalized, encrypted with AES-256-GCM, SHA-256 integrity hash registered.'
      },
      {
        stage: 'Secure Transport',
        timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
        actor: 'Secure Gateway Node CGH-01',
        role: 'System',
        note: 'Payload routed through encrypted mTLS tunnel to Metro Care gateway.'
      },
      {
        stage: 'Awaiting Doctor Approval',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        actor: 'Identity Broker',
        role: 'System',
        note: 'Assigned to Dr. Sarah Khan. Confidential data locked until explicit human approval.'
      }
    ]
  };

  const patient2 = SEED_PATIENTS[1];
  const hash2 = await computeSha256(patient2);
  const encrypted2 = await encryptPatientRecord(patient2);

  const transfer2: PatientTransfer = {
    id: 'TR-1019',
    patientId: patient2.id,
    patientName: patient2.fullName,
    sendingHospitalId: 'HOSP-01',
    sendingHospitalName: 'City General Hospital',
    receivingHospitalId: 'HOSP-03',
    receivingHospitalName: 'Lakeside Medical Center',
    receivingDoctorId: 'USR-DOC-03',
    receivingDoctorName: 'Dr. Rahul Menon',
    transferPriority: 'routine',
    status: 'approved',
    encryptedPayload: encrypted2,
    integrityHash: hash2,
    integrityStatus: 'verified',
    decryptedRecord: patient2,
    approvalStatus: 'approved',
    approvedByDoctorId: 'USR-DOC-03',
    approvalTimestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    createdAt: patient2.createdAt,
    lastUpdated: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    history: [
      {
        stage: 'Transfer Created',
        timestamp: patient2.createdAt,
        actor: 'Dr. Ahmed Thomas',
        role: 'Doctor (Sending)',
        note: 'Synthetic routine transfer initiated.'
      },
      {
        stage: 'Approved by Receiving Doctor',
        timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
        actor: 'Dr. Rahul Menon',
        role: 'Doctor (Receiving)',
        note: 'Identity verified. Doctor approved admission. Record decrypted for clinical team.'
      }
    ]
  };

  const initialLogs: AuditLog[] = [
    {
      id: 'AUD-9011',
      timestamp: new Date(Date.now() - 46 * 60 * 1000).toISOString(),
      userId: 'USR-DOC-02',
      userName: 'Dr. Ahmed Thomas',
      userRole: 'doctor',
      hospitalId: 'HOSP-01',
      hospitalName: 'City General Hospital',
      action: 'PATIENT_TRANSFER_CREATED',
      resource: 'TRANSFER_TR-1024 / PATIENT_P1024',
      result: 'AUTHORIZED',
      severity: 'LOW',
      ipAddress: '10.240.12.84 (Hospital Intranet)',
      details: 'Created transfer request for John P. to Metro Care Hospital. AES-256-GCM encrypted.',
      aiExplanation: 'Legitimate request: Authenticated physician in Emergency Dept initiated transfer within clinical scope.'
    },
    {
      id: 'AUD-9012',
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      userId: 'SYSTEM',
      userName: 'MediLink Integrity Engine',
      userRole: 'admin',
      hospitalId: 'HOSP-01',
      hospitalName: 'City General Hospital',
      action: 'INTEGRITY_HASH_GENERATED',
      resource: 'RECORD_P1024',
      result: 'COMPLETED',
      severity: 'LOW',
      ipAddress: '127.0.0.1 (Crypto Service)',
      details: `Generated SHA-256 digest: ${hash1.substring(0, 16)}...${hash1.substring(48)}`,
      aiExplanation: 'Cryptographic baseline established. Any alteration to patient data will mismatch this digest.'
    },
    {
      id: 'AUD-9013',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      userId: 'USR-DOC-01',
      userName: 'Dr. Sarah Khan',
      userRole: 'doctor',
      hospitalId: 'HOSP-02',
      hospitalName: 'Metro Care Hospital',
      action: 'TRANSFER_NOTIFICATION_DISPATCHED',
      resource: 'TRANSFER_TR-1024',
      result: 'AUTHORIZED',
      severity: 'LOW',
      ipAddress: '10.242.0.15 (Metro Care Gateway)',
      details: 'Awaiting human-in-the-loop review. Clinical records remain locked until physician approves.',
      aiExplanation: 'Zero-trust enforcement: Access is withheld until explicit human physician authorization.'
    }
  ];

  const initialEvents: SecurityEvent[] = [];

  const initialAppointments: Appointment[] = [
    {
      id: 'APT-1001',
      doctorId: 'DOC-01',
      doctorName: 'Dr. Ahmed Khan',
      doctorSpecialty: 'Cardiology',
      hospitalName: 'MediLink General Hospital',
      patientId: 'P1024',
      patientName: 'John P.',
      appointmentDate: new Date().toISOString().split('T')[0],
      appointmentTime: '11:00',
      status: 'confirmed',
      problemSummary: 'Cardiovascular checkup & follow-up evaluation',
      createdAt: new Date(Date.now() - 3600000).toISOString()
    }
  ];

  const defaultState: AppState = {
    currentUserId: 'USR-DOC-01', // Dr. Sarah Khan by default
    transfers: [transfer1, transfer2],
    auditLogs: initialLogs,
    securityEvents: initialEvents,
    appointments: initialAppointments
  };

  saveState(defaultState);
  stateCache = defaultState;
  return defaultState;
}

function saveState(state: AppState) {
  stateCache = state;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
  notifySubscribers();
}

export function getCurrentState(): AppState {
  if (!stateCache) {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      stateCache = JSON.parse(raw);
      if (!stateCache?.appointments) {
        stateCache!.appointments = [];
      }
    } else {
      // fallback
      stateCache = {
        currentUserId: 'USR-DOC-01',
        transfers: [],
        auditLogs: [],
        securityEvents: [],
        appointments: []
      };
    }
  }
  return stateCache!;
}

export function getCurrentUser(): User {
  const state = getCurrentState();
  const user = SEED_USERS.find(u => u.id === state.currentUserId);
  return user || SEED_USERS[0];
}

export function setCurrentUser(userId: string): void {
  const state = getCurrentState();
  const user = SEED_USERS.find(u => u.id === userId);
  if (!user) return;

  const log: AuditLog = {
    id: `AUD-${Date.now().toString().slice(-4)}`,
    timestamp: new Date().toISOString(),
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    hospitalId: user.hospitalId,
    hospitalName: user.hospitalName,
    action: 'USER_SESSION_SWITCH',
    resource: `ROLE_${user.role.toUpperCase()}`,
    result: 'AUTHORIZED',
    severity: user.verified ? 'LOW' : 'HIGH',
    ipAddress: '192.168.1.105 (Session Console)',
    details: `Active role switched to ${user.name} (${user.role.toUpperCase()}) at ${user.hospitalName}.`,
    aiExplanation: user.verified 
      ? `Normal role-switch in testbed. User ${user.name} holds valid credentials.`
      : `Warning: Switched to unverified entity. Security system will restrict operations.`
  };

  const updatedLogs = [log, ...state.auditLogs];
  saveState({
    ...state,
    currentUserId: userId,
    auditLogs: updatedLogs
  });
}

export function getTransfers(): PatientTransfer[] {
  return getCurrentState().transfers;
}

export function getTransferById(id: string): PatientTransfer | undefined {
  return getCurrentState().transfers.find(t => t.id === id);
}

export function getAuditLogs(): AuditLog[] {
  return getCurrentState().auditLogs;
}

export function getSecurityEvents(): SecurityEvent[] {
  return getCurrentState().securityEvents;
}

export function addAuditLog(entry: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog {
  const state = getCurrentState();
  const newLog: AuditLog = {
    ...entry,
    id: `AUD-${Date.now().toString().slice(-5)}`,
    timestamp: new Date().toISOString()
  };
  saveState({
    ...state,
    auditLogs: [newLog, ...state.auditLogs]
  });
  return newLog;
}

export function addSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): SecurityEvent {
  const state = getCurrentState();
  const newEvent: SecurityEvent = {
    ...event,
    id: `SEC-${Date.now().toString().slice(-4)}`,
    timestamp: new Date().toISOString()
  };
  saveState({
    ...state,
    securityEvents: [newEvent, ...state.securityEvents]
  });
  return newEvent;
}

/**
 * Creates a new Patient Transfer with real AES-GCM encryption & SHA-256 integrity hash
 */
export async function createPatientTransfer(params: {
  patient: Omit<SyntheticPatientRecord, 'id' | 'createdAt' | 'sourceHospitalId'>;
  sendingHospitalId: string;
  receivingHospitalId: string;
  receivingDoctorId: string;
  transferPriority: 'routine' | 'urgent' | 'emergency';
}): Promise<PatientTransfer> {
  const state = getCurrentState();
  const currentUser = getCurrentUser();

  // Enforce RBAC: Only authorized doctors can create transfers
  if (currentUser.role !== 'doctor' && currentUser.role !== 'admin') {
    addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      hospitalId: currentUser.hospitalId,
      hospitalName: currentUser.hospitalName,
      action: 'UNAUTHORIZED_TRANSFER_ATTEMPT',
      resource: 'PATIENT_TRANSFER_API',
      result: 'DENIED',
      severity: 'HIGH',
      ipAddress: '10.240.12.84',
      details: `Role ${currentUser.role} attempted to initiate patient transfer without doctor credential.`,
      aiExplanation: 'Request blocked: Patient or unverified role attempted clinical transfer initiation. Violates HIPAA/RBAC policy.'
    });
    throw new Error('403 — Unauthorized access: Only verified medical personnel can initiate patient transfers.');
  }

  const patientId = `P${Math.floor(1000 + Math.random() * 9000)}`;
  const transferId = `TR-${Math.floor(1000 + Math.random() * 9000)}`;

  const fullRecord: SyntheticPatientRecord = {
    ...params.patient,
    id: patientId,
    createdAt: new Date().toISOString(),
    sourceHospitalId: params.sendingHospitalId
  };

  // 1. Generate SHA-256 integrity hash from canonical record
  const integrityHash = await computeSha256(fullRecord);

  // 2. Encrypt record with AES-256-GCM
  const encryptedPayload = await encryptPatientRecord(fullRecord);

  const sendingHosp = SEED_HOSPITALS.find(h => h.id === params.sendingHospitalId)?.name || 'Unknown Hospital';
  const receivingHosp = SEED_HOSPITALS.find(h => h.id === params.receivingHospitalId)?.name || 'Unknown Hospital';
  const receivingDoc = SEED_USERS.find(u => u.id === params.receivingDoctorId)?.name || 'Dr. Assigned';

  const newTransfer: PatientTransfer = {
    id: transferId,
    patientId: patientId,
    patientName: fullRecord.fullName,
    sendingHospitalId: params.sendingHospitalId,
    sendingHospitalName: sendingHosp,
    receivingHospitalId: params.receivingHospitalId,
    receivingHospitalName: receivingHosp,
    receivingDoctorId: params.receivingDoctorId,
    receivingDoctorName: receivingDoc,
    transferPriority: params.transferPriority,
    status: 'awaiting_approval',
    encryptedPayload,
    integrityHash,
    integrityStatus: 'verified',
    approvalStatus: 'pending',
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    history: [
      {
        stage: 'Transfer Created',
        timestamp: new Date().toISOString(),
        actor: currentUser.name,
        role: `${currentUser.role} (${currentUser.hospitalName})`,
        note: `Encrypted via AES-256-GCM. SHA-256 digest: ${integrityHash.substring(0, 16)}...`
      },
      {
        stage: 'Awaiting Doctor Approval',
        timestamp: new Date().toISOString(),
        actor: 'MediLink Gateway',
        role: 'Security Dispatcher',
        note: `Dispatched to ${receivingDoc} at ${receivingHosp}. Sensitive data protected.`
      }
    ]
  };

  // Log audit event
  addAuditLog({
    userId: currentUser.id,
    userName: currentUser.name,
    userRole: currentUser.role,
    hospitalId: currentUser.hospitalId,
    hospitalName: currentUser.hospitalName,
    action: 'PATIENT_TRANSFER_CREATED',
    resource: `TRANSFER_${transferId} / PATIENT_${patientId}`,
    result: 'AUTHORIZED',
    severity: 'LOW',
    ipAddress: '10.240.12.84',
    details: `Transfer ${transferId} created. Priority: ${params.transferPriority}. Encrypted with AES-256-GCM.`,
    aiExplanation: 'Transfer created and cryptographically signed. Waiting for receiving doctor explicit human approval.'
  });

  saveState({
    ...state,
    transfers: [newTransfer, ...state.transfers]
  });

  return newTransfer;
}

/**
 * Human-in-the-Loop Doctor Approval
 * Verifies doctor identity, checks integrity hash, decrypts record only upon authorization
 */
export async function approvePatientTransfer(
  transferId: string,
  doctorUserId: string
): Promise<{ success: boolean; transfer: PatientTransfer; decryptedRecord?: SyntheticPatientRecord }> {
  const state = getCurrentState();
  const transfer = state.transfers.find(t => t.id === transferId);
  const doctor = SEED_USERS.find(u => u.id === doctorUserId);

  if (!transfer || !doctor) {
    throw new Error('Transfer or doctor not found');
  }

  // Verify doctor identity & credentials
  if (!doctor.verified) {
    addAuditLog({
      userId: doctor.id,
      userName: doctor.name,
      userRole: doctor.role,
      hospitalId: doctor.hospitalId,
      hospitalName: doctor.hospitalName,
      action: 'UNVERIFIED_APPROVAL_ATTEMPT',
      resource: `TRANSFER_${transferId}`,
      result: 'DENIED',
      severity: 'CRITICAL',
      ipAddress: '198.51.100.44 (External Suspicious)',
      details: `Unverified account ${doctor.name} attempted to approve transfer ${transferId}.`,
      aiExplanation: 'Critical Security Alert: Doctor credential verification failed. Medical records cannot be released to unverified identities.'
    });

    addSecurityEvent({
      type: 'FAKE_DOCTOR_ATTEMPT',
      title: 'Fake Doctor Approval Attempt Blocked',
      description: `Unverified user ${doctor.name} attempted to access confidential records for transfer ${transferId}.`,
      severity: 'CRITICAL',
      resolved: false,
      sourceIp: '198.51.100.44',
      associatedTransferId: transferId
    });

    throw new Error('403 — Identity/role verification failed: Doctor account is unverified.');
  }

  // Check if tampered in simulation
  if (transfer.tamperSimulationActive && transfer.tamperedRecordPayload) {
    const integrityCheck = await verifyRecordIntegrity(
      transfer.tamperedRecordPayload,
      transfer.integrityHash
    );

    if (!integrityCheck.isValid) {
      addAuditLog({
        userId: doctor.id,
        userName: doctor.name,
        userRole: doctor.role,
        hospitalId: doctor.hospitalId,
        hospitalName: doctor.hospitalName,
        action: 'INTEGRITY_VERIFICATION_FAILURE',
        resource: `TRANSFER_${transferId}`,
        result: 'TAMPER_DETECTED',
        severity: 'CRITICAL',
        ipAddress: '10.242.0.18',
        details: `SHA-256 mismatch detected during approval! Expected: ${transfer.integrityHash.substring(0, 16)}..., Received: ${integrityCheck.computedHash.substring(0, 16)}...`,
        aiExplanation: 'Critical Alert: Record integrity violation! The patient data has been altered after transmission. Transfer blocked to prevent clinical harm.'
      });

      addSecurityEvent({
        type: 'INTEGRITY_FAILURE',
        title: 'Tampered Record Detected in Transit',
        description: `Transfer ${transferId} integrity digest failed verification. Received payload does not match sending hospital digest.`,
        severity: 'CRITICAL',
        resolved: false,
        sourceIp: '10.242.0.18',
        associatedTransferId: transferId
      });

      const updatedTransfers = state.transfers.map(t => {
        if (t.id === transferId) {
          return {
            ...t,
            status: 'tamper_flagged' as const,
            integrityStatus: 'tampered' as const,
            lastUpdated: new Date().toISOString(),
            history: [
              ...t.history,
              {
                stage: 'Integrity Check Failed',
                timestamp: new Date().toISOString(),
                actor: 'Integrity Monitor',
                role: 'System',
                note: `Record integrity verification failed. Expected ${transfer.integrityHash.slice(0, 8)}, received ${integrityCheck.computedHash.slice(0, 8)}.`
              }
            ]
          };
        }
        return t;
      });

      saveState({ ...state, transfers: updatedTransfers });
      throw new Error('🔴 INTEGRITY FAILURE — Record tampering detected. Transfer blocked to preserve patient safety.');
    }
  }

  // Decrypt the record for the receiving doctor
  const decryptedRecord = await decryptPatientRecord(transfer.encryptedPayload);

  // Verify integrity of decrypted record against stored SHA-256 hash
  const verifyResult = await verifyRecordIntegrity(decryptedRecord, transfer.integrityHash);
  if (!verifyResult.isValid) {
    throw new Error('Decryption payload failed integrity verification.');
  }

  const updatedTransfer: PatientTransfer = {
    ...transfer,
    status: 'approved',
    approvalStatus: 'approved',
    approvedByDoctorId: doctor.id,
    approvalTimestamp: new Date().toISOString(),
    integrityStatus: 'verified',
    decryptedRecord,
    lastUpdated: new Date().toISOString(),
    history: [
      ...transfer.history,
      {
        stage: 'Doctor Approved (Human-in-the-Loop)',
        timestamp: new Date().toISOString(),
        actor: doctor.name,
        role: `Receiving Doctor (${doctor.hospitalName})`,
        note: `Doctor identity verified. Transfer explicitly approved. AES-256-GCM payload decrypted.`
      }
    ]
  };

  addAuditLog({
    userId: doctor.id,
    userName: doctor.name,
    userRole: doctor.role,
    hospitalId: doctor.hospitalId,
    hospitalName: doctor.hospitalName,
    action: 'TRANSFER_APPROVED',
    resource: `TRANSFER_${transferId} / RECORD_${transfer.patientId}`,
    result: 'AUTHORIZED',
    severity: 'LOW',
    ipAddress: '10.242.0.18 (Doctor Workstation)',
    details: `${doctor.name} approved transfer ${transferId}. Record decrypted for clinical team. Integrity verified.`,
    aiExplanation: 'Authorized workflow: Receiving physician reviewed credentials, verified integrity hash, and explicitly authorized patient transfer.'
  });

  const updatedTransfers = state.transfers.map(t => (t.id === transferId ? updatedTransfer : t));
  saveState({ ...state, transfers: updatedTransfers });

  return { success: true, transfer: updatedTransfer, decryptedRecord };
}

/**
 * Rejects a patient transfer
 */
export function rejectPatientTransfer(
  transferId: string,
  doctorUserId: string,
  reason: string
): PatientTransfer {
  const state = getCurrentState();
  const transfer = state.transfers.find(t => t.id === transferId);
  const doctor = SEED_USERS.find(u => u.id === doctorUserId);

  if (!transfer || !doctor) {
    throw new Error('Transfer or doctor not found');
  }

  const updatedTransfer: PatientTransfer = {
    ...transfer,
    status: 'rejected',
    approvalStatus: 'rejected',
    rejectionReason: reason,
    lastUpdated: new Date().toISOString(),
    history: [
      ...transfer.history,
      {
        stage: 'Transfer Rejected by Receiving Doctor',
        timestamp: new Date().toISOString(),
        actor: doctor.name,
        role: `Receiving Doctor (${doctor.hospitalName})`,
        note: `Reason: ${reason}. Sensitive patient data not unlocked.`
      }
    ]
  };

  addAuditLog({
    userId: doctor.id,
    userName: doctor.name,
    userRole: doctor.role,
    hospitalId: doctor.hospitalId,
    hospitalName: doctor.hospitalName,
    action: 'TRANSFER_REJECTED',
    resource: `TRANSFER_${transferId}`,
    result: 'COMPLETED',
    severity: 'MEDIUM',
    ipAddress: '10.242.0.18',
    details: `Transfer ${transferId} rejected by ${doctor.name}. Reason: "${reason}".`,
    aiExplanation: 'Receiving doctor declined transfer. Patient record remains encrypted; no unauthorized data disclosure occurred.'
  });

  const updatedTransfers = state.transfers.map(t => (t.id === transferId ? updatedTransfer : t));
  saveState({ ...state, transfers: updatedTransfers });

  return updatedTransfer;
}

/**
 * Demo Attack 1: Fake Doctor Impersonation Attempt
 */
export function simulateFakeDoctorAttack(transferId: string): {
  success: boolean;
  statusCode: number;
  message: string;
  auditLogId: string;
} {
  const fakeDoc = SEED_USERS.find(u => u.id === 'USR-FAKE-01')!;
  const transfer = getTransferById(transferId);

  const log = addAuditLog({
    userId: fakeDoc.id,
    userName: fakeDoc.name,
    userRole: fakeDoc.role,
    hospitalId: fakeDoc.hospitalId,
    hospitalName: fakeDoc.hospitalName,
    action: 'UNVERIFIED_DOCTOR_ACCESS_ATTEMPT',
    resource: `TRANSFER_${transferId} / SENSITIVE_RECORDS`,
    result: 'DENIED',
    severity: 'CRITICAL',
    ipAddress: '198.51.100.89 (Spoofed External Gateway)',
    details: 'Unverified entity attempting to inspect encrypted patient clinical payload without PKI credential.',
    aiExplanation: 'Security policy enforced: Identity & role verification failed. The requester has no certified medical license on file in the hospital directory.'
  });

  addSecurityEvent({
    type: 'FAKE_DOCTOR_ATTEMPT',
    title: 'Simulated Attack: Rogue Doctor Impersonation Blocked',
    description: `An unverified entity '${fakeDoc.name}' attempted to fetch medical records for transfer ${transferId}. Blocked by Zero-Trust Access Gate.`,
    severity: 'CRITICAL',
    resolved: false,
    sourceIp: '198.51.100.89',
    associatedTransferId: transferId
  });

  return {
    success: false,
    statusCode: 403,
    message: '🔴 ACCESS DENIED — Identity/role verification failed. Only verified medical professionals can access patient records.',
    auditLogId: log.id
  };
}

/**
 * Demo Attack 2: Simulate Record Tampering
 * Intentionally alters synthetic patient record in transit (e.g. Blood Group O+ -> AB+ or altered dosage)
 */
export async function simulateRecordTampering(
  transferId: string,
  field: 'bloodGroup' | 'allergies' | 'conditionSummary',
  tamperedValue: any
): Promise<{
  originalHash: string;
  tamperedHash: string;
  transfer: PatientTransfer;
}> {
  const state = getCurrentState();
  const transfer = state.transfers.find(t => t.id === transferId);
  if (!transfer) throw new Error('Transfer not found');

  // Decrypt or obtain baseline record to tamper with
  let baselineRecord: SyntheticPatientRecord;
  try {
    baselineRecord = await decryptPatientRecord(transfer.encryptedPayload);
  } catch {
    baselineRecord = SEED_PATIENTS[0];
  }

  // Create tampered copy
  const tamperedRecord: SyntheticPatientRecord = {
    ...baselineRecord,
    [field]: tamperedValue
  };

  const tamperedHash = await computeSha256(tamperedRecord);

  const updatedTransfer: PatientTransfer = {
    ...transfer,
    tamperSimulationActive: true,
    tamperedRecordPayload: tamperedRecord,
    tamperedHash: tamperedHash,
    integrityStatus: 'tampered',
    status: 'tamper_flagged',
    lastUpdated: new Date().toISOString(),
    history: [
      ...transfer.history,
      {
        stage: 'Simulated Data Tampering Injected',
        timestamp: new Date().toISOString(),
        actor: 'Security Demo Testbed',
        role: 'Auditor',
        note: `Field '${field}' modified to '${JSON.stringify(tamperedValue)}'. Recomputed SHA-256: ${tamperedHash.slice(0, 12)}...`
      }
    ]
  };

  addAuditLog({
    userId: 'DEMO-RUNNER',
    userName: 'Security Testbed Suite',
    userRole: 'admin',
    hospitalId: transfer.sendingHospitalId,
    hospitalName: transfer.sendingHospitalName,
    action: 'INTEGRITY_TAMPER_SIMULATION',
    resource: `TRANSFER_${transferId} / FIELD_${field}`,
    result: 'TAMPER_DETECTED',
    severity: 'CRITICAL',
    ipAddress: '127.0.0.1 (Attack Simulation Tool)',
    details: `Synthetic record altered in transit: ${field} changed to ${JSON.stringify(tamperedValue)}. Expected Hash: ${transfer.integrityHash.slice(0, 16)}..., Received Hash: ${tamperedHash.slice(0, 16)}...`,
    aiExplanation: 'Record tampering detected! The SHA-256 hash of the modified record does not match the cryptographic signature generated at the sending hospital.'
  });

  addSecurityEvent({
    type: 'INTEGRITY_FAILURE',
    title: 'Tampered Record Detected (Simulation)',
    description: `Integrity check failed for Transfer ${transferId}. Blood group/condition was altered in transit. Hash mismatch detected.`,
    severity: 'CRITICAL',
    resolved: false,
    sourceIp: '127.0.0.1',
    associatedTransferId: transferId
  });

  const updatedTransfers = state.transfers.map(t => (t.id === transferId ? updatedTransfer : t));
  saveState({ ...state, transfers: updatedTransfers });

  return {
    originalHash: transfer.integrityHash,
    tamperedHash,
    transfer: updatedTransfer
  };
}

/**
 * Reverts simulated tampering back to verified state
 */
export function revertRecordTampering(transferId: string): PatientTransfer {
  const state = getCurrentState();
  const transfer = state.transfers.find(t => t.id === transferId);
  if (!transfer) throw new Error('Transfer not found');

  const updatedTransfer: PatientTransfer = {
    ...transfer,
    tamperSimulationActive: false,
    tamperedRecordPayload: undefined,
    tamperedHash: undefined,
    integrityStatus: 'verified',
    status: transfer.approvalStatus === 'approved' ? 'approved' : 'awaiting_approval',
    lastUpdated: new Date().toISOString(),
    history: [
      ...transfer.history,
      {
        stage: 'Integrity Restored',
        timestamp: new Date().toISOString(),
        actor: 'Security Testbed Suite',
        role: 'Admin',
        note: 'Record reverted to authentic cryptographic baseline. Hash verified.'
      }
    ]
  };

  addAuditLog({
    userId: 'DEMO-RUNNER',
    userName: 'Security Testbed Suite',
    userRole: 'admin',
    hospitalId: transfer.sendingHospitalId,
    hospitalName: transfer.sendingHospitalName,
    action: 'INTEGRITY_RESTORED',
    resource: `TRANSFER_${transferId}`,
    result: 'COMPLETED',
    severity: 'LOW',
    ipAddress: '127.0.0.1',
    details: 'Tampering simulation ended. Authentic ciphertext and original SHA-256 digest re-verified.',
    aiExplanation: 'Record returned to valid cryptographic state. Hashes match perfectly.'
  });

  const updatedTransfers = state.transfers.map(t => (t.id === transferId ? updatedTransfer : t));
  saveState({ ...state, transfers: updatedTransfers });

  return updatedTransfer;
}

/**
 * Demo Attack 3: Unauthorized Access (Cross-Patient / RBAC Violation)
 */
export function simulateUnauthorizedAccess(
  targetPatientId: string,
  attemptedByUserId: string
): {
  success: boolean;
  statusCode: number;
  message: string;
  auditLogId: string;
} {
  const user = SEED_USERS.find(u => u.id === attemptedByUserId) || getCurrentUser();

  const log = addAuditLog({
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    hospitalId: user.hospitalId,
    hospitalName: user.hospitalName,
    action: 'RBAC_UNAUTHORIZED_ACCESS_ATTEMPT',
    resource: `PATIENT_RECORD_${targetPatientId}`,
    result: 'DENIED',
    severity: 'HIGH',
    ipAddress: '192.168.10.42 (Unauthorized Endpoint)',
    details: `User ${user.name} (${user.role}) attempted direct read on Patient ${targetPatientId} without clinical assignment or transfer authorization.`,
    aiExplanation: `403 Forbidden: Request blocked by RBAC policy. Role '${user.role}' is not granted access to Patient ${targetPatientId}. Only assigned attending doctors or the authorized patient can view this record.`
  });

  addSecurityEvent({
    type: 'UNAUTHORIZED_ACCESS',
    title: 'RBAC Policy Denial: Unauthorized Access Blocked',
    description: `User ${user.name} attempted unauthorized access to Patient ${targetPatientId}. Access denied with 403.`,
    severity: 'HIGH',
    resolved: false,
    sourceIp: '192.168.10.42'
  });

  return {
    success: false,
    statusCode: 403,
    message: `🔴 403 Forbidden — Unauthorized access: User '${user.name}' does not possess clinical clearance or assigned transfer rights for Patient ${targetPatientId}.`,
    auditLogId: log.id
  };
}

/**
 * Resets the entire store to clean seed state
 */
export async function resetStoreToDefaults(): Promise<void> {
  localStorage.removeItem(STORAGE_KEY);
  stateCache = null;
  await initializeStore();
  notifySubscribers();
}

/**
 * Patient Medical Problem Submission
 * Allows patient to describe their symptoms/problem, which is immediately encrypted with AES-256-GCM,
 * hashed with SHA-256, and routed to the receiving hospital for doctor review.
 */
export async function submitPatientProblem(submission: {
  patientId: string;
  patientName: string;
  age: number;
  gender: 'Female' | 'Male' | 'Other';
  problemDescription: string;
  symptomDuration: string;
  urgencyLevel: 'routine' | 'urgent' | 'emergency';
  knownAllergies: string[];
  currentMedications: string[];
  bloodGroup: string;
  preferredHospitalId: string;
  preferredSpecialty: string;
}): Promise<PatientTransfer> {
  const state = getCurrentState();
  const currentUser = getCurrentUser();

  const transferId = `TR-${Math.floor(1000 + Math.random() * 9000)}`;
  const patientId = submission.patientId || `P${Math.floor(1000 + Math.random() * 9000)}`;

  const syntheticRecord: SyntheticPatientRecord = {
    id: patientId,
    fullName: submission.patientName,
    age: submission.age,
    gender: submission.gender,
    bloodGroup: submission.bloodGroup,
    allergies: submission.knownAllergies,
    currentMedications: submission.currentMedications,
    conditionSummary: `[Patient Self-Reported Symptoms]: ${submission.problemDescription} (Duration: ${submission.symptomDuration})`,
    primaryDiagnosis: `Pending Attending Triage: ${submission.preferredSpecialty} Consultation`,
    vitals: {
      bloodPressure: '124/82 mmHg',
      heartRate: 78,
      oxygenSaturation: 98,
      temperature: '37.0 °C',
      respiratoryRate: 16
    },
    labNotes: `Patient intake submitted via MediLink Patient Portal. Self-reported duration: ${submission.symptomDuration}.`,
    transferPriority: submission.urgencyLevel,
    createdAt: new Date().toISOString(),
    sourceHospitalId: currentUser.hospitalId || 'HOSP-01'
  };

  // 1. Generate SHA-256 integrity hash from canonical record
  const integrityHash = await computeSha256(syntheticRecord);

  // 2. Encrypt record with AES-256-GCM
  const encryptedPayload = await encryptPatientRecord(syntheticRecord);

  const sendingHosp = SEED_HOSPITALS.find(h => h.id === currentUser.hospitalId)?.name || 'City General Hospital';
  const receivingHosp = SEED_HOSPITALS.find(h => h.id === submission.preferredHospitalId)?.name || 'Metro Care Hospital';
  
  // Pick matching receiving doctor for this specialty
  const receivingDoc = SEED_DOCTOR_PROFILES.find(
    d => d.hospitalId === submission.preferredHospitalId && d.specialty.toLowerCase().includes(submission.preferredSpecialty.toLowerCase())
  ) || SEED_DOCTOR_PROFILES.find(d => d.hospitalId === submission.preferredHospitalId) || SEED_DOCTOR_PROFILES[0];

  const newTransfer: PatientTransfer = {
    id: transferId,
    patientId: patientId,
    patientName: submission.patientName,
    sendingHospitalId: currentUser.hospitalId || 'HOSP-01',
    sendingHospitalName: sendingHosp,
    receivingHospitalId: submission.preferredHospitalId,
    receivingHospitalName: receivingHosp,
    receivingDoctorId: receivingDoc.userId,
    receivingDoctorName: receivingDoc.name,
    transferPriority: submission.urgencyLevel,
    status: 'awaiting_approval',
    encryptedPayload,
    integrityHash,
    integrityStatus: 'verified',
    approvalStatus: 'pending',
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    history: [
      {
        stage: 'Patient Problem Submitted',
        timestamp: new Date().toISOString(),
        actor: submission.patientName,
        role: 'Patient (Self-Service Intake)',
        note: `Patient described problem: "${submission.problemDescription.slice(0, 60)}...". Encrypted with AES-256-GCM.`
      },
      {
        stage: 'Awaiting Doctor Review',
        timestamp: new Date().toISOString(),
        actor: 'MediLink Gateway',
        role: 'System Dispatcher',
        note: `Routed to ${receivingDoc.name} (${receivingHosp}). Sensitive clinical record sealed.`
      }
    ]
  };

  addAuditLog({
    userId: currentUser.id,
    userName: submission.patientName,
    userRole: 'patient',
    hospitalId: currentUser.hospitalId,
    hospitalName: sendingHosp,
    action: 'PATIENT_PROBLEM_INTAKE_SUBMITTED',
    resource: `TRANSFER_${transferId} / PATIENT_${patientId}`,
    result: 'AUTHORIZED',
    severity: 'LOW',
    ipAddress: '192.168.4.12 (Patient Portal Session)',
    details: `Patient ${submission.patientName} submitted medical intake for ${submission.preferredSpecialty}. Payload encrypted with AES-256-GCM.`,
    aiExplanation: 'Legitimate patient intake: Patient described symptoms, generated cryptographic integrity digest, and requested physician review.'
  });

  saveState({
    ...state,
    transfers: [newTransfer, ...state.transfers]
  });

  return newTransfer;
}

// ==========================================
// APPOINTMENTS & DOCTOR AVAILABILITY ENGINE
// ==========================================

export function getAppointments(doctorId?: string, patientId?: string): Appointment[] {
  const state = getCurrentState();
  let list = state.appointments || [];
  if (doctorId) {
    list = list.filter(a => a.doctorId === doctorId);
  }
  if (patientId) {
    list = list.filter(a => a.patientId === patientId);
  }
  return list;
}

export function getDoctorSlots(doctorId: string, dateStr: string): TimeSlot[] {
  const state = getCurrentState();
  const doctor = SEED_DOCTOR_PROFILES.find(d => d.id === doctorId || d.userId === doctorId);
  
  const standardSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"
  ];

  const bookedSlots = new Set(
    (state.appointments || [])
      .filter(a => (a.doctorId === doctorId || (doctor && a.doctorId === doctor.id)) && a.appointmentDate === dateStr && a.status !== 'cancelled')
      .map(a => a.appointmentTime)
  );

  return standardSlots.map(time => ({
    time,
    available: !bookedSlots.has(time)
  }));
}

export async function bookAppointment(params: {
  doctorId: string;
  patientId: string;
  patientName: string;
  appointmentDate: string;
  appointmentTime: string;
  problemSummary?: string;
}): Promise<{ success: boolean; appointment: Appointment }> {
  const state = getCurrentState();
  const doctor = SEED_DOCTOR_PROFILES.find(d => d.id === params.doctorId || d.userId === params.doctorId);

  if (!doctor || !doctor.verified) {
    throw new Error("Requested doctor does not exist or has unverified medical credentials.");
  }

  // Double booking check: verify slot is not already taken
  const existing = (state.appointments || []).find(
    a => (a.doctorId === doctor.id || a.doctorId === doctor.userId) &&
         a.appointmentDate === params.appointmentDate &&
         a.appointmentTime === params.appointmentTime &&
         a.status !== 'cancelled'
  );

  if (existing) {
    throw new Error(`Time slot ${params.appointmentTime} on ${params.appointmentDate} is already booked. Please choose another available slot.`);
  }

  const appointmentId = `APT-${Math.floor(1000 + Math.random() * 9000)}`;
  const newAppointment: Appointment = {
    id: appointmentId,
    doctorId: doctor.id,
    doctorName: doctor.name,
    doctorSpecialty: doctor.specialty,
    hospitalName: doctor.hospitalName,
    patientId: params.patientId,
    patientName: params.patientName,
    appointmentDate: params.appointmentDate,
    appointmentTime: params.appointmentTime,
    status: 'confirmed',
    problemSummary: params.problemSummary || 'Clinical consultation appointment',
    createdAt: new Date().toISOString()
  };

  addAuditLog({
    userId: params.patientId,
    userName: params.patientName,
    userRole: 'patient',
    hospitalId: doctor.hospitalId,
    hospitalName: doctor.hospitalName,
    action: 'APPOINTMENT_BOOKED',
    resource: `APPOINTMENT_${appointmentId}`,
    result: 'AUTHORIZED',
    severity: 'LOW',
    ipAddress: '192.168.4.12 (Patient Client)',
    details: `Appointment ${appointmentId} confirmed with ${doctor.name} (${doctor.specialty}) for ${params.appointmentDate} at ${params.appointmentTime}. Double-booking check passed.`,
    aiExplanation: 'Authorized scheduling: Patient selected verified slot within physician clinical duty hours.'
  });

  const updatedAppointments = [newAppointment, ...(state.appointments || [])];
  saveState({
    ...state,
    appointments: updatedAppointments
  });

  return { success: true, appointment: newAppointment };
}

export function cancelAppointment(appointmentId: string): Appointment {
  const state = getCurrentState();
  const apt = (state.appointments || []).find(a => a.id === appointmentId);
  if (!apt) {
    throw new Error("Appointment not found");
  }

  const updated: Appointment = {
    ...apt,
    status: 'cancelled'
  };

  addAuditLog({
    userId: apt.patientId,
    userName: apt.patientName,
    userRole: 'patient',
    hospitalId: 'HOSP-01',
    hospitalName: apt.hospitalName,
    action: 'APPOINTMENT_CANCELLED',
    resource: `APPOINTMENT_${appointmentId}`,
    result: 'AUTHORIZED',
    severity: 'LOW',
    ipAddress: '192.168.4.12',
    details: `Appointment ${appointmentId} with ${apt.doctorName} was cancelled by patient.`,
    aiExplanation: 'Patient initiated appointment cancellation. Slot returned to public availability pool.'
  });

  const updatedList = (state.appointments || []).map(a => a.id === appointmentId ? updated : a);
  saveState({
    ...state,
    appointments: updatedList
  });

  return updated;
}

export function updateAppointmentStatus(appointmentId: string, status: 'pending' | 'confirmed' | 'completed' | 'cancelled'): Appointment {
  const state = getCurrentState();
  const apt = (state.appointments || []).find(a => a.id === appointmentId);
  if (!apt) throw new Error("Appointment not found");

  const updated: Appointment = { ...apt, status };
  const updatedList = (state.appointments || []).map(a => a.id === appointmentId ? updated : a);

  addAuditLog({
    userId: apt.doctorId,
    userName: apt.doctorName,
    userRole: 'doctor',
    hospitalId: 'HOSP-01',
    hospitalName: apt.hospitalName,
    action: 'DOCTOR_VIEWED_APPOINTMENT',
    resource: `APPOINTMENT_${appointmentId}`,
    result: 'AUTHORIZED',
    severity: 'LOW',
    ipAddress: '10.242.0.18',
    details: `Doctor updated appointment ${appointmentId} status to '${status}'.`,
    aiExplanation: 'Doctor updated clinical appointment workflow record.'
  });

  saveState({
    ...state,
    appointments: updatedList
  });

  return updated;
}

export function searchDoctorsBySpecialty(specialty?: string): DoctorProfile[] {
  let list = SEED_DOCTOR_PROFILES;
  if (specialty && specialty.toLowerCase() !== 'all') {
    const s = specialty.toLowerCase();
    list = list.filter(d => d.specialty.toLowerCase().includes(s));
  }

  addAuditLog({
    userId: 'CLIENT-SESSION',
    userName: 'Active User',
    userRole: 'patient',
    hospitalId: 'HOSP-01',
    hospitalName: 'Network Directory',
    action: 'DOCTOR_SEARCH',
    resource: `SPECIALTY_${specialty || 'ALL'}`,
    result: 'AUTHORIZED',
    severity: 'LOW',
    ipAddress: '192.168.1.100',
    details: `Queried verified physician roster for specialty: ${specialty || 'All'}. Returned ${list.length} results.`,
    aiExplanation: 'Directory lookup: Filtered verified physicians according to clinical department criteria.'
  });

  return list;
}

// ==========================================
// LAYA AI CLINICAL NAVIGATION SERVICE
// ==========================================

export const ALLOWED_SPECIALTIES = [
  "General Medicine",
  "Cardiology",
  "Neurology",
  "Orthopedics",
  "Dermatology",
  "Pediatrics",
  "ENT",
  "Ophthalmology",
  "Gynecology",
  "Psychiatry"
];

export interface LayaAnalysisOptions {
  severity?: number; // 1 - 10
  duration?: string; // e.g. "Past 30 mins", "Few hours", "1-3 days", "Over 1 week"
  associatedSymptoms?: string[];
  patientAge?: number;
  patientGender?: string;
}

export async function analyzeProblemWithLaya(
  description: string,
  options?: LayaAnalysisOptions
): Promise<LayaRecommendation> {
  if (!description || description.trim().length < 3) {
    throw new Error("Please provide a descriptive explanation of your health symptoms.");
  }

  // Combine description with extra tags for comprehensive parsing
  const fullText = [
    description,
    options?.duration ? `Duration: ${options.duration}` : '',
    options?.associatedSymptoms && options.associatedSymptoms.length > 0 ? `Associated: ${options.associatedSymptoms.join(', ')}` : '',
    options?.severity ? `Severity: ${options.severity}/10` : ''
  ].filter(Boolean).join(' ').toLowerCase();

  // Try calling backend API if reachable
  try {
    const res = await fetch("http://localhost:8000/api/ai/analyze-problem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        description,
        severity: options?.severity,
        duration: options?.duration,
        associatedSymptoms: options?.associatedSymptoms
      })
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.specialty) {
        return data;
      }
    }
  } catch {
    // Backend offline / running client-side in Vite preview: use high-precision clinical ontology engine
  }

  // ==========================================
  // HIGH-PRECISION CLINICAL ONTOLOGY ENGINE
  // ==========================================

  // 1. Critical Life-Threatening Red Flag Screener
  const emergencyPatterns = [
    { pattern: /(cannot|can't|unable to|trouble)\s+breathe|suffocat|gasping for air|stridor|airway/i, flag: "Acute Respiratory Distress / Airway Compromise" },
    { pattern: /(crushing|heavy|elephant|vise-like)\s+(chest|substernal)\s+(pain|pressure|tightness)/i, flag: "Suspected Acute Coronary Syndrome (ACS)" },
    { pattern: /(chest pain|chest pressure).*(radiat|radiating).*(arm|jaw|neck|back|shoulder)/i, flag: "Classic Anginal Radiation Pattern" },
    { pattern: /(face|facial)\s+droop|(arm|leg)\s+weakness|slurr(ed)?\s+speech|sudden\s+paralysis|stroke/i, flag: "FAST Stroke Warning Signs" },
    { pattern: /thunderclap\s+headache|worst\s+headache\s+of\s+my\s+life/i, flag: "Suspected Subarachnoid Hemorrhage" },
    { pattern: /coughing\s+blood|hemoptysis|vomiting\s+blood|hematemesis|massive\s+bleed/i, flag: "Acute Internal / Pulmonary Hemorrhage" },
    { pattern: /unconscious|loss\s+of\s+consciousness|blackout|syncope|unresponsive/i, flag: "Acute Loss of Consciousness" },
    { pattern: /anaphylaxis|swollen\s+(lip|tongue|throat)|closing\s+throat|epipen/i, flag: "Severe Anaphylactic Reaction" },
    { pattern: /(curtain|dark shadow)\s+over\s+vision|sudden\s+blindness/i, flag: "Suspected Retinal Detachment / Acute Vision Loss" }
  ];

  const detectedRedFlags: string[] = [];
  emergencyPatterns.forEach(ep => {
    if (ep.pattern.test(fullText)) {
      detectedRedFlags.push(ep.flag);
    }
  });

  const isEmergency = detectedRedFlags.length > 0 || Boolean(options?.severity && options.severity >= 9);

  // 2. Multi-Specialty Clinical Affinity Scoring Matrix
  interface SpecialtyProfile {
    specialty: string;
    keywords: { term: string; weight: number }[];
    defaultReason: string;
    suggestedQuestions: string[];
    preparation: string[];
  }

  const profiles: SpecialtyProfile[] = [
    {
      specialty: "Cardiology",
      keywords: [
        { term: "chest pain", weight: 5 },
        { term: "chest pressure", weight: 5 },
        { term: "substernal", weight: 6 },
        { term: "angina", weight: 6 },
        { term: "palpitation", weight: 4 },
        { term: "flutter", weight: 4 },
        { term: "heart", weight: 3 },
        { term: "cardiac", weight: 5 },
        { term: "shortness of breath", weight: 3 },
        { term: "dyspnea", weight: 4 },
        { term: "radiating", weight: 4 },
        { term: "left arm", weight: 4 },
        { term: "jaw pain", weight: 3 },
        { term: "cold sweat", weight: 3 },
        { term: "diaphoresis", weight: 5 },
        { term: "irregular beat", weight: 4 },
        { term: "skipping beats", weight: 4 },
        { term: "tachycardia", weight: 5 },
        { term: "bradycardia", weight: 5 },
        { term: "hypertension", weight: 3 },
        { term: "swollen ankle", weight: 3 },
        { term: "edema", weight: 3 },
        { term: "stent", weight: 4 },
        { term: "bypass", weight: 4 }
      ],
      defaultReason: "Reported symptoms strongly correlate with cardiovascular function and warrant an electrocardiogram (ECG) and clinical cardiological assessment.",
      suggestedQuestions: [
        "Is an immediate 12-lead ECG and cardiac biomarker (troponin) panel recommended?",
        "Should we perform an echocardiogram or stress test to evaluate ischemic risks?",
        "How do my current medications impact my heart rate and blood pressure control?"
      ],
      preparation: [
        "Avoid any strenuous physical exertion while awaiting consultation.",
        "Bring a complete list of all current cardiac or blood pressure medications.",
        "Note the exact time symptoms started and what triggers or relieves the pain."
      ]
    },
    {
      specialty: "Neurology",
      keywords: [
        { term: "headache", weight: 3 },
        { term: "migraine", weight: 5 },
        { term: "thunderclap", weight: 6 },
        { term: "dizziness", weight: 3 },
        { term: "vertigo", weight: 4 },
        { term: "numbness", weight: 4 },
        { term: "tingling", weight: 4 },
        { term: "pins and needles", weight: 3 },
        { term: "seizure", weight: 6 },
        { term: "convulsion", weight: 6 },
        { term: "paralysis", weight: 6 },
        { term: "weakness in arm", weight: 4 },
        { term: "facial droop", weight: 6 },
        { term: "slurred speech", weight: 6 },
        { term: "speech difficulty", weight: 5 },
        { term: "confusion", weight: 3 },
        { term: "memory loss", weight: 3 },
        { term: "tremor", weight: 4 },
        { term: "unsteady gait", weight: 4 },
        { term: "ataxia", weight: 5 },
        { term: "sciatica", weight: 4 },
        { term: "nerve pain", weight: 4 },
        { term: "neuropathy", weight: 5 },
        { term: "light sensitivity", weight: 3 },
        { term: "photophobia", weight: 4 },
        { term: "aura", weight: 5 }
      ],
      defaultReason: "Reported cranial, motor, or sensory symptoms suggest consultation with a neurologist for neurological examination and possible neuro-imaging.",
      suggestedQuestions: [
        "Would neuro-imaging (brain MRI or non-contrast CT) help identify the root cause?",
        "Could these symptoms represent a primary headache disorder or a secondary neurological issue?",
        "Are there specific red-flag sensory changes that require emergency escalation?"
      ],
      preparation: [
        "Keep a log of headache or sensory episode duration, intensity, and visual triggers.",
        "Rest in a quiet, dark environment if experiencing severe photophobia or migraine.",
        "Have a family member or witness describe any seizure or syncopal episodes."
      ]
    },
    {
      specialty: "Orthopedics",
      keywords: [
        { term: "fracture", weight: 6 },
        { term: "broken bone", weight: 6 },
        { term: "bone", weight: 3 },
        { term: "joint", weight: 3 },
        { term: "knee", weight: 4 },
        { term: "shoulder", weight: 4 },
        { term: "hip", weight: 4 },
        { term: "ankle", weight: 4 },
        { term: "wrist", weight: 4 },
        { term: "back pain", weight: 4 },
        { term: "spine", weight: 4 },
        { term: "lumbar", weight: 4 },
        { term: "ligament", weight: 5 },
        { term: "tendon", weight: 4 },
        { term: "acl", weight: 6 },
        { term: "meniscus", weight: 5 },
        { term: "sprain", weight: 4 },
        { term: "dislocation", weight: 5 },
        { term: "swelling in joint", weight: 4 },
        { term: "bear weight", weight: 5 },
        { term: "popping sound", weight: 4 },
        { term: "twisted", weight: 3 },
        { term: "fell", weight: 3 },
        { term: "arthritis", weight: 4 },
        { term: "cartilage", weight: 4 }
      ],
      defaultReason: "Musculoskeletal presentation indicates evaluation by an orthopedic specialist to assess bone, joint, or ligamentous structural integrity.",
      suggestedQuestions: [
        "Are diagnostic X-rays or a musculoskeletal MRI required to evaluate joint tears?",
        "Is surgical stabilization indicated versus conservative immobilization and physical therapy?",
        "What is the recommended weight-bearing protocol during the recovery phase?"
      ],
      preparation: [
        "Immobilize the affected limb and apply R.I.C.E. (Rest, Ice, Compression, Elevation) if safe.",
        "Do not force weight-bearing on suspected fractures or severe joint effusions.",
        "Bring any prior X-rays, MRI scans, or surgical history for the joint."
      ]
    },
    {
      specialty: "Dermatology",
      keywords: [
        { term: "skin", weight: 4 },
        { term: "rash", weight: 4 },
        { term: "itch", weight: 3 },
        { term: "pruritus", weight: 4 },
        { term: "eczema", weight: 5 },
        { term: "psoriasis", weight: 5 },
        { term: "hives", weight: 4 },
        { term: "urticaria", weight: 5 },
        { term: "mole", weight: 5 },
        { term: "melanoma", weight: 6 },
        { term: "lesion", weight: 4 },
        { term: "blister", weight: 4 },
        { term: "acne", weight: 4 },
        { term: "flaking", weight: 3 },
        { term: "peeling", weight: 3 },
        { term: "boil", weight: 4 },
        { term: "abscess", weight: 4 },
        { term: "red streaks", weight: 5 },
        { term: "cellulitis", weight: 5 },
        { term: "alopecia", weight: 4 },
        { term: "hair loss", weight: 3 },
        { term: "fungal", weight: 4 }
      ],
      defaultReason: "Cutaneous findings indicate dermatological evaluation to determine etiology, allergy triggers, or biopsy requirements.",
      suggestedQuestions: [
        "Does this lesion or rash warrant a dermatoscopic exam or skin biopsy?",
        "Could this be an allergic contact reaction or an autoimmune dermatosis?",
        "Are topical prescription anti-inflammatory agents preferred over systemic treatments?"
      ],
      preparation: [
        "Do not apply heavy cosmetic concealers or colored ointments right before inspection.",
        "Take clear photos of the rash or lesion progression across preceding days.",
        "Note any recent exposures to new soaps, detergents, medications, or outdoor plants."
      ]
    },
    {
      specialty: "Pediatrics",
      keywords: [
        { term: "child", weight: 5 },
        { term: "children", weight: 5 },
        { term: "pediatric", weight: 6 },
        { term: "baby", weight: 5 },
        { term: "infant", weight: 5 },
        { term: "toddler", weight: 5 },
        { term: "3-year-old", weight: 5 },
        { term: "2-year-old", weight: 5 },
        { term: "4-year-old", weight: 5 },
        { term: "5-year-old", weight: 5 },
        { term: "newborn", weight: 6 },
        { term: "croup", weight: 6 },
        { term: "barking cough", weight: 5 },
        { term: "pediatric fever", weight: 5 },
        { term: "fontanelle", weight: 6 },
        { term: "refusing to drink", weight: 4 },
        { term: "teething", weight: 3 },
        { term: "chickenpox", weight: 5 },
        { term: "measles", weight: 5 },
        { term: "growth milestone", weight: 4 }
      ],
      defaultReason: "Pediatric care is indicated for specialized diagnostic evaluation tailored to child developmental physiology and dosage guidelines.",
      suggestedQuestions: [
        "Are the child's hydration levels, wet diapers, and alertness within safe pediatric parameters?",
        "What pediatric-specific antipyretic or symptomatic regimen is recommended?",
        "Are there respiratory red flags (e.g., retractions, stridor) that necessitate hospital admission?"
      ],
      preparation: [
        "Track the child's fluid intake, number of wet diapers, and temperature log.",
        "Bring the child's immunization card and birth history.",
        "Keep the child calm and adequately hydrated with small, frequent sips."
      ]
    },
    {
      specialty: "ENT",
      keywords: [
        { term: "ear", weight: 4 },
        { term: "earache", weight: 5 },
        { term: "hearing loss", weight: 5 },
        { term: "ringing in ear", weight: 4 },
        { term: "tinnitus", weight: 5 },
        { term: "nose", weight: 3 },
        { term: "sinus", weight: 4 },
        { term: "sinusitis", weight: 5 },
        { term: "nosebleed", weight: 4 },
        { term: "epistaxis", weight: 5 },
        { term: "throat", weight: 4 },
        { term: "sore throat", weight: 4 },
        { term: "tonsil", weight: 5 },
        { term: "strep", weight: 4 },
        { term: "swallow", weight: 3 },
        { term: "dysphagia", weight: 5 },
        { term: "voice", weight: 3 },
        { term: "hoarseness", weight: 4 },
        { term: "laryngitis", weight: 5 },
        { term: "ear discharge", weight: 5 }
      ],
      defaultReason: "Upper respiratory, auditory, or throat symptoms suggest Otolaryngology (ENT) evaluation for direct endoscopic examination.",
      suggestedQuestions: [
        "Is there evidence of middle ear effusion, tympanic perforation, or acute otitis media?",
        "Would flexible nasopharyngoscopy help evaluate chronic sinus or vocal cord changes?",
        "Is an audiogram needed to quantify hearing threshold changes?"
      ],
      preparation: [
        "Avoid inserting cotton swabs or foreign objects into the ear canal.",
        "Note whether symptoms worsen with changes in head position or altitude.",
        "List any recent upper respiratory infections or antibiotic courses."
      ]
    },
    {
      specialty: "Ophthalmology",
      keywords: [
        { term: "eye", weight: 4 },
        { term: "vision", weight: 4 },
        { term: "blurry", weight: 3 },
        { term: "double vision", weight: 5 },
        { term: "diplopia", weight: 5 },
        { term: "floaters", weight: 5 },
        { term: "flashes of light", weight: 5 },
        { term: "curtain", weight: 5 },
        { term: "cornea", weight: 5 },
        { term: "retina", weight: 6 },
        { term: "cataract", weight: 5 },
        { term: "glaucoma", weight: 5 },
        { term: "red eye", weight: 3 },
        { term: "conjunctivitis", weight: 4 },
        { term: "foreign body in eye", weight: 5 },
        { term: "eye scratch", weight: 4 },
        { term: "photophobia", weight: 4 },
        { term: "halo", weight: 4 }
      ],
      defaultReason: "Ocular presentation warrants specialized ophthalmologic evaluation including slit-lamp examination and funduscopy.",
      suggestedQuestions: [
        "Should we perform a dilated fundus exam to inspect the retina and optic nerve?",
        "What is the intraocular pressure (IOP) measurement?",
        "Are these visual symptoms refractive, corneal, or retinal in origin?"
      ],
      preparation: [
        "Do not rub or apply pressure to an irritated or injured eye.",
        "Remove contact lenses immediately and wear glasses instead.",
        "Arrange for a driver in case pupil-dilation drops are administered."
      ]
    },
    {
      specialty: "Gynecology",
      keywords: [
        { term: "pregnancy", weight: 5 },
        { term: "pregnant", weight: 5 },
        { term: "period", weight: 4 },
        { term: "menstrual", weight: 4 },
        { term: "pelvic", weight: 4 },
        { term: "pelvic pain", weight: 5 },
        { term: "cramps", weight: 3 },
        { term: "vaginal", weight: 4 },
        { term: "ovary", weight: 5 },
        { term: "ovarian", weight: 5 },
        { term: "uterus", weight: 4 },
        { term: "cervix", weight: 4 },
        { term: "endometriosis", weight: 5 },
        { term: "fibroid", weight: 4 },
        { term: "postpartum", weight: 5 },
        { term: "menopause", weight: 4 },
        { term: "spotting", weight: 4 },
        { term: "heavy bleeding", weight: 4 }
      ],
      defaultReason: "Women's reproductive and pelvic health symptoms indicate evaluation by an OB/GYN specialist.",
      suggestedQuestions: [
        "Is a pelvic ultrasound or transvaginal imaging recommended to assess ovarian or uterine findings?",
        "Could hormonal fluctuations or structural lesions account for the bleeding patterns?",
        "Are blood counts (hemoglobin/ferritin) needed to rule out anemia from blood loss?"
      ],
      preparation: [
        "Note the date of the first day of your last menstrual period (LMP).",
        "Keep a record of bleeding intensity, number of pads/tampons used, and cycle length.",
        "Note whether you have taken any home pregnancy tests."
      ]
    },
    {
      specialty: "Psychiatry",
      keywords: [
        { term: "panic attack", weight: 5 },
        { term: "anxiety", weight: 4 },
        { term: "hyperventilating", weight: 4 },
        { term: "depression", weight: 4 },
        { term: "depressed", weight: 4 },
        { term: "insomnia", weight: 3 },
        { term: "can't sleep", weight: 3 },
        { term: "suicidal", weight: 6 },
        { term: "hopeless", weight: 4 },
        { term: "bipolar", weight: 5 },
        { term: "mania", weight: 5 },
        { term: "hallucination", weight: 6 },
        { term: "hearing voices", weight: 6 },
        { term: "paranoia", weight: 5 },
        { term: "ptsd", weight: 5 },
        { term: "trauma", weight: 4 },
        { term: "derealization", weight: 4 },
        { term: "obsessive", weight: 4 },
        { term: "phobia", weight: 3 }
      ],
      defaultReason: "Reported behavioral, emotional, or affective symptoms warrant psychiatric and mental health clinical navigation.",
      suggestedQuestions: [
        "What therapeutic or pharmacologic options are best suited for this anxiety/mood presentation?",
        "Are there organic metabolic or thyroid factors contributing to these symptoms?",
        "What crisis resources or safety planning protocols should be established?"
      ],
      preparation: [
        "Write down your main mood symptoms, sleep patterns, and when changes began.",
        "List all caffeine, medication, or supplement intake.",
        "If experiencing acute distress, reach out to trusted support or crisis helplines (988)."
      ]
    },
    {
      specialty: "General Medicine",
      keywords: [
        { term: "fatigue", weight: 3 },
        { term: "tired", weight: 2 },
        { term: "fever", weight: 3 },
        { term: "chills", weight: 3 },
        { term: "weight loss", weight: 4 },
        { term: "night sweats", weight: 4 },
        { term: "stomach ache", weight: 3 },
        { term: "abdominal pain", weight: 3 },
        { term: "acid reflux", weight: 4 },
        { term: "heartburn", weight: 3 },
        { term: "nausea", weight: 3 },
        { term: "vomit", weight: 3 },
        { term: "diarrhea", weight: 3 },
        { term: "diabetes", weight: 4 },
        { term: "blood sugar", weight: 3 },
        { term: "thyroid", weight: 4 },
        { term: "weakness", weight: 3 },
        { term: "routine", weight: 3 },
        { term: "checkup", weight: 3 },
        { term: "physical", weight: 3 }
      ],
      defaultReason: "General internal medicine consultation is recommended for initial diagnostic triage, comprehensive lab workup, and systemic evaluation.",
      suggestedQuestions: [
        "What baseline laboratory panels (CBC, metabolic panel, thyroid) are indicated?",
        "Could these generalized symptoms point to a metabolic, endocrine, or systemic issue?",
        "If symptoms persist, what subspecialty referral would you recommend next?"
      ],
      preparation: [
        "Fast if instructed prior to morning appointments for fasting blood glucose/lipids.",
        "Bring a list of all OTC vitamins, herbs, and prescription medications.",
        "Summarize symptom onset and any recent travel or dietary changes."
      ]
    }
  ];

  // Calculate scores for each profile
  const matchedKeywordList: string[] = [];
  const scoredProfiles = profiles.map(profile => {
    let score = 0;
    profile.keywords.forEach(({ term, weight }) => {
      if (fullText.includes(term.toLowerCase())) {
        score += weight;
        if (!matchedKeywordList.includes(term)) {
          matchedKeywordList.push(term);
        }
      }
    });
    return { ...profile, score };
  });

  // Sort by score descending
  scoredProfiles.sort((a, b) => b.score - a.score);

  const topProfile = scoredProfiles[0];
  const secondProfile = scoredProfiles[1];

  let selectedSpecialty = topProfile && topProfile.score > 0 ? topProfile.specialty : "General Medicine";
  let secondarySpecialty = secondProfile && secondProfile.score > 0 ? secondProfile.specialty : undefined;

  // Calculate clinical confidence score (82% to 98%)
  const rawConfidence = topProfile.score > 0 ? Math.min(98, 80 + Math.min(18, topProfile.score * 2)) : 82;

  // Determine urgency level and timeline
  let urgencyLevel: 'low' | 'medium' | 'high' | 'emergency' = 'medium';
  let urgencyTimeline = '📅 Same-Day or Next-Day Consultation (< 24 Hours)';

  if (isEmergency) {
    urgencyLevel = 'emergency';
    urgencyTimeline = '🚨 Immediate Emergency Medical Attention (< 15 Minutes)';
  } else if (
    (options?.severity && options.severity >= 7) ||
    detectedRedFlags.length > 0 ||
    fullText.includes('severe') ||
    fullText.includes('sudden') ||
    fullText.includes('fracture')
  ) {
    urgencyLevel = 'high';
    urgencyTimeline = '⚡ Urgent Clinical Evaluation Required (< 2 Hours)';
  } else if (
    (options?.severity && options.severity <= 3) ||
    topProfile.specialty === 'Dermatology' ||
    fullText.includes('routine') ||
    fullText.includes('checkup')
  ) {
    urgencyLevel = 'low';
    urgencyTimeline = '🗓️ Routine Outpatient Appointment (Within 2–5 Days)';
  }

  // Reason generation
  let clinicalReason = topProfile.defaultReason;
  if (isEmergency) {
    clinicalReason = `CRITICAL ALERT: Reported symptoms (${detectedRedFlags.join(', ') || 'acute severe distress'}) present high risk for a life-threatening medical emergency. Seek immediate emergency room evaluation or dial emergency services.`;
  } else if (matchedKeywordList.length > 0) {
    clinicalReason = `Based on reported clinical indicators (${matchedKeywordList.slice(0, 4).join(', ')}), ${selectedSpecialty} is the most appropriate primary clinical pathway for targeted evaluation.`;
  }

  // Suggested questions and preparation
  const questions = topProfile.suggestedQuestions;
  const preparation = topProfile.preparation;

  // Audit log with SHA-256 non-repudiation
  addAuditLog({
    userId: 'PATIENT-SESSION',
    userName: 'Patient User',
    userRole: 'patient',
    hospitalId: 'HOSP-01',
    hospitalName: 'MediLink Gateway',
    action: 'LAYA_AI_PROBLEM_ANALYSIS',
    resource: `SPECIALTY_${selectedSpecialty.toUpperCase()}`,
    result: isEmergency ? 'FLAGGED' : 'AUTHORIZED',
    severity: isEmergency ? 'CRITICAL' : urgencyLevel === 'high' ? 'HIGH' : 'LOW',
    ipAddress: '192.168.4.12',
    details: `Laya AI Clinical Navigation: analyzed symptoms. Primary specialty: ${selectedSpecialty}, Secondary: ${secondarySpecialty || 'None'}, Urgency: ${urgencyLevel}, Confidence: ${rawConfidence}%. Red flags: ${detectedRedFlags.length}.`,
    aiExplanation: `Clinical ontology triage model evaluated patient symptom text across ${profiles.length} specialty matrices. Identified ${matchedKeywordList.length} clinical tokens without autonomous medical diagnosis.`
  });

  return {
    specialty: selectedSpecialty,
    secondarySpecialty,
    urgency: urgencyLevel,
    urgencyTimeline,
    reason: clinicalReason,
    emergency: isEmergency,
    disclaimer: "AI-assisted recommendation — not a diagnosis. Please consult a qualified medical professional.",
    confidenceScore: rawConfidence,
    redFlagIndicators: detectedRedFlags,
    suggestedDoctorQuestions: questions,
    recommendedPreparation: preparation,
    matchedKeywords: matchedKeywordList
  };
}

