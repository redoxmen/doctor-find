import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Heart, 
  Activity, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  UserCheck, 
  Lock, 
  Fingerprint, 
  Play, 
  Building2, 
  Database,
  Sparkles
} from 'lucide-react';

interface JudgeBriefViewProps {
  onNavigateToDemo: () => void;
  onNavigateToApproval: () => void;
}

export const JudgeBriefView: React.FC<JudgeBriefViewProps> = ({
  onNavigateToDemo,
  onNavigateToApproval
}) => {
  const [activeSection, setActiveSection] = useState<'value_chain' | 'relevance' | 'pitch_script' | 'fhir' | 'safety'>('value_chain');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-semibold text-emerald-700">ASTRA 2026 · Judges Dossier</span>
          <span className="text-xs text-slate-400 font-mono">
            Track: Data, Privacy + Trust · Identity + Human Security
          </span>
        </div>

        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Doctor Find — Hackathon Judges Dossier
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl">
            Healthcare relevance, patient safety, cybersecurity, human-in-the-loop governance, and prototype execution.
          </p>
        </div>

        {/* Section Navigation Tabs */}
        <div className="pt-2 flex flex-wrap gap-2 text-xs">
          <button
            onClick={() => setActiveSection('value_chain')}
            className={`px-3.5 py-2 rounded-lg font-semibold transition-all ${
              activeSection === 'value_chain'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            1. Core Value Chain (5 Stages)
          </button>

          <button
            onClick={() => setActiveSection('relevance')}
            className={`px-3.5 py-2 rounded-lg font-semibold transition-all ${
              activeSection === 'relevance'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            2. Healthcare Relevance (7 Core Answers)
          </button>

          <button
            onClick={() => setActiveSection('pitch_script')}
            className={`px-3.5 py-2 rounded-lg font-semibold transition-all ${
              activeSection === 'pitch_script'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            3. 3-Minute Live Demo Pitch Script
          </button>

          <button
            onClick={() => setActiveSection('fhir')}
            className={`px-3.5 py-2 rounded-lg font-semibold transition-all ${
              activeSection === 'fhir'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            4. HL7 / FHIR Clinical Interoperability
          </button>

          <button
            onClick={() => setActiveSection('safety')}
            className={`px-3.5 py-2 rounded-lg font-semibold transition-all ${
              activeSection === 'safety'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            5. Safety, Ethics & Rules Compliance
          </button>
        </div>
      </div>

      {/* SECTION 1: THE CORE VALUE CHAIN */}
      {activeSection === 'value_chain' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-bold text-sky-700 uppercase tracking-widest">Section 1 Compliance</span>
            <h2 className="text-xl font-bold text-slate-900">
              The 5-Stage Value Chain: Problem $\rightarrow$ Risk $\rightarrow$ Solution $\rightarrow$ Prototype $\rightarrow$ Patient Outcome
            </h2>
            <p className="text-xs text-slate-500">
              The hackathon organizers mandate that the project is not just a technical tool, but a clinical safety instrument.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
            {/* Stage 1 */}
            <div className="p-4 rounded-xl bg-red-50/60 border border-red-200 space-y-2">
              <span className="font-mono text-[10px] font-bold text-red-700">STAGE 1</span>
              <h3 className="font-bold text-red-950 text-sm">Healthcare Problem</h3>
              <p className="text-slate-700 leading-relaxed text-[11px]">
                Hospitals routinely share emergency patient referrals and charts using informal phone calls, consumer WhatsApp messages, and unencrypted emails.
              </p>
            </div>

            {/* Stage 2 */}
            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-2">
              <span className="font-mono text-[10px] font-bold text-amber-700">STAGE 2</span>
              <h3 className="font-bold text-amber-950 text-sm">Cybersecurity Risk</h3>
              <p className="text-slate-700 leading-relaxed text-[11px]">
                In-transit packet eavesdropping, silent data alteration (altering blood type or dosage), unverified caller impersonation, and zero non-repudiation logging.
              </p>
            </div>

            {/* Stage 3 */}
            <div className="p-4 rounded-xl bg-sky-50/60 border border-sky-200 space-y-2">
              <span className="font-mono text-[10px] font-bold text-sky-700">STAGE 3</span>
              <h3 className="font-bold text-sky-950 text-sm">Proposed Solution</h3>
              <p className="text-slate-700 leading-relaxed text-[11px]">
                A Zero-Trust transfer protocol combining AES-256-GCM encryption, canonical SHA-256 integrity digests, PKI directory RBAC, and doctor-in-the-loop approval.
              </p>
            </div>

            {/* Stage 4 */}
            <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-200 space-y-2">
              <span className="font-mono text-[10px] font-bold text-indigo-700">STAGE 4</span>
              <h3 className="font-bold text-indigo-950 text-sm">Working Prototype</h3>
              <p className="text-slate-700 leading-relaxed text-[11px]">
                Doctor Find: Real WebCrypto cryptographic engine, live attack simulators (fake doctor, tampered record, unauthorized access), and full audit dashboard.
              </p>
            </div>

            {/* Stage 5 */}
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2">
              <span className="font-mono text-[10px] font-bold text-emerald-700">STAGE 5</span>
              <h3 className="font-bold text-emerald-950 text-sm">Patient Safety Outcome</h3>
              <p className="text-slate-700 leading-relaxed text-[11px]">
                Prevents fatal ABO-incompatible transfusions, stops wrong-dose toxicities, blocks medical identity theft, and preserves doctor accountability.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-600 shrink-0" />
              <span className="text-slate-700">
                <strong>ASTRA Core Principle:</strong> &ldquo;Cybersecurity in healthcare is not only about protecting data. It is also about protecting patients, clinical services and trust.&rdquo;
              </span>
            </div>
            <button
              onClick={onNavigateToDemo}
              className="px-4 py-2 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-semibold text-xs transition-colors shrink-0"
            >
              Test Live Prototype →
            </button>
          </div>
        </div>
      )}

      {/* SECTION 2: HEALTHCARE RELEVANCE (7 Core Questions) */}
      {activeSection === 'relevance' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-bold text-sky-700 uppercase tracking-widest">Section 4 Guidelines</span>
            <h2 className="text-xl font-bold text-slate-900">
              The 7 Mandatory Healthcare Relevance Questions
            </h2>
            <p className="text-xs text-slate-500">
              Every team must clearly answer these 7 specific questions for the judging panel.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="font-bold text-sky-800 text-sm">1. Who will use the solution?</span>
              <p className="text-slate-700 leading-relaxed">
                Emergency medicine physicians, referring clinicians, receiving sub-specialists (e.g. interventional cardiologists, neurointensivists), 
                transfer dispatchers, hospital SecOps compliance officers, and patients checking referral status.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="font-bold text-sky-800 text-sm">2. What healthcare problem does it solve?</span>
              <p className="text-slate-700 leading-relaxed">
                Eliminates the dangerous reliance on unencrypted WhatsApp groups, telephone handoffs, and consumer email for patient transfers, 
                where charts are easily intercepted, forwarded without consent, or miscommunicated.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="font-bold text-sky-800 text-sm">3. What cyber threat/risk does it address?</span>
              <p className="text-slate-700 leading-relaxed">
                Eavesdropping/interception on public networks; in-transit record tampering (altering clinical values); fake physician impersonation; 
                unauthorized internal browsing; and lack of forensic accountability.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="font-bold text-sky-800 text-sm">4. How does the system detect/prevent/mitigate?</span>
              <p className="text-slate-700 leading-relaxed">
                AES-256-GCM authenticated encryption enforces confidentiality; deterministic SHA-256 hashes detect any single altered bit; 
                PKI credentials enforce strict role-based access; and physician-in-the-loop ensures no automated data release.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="font-bold text-sky-800 text-sm">5. What happens when a threat is detected?</span>
              <p className="text-slate-700 leading-relaxed">
                The transfer is immediately frozen and flagged as <code>TAMPER_DETECTED</code> or <code>ACCESS_DENIED</code>. 
                Decrypted clinical charts remain permanently locked, physicians are alerted with mismatch digests, and critical forensic audit logs are dispatched.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="font-bold text-sky-800 text-sm">6. How does the solution protect patients?</span>
              <p className="text-slate-700 leading-relaxed">
                Guarantees patient safety by preventing fatal medical errors caused by altered charts (e.g. wrong blood group transfusion or contraindicated medications), 
                while safeguarding privacy under HIPAA and GDPR.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 md:col-span-2">
              <span className="font-bold text-sky-800 text-sm">7. How can the solution be deployed in a real healthcare environment?</span>
              <p className="text-slate-700 leading-relaxed">
                Deployed as a lightweight secure gateway proxy interfacing between existing Hospital Information Systems (HIS) / Electronic Health Records (EHR) via 
                standard HL7 FHIR APIs and mTLS hardware security modules (HSM) without disrupting existing emergency department workflows.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: 3-MINUTE LIVE DEMO PITCH SCRIPT */}
      {activeSection === 'pitch_script' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-bold text-sky-700 uppercase tracking-widest">Section 13 Guidelines</span>
            <h2 className="text-xl font-bold text-slate-900">
              The 3-Minute Judge Presentation Script
            </h2>
            <p className="text-xs text-slate-500">
              Use this exact timing and sequence during the final judging evaluation.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            {/* Minute 1 */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-sky-700">00:00 – 00:45 · THE PROBLEM & THE THREAT</span>
                <span className="text-[10px] text-slate-400 font-mono">Phase 1</span>
              </div>
              <p className="text-slate-700 leading-relaxed italic">
                &ldquo;Judges, hospitals transfer critical patients every day, but often coordinate these handoffs over WhatsApp, phone calls, or unencrypted email. 
                This exposes healthcare to catastrophic risks: records intercepted over public Wi-Fi, malicious actors altering a patient&apos;s blood group, or fake doctors requesting sensitive data. 
                We built Doctor Find to establish a Zero-Trust transfer protocol based on Confidentiality, Integrity, Identity, Accountability, and Human Control.&rdquo;
              </p>
            </div>

            {/* Minute 2 */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-emerald-700">00:45 – 01:45 · WORKING PROTOTYPE & ENCRYPTION</span>
                <span className="text-[10px] text-slate-400 font-mono">Phase 2</span>
              </div>
              <p className="text-slate-700 leading-relaxed italic">
                &ldquo;Notice transfer TR-1024 on our live dashboard. When Dr. Ahmed created this referral at City General, our WebCrypto engine canonicalized the clinical payload, 
                encrypted it with AES-256-GCM, and signed it with a SHA-256 digest. Notice the sealed ciphertext preview: even in transit, no unauthorized party can read it. 
                Next, receiving doctor Dr. Sarah Khan reviews the request. Notice our Human-in-the-Loop policy: the record is only decrypted on her authorized workstation AFTER she explicitly clicks Approve.&rdquo;
              </p>
            </div>

            {/* Minute 3 */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-red-700">01:45 – 03:00 · THE 3 ATTACK SIMULATIONS & PATIENT OUTCOME</span>
                <span className="text-[10px] text-slate-400 font-mono">Phase 3</span>
              </div>
              <p className="text-slate-700 leading-relaxed italic">
                &ldquo;Now let&apos;s demonstrate our cyber defenses in the Security Demo suite. 
                First, a rogue doctor attempts access: the system enforces a 403 block because their PKI credential fails verification. 
                Second, we simulate an attacker modifying the Blood Group from O+ to AB+ in transit: our SHA-256 digest instantly detects the mismatch, flags the transfer, and blocks clinical access to prevent fatal transfusion shock. 
                Third, every attempt is recorded in our forensic audit trail with plain-English AI explanations. 
                Doctor Find doesn&apos;t just protect data—it protects patient lives and clinical continuity.&rdquo;
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={onNavigateToApproval}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors"
            >
              Open Doctor Approval Review →
            </button>
            <button
              onClick={onNavigateToDemo}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition-colors"
            >
              Launch Live Attack Simulators →
            </button>
          </div>
        </div>
      )}

      {/* SECTION 4: HL7 / FHIR INTEROPERABILITY */}
      {activeSection === 'fhir' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-bold text-sky-700 uppercase tracking-widest">Healthcare IT Architecture</span>
            <h2 className="text-xl font-bold text-slate-900">
              HL7® FHIR® R4 Interoperability Manifest
            </h2>
            <p className="text-xs text-slate-500">
              Doctor Find envelopes standard Fast Healthcare Interoperability Resources (FHIR) bundles for seamless hospital EHR integration.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 text-slate-300 font-mono text-xs overflow-x-auto border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2 text-[11px]">
              <span className="text-sky-400">Standard Synthetic FHIR Resource: Bundle / Patient / Condition</span>
              <span>Spec: HL7 FHIR Release 4 (JSON)</span>
            </div>
            <pre className="text-[11px] text-emerald-400 leading-relaxed">
{`{
  "resourceType": "Bundle",
  "id": "medilink-transfer-tr1024",
  "type": "document",
  "timestamp": "2026-10-04T14:32:00Z",
  "entry": [
    {
      "resource": {
        "resourceType": "Patient",
        "id": "P1024",
        "name": [{ "family": "Pendelton", "given": ["Arthur"] }],
        "gender": "male",
        "birthDate": "1978-04-12",
        "extension": [{ "url": "blood-group", "valueString": "O+" }]
      }
    },
    {
      "resource": {
        "resourceType": "Condition",
        "code": { "coding": [{ "system": "http://hl7.org/fhir/sid/icd-10", "code": "I21.0" }] },
        "subject": { "reference": "Patient/P1024" }
      }
    }
  ],
  "securityEnclosure": {
    "encryption": "AES-256-GCM",
    "integritySignature": "SHA-256:a4f828bd7818fa8f9e61298492040182",
    "mTLSCert": "CERT-METROCARE-NODE-02"
  }
}`}
            </pre>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-700">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <strong>Epic / Cerner Bridge:</strong> Direct ingestion into hospital EHR beds via RESTful FHIR endpoints without custom hospital-side code.
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <strong>Zero Plaintext Storage:</strong> The FHIR payload is encrypted at the source node before leaving hospital perimeter walls.
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <strong>Deterministic Serialization:</strong> Keys are sorted alphabetically before SHA-256 hashing to eliminate formatting jitter.
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: SAFETY, ETHICS & DISQUALIFICATION PREVENTION */}
      {activeSection === 'safety' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">Section 5 & 16 Strict Compliance</span>
            <h2 className="text-xl font-bold text-slate-900">
              Cybersecurity Safety & Ethics Compliance Checklist
            </h2>
            <p className="text-xs text-slate-500">
              Proof of 100% adherence to all ASTRA 2026 hackathon safety rules and ethical guidelines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2">
              <span className="font-bold text-emerald-900 text-sm flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Mandatory Safety Rules Enforced</span>
              </span>
              <ul className="space-y-1.5 text-slate-700">
                <li className="flex items-center gap-1.5">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span><strong>100% Synthetic Data:</strong> Zero real patient names, health records, or live credentials.</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span><strong>Zero Real Hospital Probing:</strong> No unauthorized scanning or penetration testing of real clinics.</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span><strong>Hermetic Simulation Environment:</strong> Attacks demonstrated in-memory via controlled test vectors.</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span><strong>Patient Safety Priority:</strong> System preserves clinical continuity and human doctor authority.</span>
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-sky-600" />
                <span>Human-in-the-Loop & Disqualification Protections</span>
              </span>
              <ul className="space-y-1.5 text-slate-700">
                <li className="flex items-center gap-1.5">
                  <span className="text-sky-600 font-bold">✓</span>
                  <span><strong>No Autonomous Decisions:</strong> Physician must explicitly authorize admission to unlock clinical charts.</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-sky-600 font-bold">✓</span>
                  <span><strong>Open Source Apache 2.0:</strong> Complete <code>LICENSE</code> and <code>README.md</code> included.</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-sky-600 font-bold">✓</span>
                  <span><strong>Disclosed Third Parties:</strong> React 19, Tailwind, Lucide, WebCrypto fully attributed.</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-sky-600 font-bold">✓</span>
                  <span><strong>Zero Committed Secrets:</strong> Clean <code>.env.example</code> template provided.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
