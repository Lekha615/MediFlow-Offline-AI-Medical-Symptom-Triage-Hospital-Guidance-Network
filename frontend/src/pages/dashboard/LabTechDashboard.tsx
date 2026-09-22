import React from "react";
import { FlaskConical, Users, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../../components/common/Button";

export const LabTechDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-violet-900 via-slate-900 to-indigo-950 p-6 rounded-2xl text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FlaskConical className="w-5 h-5 text-violet-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-violet-400">Laboratory Operations</span>
          </div>
          <h2 className="text-2xl font-black">Lab Technician Dashboard</h2>
          <p className="text-xs text-slate-300 mt-1">Access patient profiles and laboratory diagnostic records.</p>
        </div>
        <Link to="/patients">
          <Button size="sm" variant="primary" leftIcon={<Users className="w-4 h-4" />}>
            Patient Directory
          </Button>
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Lab Diagnostic Services</h3>
        <p className="text-xs text-slate-500">
          Use the Patient Directory menu to search for patients, look up UHIDs, and access health records.
        </p>
        <Link to="/patients" className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 hover:underline">
          <span>Search Patients</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
