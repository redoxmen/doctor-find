import React from 'react';
import { 
  Lock, 
  Fingerprint, 
  ShieldCheck, 
  UserCheck, 
  History, 
  ArrowRight, 
  Server, 
  Database, 
  Building2, 
  ShieldAlert, 
  Cpu, 
  KeyRound,
  FileCheck2
} from 'lucide-react';

export const SecurityArchitectureView: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Security Architecture</h1>
        <p className="text-xs text-slate-500 mt-1 max-w-3xl">
          Zero-trust pipeline replacing phone, chat apps, and unencrypted email for transfers.
        </p>
      </div>

      {/* Visual End-to-End Workflow Diagram */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-sky-700" />
          End-to-End Secure Transfer Pipeline
        </h2>

        {/* Step-by-step visual chain */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative text-xs">
          {/* Step 1: Hospital A Initiation */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 relative">
            <div className="flex items-center justify-between text-slate-500">
              <span className="font-mono text-[10px] text-sky-700 font-bold">NODE 01</span>
              <Building2 className="w-4 h-4 text-slate-600" />
            </div>
            <div className="font-bold text-slate-900 text-sm">Hospital A (Origin)</div>
            <p className="text-[11px] text-slate-600">
              Attending physician inputs synthetic patient transfer parameters (diagnosis, vitals, meds).
            </p>
            <div className="pt-2 text-[10px] text-slate-400 font-mono">
              mTLS Authentication · RBAC Role Enforced
            </div>
          </div>

          {/* Step 2: Canonicalization & AES-256-GCM */}
          <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 space-y-2 relative">
            <div className="flex items-center justify-between text-sky-700">
              <span className="font-mono text-[10px] font-bold">CIPHER ENGINE</span>
              <Lock className="w-4 h-4" />
            </div>
            <div className="font-bold text-sky-950 text-sm">AES-256-GCM Encryption</div>
            <p className="text-[11px] text-slate-700">
              Record serialized canonically. Encrypted using 256-bit symmetric key with 96-bit random IV.
            </p>
            <div className="pt-2 text-[10px] text-sky-700 font-mono">
              Confidentiality Guaranteed
            </div>
          </div>

          {/* Step 3: SHA-256 Integrity Digest */}
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2 relative">
            <div className="flex items-center justify-between text-emerald-700">
              <span className="font-mono text-[10px] font-bold">DIGEST GATE</span>
              <Fingerprint className="w-4 h-4" />
            </div>
            <div className="font-bold text-emerald-950 text-sm">SHA-256 Integrity Hash</div>
            <p className="text-[11px] text-slate-700">
              Cryptographic digest computed and bound to transfer manifest. Re-verified upon delivery.
            </p>
            <div className="pt-2 text-[10px] text-emerald-700 font-mono">
              Tamper Detection Active
            </div>
          </div>

          {/* Step 4: Hospital B & Identity Check */}
          <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 space-y-2 relative">
            <div className="flex items-center justify-between text-indigo-700">
              <span className="font-mono text-[10px] font-bold">NODE 02</span>
              <Building2 className="w-4 h-4" />
            </div>
            <div className="font-bold text-indigo-950 text-sm">Hospital B (Destination)</div>
            <p className="text-[11px] text-slate-700">
              Target physician identified. PKI credentials validated against medical licensing registry.
            </p>
            <div className="pt-2 text-[10px] text-indigo-700 font-mono">
              Zero Unverified Access
            </div>
          </div>

          {/* Step 5: Human Doctor Approval */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2 relative">
            <div className="flex items-center justify-between text-amber-700">
              <span className="font-mono text-[10px] font-bold">HUMAN CONTROL</span>
              <UserCheck className="w-4 h-4" />
            </div>
            <div className="font-bold text-amber-950 text-sm">Doctor Explicit Approval</div>
            <p className="text-[11px] text-slate-700">
              Physician reviews transfer envelope. Only upon explicit human click is the record decrypted.
            </p>
            <div className="pt-2 text-[10px] text-amber-700 font-mono">
              Zero Autonomous Decryption
            </div>
          </div>
        </div>

        {/* Append-Only Audit Logging Foundation */}
        <div className="p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <History className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold text-white">Immutable Non-Repudiation Audit Layer</span>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Every transaction, encryption step, signature verification, approval, rejection, and unauthorized attempt is written to an immutable append-only trail.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-mono text-[10px] border border-slate-700 shrink-0">
            Forensic Grade
          </span>
        </div>
      </div>

      {/* Threat Modeling & Countermeasures Matrix */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-red-600" />
          Threat Model & Doctor Find Countermeasures
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Threat Vector</th>
                <th className="px-4 py-3">Informal Channel Vulnerability</th>
                <th className="px-4 py-3">Doctor Find Defense</th>
                <th className="px-4 py-3">Security Metric</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              <tr>
                <td className="px-4 py-3 font-semibold text-slate-900">Eavesdropping / Packet Interception</td>
                <td className="px-4 py-3 text-slate-600">WhatsApp/Email attachments stored on third-party commercial servers</td>
                <td className="px-4 py-3 text-emerald-800 font-medium">AES-256-GCM authenticated symmetric encryption + mTLS 1.3</td>
                <td className="px-4 py-3 font-mono text-slate-500">256-bit Key Security</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-slate-900">In-Flight Data Tampering</td>
                <td className="px-4 py-3 text-slate-600">Altering blood type or dosage goes unnoticed with zero verification</td>
                <td className="px-4 py-3 text-emerald-800 font-medium">Canonical SHA-256 digest comparison halts transfer on bit alteration</td>
                <td className="px-4 py-3 font-mono text-slate-500">100% Bit-flip Detection</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-slate-900">Rogue / Fake Doctor Impersonation</td>
                <td className="px-4 py-3 text-slate-600">Unverified telephone caller requests records with zero credential audit</td>
                <td className="px-4 py-3 text-emerald-800 font-medium">Strict PKI identity directory + RBAC policy gate (403 Access Denied)</td>
                <td className="px-4 py-3 font-mono text-slate-500">Zero Unverified Release</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-slate-900">Over-Privileged Snooping (Insider Threat)</td>
                <td className="px-4 py-3 text-slate-600">Staff members freely browse hospital-wide patient databases</td>
                <td className="px-4 py-3 text-emerald-800 font-medium">Least Privilege: Doctors only see assigned cases; Patients see own file only</td>
                <td className="px-4 py-3 font-mono text-slate-500">RBAC Strict Separation</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-slate-900">Unaccountable Medical Access</td>
                <td className="px-4 py-3 text-slate-600">No logs of who viewed or forwarded downloaded chart PDFs</td>
                <td className="px-4 py-3 text-emerald-800 font-medium">Complete forensic audit logging with IP, timestamp, user, and action code</td>
                <td className="px-4 py-3 font-mono text-slate-500">Immutable Audit Trail</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
