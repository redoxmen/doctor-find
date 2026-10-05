import React from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Fingerprint, 
  UserCheck, 
  History, 
  ArrowRight, 
  AlertTriangle,
  FileCheck2,
  PhoneOff,
  Activity,
  Layers
} from 'lucide-react';

interface LandingViewProps {
  onEnterPortal: () => void;
  onLaunchDemo: () => void;
  onViewArchitecture: () => void;
  onOpenPatientPortal?: () => void;
  onOpenLogin?: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onEnterPortal,
  onLaunchDemo,
  onViewArchitecture,
  onOpenPatientPortal,
  onOpenLogin
}) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 text-white pt-12 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 z-0 opacity-20">
          <img 
            src="/src/assets/images/hero_medilink_secure_1791180042437.jpg" 
            alt="Hospital Cyber Operations Center"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950/80 border border-sky-800 text-sky-300 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            ASTRA 2026 Hackathon Prototype · Track: Data, Privacy + Trust
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white max-w-4xl mx-auto" style={{ textWrap: 'balance' }}>
            Doctor Find
          </h1>

          <p className="text-xl sm:text-2xl text-sky-100 font-light max-w-3xl mx-auto" style={{ textWrap: 'balance' }}>
            Secure Patient Transfer. Verified Identity. Trusted Healthcare.
          </p>

          <p className="text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            A secure digital platform for transferring patient information between hospitals with end-to-end encryption, 
            tamper detection, role-based access control, complete audit trails, and mandatory human doctor approval.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            {onOpenPatientPortal && (
              <button
                onClick={onOpenPatientPortal}
                className="px-5 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all shadow-lg hover:shadow-emerald-600/30 flex items-center gap-2"
              >
                <span>Describe Problem (Patient Portal)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onEnterPortal}
              className="px-5 py-3 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm transition-all shadow-lg hover:shadow-sky-600/30 flex items-center gap-2"
            >
              <span>Enter Doctor & Hospital Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onLaunchDemo}
              className="px-5 py-3 rounded-lg bg-red-600/90 hover:bg-red-500 text-white font-semibold text-sm transition-all shadow-lg hover:shadow-red-600/30 flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span>Launch Security Demo</span>
            </button>

            {onOpenLogin && (
              <button
                onClick={onOpenLogin}
                className="px-4 py-3 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-medium text-sm transition-all"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Quick Metrics Bar */}
          <div className="pt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto border-t border-slate-800/80 text-left">
            <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-700/50">
              <div className="text-xs text-slate-400 font-medium">Confidentiality</div>
              <div className="text-sm font-semibold text-white mt-1">AES-256-GCM</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Authenticated Cipher</div>
            </div>
            <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-700/50">
              <div className="text-xs text-slate-400 font-medium">Integrity</div>
              <div className="text-sm font-semibold text-emerald-400 mt-1">SHA-256 Digest</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Bit-Level Tamper Check</div>
            </div>
            <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-700/50">
              <div className="text-xs text-slate-400 font-medium">Identity & Access</div>
              <div className="text-sm font-semibold text-indigo-300 mt-1">Strict RBAC</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Doctor, Patient, Admin</div>
            </div>
            <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-700/50">
              <div className="text-xs text-slate-400 font-medium">Governance</div>
              <div className="text-sm font-semibold text-amber-300 mt-1">Human-In-The-Loop</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Zero Silent Decryption</div>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem: Informal Healthcare Communication Risks */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-red-600 uppercase tracking-widest">The Cybersecurity Vulnerability</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            Why Informal Hospital Transfers Fail
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Hospitals routinely transfer emergency patients and confidential charts via phone calls, WhatsApp, and unencrypted emails.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          {/* Status Quo */}
          <div className="p-6 rounded-xl border border-red-200 bg-red-50/40 space-y-4">
            <div className="flex items-center gap-2 text-red-700 font-semibold">
              <PhoneOff className="w-5 h-5 text-red-600" />
              <h3>Informal Channels (Phone, WhatsApp, Email)</h3>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold mt-0.5">✕</span>
                <span><strong>Unencrypted Transmission:</strong> Plaintext records intercepted or cached across commercial messaging servers.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold mt-0.5">✕</span>
                <span><strong>Silent Tampering:</strong> A modified blood group or altered dosage goes undetected with zero mathematical verification.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold mt-0.5">✕</span>
                <span><strong>Fake Doctor Impersonation:</strong> Rogue actors phone hospitals claiming to be attending physicians to obtain patient records.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold mt-0.5">✕</span>
                <span><strong>No Audit Trail:</strong> No immutable forensic logging of who sent, viewed, or forwarded sensitive files.</span>
              </li>
            </ul>
          </div>

          {/* Doctor Find Approach */}
          <div className="p-6 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-4">
            <div className="flex items-center gap-2 text-emerald-800 font-semibold">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h3>Doctor Find Solution</h3>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                <span><strong>AES-256-GCM Encryption:</strong> Sensitive clinical summaries and vitals remain encrypted in storage and transit.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                <span><strong>SHA-256 Integrity Verification:</strong> Instant tamper alerts if even 1 byte is modified before receiving physician review.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                <span><strong>Verified Doctor Identity (PKI/RBAC):</strong> Unverified callers and unauthorized roles receive hard 403 blocks.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                <span><strong>Human-in-the-Loop Approval:</strong> Records only unlock after the receiving doctor explicitly reviews and authorizes transfer.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* The 5 Pillars of Doctor Find */}
      <section className="bg-white border-y border-slate-200 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-sky-700 uppercase tracking-widest">Architectural Principles</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              Confidentiality · Integrity · Identity · Accountability · Human Control
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all space-y-2">
              <div className="w-8 h-8 rounded bg-sky-100 flex items-center justify-center text-sky-700">
                <Lock className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-slate-900 text-sm">1. End-to-End Encryption</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Uses authenticated AES-256-GCM symmetric encryption with randomized 96-bit initialization vectors (IV). 
                Plaintext never touches unsecured networks.
              </p>
            </div>

            <div className="p-5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all space-y-2">
              <div className="w-8 h-8 rounded bg-emerald-100 flex items-center justify-center text-emerald-700">
                <Fingerprint className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-slate-900 text-sm">2. Record Integrity & Tamper Check</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Generates a SHA-256 cryptographic digest from the canonicalized record. The receiving hospital checks the digest 
                before admission; any bit mismatch triggers a tampering alert.
              </p>
            </div>

            <div className="p-5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all space-y-2">
              <div className="w-8 h-8 rounded bg-indigo-100 flex items-center justify-center text-indigo-700">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-slate-900 text-sm">3. Role-Based Access Control (RBAC)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Doctors only access assigned incoming transfers. Patients view only their own records. Admins monitor system posture without clinical snooping.
              </p>
            </div>

            <div className="p-5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all space-y-2">
              <div className="w-8 h-8 rounded bg-amber-100 flex items-center justify-center text-amber-700">
                <UserCheck className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-slate-900 text-sm">4. Human-in-the-Loop Control</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                No autonomous transfers. The assigned receiving physician must explicitly review the transfer request and click Approve 
                before the record is decrypted.
              </p>
            </div>

            <div className="p-5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all space-y-2">
              <div className="w-8 h-8 rounded bg-slate-200 flex items-center justify-center text-slate-700">
                <History className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-slate-900 text-sm">5. Complete Audit Trail</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every action—creation, transfer dispatch, doctor review, approval, rejection, and unauthorized attempt—is permanently recorded with timestamps, user IDs, and IPs.
              </p>
            </div>

            <div className="p-5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all space-y-2">
              <div className="w-8 h-8 rounded bg-teal-100 flex items-center justify-center text-teal-700">
                <Activity className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-slate-900 text-sm">6. Doctor Availability Directory</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Real-time on-duty status, verified specialty badges, and smart matching to ensure acute transfers are directed only to active, qualified physicians.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Demonstration Callout */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="p-8 rounded-xl bg-slate-900 text-white shadow-xl space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400">
            <AlertTriangle className="w-4 h-4" />
            <span>Ready for Hackathon Judges</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold">
            Simulate 3 Real-World Healthcare Attacks Safely
          </h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto">
            Test Fake Doctor Impersonation, In-Transit Record Tampering (altering Blood Group), and Cross-Patient RBAC Violations with 
            live cryptographic proof and audit generation.
          </p>
          <div className="pt-2">
            <button
              onClick={onLaunchDemo}
              className="px-6 py-3 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-sm transition-all shadow-md inline-flex items-center gap-2"
            >
              <span>Open Security Demonstration Suite</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
