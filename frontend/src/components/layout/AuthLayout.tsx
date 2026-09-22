import React from "react";
import { ThemeToggle } from "../common/ThemeToggle";
import { LanguageSelector } from "../common/LanguageSelector";

export interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ title, subtitle, children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Dynamic Background Blurs */}
      <div className="absolute top-1/4 left-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <LanguageSelector variant="auth" />
        <ThemeToggle />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-teal-500 text-white font-black text-2xl shadow-lg shadow-teal-500/30 mb-3">
          M
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Medi<span className="text-teal-400">Flow</span>
        </h1>
        <p className="mt-2 text-sm text-slate-300 font-medium">{title}</p>
        {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4 sm:px-0">
        <div className="glass-panel py-8 px-6 sm:px-10 rounded-2xl shadow-2xl backdrop-blur-xl border border-slate-700/50">
          {children}
        </div>
      </div>
    </div>
  );
};
