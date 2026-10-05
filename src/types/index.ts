export type UserRole = 'admin' | 'doctor' | 'patient';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  hospitalId: string;
  hospitalName: string;
  department?: string;
  specialty?: string;
  licenseNumber?: string;
  verified: boolean;
  avatarUrl?: string;
  email: string;
}

export interface Hospital {
  id: string;
  name: string;
  code: string;
  region: string;
  secureEndpoint: string;
  status: 'active' | 'maintenance' | 'offline';
  encryptionStandard: string;
}

export interface DoctorProfile {
  id: string;
  userId: string;
  name: string;
  hospitalId: string;
  hospitalName: string;
  department: string;
  specialty: string;
  dutyStatus: 'on_duty' | 'on_call' | 'off_duty';
  availableFrom: string;
  availableUntil: string;
  verified: boolean;
  syntheticRating: number;
  avatarUrl?: string;
  workingDays?: string[];
  slotDurationMinutes?: number;
  nextAvailableSlot?: string;
}

export interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  hospitalName: string;
  patientId: string;
  patientName: string;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // HH:MM
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  problemSummary?: string;
  createdAt: string;
}

export interface LayaRecommendation {
  specialty: string;
  secondarySpecialty?: string;
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  urgencyTimeline?: string;
  reason: string;
  emergency: boolean;
  disclaimer: string;
  confidenceScore?: number;
  redFlagIndicators?: string[];
  suggestedDoctorQuestions?: string[];
  recommendedPreparation?: string[];
  matchedKeywords?: string[];
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface Vitals {
  bloodPressure: string;
  heartRate: number;
  oxygenSaturation: number;
  temperature: string;
  respiratoryRate: number;
}

export interface SyntheticPatientRecord {
  id: string;
  fullName: string;
  age: number;
  gender: 'Female' | 'Male' | 'Other';
  bloodGroup: string;
  allergies: string[];
  currentMedications: string[];
  conditionSummary: string;
  primaryDiagnosis: string;
  vitals: Vitals;
  labNotes: string;
  transferPriority: 'routine' | 'urgent' | 'emergency';
  createdAt: string;
  sourceHospitalId: string;
}

export interface EncryptedPayload {
  ciphertext: string;
  iv: string;
  algorithm: string;
  keyFingerprint: string;
  encryptedAt: string;
}

export interface PatientTransfer {
  id: string;
  patientId: string;
  patientName: string;
  sendingHospitalId: string;
  sendingHospitalName: string;
  receivingHospitalId: string;
  receivingHospitalName: string;
  receivingDoctorId: string;
  receivingDoctorName: string;
  transferPriority: 'routine' | 'urgent' | 'emergency';
  status: 'awaiting_approval' | 'approved' | 'rejected' | 'in_transit' | 'completed' | 'tamper_flagged';
  encryptedPayload: EncryptedPayload;
  integrityHash: string; // SHA-256 hash of plaintext record
  integrityStatus: 'verified' | 'tampered' | 'unverified';
  tamperSimulationActive?: boolean;
  tamperedRecordPayload?: SyntheticPatientRecord;
  tamperedHash?: string;
  decryptedRecord?: SyntheticPatientRecord;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approvedByDoctorId?: string;
  approvalTimestamp?: string;
  rejectionReason?: string;
  createdAt: string;
  lastUpdated: string;
  history: {
    stage: string;
    timestamp: string;
    actor: string;
    role: string;
    note: string;
  }[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  hospitalId: string;
  hospitalName: string;
  action: string;
  resource: string;
  result: 'AUTHORIZED' | 'DENIED' | 'FLAGGED' | 'COMPLETED' | 'TAMPER_DETECTED';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  ipAddress: string;
  details: string;
  aiExplanation?: string;
}

export interface SecurityEvent {
  id: string;
  timestamp: string;
  type: 'UNAUTHORIZED_ACCESS' | 'INTEGRITY_FAILURE' | 'FAKE_DOCTOR_ATTEMPT' | 'POLICY_VIOLATION';
  title: string;
  description: string;
  severity: 'MEDIUM' | 'HIGH' | 'CRITICAL';
  resolved: boolean;
  sourceIp: string;
  associatedTransferId?: string;
}

export interface PatientProblemSubmission {
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
  submittedAt: string;
}
