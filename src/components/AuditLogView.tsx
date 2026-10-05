import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Terminal, 
  Sparkles, 
  X, 
  Calendar, 
  Building2, 
  UserCheck, 
  Lock 
} from 'lucide-react';
import { AuditLog, UserRole } from '../types';

interface AuditLogViewProps {
  logs: AuditLog[];
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedResult, setSelectedResult] = useState<string>('all');
  const [activeLog, setActiveLog] = useState<AuditLog | null>(null);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = selectedRole === 'all' || log.userRole === selectedRole;
    const matchesSeverity = selectedSeverity === 'all' || log.severity === selectedSeverity;
    const matchesResult = selectedResult === 'all' || log.result === selectedResult;

    return matchesSearch && matchesRole && matchesSeverity && matchesResult;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Audit Trail</h1>
          <p className="text-xs text-slate-500 mt-1">
            Non-repudiation ledger of transfers, reviews, decryptions, and blocked threats.
          </p>
        </div>

        <div className="text-xs text-slate-500 font-mono tabular-nums">
          Total Recorded Events: <strong className="text-slate-800 font-semibold">{logs.length}</strong>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3 text-xs">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search action, user, patient ID, or details..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-medium">Role:</span>
          <select
            value={selectedRole}
            onChange={e => setSelectedRole(e.target.value)}
            className="p-2 rounded-lg border border-slate-300 bg-slate-50 text-xs"
          >
            <option value="all">All Roles</option>
            <option value="doctor">Doctor</option>
            <option value="admin">Admin</option>
            <option value="patient">Patient</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-medium">Severity:</span>
          <select
            value={selectedSeverity}
            onChange={e => setSelectedSeverity(e.target.value)}
            className="p-2 rounded-lg border border-slate-300 bg-slate-50 text-xs"
          >
            <option value="all">All Severities</option>
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
            <option value="CRITICAL">CRITICAL</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-medium">Result:</span>
          <select
            value={selectedResult}
            onChange={e => setSelectedResult(e.target.value)}
            className="p-2 rounded-lg border border-slate-300 bg-slate-50 text-xs"
          >
            <option value="all">All Results</option>
            <option value="AUTHORIZED">AUTHORIZED</option>
            <option value="DENIED">DENIED</option>
            <option value="TAMPER_DETECTED">TAMPER_DETECTED</option>
            <option value="COMPLETED">COMPLETED</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-mono">Timestamp</th>
                <th className="px-4 py-3">User & Role</th>
                <th className="px-4 py-3">Hospital</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Target Resource</th>
                <th className="px-4 py-3">Result</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {filteredLogs.map(log => {
                const isDenied = log.result === 'DENIED';
                const isTamper = log.result === 'TAMPER_DETECTED';
                const isCritical = log.severity === 'CRITICAL';
                const isHigh = log.severity === 'HIGH';

                return (
                  <tr 
                    key={log.id} 
                    onClick={() => setActiveLog(log)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-slate-500 tabular-nums whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="px-4 py-3 text-slate-900 font-medium">
                      <div>{log.userName}</div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider">{log.userRole}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 truncate max-w-[140px]">
                      {log.hospitalName}
                    </td>
                    <td className="px-4 py-3 font-mono font-medium text-slate-800 text-[11px]">
                      {log.action}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600 text-[11px] truncate max-w-[160px]">
                      {log.resource}
                    </td>
                    <td className="px-4 py-3">
                      {isDenied ? (
                        <span className="inline-flex items-center gap-1 font-bold text-red-600 text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                          DENIED
                        </span>
                      ) : isTamper ? (
                        <span className="inline-flex items-center gap-1 font-bold text-red-700 text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                          TAMPER DETECTED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-medium text-emerald-700 text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {log.result}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isCritical 
                          ? 'bg-red-100 text-red-800 border border-red-200' 
                          : isHigh 
                          ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {log.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveLog(log);
                        }}
                        className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Forensic Detail Drawer / Modal */}
      {activeLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 space-y-5 shadow-2xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-sky-700" />
                <h3 className="text-base font-bold text-slate-900 font-mono">
                  Audit Record #{activeLog.id}
                </h3>
              </div>
              <button 
                onClick={() => setActiveLog(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* AI Security Plain-English Explanation (Section 14) */}
            <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 space-y-2">
              <div className="flex items-center gap-2 text-sky-900 font-bold text-xs">
                <Sparkles className="w-4 h-4 text-sky-600" />
                <span>Plain-English Security Explanation (ASTRA SecOps AI)</span>
              </div>
              <p className="text-slate-700 leading-relaxed text-xs italic">
                &ldquo;{activeLog.aiExplanation || 'Legitimate operation conducted within authorized clinical and role-based policies.'}&rdquo;
              </p>
              <div className="text-[10px] text-slate-400">
                Note: AI explanations summarize technical event logs; clinical decisions remain physician-directed.
              </div>
            </div>

            {/* Technical Metadata Grid */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 font-mono text-[11px]">
              <div>
                <span className="text-slate-500 font-sans">Timestamp:</span>
                <div className="font-semibold text-slate-800">{new Date(activeLog.timestamp).toISOString()}</div>
              </div>
              <div>
                <span className="text-slate-500 font-sans">Source Endpoint IP:</span>
                <div className="font-semibold text-slate-800">{activeLog.ipAddress}</div>
              </div>
              <div>
                <span className="text-slate-500 font-sans">Actor:</span>
                <div className="font-semibold text-slate-800">{activeLog.userName} ({activeLog.userRole})</div>
              </div>
              <div>
                <span className="text-slate-500 font-sans">Hospital Node:</span>
                <div className="font-semibold text-slate-800">{activeLog.hospitalName} ({activeLog.hospitalId})</div>
              </div>
              <div>
                <span className="text-slate-500 font-sans">Action Code:</span>
                <div className="font-semibold text-sky-700">{activeLog.action}</div>
              </div>
              <div>
                <span className="text-slate-500 font-sans">Target Resource:</span>
                <div className="font-semibold text-slate-800">{activeLog.resource}</div>
              </div>
            </div>

            {/* Raw Event Detail */}
            <div className="space-y-1">
              <span className="text-slate-700 font-semibold block">Event Description:</span>
              <p className="p-3 bg-slate-900 text-slate-200 rounded-lg font-mono text-[11px] leading-relaxed">
                {activeLog.details}
              </p>
            </div>

            <div className="flex items-center justify-end pt-2">
              <button
                onClick={() => setActiveLog(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
