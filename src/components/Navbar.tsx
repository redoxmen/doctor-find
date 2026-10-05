import React, { useState } from 'react';
import { 
  Shield, 
  User, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  Sparkles,
  Stethoscope,
  ShieldCheck,
  Send,
  History,
  Layers,
  Menu,
  X,
  Clock,
  LogOut,
  LogIn
} from 'lucide-react';
import { User as UserType } from '../types';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  currentUser: UserType;
  onLogout: () => void;
  isLoggedIn?: boolean;
  onOpenNewTransfer: () => void;
  pendingApprovalsCount: number;
}

interface NavLinkItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  accent?: 'sky' | 'emerald' | 'amber' | 'red';
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  onLogout,
  isLoggedIn = true,
  onOpenNewTransfer,
  pendingApprovalsCount
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Compute navigation links based strictly on user role
  const getNavLinks = (): NavLinkItem[] => {
    // If not logged in, only public overview tabs
    if (!isLoggedIn) {
      return [
        { id: 'landing', label: 'Overview' },
        { id: 'architecture', label: 'Architecture' },
        { id: 'judge_guide', label: 'ASTRA Rubric', accent: 'amber' }
      ];
    }

    if (currentUser.role === 'patient') {
      return [
        {
          id: 'doctor_find',
          label: 'Doctor Find',
          icon: <Sparkles className="w-3.5 h-3.5 text-sky-500" />,
          badge: (
            <span className="text-[10px] bg-sky-100 text-sky-800 px-1.5 py-0.2 rounded font-bold border border-sky-300">
              Laya AI
            </span>
          )
        },
        {
          id: 'patient_portal',
          label: 'My Health Portal',
          icon: <User className="w-3.5 h-3.5 text-sky-600" />
        },
        {
          id: 'availability',
          label: 'Doctor Directory',
          icon: <Clock className="w-3.5 h-3.5 text-slate-500" />
        }
      ];
    }

    if (currentUser.role === 'doctor') {
      return [
        {
          id: 'approval',
          label: 'Doctor Approvals & Inbox',
          icon: <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />,
          badge: pendingApprovalsCount > 0 ? (
            <span className="inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-bold text-white bg-amber-600 rounded-full tabular-nums">
              {pendingApprovalsCount}
            </span>
          ) : undefined
        },
        {
          id: 'transfers',
          label: 'Transfers Queue',
          icon: <Send className="w-3.5 h-3.5 text-slate-500" />
        },
        {
          id: 'availability',
          label: 'Doctor Availability',
          icon: <Clock className="w-3.5 h-3.5 text-slate-500" />
        },
        {
          id: 'audit',
          label: 'Clinical Audit Trail',
          icon: <History className="w-3.5 h-3.5 text-slate-500" />
        }
      ];
    }

    // Admin / SecOps Role: Sees security monitoring and governance tools
    return [
      {
        id: 'dashboard',
        label: 'SecOps Dashboard',
        icon: <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
      },
      {
        id: 'transfers',
        label: 'Transfers Monitor',
        icon: <Send className="w-3.5 h-3.5 text-slate-500" />
      },
      {
        id: 'approval',
        label: 'Doctor Approvals',
        icon: <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />,
        badge: pendingApprovalsCount > 0 ? (
          <span className="inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-bold text-white bg-amber-600 rounded-full tabular-nums">
            {pendingApprovalsCount}
          </span>
        ) : undefined
      },
      {
        id: 'demo',
        label: 'Security Demo',
        accent: 'red',
        badge: (
          <span className="inline-flex items-center gap-1 text-[10px] bg-red-100 text-red-700 px-1.5 py-0.2 rounded font-bold border border-red-200">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
            Attack Lab
          </span>
        )
      },
      {
        id: 'audit',
        label: 'Audit Trail',
        icon: <History className="w-3.5 h-3.5 text-slate-500" />
      },
      {
        id: 'architecture',
        label: 'Architecture',
        icon: <Layers className="w-3.5 h-3.5 text-slate-500" />
      },
      {
        id: 'judge_guide',
        label: 'ASTRA Rubric',
        accent: 'amber',
        badge: (
          <span className="text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded font-bold border border-amber-300">
            Judge Guide
          </span>
        )
      }
    ];
  };

  const navLinks = getNavLinks();

  const getRoleTag = () => {
    if (!isLoggedIn) {
      return {
        title: 'Guest Overview',
        badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
        dotClass: 'bg-slate-400'
      };
    }

    switch (currentUser.role) {
      case 'patient':
        return {
          title: 'Patient Portal',
          badgeClass: 'bg-sky-50 text-sky-800 border-sky-300',
          dotClass: 'bg-sky-500'
        };
      case 'doctor':
        return {
          title: 'Doctor Portal',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          dotClass: 'bg-emerald-500'
        };
      default:
        return {
          title: 'SecOps Admin',
          badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-300',
          dotClass: 'bg-indigo-500'
        };
    }
  };

  const roleTag = getRoleTag();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Wordmark & Role Mode Pill */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => onSelectTab('landing')} 
              className="flex items-center gap-2.5 text-left group"
              title="Return to Doctor Find Overview"
            >
              <div className="w-9 h-9 rounded-xl bg-sky-600 flex items-center justify-center text-white shadow-xs group-hover:bg-sky-700 transition-colors">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <span className="text-base font-bold tracking-tight text-slate-900 group-hover:text-sky-700 transition-colors flex items-center gap-1.5">
                  Doctor Find
                </span>
                <span className="block text-[11px] font-medium text-slate-500 leading-tight">
                  ASTRA 2026 Testbed
                </span>
              </div>
            </button>

            {/* Current Role Mode Indicator Pill */}
            <div className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${roleTag.badgeClass}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${roleTag.dotClass}`} />
              <span>{roleTag.title}</span>
            </div>
          </div>

          {/* Zone 2: Role-Tailored Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-5 text-xs font-semibold">
            {navLinks.map(link => {
              const isActive = currentTab === link.id;
              const isRed = link.accent === 'red';
              const isAmber = link.accent === 'amber';

              return (
                <button
                  key={link.id}
                  onClick={() => onSelectTab(link.id)}
                  className={`transition-colors relative py-1 flex items-center gap-1.5 ${
                    isActive
                      ? isRed 
                        ? 'text-red-700 font-bold'
                        : isAmber
                        ? 'text-amber-800 font-bold'
                        : 'text-sky-700 font-bold'
                      : isRed
                      ? 'text-red-600 hover:text-red-700'
                      : isAmber
                      ? 'text-amber-700 hover:text-amber-800'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {link.icon}
                  <span>{link.label}</span>
                  {link.badge}
                  {isActive && (
                    <span 
                      className={`absolute -bottom-1 left-0 right-0 h-0.5 rounded-full ${
                        isRed ? 'bg-red-600' : isAmber ? 'bg-amber-600' : 'bg-sky-600'
                      }`} 
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Actions & User Logout */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Contextual primary action depending on role */}
            {isLoggedIn && currentUser.role === 'patient' && (
              <button
                onClick={() => onSelectTab('doctor_find')}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs transition-colors whitespace-nowrap"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Describe Problem</span>
              </button>
            )}

            {isLoggedIn && currentUser.role !== 'patient' && currentUser.verified && (
              <button
                onClick={onOpenNewTransfer}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-sky-700 hover:bg-sky-800 rounded-lg shadow-xs transition-colors whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Transfer</span>
              </button>
            )}

            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                {/* User Identity Chip (Profile switching removed - user switches via login) */}
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs">
                  <div className="w-6 h-6 rounded-full bg-slate-300 overflow-hidden flex items-center justify-center shrink-0">
                    {currentUser.avatarUrl ? (
                      <img 
                        src={currentUser.avatarUrl} 
                        alt={currentUser.name} 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <User className="w-3.5 h-3.5 text-slate-600" />
                    )}
                  </div>
                  <div className="text-left hidden sm:block leading-tight">
                    <div className="font-bold text-slate-900 flex items-center gap-1">
                      <span>{currentUser.name}</span>
                      {currentUser.verified ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertCircle className="w-3 h-3 text-red-600 shrink-0" />
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">
                      {currentUser.role.toUpperCase()} · {currentUser.hospitalName.split(' ')[0]}
                    </div>
                  </div>
                </div>

                {/* Dedicated Logout Button */}
                <button
                  type="button"
                  onClick={onLogout}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 transition-colors text-xs font-bold shadow-2xs"
                  title="Sign out of current role"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-600" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onSelectTab('login')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In / Select Role</span>
              </button>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-slate-200 space-y-1">
            <div className="px-2 pb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>{roleTag.title} Navigation</span>
              <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold border ${roleTag.badgeClass}`}>
                {isLoggedIn ? currentUser.role.toUpperCase() : 'GUEST'}
              </span>
            </div>

            {navLinks.map(link => (
              <button
                key={link.id}
                onClick={() => {
                  onSelectTab(link.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full px-3 py-2 rounded-lg text-left flex items-center justify-between text-xs font-semibold ${
                  currentTab === link.id
                    ? 'bg-sky-50 text-sky-800'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  {link.icon}
                  <span>{link.label}</span>
                </div>
                {link.badge}
              </button>
            ))}

            <div className="pt-2 border-t border-slate-100">
              {isLoggedIn ? (
                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-xs font-bold text-red-600 flex items-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    onSelectTab('login');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-xs font-bold text-sky-700 flex items-center gap-2"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
