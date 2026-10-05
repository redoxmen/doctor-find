import React, { useState } from 'react';
import { 
  Sparkles, 
  Search, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Stethoscope, 
  Building2, 
  Star, 
  ShieldCheck, 
  ArrowRight, 
  X, 
  Info,
  RefreshCw,
  PhoneCall,
  User,
  Heart,
  Activity,
  Sliders,
  Check,
  HelpCircle,
  ClipboardList,
  AlertCircle,
  Tag,
  Plus
} from 'lucide-react';
import { DoctorProfile, LayaRecommendation, Appointment, User as UserType } from '../types';
import { 
  analyzeProblemWithLaya, 
  searchDoctorsBySpecialty, 
  getDoctorSlots, 
  bookAppointment, 
  ALLOWED_SPECIALTIES 
} from '../utils/store';

interface DoctorFindViewProps {
  currentUser: UserType;
  onNavigateToTab: (tab: string) => void;
  onAppointmentBooked?: (appointment: Appointment) => void;
}

interface ClinicalPreset {
  label: string;
  icon: string;
  category: string;
  description: string;
  severity: number;
  duration: string;
  associatedSymptoms: string[];
}

const COMMON_ASSOCIATED_SYMPTOMS = [
  "Shortness of Breath",
  "Cold Sweats",
  "Radiating Pain (Arm/Jaw)",
  "Dizziness / Vertigo",
  "High Fever (> 101°F)",
  "Numbness or Tingling",
  "Nausea / Vomiting",
  "Joint Swelling",
  "Visual Disturbance",
  "Rapid / Fluttering Pulse"
];

const CLINICAL_PRESETS: ClinicalPreset[] = [
  {
    label: "Acute Chest Pressure",
    icon: "🫀",
    category: "Cardiology",
    description: "Sudden crushing chest pressure while walking upstairs, radiating down left arm with cold sweats and shortness of breath.",
    severity: 8,
    duration: "Past 30 mins",
    associatedSymptoms: ["Shortness of Breath", "Cold Sweats", "Radiating Pain (Arm/Jaw)"]
  },
  {
    label: "Thunderclap Migraine",
    icon: "🧠",
    category: "Neurology",
    description: "Severe throbbing unilateral headache with extreme photophobia, nausea, and visual aura followed by mild facial tingling.",
    severity: 7,
    duration: "Few hours today",
    associatedSymptoms: ["Dizziness / Vertigo", "Visual Disturbance", "Nausea / Vomiting"]
  },
  {
    label: "Knee Twist & Pop",
    icon: "🦴",
    category: "Orthopedics",
    description: "Twisted right knee during sports with an audible popping sound. Immediate joint swelling and unable to bear weight.",
    severity: 7,
    duration: "Few hours today",
    associatedSymptoms: ["Joint Swelling"]
  },
  {
    label: "Barking Pediatric Cough",
    icon: "👶",
    category: "Pediatrics",
    description: "3-year-old child with persistent 103°F fever, harsh barking cough, stridor when crying, and refusal to drink fluids.",
    severity: 8,
    duration: "1-3 days",
    associatedSymptoms: ["High Fever (> 101°F)", "Shortness of Breath"]
  },
  {
    label: "Visual Flashes & Curtain",
    icon: "👁️",
    category: "Ophthalmology",
    description: "Sudden onset of dark floaters and bright lightning flashes in right eye followed by a curtain-like shadow in peripheral vision.",
    severity: 8,
    duration: "Past 30 mins",
    associatedSymptoms: ["Visual Disturbance"]
  },
  {
    label: "Fatigue & Weight Loss",
    icon: "🩺",
    category: "General Medicine",
    description: "Progressive debilitating fatigue over the last 3 weeks with unexplained 12 lb weight loss, excessive thirst, and frequent urination.",
    severity: 4,
    duration: "Over 1 week",
    associatedSymptoms: ["Dizziness / Vertigo"]
  }
];

