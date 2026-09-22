import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Stethoscope, Users, Clock, Building2, Plus, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { doctorApi } from "../../api/doctorApi";
import { patientApi } from "../../api/patientApi";
import { queueApi } from "../../api/queueApi";
import { Button } from "../../components/common/Button";

export const HospitalAdminDashboard: React.FC = () => {
  const { data: doctors } = useQuery({
    queryKey: ["hospital-doctors-count"],
    queryFn: () => doctorApi.list({ limit: 5 }),
  });

  const { data: patients } = useQuery({
    queryKey: ["hospital-patients-count"],
    queryFn: () => patientApi.list({ limit: 5 }),
  });

  const { data: queueItems } = useQuery({
    queryKey: ["hospital-queue-count"],
    queryFn: () => queueApi.list({ limit: 5 }),
  });

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-teal-800 to-slate-900 p-6 rounded-2xl text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-5 h-5 text-teal-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400">Hospital Control</span>
          </div>
          <h2 className="text-2xl font-black">Hospital Operations Dashboard</h2>
          <p className="text-xs text-slate-300 mt-1">Manage staff, patient queues, and clinical activity.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/doctors">
            <Button size="sm" variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
              Add Doctor
            </Button>
          </Link>
          <Link to="/queue">
            <Button size="sm" variant="outline" className="text-white border-slate-600 hover:bg-slate-800">
              Manage Queue
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Active Doctors</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {doctors?.pagination.total || 0}
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Queue Entries</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {queueItems?.pagination.total || 0}
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Registered Patients</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {patients?.pagination.total || 0}
            </h3>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Active Queue Summary</h3>
          <Link to="/queue" className="text-xs font-semibold text-teal-600 hover:underline flex items-center gap-1">
            <span>View Live Board</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {(() => {
            const activeQueue = Array.isArray(queueItems?.data)
              ? queueItems.data
              : Array.isArray((queueItems as any)?.items)
              ? (queueItems as any).items
              : [];

            return (
              <>
                {activeQueue.slice(0, 4).map((q: any) => (
                  <div key={q.id || Math.random()} className="py-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950 px-2.5 py-1 rounded-lg">
                        #{q.tokenNumber}
                      </span>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-slate-100">
                          {q.patient ? `${q.patient.firstName || ""} ${q.patient.lastName || ""}` : "Patient"}
                        </p>
                        <p className="text-slate-400 text-[11px]">
                          Doctor: Dr. {q.doctor?.firstName || ""} {q.doctor?.lastName || "Staff"}
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {q.status || "WAITING"}
                    </span>
                  </div>
                ))}
                {activeQueue.length === 0 && (
                  <p className="py-6 text-center text-xs text-slate-400">No active queue entries right now.</p>
                )}
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
};
