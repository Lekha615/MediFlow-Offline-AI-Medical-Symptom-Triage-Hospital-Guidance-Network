import React from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarCheck, Clock, Stethoscope, Building2, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { patientApi } from "../../api/patientApi";
import { Badge } from "../../components/common/Badge";
import { Spinner } from "../../components/common/Spinner";
import { EmptyState } from "../../components/common/EmptyState";

export const AppointmentsPage: React.FC = () => {
  const { user } = useAuth();
  const patientId = user?.patient?.id;

  const { data: appointments, isLoading, isError } = useQuery({
    queryKey: ["patient-appointments-page", patientId],
    queryFn: () => patientApi.getAppointments(patientId!),
    enabled: !!patientId,
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 p-6 rounded-2xl text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CalendarCheck className="w-5 h-5 text-teal-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
              Patient Portal
            </span>
          </div>
          <h1 className="text-2xl font-black">My Medical Appointments</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Track upcoming consultations, past visits, and token booking history.
          </p>
        </div>

        {user?.patient?.uhid && (
          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-right">
            <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">Patient UHID</p>
            <p className="font-mono text-sm font-bold text-teal-300">{user.patient.uhid}</p>
          </div>
        )}
      </div>

      {/* Appointments Content */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
        {(() => {
          const appointmentList = Array.isArray(appointments)
            ? appointments
            : Array.isArray((appointments as any)?.data)
            ? (appointments as any).data
            : [];

          return (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-teal-600" />
                  <span>Consultation Schedule</span>
                </h3>

                <Badge variant="waiting">{appointmentList.length} Total Bookings</Badge>
              </div>

              {isLoading ? (
                <div className="p-12 flex justify-center">
                  <Spinner size="lg" />
                </div>
              ) : isError ? (
                <div className="p-6 text-center text-xs text-rose-500 font-semibold flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>Failed to load appointment records.</span>
                </div>
              ) : appointmentList.length === 0 ? (
                <EmptyState
                  title="No Appointments Found"
                  description="You have no recorded appointments in the system."
                />
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {appointmentList.map((app: any) => (
                    <div
                      key={app.id || Math.random()}
                      className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 p-3 rounded-xl transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="text-base font-black text-teal-600 dark:text-teal-400">
                            Token #{app.tokenNumber}
                          </span>
                          <Badge variant={app.status === "BOOKED" ? "waiting" : "completed"}>
                            {app.status || "BOOKED"}
                          </Badge>
                        </div>

                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Date: {app.appointmentDate ? new Date(app.appointmentDate).toLocaleDateString() : "N/A"} • {app.appointmentType || "Standard Consultation"}
                        </p>

                        <div className="flex flex-wrap gap-4 text-xs text-slate-500 pt-1">
                          {app.doctor && (
                            <span className="flex items-center gap-1.5">
                              <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                              Dr. {app.doctor.firstName} {app.doctor.lastName}
                            </span>
                          )}

                          {app.hospital && (
                            <span className="flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5 text-slate-400" />
                              {app.hospital.name}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right text-xs">
                        <span className="text-slate-500 font-medium">Confirmed</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          );
        })()}
      </div>
    </div>
  );
};

export default AppointmentsPage;
