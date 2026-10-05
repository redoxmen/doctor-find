/**
 * LoginView.tsx — Animated Zero-Trust Login Gate
 * ----------------------------------------------
 * Replaces the old static credential card with the cinematic
 * scroll-driven login from kmct_hackethone (Landing.jsx + ScrollVideo).
 *
 * Layout: 400vh scroll container -> single sticky 100vh viewport:
 *   Beat 1 (0.00-0.22): Brand headline
 *   Beat 2 (0.24-0.48): Problem statement
 *   Beat 3 (0.50-0.74): Solution promise (Encrypted / Verified / Approved)
 *   Beat 4 (0.75-1.00): Glassmorphic sign-in card (Doctor / Admin / Patient)
 *
 * Login system:
 *   - Role-first: Doctor + SecOps Admin are primary (per requirements),
 *     Patient kept so the patient portal flow keeps working.
 *   - Email is validated against SEED_USERS; unverified identities
 *     (e.g. USR-FAKE-01) are rejected with a 403-style error and never
 *     call onLogin. Password is demo-checked for presence/length.
 *   - Success calls onLogin(userId) -> App sets store user + routes:
 *     doctor -> approval inbox, admin -> SecOps dashboard,
 *     patient -> health portal.
 */

import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'motion/react';
import {
  ShieldCheck,
  User,
  Stethoscope,
  Settings,
  ArrowRight,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertTriangle,
} from 'lucide-react';
import { UserRole } from '../types';
import { SEED_USERS } from '../utils/store';
import { ScrollVideo } from './ScrollVideo';

interface LoginViewProps {
  onLogin: (userId: string) => void;
  onContinueAsGuest?: () => void;
}

type LoginRole = 'doctor' | 'admin' | 'patient';

const ROLE_META: { id: LoginRole; label: string; Icon: typeof User }[] = [
  { id: 'doctor', label: 'Doctor', Icon: Stethoscope },
  { id: 'admin', label: 'Admin', Icon: Settings },
  { id: 'patient', label: 'Patient', Icon: User },
];

const ROLE_EMAIL: Record<LoginRole, string> = {
  doctor: 'sarah.khan@metrocare.health.org',
  admin: 'secops.admin@metrocare.health.org',
  patient: 'john.p.patient@securemail.internal',
};

const ROLE_USER_ID: Record<LoginRole, string> = {
  doctor: 'USR-DOC-01',
  admin: 'USR-ADMIN-01',
  patient: 'USR-PAT-01',
};

const DOCTOR_OPTIONS = [
  { id: 'USR-DOC-01', label: 'Dr. Sarah Khan — Cardiology · Metro Care' },
  { id: 'USR-DOC-02', label: 'Dr. Ahmed Thomas — Emergency · City General' },
  { id: 'USR-DOC-03', label: 'Dr. Rahul Menon — Neurology · Lakeside' },
];

/* ── Scroll-animated text beat ──────────────────────────── */
function TextBeat({
  scrollYProgress,
  start,
  peak,
  end,
  children,
}: {
  scrollYProgress: MotionValue<number>;
  start: number;
  peak: number;
  end: number;
  children: React.ReactNode;
}) {
  const opacity = useTransform(scrollYProgress, [start, peak, end * 0.9, end], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [start, peak, end], [30, 0, -20]);
  return (
    <motion.div
      style={{ opacity, y }}
      className="absolute inset-0 flex items-center justify-center px-6 pointer-events-none"
    >
      {children}
    </motion.div>
  );
}

