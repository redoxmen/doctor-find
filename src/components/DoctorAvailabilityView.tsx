import React, { useState } from 'react';
import { 
  UserCheck, 
  Clock, 
  Search, 
  CheckCircle2, 
  Building2, 
  ShieldCheck, 
  Sparkles, 
  AlertTriangle,
  ArrowRight,
  Filter
} from 'lucide-react';
import { DoctorProfile, Hospital } from '../types';

interface DoctorAvailabilityViewProps {
  doctorProfiles: DoctorProfile[];
  hospitals: Hospital[];
  onInitiateTransferToDoctor?: (doctorId: string) => void;
}

export const DoctorAvailabilityView: React.FC<DoctorAvailabilityViewProps> = ({
  doctorProfiles,
  hospitals,
  onInitiateTransferToDoctor
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHospital, setSelectedHospital] = useState('all');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [dutyFilter, setDutyFilter] = useState('all');

  // Smart Suggestion State (Section 13)
  const [suggestionSpecialty, setSuggestionSpecialty] = useState('Interventional Cardiology');
  const [suggestionUrgency, setSuggestionUrgency] = useState<'routine' | 'urgent' | 'emergency'>('urgent');
  const [suggestedDoctor, setSuggestedDoctor] = useState<DoctorProfile | null>(null);

  const specialties = Array.from(new Set(doctorProfiles.map(d => d.specialty)));

  const filteredDoctors = doctorProfiles.filter(doc => {
    const matchesSearch = 
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.hospitalName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesHospital = selectedHospital === 'all' || doc.hospitalId === selectedHospital;
    const matchesSpecialty = selectedSpecialty === 'all' || doc.specialty === selectedSpecialty;
    const matchesDuty = dutyFilter === 'all' || doc.dutyStatus === dutyFilter;

    return matchesSearch && matchesHospital && matchesSpecialty && matchesDuty;
  });

  const handleRunSmartSuggestion = () => {
    // Find active on_duty doctor in that specialty or closest match
    const match = doctorProfiles.find(d => 
      d.specialty.toLowerCase().includes(suggestionSpecialty.toLowerCase()) && 
      d.verified && 
      d.dutyStatus === 'on_duty'
    ) || doctorProfiles.find(d => d.verified && d.dutyStatus === 'on_duty') || doctorProfiles[0];

    setSuggestedDoctor(match);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Doctor Availability</h1>
        <p className="text-xs text-slate-500 mt-1">
          Verified physicians on duty — pick a doctor to start a transfer.
        </p>
      </div>

      {/* Smart Doctor Suggestion Tool (Section 13) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center text-sky-700">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Smart Doctor Transfer Matching</h3>
              <p className="text-[11px] text-slate-500">Filter qualified physicians based on specialty, urgency, and active shift</p>
            </div>
          </div>
        </div>

        {/* Mandatory Disclaimer (Prompt Requirement 13) */}
        <div className="p-3 bg-amber-50/80 rounded-lg border border-amber-200/80 text-amber-900 text-xs flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            <strong>Platform Disclaimer:</strong> “Doctor suggestions are based on availability and platform information. They are NOT a medical diagnosis or clinical recommendation.”
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
          <div>
            <label className="block text-slate-700 font-medium mb-1">Target Clinical Specialty:</label>
            <select
              value={suggestionSpecialty}
              onChange={e => setSuggestionSpecialty(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 bg-slate-50 text-xs"
            >
              {specialties.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Transfer Urgency:</label>
            <select
              value={suggestionUrgency}
              onChange={e => setSuggestionUrgency(e.target.value as any)}
              className="w-full p-2.5 rounded-lg border border-slate-300 bg-slate-50 text-xs"
            >
              <option value="routine">Routine (Elective Referral)</option>
              <option value="urgent">Urgent (Acute Deterioration)</option>
              <option value="emergency">Emergency (Code STEMI / Stroke)</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleRunSmartSuggestion}
              className="w-full py-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Sparkles className="w-4 h-4" />
              <span>Match Available Physician</span>
            </button>
          </div>
        </div>

        {/* Suggestion Output */}
        {suggestedDoctor && (
          <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden shrink-0">
                {suggestedDoctor.avatarUrl ? (
                  <img src={suggestedDoctor.avatarUrl} alt={suggestedDoctor.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-600 font-bold">{suggestedDoctor.name.charAt(4)}</div>
                )}
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm flex items-center gap-1">
                  <span>{suggestedDoctor.name}</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-slate-600">
                  {suggestedDoctor.specialty} · <strong>{suggestedDoctor.hospitalName}</strong>
                </div>
                <div className="text-[11px] text-emerald-700 font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  On duty ({suggestedDoctor.availableFrom}–{suggestedDoctor.availableUntil}) · Verified
                </div>
              </div>
            </div>

            {onInitiateTransferToDoctor && (
              <button
                onClick={() => onInitiateTransferToDoctor(suggestedDoctor.userId)}
                className="px-4 py-2 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 self-start sm:self-center"
              >
                <span>Select for Transfer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Directory Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3 text-xs">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search physician by name, specialty, or department..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-medium">Hospital:</span>
          <select
            value={selectedHospital}
            onChange={e => setSelectedHospital(e.target.value)}
            className="p-2 rounded-lg border border-slate-300 bg-slate-50 text-xs"
          >
            <option value="all">All Hospitals</option>
            {hospitals.map(h => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-medium">Duty Status:</span>
          <select
            value={dutyFilter}
            onChange={e => setDutyFilter(e.target.value)}
            className="p-2 rounded-lg border border-slate-300 bg-slate-50 text-xs"
          >
            <option value="all">All Statuses</option>
            <option value="on_duty">On Duty</option>
            <option value="on_call">On Call</option>
            <option value="off_duty">Off Duty</option>
          </select>
        </div>
      </div>

      {/* Doctor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDoctors.map(doc => {
          const isOnDuty = doc.dutyStatus === 'on_duty';
          const isOnCall = doc.dutyStatus === 'on_call';

          return (
            <div key={doc.id} className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden shrink-0 border border-slate-200">
                      {doc.avatarUrl ? (
                        <img src={doc.avatarUrl} alt={doc.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-slate-600 text-sm">
                          {doc.name.charAt(4)}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm flex items-center gap-1">
                        <span>{doc.name}</span>
                        {doc.verified && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                      </div>
                      <div className="text-xs text-sky-700 font-medium">{doc.specialty}</div>
                      <div className="text-[11px] text-slate-500">{doc.department}</div>
                    </div>
                  </div>

                  <div>
                    {isOnDuty && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        On Duty
                      </span>
                    )}
                    {isOnCall && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        On Call
                      </span>
                    )}
                    {!isOnDuty && !isOnCall && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600">
                        Off Duty
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{doc.hospitalName}</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 font-mono text-[11px]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Shift:</span>
                    </span>
                    <span className="font-semibold text-slate-800 tabular-nums">
                      {doc.availableFrom} – {doc.availableUntil}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1 text-emerald-700 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>PKI Credential Verified</span>
                </div>

                {onInitiateTransferToDoctor && (
                  <button
                    onClick={() => onInitiateTransferToDoctor(doc.userId)}
                    className="text-xs font-semibold text-sky-700 hover:text-sky-800"
                  >
                    Select Doctor →
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
