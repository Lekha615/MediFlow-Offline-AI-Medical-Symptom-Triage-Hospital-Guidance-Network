import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Clock,
  Calendar,
  ShieldCheck,
  Activity,
  RefreshCw,
  Stethoscope,
  Building2,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { queueApi } from "../../api/queueApi";
import { patientApi } from "../../api/patientApi";
import { Badge } from "../../components/common/Badge";
import { Spinner } from "../../components/common/Spinner";
import { Button } from "../../components/common/Button";

export const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const [countdown, setCountdown] = useState<number>(10);

  const { data: queuePosition, isLoading: queueLoading } = useQuery({
    queryKey: ["patient-my-position"],
    queryFn: () => queueApi.getMyPosition(),
    refetchInterval: 10000,
  });

  const { data: appointments } = useQuery({
    queryKey: ["patient-appointments", user?.patient?.id],
    queryFn: () => patientApi.getAppointments(user?.patient?.id!),
    enabled: !!user?.patient?.id,
  });

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 10 : prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Patient Welcome Hero */}
      <div className="bg-gradient-to-r from-teal-800 via-slate-900 to-teal-950 p-6 rounded-2xl text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-teal-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
              Patient Health Portal
            </span>
          </div>
          <h2 className="text-2xl font-black">
            Welcome, {user?.patient?.firstName || user?.email}
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            UHID:{" "}
            <span className="font-mono text-teal-300 font-bold">
              {user?.patient?.uhid || "Generating..."}
            </span>
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 text-right">
          <p className="text-[10px] text-slate-300 uppercase tracking-wider font-bold">
            Gender & DOB
          </p>
          <p className="text-xs font-semibold text-teal-300">
            {user?.patient?.gender || "N/A"} •{" "}
            {user?.patient?.dateOfBirth
              ? new Date(user.patient.dateOfBirth).toLocaleDateString()
              : "N/A"}
          </p>
        </div>
      </div>

      {/* Quick Care Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to="/triage"
          className="bg-gradient-to-br from-teal-500/10 to-indigo-500/10 dark:from-teal-950/40 dark:to-indigo-950/40 p-5 rounded-2xl border border-teal-500/20 shadow-xs hover:shadow-md transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-teal-600 text-white shadow-sm">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-teal-600 transition-colors">
                AI Symptom Triage
              </h3>
              <p className="text-xs text-slate-500">
                Check symptoms, assess urgency, and get guidance
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          to="/guidance"
          className="bg-gradient-to-br from-sky-500/10 to-teal-500/10 dark:from-sky-950/40 dark:to-teal-950/40 p-5 rounded-2xl border border-sky-500/20 shadow-xs hover:shadow-md transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-sky-600 text-white shadow-sm">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-sky-600 transition-colors">
                Hospital Guidance
              </h3>
              <p className="text-xs text-slate-500">
                Discover hospitals, specialists, and departments
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-sky-600 group-hover:translate-x-1 transition-all" />
        </Link>
      </div>

      {/* Live Queue Position Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-teal-600 animate-pulse" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Live Consultation Queue Tracker
            </h3>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-600" />
            <span>
              Auto-refreshing in{" "}
              <strong className="text-teal-600 dark:text-teal-400">
                {countdown}s
              </strong>
            </span>
          </div>
        </div>

        {queueLoading ? (
          <div className="p-8 flex justify-center">
            <Spinner />
          </div>
        ) : queuePosition?.inQueue && queuePosition.queueItem ? (
          <div className="bg-gradient-to-br from-teal-500/10 via-slate-900/5 to-teal-500/5 p-6 rounded-xl border border-teal-500/30 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-teal-600 dark:text-teal-400">
                  Your Assigned Token Number
                </span>
                <h4 className="text-4xl font-black text-slate-900 dark:text-slate-100 mt-1">
                  #{queuePosition.queueItem.tokenNumber}
                </h4>
              </div>

              <Badge
                variant={queuePosition.queueItem.status.toLowerCase() as any}
                className="text-sm px-4 py-1.5 self-start sm:self-center"
              >
                Status: {queuePosition.queueItem.status}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-teal-500/20">
              <div className="p-3 bg-white dark:bg-slate-800/60 rounded-lg">
                <p className="text-[11px] font-semibold text-slate-500">
                  Patients Ahead of You
                </p>
                <p className="text-xl font-black text-slate-900 dark:text-slate-100">
                  {queuePosition.waitingAhead ?? 0}
                </p>
              </div>

              <div className="p-3 bg-white dark:bg-slate-800/60 rounded-lg">
                <p className="text-[11px] font-semibold text-slate-500">
                  Estimated Wait Time
                </p>
                <p className="text-xl font-black text-teal-600 dark:text-teal-400">
                  ~{queuePosition.estimatedWaitMinutes ?? 0} mins
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
            <Clock className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              You are not currently in any queue
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              When you check in for an appointment at the hospital desk, your
              real-time queue position will appear here automatically.
            </p>
          </div>
        )}
      </div>

      {/* Appointments List */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-teal-600" />
            <span>My Recent Appointments</span>
          </h3>

          <Link
            to="/appointments"
            className="text-xs font-semibold text-teal-600 hover:underline flex items-center gap-1"
          >
            View All
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {(() => {
          const appointmentList = Array.isArray(appointments)
            ? appointments
            : Array.isArray((appointments as any)?.data)
            ? (appointments as any).data
            : [];

          return (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {appointmentList.map((app: any) => (
                <div
                  key={app.id || Math.random()}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div>
                    <p className="font-bold text-slate-900 dark:text-slate-100">
                      Appointment Token: #{app.tokenNumber} • {app.appointmentType || "Consultation"}
                    </p>
                    <p className="text-slate-500">
                      Date: {app.appointmentDate ? new Date(app.appointmentDate).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                  <Badge
                    variant={app.status === "BOOKED" ? "waiting" : "completed"}
                  >
                    {app.status || "BOOKED"}
                  </Badge>
                </div>
              ))}
              {appointmentList.length === 0 && (
                <p className="py-6 text-center text-xs text-slate-400">
                  No appointment history found.
                </p>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default PatientDashboard;
