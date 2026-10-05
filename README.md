# Doctor Find

### Secure Patient Transfer & Doctor Availability Platform
**ASTRA 2026 — Cyber in Healthcare Hackathon**

---

## 1. Project Name
**Doctor Find** — Secure Patient Transfer & Doctor Availability Platform

## 2. Team Name
**HealthSec Guardians** (ASTRA 2026 Cyber in Healthcare)

## 3. Track
- **Primary Track:** Data, Privacy + Trust
- **Secondary Fit:** Identity + Human Security

## 4. Challenge Number
**TBD — Confirm with organizers**  
*(Preserved strictly as required by ASTRA 2026 Hackathon guidelines)*

---

## 5. Problem Statement
In modern healthcare settings, hospitals frequently transfer critical patients and clinical records using vulnerable informal communication channels:
- Unencrypted telephone calls
- Consumer messaging apps (e.g., WhatsApp, Telegram)
- Unencrypted emails and attachments
- Ad-hoc verbal handoffs

### Clinical & Cybersecurity Risks:
1. **Confidentiality Leaks:** Patient records stored or cached across third-party consumer servers without HIPAA/GDPR safeguards.
2. **Silent Record Tampering:** In-transit alteration of critical clinical parameters (e.g., Blood Group altered from `O+` to `AB+`, or changed dosage) goes unnoticed without mathematical verification, risking fatal transfusions.
3. **Fake Doctor Impersonation:** Rogue actors or social engineers phoning hospitals claiming to be receiving physicians to illicitly obtain charts.
4. **Zero Auditability:** Lack of immutable non-repudiation records detailing who created, transmitted, inspected, or authorized sensitive medical transfers.
5. **Lack of Controlled Approval:** Automated or silent data pushes without explicit receiving-doctor review and clinical acceptance.

---

## 6. Proposed Solution
**Doctor Find** eliminates informal healthcare communication vulnerabilities through a Zero-Trust digital patient-transfer workflow built on five core cybersecurity pillars:

$$\text{CONFIDENTIALITY} + \text{INTEGRITY} + \text{IDENTITY} + \text{ACCOUNTABILITY} + \text{HUMAN CONTROL}$$

1. **Authenticated Data Encryption (AES-256-GCM):** Plaintext clinical summaries, vitals, and medications are never exposed in transit or storage.
2. **Record Integrity & Tamper Detection (SHA-256):** Deterministic canonical digests verify bit-for-bit authenticity before clinical handoff.
3. **Role-Based Access Control (RBAC):** Strict boundaries separating Doctors, Patients, and SecOps Administrators.
4. **Immutable Audit Trail:** Append-only forensic ledger capturing every creation, encryption, approval, rejection, and unauthorized attempt.
5. **Human-in-the-Loop Doctor Review:** Patient records remain sealed until an authenticated, verified receiving physician grants explicit clinical approval.

---

## 7. Key Features
- **Human-in-the-Loop Doctor Approval Gateway:** Clinical data unlocks only upon explicit human review and authorization.
- **Bit-Level Tamper Detection:** Real-time SHA-256 digest recalculation detects any altered field (e.g., Blood Group) and halts the transfer.
- **Interactive Security Demonstration Suite:** Guided attack simulators demonstrating:
  1. Fake Doctor Impersonation Block (`403 Identity Verification Failed`)
  2. In-Transit Record Tampering (`SHA-256 Digest Mismatch`)
  3. Cross-Patient RBAC Violation (`403 Forbidden`)
- **Doctor Availability & Duty Directory:** Live roster displaying shift hours, department, specialty, and verified PKI credentials.
- **Doctor Find (Laya AI):** Patient-facing symptom-to-specialty matching with red-flag detection, verified on-duty doctor roster, and double-booking-proof slot reservation.
- **AI-Powered Security Explainer:** Plain-English interpretation of technical audit logs and RBAC violations for compliance officers.

---

## 8. Architecture & Data Flow

