import React from 'react';
import { ShieldCheck, Lock, Fingerprint, History, UserCheck, AlertTriangle } from 'lucide-react';

export const SystemStatusBar: React.FC = () => {
  return (
    <div className="w-full bg-slate-900 border-b border-slate-800 text-slate-300 text-xs">
      {/* Hackathon Context & Synthetic Data Banner */}
      <div className="bg-slate-950/80 px-4 py-1.5 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 font-semibold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            ASTRA 2026 — Cyber in Healthcare
          </span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-300">Track: <strong className="text-white font-medium">Data, Privacy + Trust</strong></span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-400">Challenge: <span className="font-mono text-slate-300">TBD — Confirm with organizers</span></span>
        </div>
        <div className="flex items-center gap-1.5 text-amber-300 font-medium">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>DEMO ENVIRONMENT — SYNTHETIC DATA ONLY</span>
        </div>
      </div>

      {/* Security Architecture Status Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium tracking-wide">SYSTEM STATUS:</span>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Secure & Operational
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Lock className="w-3.5 h-3.5 text-sky-400" />
            <span>Encryption: <strong className="text-white font-medium">AES-256-GCM Active</strong></span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-300">
            <Fingerprint className="w-3.5 h-3.5 text-emerald-400" />
            <span>Integrity: <strong className="text-white font-medium">SHA-256 Active</strong></span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Identity: <strong className="text-white font-medium">Verified PKI / RBAC</strong></span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-300">
            <History className="w-3.5 h-3.5 text-amber-400" />
            <span>Audit Trail: <strong className="text-white font-medium">Immutable Chain</strong></span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-300">
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Human Approval: <strong className="text-white font-medium">Doctor Required</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
