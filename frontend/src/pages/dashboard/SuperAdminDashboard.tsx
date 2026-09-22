import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Building2, Stethoscope, Users, Activity, ArrowRight, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { hospitalApi } from "../../api/hospitalApi";
import { doctorApi } from "../../api/doctorApi";
import { patientApi } from "../../api/patientApi";
import { Badge } from "../../components/common/Badge";
import { Spinner } from "../../components/common/Spinner";

export const SuperAdminDashboard: React.FC = () => {
  const { data: hospitalsData, isLoading: hospitalsLoading } = useQuery({
    queryKey: ["hospitals-summary"],
    queryFn: () => hospitalApi.list({ limit: 5 }),
  });

  const { data: doctorsData, isLoading: doctorsLoading } = useQuery({
    queryKey: ["doctors-summary"],
    queryFn: () => doctorApi.list({ limit: 5 }),
  });

  const { data: patientsData, isLoading: patientsLoading } = useQuery({
    queryKey: ["patients-summary"],
    queryFn: () => patientApi.list({ limit: 5 }),
  });

  const hospitalList = Array.isArray(hospitalsData?.data)
    ? hospitalsData.data
    : Array.isArray((hospitalsData as any)?.items)
    ? (hospitalsData as any).items
    : [];

  const doctorList = Array.isArray(doctorsData?.data)
    ? doctorsData.data
    : Array.isArray((doctorsData as any)?.items)
    ? (doctorsData as any).items
    : [];

  const patientList = Array.isArray(patientsData?.data)
    ? patientsData.data
    : Array.isArray((patientsData as any)?.items)
    ? (patientsData as any).items
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-teal-900 via-slate-900 to-slate-900 p-6 rounded-2xl text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-teal-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400">System Command Center</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">Super Admin Dashboard</h2>
          <p className="text-xs text-slate-300 mt-1">Multi-hospital ecosystem overview & system operational health.</p>
        </div>
        <Link
          to="/hospitals"
          className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all"
        >
          <span>Manage Hospitals</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Hospitals</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {hospitalsLoading ? <Spinner size="sm" /> : hospitalsData?.pagination?.total ?? hospitalList.length}
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Registered Doctors</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {doctorsLoading ? <Spinner size="sm" /> : doctorsData?.pagination?.total ?? doctorList.length}
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Registered Patients</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {patientsLoading ? <Spinner size="sm" /> : patientsData?.pagination?.total ?? patientList.length}
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">System Status</p>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Operational
            </span>
          </div>
        </div>
      </div>

      {/* Overview Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hospitals Table */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-teal-600" />
              <span>Recent Hospitals</span>
            </h3>
            <Link to="/hospitals" className="text-xs font-semibold text-teal-600 hover:underline">
              View All
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-semibold uppercase">
                <tr>
                  <th className="p-2.5 rounded-l-lg">Hospital</th>
                  <th className="p-2.5">Type</th>
                  <th className="p-2.5 rounded-r-lg">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {hospitalList.map((h: any) => (
                  <tr key={h.id || Math.random()} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-2.5 font-semibold text-slate-900 dark:text-slate-100">{h.name || "Hospital"}</td>
                    <td className="p-2.5 text-slate-500 capitalize">{h.type ? String(h.type).toLowerCase() : "N/A"}</td>
                    <td className="p-2.5">
                      <Badge variant={h.status === "ACTIVE" ? "active" : "inactive"}>
                        {h.status || "ACTIVE"}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {hospitalList.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-4 text-center text-slate-400">
                      No hospitals registered yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Doctors Table */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-indigo-600" />
              <span>Doctor Directory Snapshot</span>
            </h3>
            <Link to="/doctors" className="text-xs font-semibold text-teal-600 hover:underline">
              View All
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-semibold uppercase">
                <tr>
                  <th className="p-2.5 rounded-l-lg">Doctor</th>
                  <th className="p-2.5">License</th>
                  <th className="p-2.5 rounded-r-lg">Availability</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {doctorList.map((d: any) => (
                  <tr key={d.id || Math.random()} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-2.5 font-semibold text-slate-900 dark:text-slate-100">
                      Dr. {d.firstName || ""} {d.lastName || ""}
                    </td>
                    <td className="p-2.5 text-slate-500">{d.licenseNumber || "N/A"}</td>
                    <td className="p-2.5">
                      <Badge variant={d.isAvailable ? "active" : "inactive"}>
                        {d.isAvailable ? "Available" : "Busy"}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {doctorList.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-4 text-center text-slate-400">
                      No doctors onboarded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
