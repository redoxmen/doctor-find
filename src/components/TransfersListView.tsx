import React, { useState } from 'react';
import { 
  Lock, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Plus, 
  ArrowRight,
  ShieldCheck,
  Building2,
  UserCheck
} from 'lucide-react';
import { PatientTransfer, User } from '../types';

interface TransfersListViewProps {
  currentUser: User;
  transfers: PatientTransfer[];
  onOpenNewTransfer: () => void;
  onSelectTransferForReview: (transferId: string) => void;
}

export const TransfersListView: React.FC<TransfersListViewProps> = ({
  currentUser,
  transfers,
  onOpenNewTransfer,
  onSelectTransferForReview
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const filteredTransfers = transfers.filter(t => {
    const matchesSearch = 
      t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.sendingHospitalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.receivingHospitalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.receivingDoctorName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || t.transferPriority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Transfers</h1>
          <p className="text-xs text-slate-500 mt-1">
            All cross-hospital transfers with integrity and approval states.
          </p>
        </div>

        {currentUser.role !== 'patient' && currentUser.verified && (
          <button
            onClick={onOpenNewTransfer}
            className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs self-start sm:self-center"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Transfer</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3 text-xs">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search transfer ID, patient name, doctor, or hospital..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="p-2 rounded-lg border border-slate-300 bg-slate-50 text-xs"
          >
            <option value="all">All Statuses</option>
            <option value="awaiting_approval">Awaiting Approval</option>
            <option value="approved">Approved & Decrypted</option>
            <option value="rejected">Rejected</option>
            <option value="tamper_flagged">Tamper Flagged</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-medium">Priority:</span>
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="p-2 rounded-lg border border-slate-300 bg-slate-50 text-xs"
          >
            <option value="all">All Priorities</option>
            <option value="routine">Routine</option>
            <option value="urgent">Urgent</option>
            <option value="emergency">Emergency</option>
          </select>
        </div>
      </div>

      {/* Transfers Grid / List */}
      <div className="space-y-4">
        {filteredTransfers.map(t => {
          const isPending = t.status === 'awaiting_approval';
          const isApproved = t.status === 'approved';
          const isTampered = t.integrityStatus === 'tampered' || t.status === 'tamper_flagged';

          return (
            <div 
              key={t.id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 hover:border-slate-300 transition-all text-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-sm text-slate-900 bg-slate-100 px-2.5 py-1 rounded">
                    {t.id}
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{t.patientName}</h3>
                    <div className="text-[11px] text-slate-500 font-mono">Patient Record: {t.patientId}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                    t.transferPriority === 'emergency'
                      ? 'bg-red-100 text-red-800'
                      : t.transferPriority === 'urgent'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-sky-100 text-sky-800'
                  }`}>
                    {t.transferPriority}
                  </span>

                  {isPending && (
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                      Awaiting Doctor Approval
                    </span>
                  )}
                  {isApproved && (
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Approved & Decrypted
                    </span>
                  )}
                  {t.status === 'rejected' && (
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                      Rejected
                    </span>
                  )}
                  {isTampered && (
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-800 border border-red-300">
                      Tampered in Transit
                    </span>
                  )}
                </div>
              </div>

              {/* Transfer Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <span className="text-slate-500 font-medium block">Route:</span>
                  <div className="font-semibold text-slate-800 mt-0.5">{t.sendingHospitalName}</div>
                  <div className="text-[11px] text-slate-500">→ {t.receivingHospitalName}</div>
                </div>

                <div>
                  <span className="text-slate-500 font-medium block">Assigned Doctor:</span>
                  <div className="font-semibold text-slate-800 mt-0.5">{t.receivingDoctorName}</div>
                  <div className="text-[11px] text-emerald-700 font-medium">Verified Physician</div>
                </div>

                <div>
                  <span className="text-slate-500 font-medium block">Integrity Digest (SHA-256):</span>
                  <div className="font-mono text-[11px] text-slate-700 truncate max-w-[200px]" title={t.integrityHash}>
                    {t.integrityHash.slice(0, 16)}...
                  </div>
                  <div className="text-[10px] text-emerald-600 font-medium">
                    {isTampered ? 'Mismatch Detected' : 'Verified Digest'}
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 font-medium block">Encryption Standard:</span>
                  <div className="font-semibold text-slate-800 mt-0.5">{t.encryptedPayload.algorithm}</div>
                  <div className="text-[10px] text-slate-400 font-mono">IV: {t.encryptedPayload.iv}</div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-[11px] text-slate-400 font-mono">
                  Created: {new Date(t.createdAt).toLocaleString()}
                </span>

                <button
                  onClick={() => onSelectTransferForReview(t.id)}
                  className="px-3.5 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 font-semibold text-xs transition-colors flex items-center gap-1.5"
                >
                  <span>{isPending ? 'Review & Authorize' : 'Inspect Details'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