/* ── CSS animated fallback (shown under/behind ScrollVideo) ── */
function AnimatedFallback() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#050d1a]" aria-hidden="true">
      <img
        src="/videos/poster.jpg"
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-40"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
      {/* Teal aurora orbs */}
      <motion.div
        className="absolute -top-32 -left-32 w-[34rem] h-[34rem] rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(45,212,191,0.28) 0%, transparent 70%)' }}
        animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
        transition={{ repeat: Infinity, duration: 14, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-[38rem] h-[38rem] rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.20) 0%, transparent 70%)' }}
        animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
        transition={{ repeat: Infinity, duration: 18, ease: 'easeInOut' }}
      />
      {/* Fine grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(148,163,184,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.25) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
        }}
      />
    </div>
  );
}

/* ── Login Card ─────────────────────────────────────────── */
function LoginCard({
  scrollYProgress,
  onLogin,
  onContinueAsGuest,
}: {
  scrollYProgress: MotionValue<number>;
  onLogin: (userId: string) => void;
  onContinueAsGuest?: () => void;
}) {
  const [selectedRole, setSelectedRole] = useState<LoginRole>('doctor');
  const [selectedDoctorId, setSelectedDoctorId] = useState('USR-DOC-01');
  const [email, setEmail] = useState(ROLE_EMAIL.doctor);
  const [password, setPassword] = useState('DocKey#Metro2026');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const opacity = useTransform(scrollYProgress, [0.75, 0.85], [0, 1]);
  const y = useTransform(scrollYProgress, [0.75, 0.85], [50, 0]);
  const pointerEvents = useTransform(scrollYProgress, (val: number) => (val > 0.72 ? 'auto' : 'none'));

  const handleRoleSelect = (roleId: LoginRole) => {
    setSelectedRole(roleId);
    setError('');
    setEmail(ROLE_EMAIL[roleId]);
    if (roleId === 'doctor') {
      setPassword('DocKey#Metro2026');
    } else if (roleId === 'admin') {
      setPassword('AdminSecOps#ASTRA2026');
    } else {
      setPassword('PatientPass#2026');
    }
  };

  const identityPreview = (() => {
    if (selectedRole === 'doctor') {
      const doc = SEED_USERS.find((u) => u.id === selectedDoctorId);
      return doc ? `${doc.name} · ${doc.specialty} · ${doc.hospitalName}` : 'Verified Doctor';
    }
    if (selectedRole === 'admin') return 'Marcus Vance (SecOps Root Authority · Level 5)';
    return 'John P. (Patient ID: P1024 · City General)';
  })();

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setError('Please enter your email and password.');
      return;
    }
    if (password.length < 4) {
      setError('Password too short — demo credentials require at least 4 characters.');
      return;
    }

    // Resolve identity: doctor role may pick any of the 3 verified doctors.
    let user = SEED_USERS.find((u) => u.email.toLowerCase() === cleanEmail);
    if (selectedRole === 'doctor' && !user) {
      user = SEED_USERS.find((u) => u.id === selectedDoctorId);
    }
    if (!user) {
      setError('No verified identity found for that email. Pick a role above to autofill a demo account.');
      return;
    }

    const roleOf = (u: (typeof SEED_USERS)[number]): UserRole => u.role;
    const expected: UserRole = selectedRole === 'admin' ? 'admin' : selectedRole;
    if (roleOf(user) !== expected) {
      setError(
        `That email belongs to a ${roleOf(user).toUpperCase()} identity. Switch to the ${roleOf(
          user,
        ).toUpperCase()} tab or use ${ROLE_EMAIL[selectedRole]}.`,
      );
      return;
    }

    if (!user.verified) {
      setError('🔴 403 — Identity verification failed. Unverified callers cannot access clinical systems.');
      return;
    }

    setError('');
    onLogin(user.id);
  };

  const quickFill = (userId: string) => {
    const user = SEED_USERS.find((u) => u.id === userId);
    if (!user) return;
    setEmail(user.email);
    setError('');
    if (user.role === 'doctor') {
      setSelectedRole('doctor');
      setSelectedDoctorId(user.id);
    } else if (user.role === 'admin') {
      setSelectedRole('admin');
    } else {
      setSelectedRole('patient');
    }
  };

  void ROLE_USER_ID;

  return (
    <motion.div
      style={{ opacity, y, pointerEvents }}
      className="absolute inset-0 flex items-center justify-center px-4 overflow-y-auto py-6"
      aria-label="Sign in section"
    >
      <div
        className="w-full max-w-md rounded-2xl p-6 sm:p-8 shadow-2xl transition-all my-auto"
        style={{
          background: 'rgba(10, 22, 40, 0.88)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(45,212,191,0.25)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(45, 212, 191, 0.1)',
        }}
        role="region"
        aria-label="Login form"
      >
        <div className="flex items-center gap-3 mb-5">
          <ShieldCheck className="text-teal-400 w-7 h-7 flex-shrink-0" aria-hidden="true" />
          <div>
            <h2 className="text-white text-xl font-bold leading-tight">Sign in to Doctor Find</h2>
            <p className="text-slate-400 text-sm">Secure access · Encrypted records</p>
          </div>
        </div>

        <form onSubmit={handleSignIn} noValidate>
          <fieldset className="mb-4">
            <legend className="text-slate-300 text-sm font-medium mb-2">Select your role</legend>
            <div className="grid grid-cols-3 gap-2" role="group">
              {ROLE_META.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleRoleSelect(id)}
                  aria-pressed={selectedRole === id}
                  className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl text-xs font-medium cursor-pointer transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-400 ${
                    selectedRole === id
                      ? 'bg-teal-500/20 border border-teal-400 text-teal-300 shadow-sm shadow-teal-500/20'
                      : 'bg-white/5 border border-white/10 text-slate-400 hover:border-white/25 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" aria-hidden="true" />
                  {label}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Doctor picker — visible only for doctor role */}
          {selectedRole === 'doctor' && (
            <div className="mb-4">
              <label htmlFor="ml-doctor" className="block text-slate-300 text-sm font-medium mb-1">
                Attending doctor identity
              </label>
              <select
                id="ml-doctor"
                value={selectedDoctorId}
                onChange={(e) => {
                  setSelectedDoctorId(e.target.value);
                  const doc = SEED_USERS.find((u) => u.id === e.target.value);
                  if (doc) setEmail(doc.email);
                  setError('');
                }}
                className="w-full px-3 py-2.5 rounded-lg text-white text-sm bg-white/5 border border-white/15 focus:outline-none focus:ring-1 focus:ring-teal-400 [&>option]:bg-slate-900"
              >
                {DOCTOR_OPTIONS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="mb-3">
            <label htmlFor="ml-email" className="block text-slate-300 text-sm font-medium mb-1">
              Email address
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none"
                aria-hidden="true"
              />
              <input
                id="ml-email"
                type="email"
                autoComplete="email"
                placeholder="you@hospital.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-lg text-white text-sm placeholder-slate-500 transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-teal-400"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)' }}
                aria-describedby={error ? 'ml-error' : undefined}
              />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="ml-password" className="block text-slate-300 text-sm font-medium mb-1">
              Password
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none"
                aria-hidden="true"
              />
              <input
                id="ml-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-11 py-2.5 rounded-lg text-white text-sm placeholder-slate-500 transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-teal-400"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)' }}
                aria-describedby={error ? 'ml-error' : undefined}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Active Account Identity Preview */}
          <div className="mb-4 p-2.5 rounded-xl bg-slate-950/60 border border-teal-500/20 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse shrink-0" />
              <span className="text-slate-300 truncate">{identityPreview}</span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 uppercase font-semibold shrink-0">
              {selectedRole}
            </span>
          </div>

          {error && (
            <p id="ml-error" role="alert" className="flex items-start gap-1.5 text-red-400 text-xs mb-3">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </p>
          )}

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm cursor-pointer transition-all duration-200 hover:brightness-110 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-400 shadow-md shadow-teal-500/20"
            style={{ background: 'linear-gradient(135deg, #2dd4bf 0%, #0d9488 100%)', color: '#050d1a' }}
          >
            Sign in as {selectedRole.toUpperCase()} <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>

          {/* 1-click demo fill */}
          <div className="flex items-center justify-center gap-2 mt-3 text-[11px] text-slate-500">
            <span>Demo:</span>
            {(selectedRole === 'doctor'
              ? DOCTOR_OPTIONS.map((d) => d.id)
              : [ROLE_USER_ID[selectedRole]]
            ).map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => quickFill(id)}
                className="text-teal-400/90 hover:text-teal-300 underline underline-offset-2 decoration-teal-500/30"
              >
                {id}
              </button>
            ))}
          </div>
        </form>

        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
          <span className="text-slate-500">Synthetic demo credentials only</span>
          {onContinueAsGuest && (
            <button type="button" onClick={onContinueAsGuest} className="text-teal-300 hover:text-white font-medium">
              Explore public overview →
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Main Login Gate ────────────────────────────────────── */
export const LoginView: React.FC<LoginViewProps> = ({ onLogin, onContinueAsGuest }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const handleSkipToLogin = () => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: maxScroll * 0.92, behavior: 'smooth' });
  };

  return (
    <div className="relative bg-[#050d1a] min-h-screen text-white">
      {/* Brand bar */}
      <nav aria-label="Main navigation" className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-gradient-to-b from-[#050d1a]/90 to-transparent">
        <span className="flex items-center gap-2 text-white font-semibold text-lg">
          <ShieldCheck className="text-teal-400 w-6 h-6" aria-hidden="true" />
          <span>
            Doctor <span className="text-teal-400">Find</span>
          </span>
        </span>
        <span className="hidden sm:inline text-slate-400 text-sm">ASTRA 2026 · Cyber in Healthcare</span>
      </nav>

      <button
        onClick={handleSkipToLogin}
        aria-label="Skip to login form"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-teal-300 cursor-pointer transition-all duration-200 hover:text-white hover:scale-105 shadow-lg shadow-black/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-400"
        style={{ background: 'rgba(10,22,40,0.85)', border: '1px solid rgba(45,212,191,0.35)', backdropFilter: 'blur(12px)' }}
      >
        <ShieldCheck className="w-4 h-4" aria-hidden="true" />
        Skip to login
      </button>

      <div ref={containerRef} className="relative w-full" style={{ height: '400vh' }}>
        <div className="sticky top-0 w-full h-screen overflow-hidden">
          <AnimatedFallback />
          <ScrollVideo framesDir="/frames" poster="/videos/poster.jpg" />

          <div
            className="absolute inset-0 pointer-events-none z-10"
            style={{
              background:
                'linear-gradient(to bottom, rgba(5,13,26,0.85) 0%, rgba(5,13,26,0.2) 30%, rgba(5,13,26,0.2) 70%, rgba(5,13,26,0.9) 100%)',
            }}
          />

          <div className="absolute inset-0 z-20" aria-live="polite">
            <TextBeat scrollYProgress={scrollYProgress} start={0} peak={0.08} end={0.22}>
              <div className="text-center max-w-2xl">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <ShieldCheck className="text-teal-400 w-12 h-12" aria-hidden="true" />
                </div>
                <h1 className="text-5xl sm:text-7xl font-extrabold text-white leading-tight tracking-tight">
                  Doctor{' '}
                  <span
                    className="bg-clip-text text-transparent"
                    style={{ backgroundImage: 'linear-gradient(135deg, #2dd4bf 0%, #5eead4 100%)' }}
                  >
                    Find
                  </span>
                </h1>
                <p className="mt-4 text-lg sm:text-xl text-slate-300 font-light">
                  Safer patient transfers between hospitals
                </p>
                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                  className="mt-10 text-slate-400 text-sm flex flex-col items-center gap-1.5"
                  aria-label="Scroll to explore"
                >
                  <span className="tracking-wide">Scroll to explore</span>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <path d="M10 4v12M4 10l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </motion.div>
              </div>
            </TextBeat>

            <TextBeat scrollYProgress={scrollYProgress} start={0.24} peak={0.34} end={0.48}>
              <div className="text-center max-w-xl">
                <p className="text-3xl sm:text-4xl font-bold text-white leading-snug" style={{ textShadow: '0 4px 24px rgba(0,0,0,0.8)' }}>
                  Patient records travel over <span className="text-red-400 underline decoration-red-400/40">calls</span> and{' '}
                  <span className="text-red-400 underline decoration-red-400/40">chats</span>,
                  <br />
                  <span className="font-light text-slate-300">unprotected.</span>
                </p>
              </div>
            </TextBeat>

            <TextBeat scrollYProgress={scrollYProgress} start={0.5} peak={0.6} end={0.74}>
              <div className="text-center max-w-xl">
                <div className="flex justify-center gap-6 mb-5 text-teal-400">
                  <div className="flex flex-col items-center gap-1 text-sm font-medium">
                    <Lock className="w-7 h-7" aria-hidden="true" />
                    <span>Encrypted</span>
                  </div>
                  <div className="text-slate-600 self-center text-xl">·</div>
                  <div className="flex flex-col items-center gap-1 text-sm font-medium">
                    <ShieldCheck className="w-7 h-7" aria-hidden="true" />
                    <span>Verified</span>
                  </div>
                  <div className="text-slate-600 self-center text-xl">·</div>
                  <div className="flex flex-col items-center gap-1 text-sm font-medium">
                    <Stethoscope className="w-7 h-7" aria-hidden="true" />
                    <span>Approved</span>
                  </div>
                </div>
                <p className="text-3xl sm:text-4xl font-bold text-white leading-snug" style={{ textShadow: '0 4px 24px rgba(0,0,0,0.8)' }}>
                  Encrypted. Verified.
                  <br />
                  <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #2dd4bf, #5eead4)' }}>
                    Approved by a doctor.
                  </span>
                </p>
              </div>
            </TextBeat>

            <LoginCard scrollYProgress={scrollYProgress} onLogin={onLogin} onContinueAsGuest={onContinueAsGuest} />
          </div>
        </div>
      </div>
    </div>
  );
};
