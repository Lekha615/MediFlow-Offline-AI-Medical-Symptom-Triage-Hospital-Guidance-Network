import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Stethoscope, UserCheck, Clock, CheckCircle2, PhoneCall, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { doctorApi } from "../../api/doctorApi";
import { queueApi } from "../../api/queueApi";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { Spinner } from "../../components/common/Spinner";

export const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const doctorId = user?.doctor?.id || user?.doctor?.userId || (user as any)?.doctorId;

  const { data: queueData, isLoading: queueLoading } = useQuery({
    queryKey: ["doctor-queue", doctorId],
    queryFn: () => queueApi.list({ doctorId, status: "WAITING" }),
    enabled: !!doctorId,
    refetchInterval: 10000,
  });

  const { data: currentDoc, isLoading: docLoading } = useQuery({
    queryKey: ["doctor-profile", doctorId],
    queryFn: () => doctorApi.getById(doctorId!),
    enabled: !!doctorId,
  });

  const availabilityMutation = useMutation({
    mutationFn: (isAvailable: boolean) => doctorApi.setAvailability(doctorId!, isAvailable),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-profile", doctorId] });
    },
  });

  const callNextMutation = useMutation({
    mutationFn: (queueId: string) => queueApi.callNext(queueId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-queue", doctorId] });
    },
  });

  const setStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: any }) =>
      queueApi.setStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-queue", doctorId] });
    },
  });

  const queueItems = Array.isArray(queueData?.data)
    ? queueData.data
    : Array.isArray((queueData as any)?.items)
    ? (queueData as any).items
    : [];

  const nextPatient = queueItems[0];
  const totalWaiting = queueData?.pagination?.total ?? queueItems.length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Availability Toggle */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 p-6 rounded-2xl text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Stethoscope className="w-5 h-5 text-teal-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400">Doctor Portal</span>
          </div>
          <h2 className="text-2xl font-black">
            Welcome, Dr. {user?.doctor?.firstName || user?.email || "Practitioner"}
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            License: {user?.doctor?.licenseNumber || "N/A"} • Qualification: {user?.doctor?.qualification || "General Practitioner"}
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10">
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-slate-300 font-bold">Consulting Status</p>
            <p className="text-xs font-bold text-teal-300">
              {docLoading ? "..." : currentDoc?.isAvailable ? "Available for Patients" : "Unavailable / Away"}
            </p>
          </div>
          <Button
            size="sm"
            variant={currentDoc?.isAvailable ? "danger" : "primary"}
            isLoading={availabilityMutation.isPending}
            disabled={!doctorId}
            onClick={() => availabilityMutation.mutate(!currentDoc?.isAvailable)}
          >
            {currentDoc?.isAvailable ? "Set Unavailable" : "Set Available"}
          </Button>
        </div>
      </div>

      {/* Active Consultation Hero Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-teal-600" />
              <span>Next Patient In Queue</span>
            </h3>
            <Badge variant="waiting">{totalWaiting} Waiting</Badge>
          </div>

          {queueLoading ? (
            <div className="p-8 flex justify-center"><Spinner /></div>
          ) : nextPatient ? (
            <div className="bg-teal-50/50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900/50 p-5 rounded-xl space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-2xl font-black text-teal-600 dark:text-teal-400">
                    Token #{nextPatient.tokenNumber}
                  </span>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
                    {nextPatient.patient ? `${nextPatient.patient.firstName || ""} ${nextPatient.patient.lastName || ""}` : "Patient"}
                  </h4>
                  <p className="text-xs text-slate-500">
                    UHID: {nextPatient.patient?.uhid || "N/A"} • Priority Level: {nextPatient.priorityLevel ?? 0}
                  </p>
                </div>
                <Badge variant={nextPatient.status ? (nextPatient.status.toLowerCase() as any) : "waiting"}>
                  {nextPatient.status || "WAITING"}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-2 pt-2 border-t border-teal-200/60 dark:border-teal-900/40">
                <Button
                  size="sm"
                  variant="primary"
                  leftIcon={<PhoneCall className="w-4 h-4" />}
                  isLoading={callNextMutation.isPending}
                  onClick={() => callNextMutation.mutate(nextPatient.id)}
                >
                  Call Patient
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setStatusMutation.mutate({ id: nextPatient.id, status: "IN_CONSULTATION" })}
                >
                  Start Consultation
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  onClick={() => setStatusMutation.mutate({ id: nextPatient.id, status: "COMPLETED" })}
                >
                  Mark Complete
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-rose-600 hover:bg-rose-50"
                  onClick={() => setStatusMutation.mutate({ id: nextPatient.id, status: "SKIPPED" })}
                >
                  Skip
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-500">No patients waiting in queue.</p>
            </div>
          )}
        </div>

        {/* Doctor Stats Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>Shift Summary</span>
          </h3>

          <div className="space-y-3">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Patients Waiting</span>
              <span className="text-base font-black text-slate-900 dark:text-slate-100">
                {totalWaiting}
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Consultation Fee</span>
              <span className="text-base font-black text-teal-600 dark:text-teal-400">
                ₹{user?.doctor?.consultationFee || "0.00"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