export const DoctorFindView: React.FC<DoctorFindViewProps> = ({
  currentUser,
  onNavigateToTab,
  onAppointmentBooked
}) => {
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<number>(5);
  const [duration, setDuration] = useState<string>('Few hours today');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendation, setRecommendation] = useState<LayaRecommendation | null>(null);
  const [matchingDoctors, setMatchingDoctors] = useState<DoctorProfile[]>([]);
  const [aiError, setAiError] = useState<string | null>(null);
  const [manualSpecialty, setManualSpecialty] = useState<string>('Cardiology');

  // Booking Modal State
  const [bookingDoctor, setBookingDoctor] = useState<DoctorProfile | null>(null);
  const [selectedDate, setSelectedDate] = useState<'today' | 'tomorrow'>('today');
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);

  // Compute dates
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowObj = new Date();
  tomorrowObj.setDate(tomorrowObj.getDate() + 1);
  const tomorrowStr = tomorrowObj.toISOString().split('T')[0];

  const activeDateStr = selectedDate === 'today' ? todayStr : tomorrowStr;

  const handleApplyPreset = (preset: ClinicalPreset) => {
    setDescription(preset.description);
    setSeverity(preset.severity);
    setDuration(preset.duration);
    setSelectedSymptoms(preset.associatedSymptoms);
  };

  const toggleSymptom = (sym: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(sym) ? prev.filter(s => s !== sym) : [...prev, sym]
    );
  };

  const handleAnalyzeProblem = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!description.trim()) return;

    setIsAnalyzing(true);
    setAiError(null);
    setConfirmedAppointment(null);

    try {
      const rec = await analyzeProblemWithLaya(description, {
        severity,
        duration,
        associatedSymptoms: selectedSymptoms
      });

      setRecommendation(rec);
      const doctors = searchDoctorsBySpecialty(rec.specialty);
      setMatchingDoctors(doctors);
    } catch (err: any) {
      setAiError(
        "AI recommendation is temporarily unavailable. You can search doctors by specialty manually."
      );
      const fallbackDoctors = searchDoctorsBySpecialty(manualSpecialty);
      setMatchingDoctors(fallbackDoctors);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleManualSpecialtyChange = (spec: string) => {
    setManualSpecialty(spec);
    const docs = searchDoctorsBySpecialty(spec);
    setMatchingDoctors(docs);
  };

  const handleOpenBooking = (doc: DoctorProfile) => {
    setBookingDoctor(doc);
    setSelectedSlot(null);
    setBookingError(null);
  };

  const handleConfirmBooking = async () => {
    if (!bookingDoctor || !selectedSlot) return;

    setIsBooking(true);
    setBookingError(null);

    try {
      const res = await bookAppointment({
        doctorId: bookingDoctor.id,
        patientId: currentUser.id || 'P1024',
        patientName: currentUser.name || 'John P.',
        appointmentDate: activeDateStr,
        appointmentTime: selectedSlot,
        problemSummary: description || recommendation?.reason || 'Consultation request'
      });

      setConfirmedAppointment(res.appointment);
      setBookingDoctor(null);
      if (onAppointmentBooked) {
        onAppointmentBooked(res.appointment);
      }
    } catch (err: any) {
      setBookingError(err.message || 'Failed to book appointment. Slot may be taken.');
    } finally {
      setIsBooking(false);
    }
  };

  const availableSlots = bookingDoctor 
    ? getDoctorSlots(bookingDoctor.id, activeDateStr)
    : [];

  const getSeverityBadge = (val: number) => {
    if (val <= 3) return { text: "Mild Discomfort (1–3)", color: "text-emerald-700 bg-emerald-50 border-emerald-200" };
    if (val <= 6) return { text: "Moderate Pain (4–6)", color: "text-sky-700 bg-sky-50 border-sky-200" };
    if (val <= 8) return { text: "Severe Disabling (7–8)", color: "text-amber-800 bg-amber-50 border-amber-200" };
    return { text: "Critical / Intolerable (9–10)", color: "text-red-800 bg-red-50 border-red-200" };
  };

  const currentSevBadge = getSeverityBadge(severity);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* 1. Header */}
      <div className="space-y-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-sky-700">Doctor Find · powered by Laya AI</span>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          What symptoms are you experiencing?
        </h1>
        <p className="text-xs text-slate-500 max-w-3xl">
          Describe your problem in plain English — Laya matches a specialty and books a verified on-duty doctor.
        </p>
      </div>

      {/* 2. Presets */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-700">
            1-click test scenarios
          </span>
          <span className="text-[10px] text-slate-400">Click to load symptoms</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {CLINICAL_PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(p)}
              className="p-2.5 rounded-xl bg-white hover:bg-sky-50/80 border border-slate-200 hover:border-sky-300 text-left transition-all text-xs space-y-1 group shadow-2xs"
            >
              <div className="text-base">{p.icon}</div>
              <div className="font-bold text-slate-800 group-hover:text-sky-800 leading-tight text-[11px] truncate">
                {p.label}
              </div>
              <div className="text-[10px] text-slate-400 font-medium truncate">
                {p.category}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Main Form */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 space-y-5">
        <form onSubmit={handleAnalyzeProblem} className="space-y-5">
          {/* Main Symptom Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-900">
              1. Describe your symptoms in your own words: *
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="E.g., Experiencing sudden crushing substernal chest pressure radiating to my left arm and jaw, accompanied by shortness of breath and cold sweats while climbing stairs..."
              className="w-full p-4 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-hidden leading-relaxed placeholder:text-slate-400 font-normal"
            />
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Be as descriptive as possible regarding location, severity, triggers, and progression.</span>
              <span className="font-medium text-sky-700">Multi-Symptom Parsing Active</span>
            </div>
          </div>

          {/* Clinical Options Grid: Severity Slider + Duration + Associated Symptoms */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2 border-t border-slate-100">
            {/* Severity / Pain Scale Slider (1 to 10) */}
            <div className="md:col-span-5 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-sky-600" />
                  <span>Pain / Severity Rating:</span>
                </label>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${currentSevBadge.color}`}>
                  {currentSevBadge.text}
                </span>
              </div>

              <div className="space-y-1.5">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={severity}
                  onChange={e => setSeverity(parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
                />
                <div className="flex justify-between text-[10px] font-bold text-slate-400 font-mono">
                  <span>1 (Mild)</span>
                  <span>5 (Moderate)</span>
                  <span>7 (Severe)</span>
                  <span className="text-red-600">10 (Critical)</span>
                </div>
              </div>

              {/* Duration Buttons */}
              <div className="pt-2 space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Symptom Onset & Duration:
                </label>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  {["Past 30 mins", "Few hours today", "1-3 days", "Over 1 week"].map(dur => (
                    <button
                      key={dur}
                      type="button"
                      onClick={() => setDuration(dur)}
                      className={`p-2 rounded-xl border text-center transition-all text-[11px] font-semibold ${
                        duration === dur
                          ? 'border-sky-500 bg-sky-50 text-sky-900 ring-1 ring-sky-500/20'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-slate-50/50'
                      }`}
                    >
                      {dur}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Associated Symptoms Multi-Select Tags */}
            <div className="md:col-span-7 space-y-2.5">
              <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Select Any Associated Symptoms:</span>
                </span>
                <span className="text-[10px] text-slate-400 font-normal">Optional multi-select</span>
              </label>

              <div className="flex flex-wrap gap-1.5">
                {COMMON_ASSOCIATED_SYMPTOMS.map(sym => {
                  const isSelected = selectedSymptoms.includes(sym);
                  return (
                    <button
                      key={sym}
                      type="button"
                      onClick={() => toggleSymptom(sym)}
                      className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold transition-all flex items-center gap-1.5 border ${
                        isSelected
                          ? 'bg-sky-600 text-white border-sky-600 shadow-2xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {isSelected ? <Check className="w-3 h-3 text-white" /> : <Plus className="w-3 h-3 text-slate-400" />}
                      <span>{sym}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-slate-400 shrink-0" />
              <span>AI specialty navigation only. Not an autonomous clinical diagnosis.</span>
            </div>

            <button
              type="submit"
              disabled={isAnalyzing || !description.trim()}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Evaluating Clinical Presentation...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze Symptoms with Laya</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 4. Loading State */}
      {isAnalyzing && (
        <div className="p-6 rounded-xl bg-sky-50/70 border border-sky-200 text-center space-y-2">
          <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="font-bold text-sky-950 text-sm">Evaluating symptoms…</div>
        </div>
      )}

      {/* Graceful Fallback if AI is Unavailable */}
      {aiError && (
        <div className="p-5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 space-y-3 text-xs">
          <div className="flex items-center gap-2 font-bold text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>AI Recommendation Notice</span>
          </div>
          <p className="text-amber-800 leading-relaxed">
            {aiError}
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="font-semibold text-amber-900">Select Specialty Manually:</span>
            <select
              value={manualSpecialty}
              onChange={e => handleManualSpecialtyChange(e.target.value)}
              className="p-2 rounded-lg border border-amber-300 bg-white font-medium text-xs"
            >
              {ALLOWED_SPECIALTIES.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* 5. Assessment result */}
      {recommendation && !isAnalyzing && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-5">
          {/* Header Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <h2 className="text-sm font-bold text-slate-900">Assessment result</h2>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* AI Confidence Meter */}
              {recommendation.confidenceScore && (
                <div className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-sky-600" />
                  <span>{recommendation.confidenceScore}% Confidence</span>
                </div>
              )}

              {/* Priority Badge */}
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                recommendation.urgency === 'emergency'
                  ? 'bg-red-100 text-red-800 border border-red-300 animate-pulse'
                  : recommendation.urgency === 'high'
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : recommendation.urgency === 'medium'
                  ? 'bg-sky-100 text-sky-800 border border-sky-300'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              }`}>
                {recommendation.urgency} Urgency
              </span>
            </div>
          </div>

          {/* Emergency Alert Banner if Emergency */}
          {recommendation.emergency && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-red-800">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                <span>Potential medical emergency detected</span>
              </div>
              <p className="text-xs text-red-700 leading-relaxed">
                Your symptoms may indicate an acute condition. Please <strong>dial 911 / 112 immediately</strong> or go to the nearest emergency department.
              </p>
              <div className="pt-1">
                <a
                  href="tel:911"
                  className="inline-flex px-4 py-2 rounded-lg bg-red-600 text-white font-bold text-xs hover:bg-red-700 items-center gap-1.5"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Call Emergency (911 / 112)</span>
                </a>
              </div>
            </div>
          )}

          {/* Primary & Secondary Recommended Specialties */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            {/* Primary Specialty */}
            <div className="sm:col-span-6 p-4 rounded-xl border border-slate-200 space-y-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Recommended specialty
              </span>
              <div className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-sky-600" />
                <span>{recommendation.specialty}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pt-1">
                {recommendation.reason}
              </p>
            </div>

            {/* Secondary Specialty & Response Timeline */}
            <div className="sm:col-span-6 p-4 rounded-xl border border-slate-200 space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Alternative / Secondary Pathway
                </span>
                <div className="text-base font-bold text-slate-800 mt-1">
                  {recommendation.secondarySpecialty ? (
                    <span className="flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-slate-500" />
                      <span>{recommendation.secondarySpecialty}</span>
                    </span>
                  ) : (
                    <span className="text-slate-500 font-normal">General Clinical Triage</span>
                  )}
                </div>
              </div>

              {recommendation.urgencyTimeline && (
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Target Clinical Window:</span>
                  <div className="font-bold text-slate-800">{recommendation.urgencyTimeline}</div>
                </div>
              )}
            </div>
          </div>

          {/* Red Flag Indicators (if detected) */}
          {recommendation.redFlagIndicators && recommendation.redFlagIndicators.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Identified Clinical Red Flags:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {recommendation.redFlagIndicators.map((flag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 text-xs font-semibold border border-amber-300/80"
                  >
                    {flag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Consultation Preparation Toolkit: Questions to Ask & How to Prepare */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Questions to Ask Doctor */}
            {recommendation.suggestedDoctorQuestions && recommendation.suggestedDoctorQuestions.length > 0 && (
              <div className="p-4 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <HelpCircle className="w-4 h-4 text-sky-600" />
                  <span>Questions to Ask Your Attending Physician:</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-600 list-disc list-inside">
                  {recommendation.suggestedDoctorQuestions.map((q, idx) => (
                    <li key={idx} className="leading-relaxed font-medium">
                      {q}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Preparation Advice */}
            {recommendation.recommendedPreparation && recommendation.recommendedPreparation.length > 0 && (
              <div className="p-4 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <ClipboardList className="w-4 h-4 text-emerald-600" />
                  <span>Recommended Patient Preparation:</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-600 list-disc list-inside">
                  {recommendation.recommendedPreparation.map((prep, idx) => (
                    <li key={idx} className="leading-relaxed font-medium">
                      {prep}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Matched Clinical Keyword Tags */}
          {recommendation.matchedKeywords && recommendation.matchedKeywords.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-500">
              <span className="font-bold text-slate-700">Matched Clinical Indicators:</span>
              {recommendation.matchedKeywords.map((kw, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[10px] border border-slate-200">
                  #{kw}
                </span>
              ))}
            </div>
          )}

          {/* Mandatory Compliance Disclaimer */}
          <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200/80 text-amber-900 text-xs flex items-center gap-2.5">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <p className="text-[11px] font-semibold leading-relaxed">
              Disclaimer: {recommendation.disclaimer}
            </p>
          </div>
        </div>
      )}

      {/* 6. Confirmation Screen if appointment was booked */}
      {confirmedAppointment && (
        <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-emerald-950">Appointment booked</h3>
              <p className="text-xs text-emerald-800">
                Confirmed and logged in the audit trail.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-white rounded-xl border border-emerald-200 text-xs">
            <div>
              <span className="text-slate-500 block">Doctor:</span>
              <strong className="text-slate-900 font-bold">{confirmedAppointment.doctorName}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Specialty & Hospital:</span>
              <span className="text-slate-800 font-medium">{confirmedAppointment.doctorSpecialty} · {confirmedAppointment.hospitalName}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Date & Time:</span>
              <span className="text-emerald-700 font-bold font-mono">{confirmedAppointment.appointmentDate} at {confirmedAppointment.appointmentTime}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Appointment ID:</span>
              <span className="font-mono text-slate-800 font-bold">{confirmedAppointment.id}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-emerald-800 text-[11px]">
              Audit Event Logged: <code className="font-mono">APPOINTMENT_BOOKED</code>
            </span>
            <button
              onClick={() => onNavigateToTab('patient_portal')}
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition-colors"
            >
              View in Patient Portal →
            </button>
          </div>
        </div>
      )}

      {/* 7. Matching Verified Doctors & Slot Booking Section */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-sky-600" />
              <span>Available Verified Specialists</span>
            </h2>
            <p className="text-xs text-slate-500">
              {recommendation 
                ? `Physicians accredited in ${recommendation.specialty} with on-duty verified credentials`
                : 'Browse accredited specialists across partner hospital networks'}
            </p>
          </div>

          {matchingDoctors.length > 0 && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {matchingDoctors.length} On-Duty Doctors Found
            </span>
          )}
        </div>

        {matchingDoctors.length === 0 ? (
          <div className="p-6 rounded-xl bg-white border border-slate-200 text-center space-y-2">
            <Building2 className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs font-bold text-slate-700">No matching doctors found for this specialty right now.</p>
            <p className="text-[11px] text-slate-500">Try selecting another specialty manually or adjusting your symptom description.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matchingDoctors.map(doctor => {
              const isOnDuty = doctor.dutyStatus === 'on_duty';
              return (
                <div
                  key={doctor.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-200 overflow-hidden shrink-0 border border-slate-200">
                          {doctor.avatarUrl ? (
                            <img src={doctor.avatarUrl} alt={doctor.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-slate-600">
                              {doctor.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-bold text-slate-900 text-sm">{doctor.name}</h3>
                            {doctor.verified && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            )}
                          </div>
                          <div className="text-xs font-medium text-sky-700">{doctor.specialty}</div>
                          <div className="text-[11px] text-slate-500">{doctor.hospitalName}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full text-xs font-bold text-amber-900">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{doctor.syntheticRating}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-100">
                      <div>
                        <span className="text-slate-400 block">Duty Hours:</span>
                        <span className="font-mono text-slate-700 font-semibold">{doctor.availableFrom} – {doctor.availableUntil}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Next Available Slot:</span>
                        <span className="font-semibold text-emerald-700">{doctor.nextAvailableSlot || 'Today'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                      isOnDuty ? 'text-emerald-700' : 'text-slate-500'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${isOnDuty ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      <span>{isOnDuty ? 'On-Duty Now' : 'On-Call'}</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => handleOpenBooking(doctor)}
                      className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Book Slot</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 8. Booking Slot Selector Modal */}
      {bookingDoctor && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 border border-slate-200 space-y-5">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-700">Reserve Consultation Slot</span>
                <h3 className="text-base font-bold text-slate-900">{bookingDoctor.name}</h3>
                <p className="text-xs text-slate-500">{bookingDoctor.specialty} · {bookingDoctor.hospitalName}</p>
              </div>
              <button
                onClick={() => setBookingDoctor(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bookingError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{bookingError}</span>
              </div>
            )}

            {/* Date Selector: Today vs Tomorrow */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 block">Select Date:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDate('today');
                    setSelectedSlot(null);
                  }}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    selectedDate === 'today'
                      ? 'border-sky-500 bg-sky-50 text-sky-900 ring-2 ring-sky-500/20'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div>Today</div>
                  <div className="text-[10px] text-slate-400 font-mono font-normal">{todayStr}</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedDate('tomorrow');
                    setSelectedSlot(null);
                  }}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    selectedDate === 'tomorrow'
                      ? 'border-sky-500 bg-sky-50 text-sky-900 ring-2 ring-sky-500/20'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div>Tomorrow</div>
                  <div className="text-[10px] text-slate-400 font-mono font-normal">{tomorrowStr}</div>
                </button>
              </div>
            </div>

            {/* Slots Grid */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">Available Consultation Slots:</span>
                <span className="text-[10px] text-slate-400">30-min clinical windows</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {availableSlots.map(slot => (
                  <button
                    key={slot.time}
                    type="button"
                    disabled={!slot.available}
                    onClick={() => setSelectedSlot(slot.time)}
                    className={`py-2 px-2 rounded-xl text-xs font-mono font-bold transition-all ${
                      !slot.available
                        ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed line-through'
                        : selectedSlot === slot.time
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'bg-white text-slate-800 border border-slate-200 hover:border-sky-400'
                    }`}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            </div>

            {/* Double-Booking Guarantee notice */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Double-booking prevention is enforced. Slot is locked immediately upon booking.</span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setBookingDoctor(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={!selectedSlot || isBooking}
                onClick={handleConfirmBooking}
                className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {isBooking ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Confirming...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm Slot ({selectedSlot || 'Select a time'})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