```text
[Hospital A - Originating Clinic]
       │
       ▼
 [Authentication & RBAC Gate]
       │
       ▼
 [Canonical JSON Serialization]
       │
       ▼
 [AES-256-GCM Symmetric Encryption] ───► [Confidentiality Secured]
       │
       ▼
 [SHA-256 Cryptographic Hashing]     ───► [Integrity Digest Manifest]
       │
       ▼
 [Secure TLS Gateway Transport]
       │
       ▼
[Hospital B - Receiving Hospital]
       │
       ▼
 [Doctor PKI Credential Verification]
       │
       ▼
 [Human-in-the-Loop Review Screen] ─── (Doctor APPROVES or REJECTS)
       │
       ├─── APPROVE: SHA-256 Checked ──► AES-256-GCM Decrypted ──► Clinical Access
       └─── REJECT:  Record Remains Sealed ──► Audit Event Logged
       │
       ▼
[Immutable Forensic Audit Trail] ───► (IP, Timestamp, Actor, Action, Result)
```

---

## 9. Technology Stack
- **Frontend Framework:** React 19, TypeScript
- **Build System:** Vite
- **Styling:** Tailwind CSS (Modern Clinical & Cybersecurity Design System)
- **Cryptography Engine:** W3C WebCrypto API (Native browser implementation):
  - Authenticated Symmetric Encryption: `AES-256-GCM` (PBKDF2 key derivation, 96-bit random IVs)
  - Cryptographic Hashing: `SHA-256` (Deterministic canonical JSON digest)
- **Icons & Motion:** Lucide React, Framer Motion
- **State & Storage:** LocalStorage-backed reactive state store with event emitters

---

## 10. Installation & Setup

### Prerequisites
- Node.js (v18+ or v20+)
- npm or yarn

### Commands

#### 1. Frontend Setup (React + Vite)
```bash
# Clone the repository or open extracted download folder
cd doctor-find

# Recommended install (resolves npm 11 peer dependency strictness):
npm install --legacy-peer-deps

# Or standard install:
npm install

# Run the local frontend development server (runs on port 3000)
npm run dev
```

> **Windows PowerShell Fix for `npm error ERESOLVE`:**
> If npm reports `ERESOLVE could not resolve` with `peerOptional esbuild` and `vite`, run:
> ```powershell
> npm install --legacy-peer-deps
> npm run dev
> ```
> This accepts peer resolution smoothly and installs `vite` so `'vite' is not recognized` is immediately fixed!

The frontend application will be live at `http://localhost:3000`.

#### 2. FastAPI (Python) Backend Setup
A production-ready FastAPI REST API service with Laya AI analysis is included in `/backend`:
```bash
# Open a new terminal in the backend directory
cd backend

# (Optional) Create Python virtual environment
python -m venv venv
# On Windows PowerShell:
.\venv\Scripts\Activate.ps1
# On macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Run the FastAPI server (runs on port 8000)
uvicorn main:app --reload --port 8000
```
- Interactive Swagger API Documentation: `http://localhost:8000/docs`
- AI Problem Analysis Endpoint: `POST http://localhost:8000/api/ai/analyze-problem`
- Doctor Availability & Slot Endpoint: `GET http://localhost:8000/api/doctors/DOC-01/slots?date=2026-10-05`
- Appointment Booking Endpoint: `POST http://localhost:8000/api/appointments`

---

## 11. Patient Problem Intake & Role-Based Workflows
1. **Patient Intake Portal:**
   - Patients log in via the dedicated **Patient Login** tab.
   - Describe their medical problem/symptoms in natural language, duration, and urgency.
   - The submission is client-side encrypted with **AES-256-GCM** and hashed with **SHA-256**.
   - A new transfer envelope is generated with status `Awaiting Doctor Approval` and routed to the target hospital.
   - Patients can inspect **My Transfers** and **Privacy & Access History** (who viewed their records).
2. **Dr. Sarah Khan (Receiving Doctor at Metro Care Hospital):**
   - Accesses incoming urgent transfers assigned to Cardiology.
   - Reviews pending transfer `TR-1024`, verifies SHA-256 integrity, and clicks **Approve & Decrypt Record**.
3. **Dr. Ahmed Thomas (Sending Doctor at City General Hospital):**
   - Initiates synthetic patient transfers with custom vitals and priority levels.
4. **Unknown Agent (Unverified / Fake Doctor):**
   - Simulates a rogue entity attempting to approve or access confidential transfers; instantly denied with `403`.
