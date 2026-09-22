import React from "react";

export type BadgeVariant =
  | "active"
  | "inactive"
  | "suspended"
  | "waiting"
  | "called"
  | "consultation"
  | "skipped"
  | "completed"
  | "patient"
  | "doctor"
  | "admin"
  | "receptionist"
  | "neutral";

export interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant = "neutral", children, className = "" }) => {
  const styles: Record<BadgeVariant, string> = {
    active: "bg-emerald-100 text-emerald-800 border-emerald-200",
    inactive: "bg-slate-100 text-slate-700 border-slate-200",
    suspended: "bg-amber-100 text-amber-800 border-amber-200",
    waiting: "bg-blue-100 text-blue-800 border-blue-200",
    called: "bg-purple-100 text-purple-800 border-purple-200 animate-pulse",
    consultation: "bg-teal-100 text-teal-800 border-teal-200",
    skipped: "bg-rose-100 text-rose-800 border-rose-200",
    completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
    patient: "bg-cyan-100 text-cyan-800 border-cyan-200",
    doctor: "bg-indigo-100 text-indigo-800 border-indigo-200",
    admin: "bg-violet-100 text-violet-800 border-violet-200",
    receptionist: "bg-orange-100 text-orange-800 border-orange-200",
    neutral: "bg-slate-100 text-slate-800 border-slate-200",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
