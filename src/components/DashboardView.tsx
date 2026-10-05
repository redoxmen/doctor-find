import React from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Plus, 
  ArrowRight,
  Shield
} from 'lucide-react';
import { PatientTransfer, DoctorProfile, AuditLog, SecurityEvent, User } from '../types';

interface DashboardViewProps {
  currentUser: User;
  transfers: PatientTransfer[];
  doctorProfiles: DoctorProfile[];
  auditLogs: AuditLog[];
  securityEvents: SecurityEvent[];
  onOpenNewTransfer: () => void;
  onNavigateToTab: (tab: string) => void;
  onSelectTransferForReview: (transferId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  transfers,
  doctorProfiles,
  auditLogs,
  securityEvents,
  onOpenNewTransfer,
  onNavigateToTab,
  onSelectTransferForReview
}) => {
  const activeTransfersCount = transfers.filter(t => t.status === 'awaiting_approval' || t.status === 'in_transit').length;
  const pendingApprovalsCount = transfers.filter(t => t.status === 'awaiting_approval').length;
  const verifiedDoctorsCount = doctorProfiles.filter(d => d.verified && (d.dutyStatus === 'on_duty' || d.dutyStatus === 'on_call')).length;
  const securityThreatsBlocked = auditLogs.filter(a => a.result === 'DENIED' || a.result === 'TAMPER_DETECTED').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Healthcare Cyber Operations Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {currentUser.name} · {currentUser.role.toUpperCase()} · {currentUser.hospitalName}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateToTab('demo')}
            className="px-3.5 py-2 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <ShieldAlert className="w-4 h-4 text-red-600" />
            <span>Simulate Attack Demo</span>
          </button>

          {currentUser.role !== 'patient' && currentUser.verified && (
            <button
              onClick={onOpenNewTransfer}
              className="px-3.5 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Transfer</span>
            </button>
          )}
        </div>
      </div>

      {/* Key metrics — single strip */}
      <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {activeTransfersCount}
          </div>
          <div className="text-[11px] text-slate-500">Active transfers · AES-256-GCM</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-amber-600 font-mono tabular-nums">
            {pendingApprovalsCount}
          </div>
          <div className="text-[11px] text-slate-500">Pending doctor approvals</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {verifiedDoctorsCount}
          </div>
          <div className="text-[11px] text-slate-500">Verified doctors on duty</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-red-600 font-mono tabular-nums">
            {securityThreatsBlocked}
          </div>
          <div className="text-[11px] text-slate-500">Threats blocked</div>
        </div>
      </div>

      {/* Main Content: Recent Transfers + Doctor Availability */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Transfers Column (Span 2) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Live Patient Transfers</h2>
              <p className="text-xs text-slate-500">Encrypted end-to-end · SHA-256 integrity checked</p>
            </div>
            <button
              onClick={() => onNavigateToTab('transfers')}
              className="text-xs font-semibold text-sky-700 hover:text-sky-800 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Transfer</th>
                    <th className="px-4 py-3">Receiving Doctor</th>
                    <th className="px-4 py-3">Integrity</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transfers.slice(0, 5).map(t => {
                    const isTampered = t.integrityStatus === 'tampered';
                    const isPending = t.status === 'awaiting_approval';
                    const isApproved = t.status === 'approved';

                    return (
                      <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-mono font-semibold text-slate-900 tabular-nums">{t.id}</div>
                          <div className="text-[11px] text-slate-500">{t.patientName} · {t.patientId}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-800">{t.receivingDoctorName}</div>
                          <div className="text-[10px] text-slate-400">{t.sendingHospitalName.split(' ')[0]} → {t.receivingHospitalName.split(' ')[0]}</div>
                        </td>
                        <td className="px-4 py-3">
                          {isTampered ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>TAMPER DETECTED</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Verified (SHA-256)</span>
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {isPending && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                              Awaiting Approval
                            </span>
                          )}
                          {isApproved && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                              Approved & Decrypted
                            </span>
                          )}
                          {t.status === 'rejected' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                              Rejected
                            </span>
                          )}
                          {t.status === 'tamper_flagged' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-800 border border-red-300">
                              Blocked
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {isPending ? (
                            <button
                              onClick={() => onSelectTransferForReview(t.id)}
                              className="px-2.5 py-1 rounded bg-sky-50 text-sky-700 hover:bg-sky-100 font-semibold text-[11px] transition-colors"
                            >
                              Review
                            </button>
                          ) : (
                            <button
                              onClick={() => onSelectTransferForReview(t.id)}
                              className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium text-[11px] transition-colors"
                            >
                              Inspect
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Slim protocol note */}
          <div className="px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2.5 text-xs text-slate-600">
            <Shield className="w-4 h-4 text-sky-700 shrink-0" />
            <p>
              Records stay AES-256-GCM encrypted until the receiving doctor approves — even if intercepted in transit.
            </p>
          </div>
        </div>

        {/* Right Column: Doctor Availability & Security Alerts */}
        <div className="space-y-6">
          {/* Doctor Availability Spotlight */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Doctor Availability</h3>
                <p className="text-[11px] text-slate-500">Live roster for acute transfers</p>
              </div>
              <button
                onClick={() => onNavigateToTab('availability')}
                className="text-xs font-semibold text-sky-700 hover:text-sky-800"
              >
                Directory
              </button>
            </div>

            <div className="space-y-3">
              {doctorProfiles.slice(0, 3).map(doc => (
                <div key={doc.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden shrink-0">
                      {doc.avatarUrl ? (
                        <img src={doc.avatarUrl} alt={doc.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-slate-600">
                          {doc.name.charAt(4)}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 flex items-center gap-1">
                        <span>{doc.name}</span>
                        {doc.verified && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {doc.specialty} · {doc.hospitalName.split(' ')[0]}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    {doc.dutyStatus === 'on_duty' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        On Duty
                      </span>
                    )}
                    {doc.dutyStatus === 'on_call' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        On Call
                      </span>
                    )}
                    <div className="text-[10px] text-slate-400 font-mono tabular-nums">
                      {doc.availableFrom}–{doc.availableUntil}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Security Events / Audit Preview */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Recent Audit Events</h3>
                <p className="text-[11px] text-slate-500">Cryptographic audit log</p>
              </div>
              <button
                onClick={() => onNavigateToTab('audit')}
                className="text-xs font-semibold text-sky-700 hover:text-sky-800"
              >
                Full Trail
              </button>
            </div>

            <div className="space-y-2.5">
              {auditLogs.slice(0, 4).map(log => {
                const isDenied = log.result === 'DENIED' || log.result === 'TAMPER_DETECTED';
                return (
                  <div key={log.id} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/60 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 text-[11px]">{log.action}</span>
                      <span className="font-mono text-[10px] text-slate-400 tabular-nums">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 line-clamp-1">{log.details}</div>
                      <div className="flex items-center justify-between text-[10px] pt-0.5">
                        <span className="text-slate-500">{log.userName}</span>
                        {isDenied ? (
                          <span className="inline-flex items-center gap-1 text-red-600 font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                            {log.result}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {log.result}
                          </span>
                        )}
                      </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