5. **Marcus Vance (SecOps Admin):**
   - Full visibility across audit trails, threat alerts, and system health.

---

## 12. Security Demo Walkthrough (For Hackathon Judges)
Click **"Launch Security Demo"** or navigate to the **Security Demo** tab:

1. **Demo 1 — Fake Doctor Impersonation:**
   - Click *Simulate Fake Doctor Attack*.
   - Result: 🔴 `403 ACCESS DENIED` — Identity/role verification failed.
   - Audit Event: Logged with severity `CRITICAL`.
2. **Demo 2 — Tampered Record in Transit:**
   - In the Tamper Simulator, change Blood Group to `AB+ (Modified in Transit)` and click *Inject Tampered Record*.
   - Result: Original SHA-256 hash does not match received payload hash.
   - Alert: 🔴 `RECORD TAMPERING DETECTED` — Transfer locked to protect patient safety.
3. **Demo 3 — Unauthorized Cross-Patient Access:**
   - Click *Simulate Unauthorized Access* attempting to read Patient `P1002`.
   - Result: 🔴 `403 Forbidden` — RBAC Policy Denial logged.
4. **Guided Judge Walkthrough:**
   - Toggle *Launch Security Demo (Judge Walkthrough)* for an automated 11-step interactive narrative.

---

## 13. Testing
Run TypeScript type-checking and lint verification:
```bash
npm run lint
```
All cryptographic operations use native browser test vectors complying with NIST SP 800-38D (AES-GCM) and FIPS 180-4 (SHA-256).

---

## 14. Security Approach
| Dimension | Principle | Implementation |
| :--- | :--- | :--- |
| **Confidentiality** | Data at rest & in transit must not be plain text | AES-256-GCM authenticated cipher with 96-bit random IVs |
| **Integrity** | Bit alterations must be immediately detectable | Deterministic SHA-256 digest comparison on canonical JSON |
| **Identity** | Actors must be verified before clinical release | PKI-verified medical credentials and RBAC authorization |
| **Accountability** | All operations must produce non-repudiation logs | Immutable forensic audit log with timestamp, IP, actor, and outcome |
| **Human Control** | No autonomous patient data disclosure | Explicit receiving-doctor approval required for decryption |

---

## 15. Limitations
- **Prototype Testbed:** Designed for demonstration within the ASTRA 2026 hackathon environment.
- **Key Management:** In enterprise deployment, encryption keys would be managed via cloud Hardware Security Modules (AWS KMS / Google Cloud KMS / HashiCorp Vault) and mutual TLS certificates rather than prototype PBKDF2 derivation.
- **Synthetic Data Only:** The system does not interface with real hospitals, live EHRs, or actual patient health records.

---

## 16. Team Members
- **Lead Cybersecurity Architect & Full-Stack Engineer:** HealthSec Guardians Team
- **Clinical Informatics Advisor:** HealthSec Guardians Team
- **UI/UX & Frontend Engineer:** HealthSec Guardians Team

## 17. Team Contributions
- **Cryptographic Engine:** Implementation of WebCrypto AES-256-GCM and SHA-256 canonical hashing.
- **Workflow & RBAC:** Human-in-the-loop doctor approval states and multi-role access controls.
- **Attack Simulation Suite:** Controlled demo environments for Fake Doctor, Tamper Detection, and RBAC breaches.
- **Audit System:** Immutable event logging with AI-powered plain-English explanations.

---

## 18. Third-Party Disclosures
- **React 19 & React-DOM** (MIT)
- **Vite** (MIT)
- **Tailwind CSS v4** (MIT)
- **Lucide React** (ISC)
- **Framer Motion / Motion** (MIT)

---

## 19. AI-Generated Content Disclosure
- **Visual Imagery:** The hospital cybersecurity command center hero banner was generated via Google AI Studio image generation tools strictly for conceptual illustration of a hospital operations center.
- **AI Alert Explanations:** Plain-English audit event summaries are designed to assist compliance officers in interpreting technical access violation strings. All medical and security decisions remain human-directed.

---

## 20. License
Doctor Find is open-source software licensed under the **Apache License 2.0**. See the [LICENSE](./LICENSE) file for details.
