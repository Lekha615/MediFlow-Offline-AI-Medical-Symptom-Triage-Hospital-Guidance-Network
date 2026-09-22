import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Stethoscope,
  Building2,
  Clock,
  Users,
  UserCheck,
  ArrowRight,
  Activity,
  HeartPulse,
  Lock,
  ChevronRight,
  FlaskConical,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/common/Button";

export const LandingPage: React.FC = () => {
  const { isAuthenticated, role } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-teal-500 selection:text-white">
      {/* Navbar Header */}
      <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-teal-600/30">
            M
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white">
            Medi<span className="text-teal-400">Flow</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Button
              variant="primary"
              rightIcon={<ArrowRight className="w-4 h-4" />}
              onClick={() => navigate("/dashboard")}
            >
              Go to My Dashboard ({role})
            </Button>
          ) : (
            <>
              <Link
                to="/login"
                className="text-xs font-bold text-slate-300 hover:text-white px-3 py-2 transition-colors"
              >
                Sign In
              </Link>
              <Link to="/register">
                <Button size="sm" variant="primary">
                  Patient Self-Register
                </Button>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-12 space-y-12 flex-1">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-bold uppercase tracking-wider">
            <Activity className="w-4 h-4 animate-pulse text-teal-400" />
            <span>Next-Gen Healthcare Operations & Patient Portal</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tight">
            Streamlined Patient Triage & <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-sky-400 to-indigo-400">
              Live Hospital Queue Operations
            </span>
          </h1>

          <p className="text-sm md:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            MediFlow unifies patient symptom triage, hospital guidance, live consultation queues, and multi-role staff administration under one platform.
          </p>
        </div>

        {/* Dual Entry Pathways */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Patient Portal Card */}
          <div className="bg-gradient-to-br from-teal-950/60 via-slate-900 to-slate-900 border border-teal-500/30 p-8 rounded-3xl shadow-xl flex flex-col justify-between space-y-6 hover:border-teal-500/60 transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-500/40 text-teal-400 flex items-center justify-center">
                <HeartPulse className="w-6 h-6" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                  Patient Services Portal
                </span>
                <h2 className="text-2xl font-black text-white mt-1">
                  For Patients & Seekers
                </h2>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Assess symptoms, find specialists, view hospital guidance, track live queue positions, and manage appointment bookings.
                </p>
              </div>

              <div className="space-y-2 pt-2 text-xs text-slate-300">
                <div className="flex items-center gap-2.5">
                  <Stethoscope className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Clinical Symptom Assessment & Urgency Guidance</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Hospital & Specialist Discovery Directory</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Live 10-Second Auto-Polling Queue Tracker</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-2">
              <Link to="/register">
                <Button variant="primary" size="lg" className="w-full" rightIcon={<ChevronRight className="w-4 h-4" />}>
                  Register Patient Account
                </Button>
              </Link>
              <Link to="/login" className="block text-center text-xs font-semibold text-teal-400 hover:underline pt-1">
                Already have a patient account? Sign In
              </Link>
            </div>
          </div>

          {/* Healthcare Staff Portal Card */}
          <div className="bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-500/30 p-8 rounded-3xl shadow-xl flex flex-col justify-between space-y-6 hover:border-indigo-500/60 transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                  Healthcare Staff Portal
                </span>
                <h2 className="text-2xl font-black text-white mt-1">
                  For Staff & Administrators
                </h2>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Role-based command centers for Doctors, Receptionists, Hospital Admins, System Super Admins, and Lab Technicians.
                </p>
              </div>

              <div className="space-y-2 pt-2 text-xs text-slate-300">
                <div className="flex items-center gap-2.5">
                  <UserCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Doctor Dashboard: Next Patient Caller & Availability Toggle</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Reception Desk: Walk-in Patient Check-In & Token Generation</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Hospital Admin & Super Admin Management</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-2">
              <Link to="/login">
                <Button variant="secondary" size="lg" className="w-full" rightIcon={<ChevronRight className="w-4 h-4" />}>
                  Healthcare Staff Sign In
                </Button>
              </Link>
              <p className="text-[11px] text-center text-slate-500 pt-1">
                Staff credentials are provisioned by Hospital Administration.
              </p>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-slate-800/80 text-center text-xs">
          <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800">
            <span className="text-xl font-black text-teal-400">6 Roles</span>
            <p className="text-slate-400 mt-0.5 font-medium">Role-Based Access Control</p>
          </div>
          <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800">
            <span className="text-xl font-black text-sky-400">10s Sync</span>
            <p className="text-slate-400 mt-0.5 font-medium">Real-Time Queue Polling</p>
          </div>
          <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800">
            <span className="text-xl font-black text-indigo-400">UHID</span>
            <p className="text-slate-400 mt-0.5 font-medium">Unique Health Identifier</p>
          </div>
          <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800">
            <span className="text-xl font-black text-teal-400">JWT Auth</span>
            <p className="text-slate-400 mt-0.5 font-medium">Secure Bearer Sessions</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} MediFlow Platform. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
