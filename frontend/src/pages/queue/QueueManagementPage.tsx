import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Clock, Plus, PhoneCall, CheckCircle2, ArrowRight, ShieldAlert, AlertCircle, Search, UserCheck } from "lucide-react";
import { queueApi } from "../../api/queueApi";
import { patientApi } from "../../api/patientApi";
import { QueueStatus, QueueItem } from "../../types/queue";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Select } from "../../components/common/Select";
import { Badge } from "../../components/common/Badge";
import { Pagination } from "../../components/common/Pagination";
import { Spinner } from "../../components/common/Spinner";
import { EmptyState } from "../../components/common/EmptyState";
import { Modal } from "../../components/common/Modal";

export const QueueManagementPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState<number>(1);
  const [statusFilter, setStatusFilter] = useState<QueueStatus | "">("WAITING");

  // Check-In Modal state
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [checkInAppointmentId, setCheckInAppointmentId] = useState("");
  const [checkInPriority, setCheckInPriority] = useState("0");
  const [checkInError, setCheckInError] = useState<string | null>(null);

  // Priority Update Modal state
  const [priorityModalQueue, setPriorityModalQueue] = useState<QueueItem | null>(null);
  const [newPriority, setNewPriority] = useState<string>("0");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["queue-management-list", page, statusFilter],
    queryFn: () =>
      queueApi.list({
        page,
        limit: 10,
        status: (statusFilter as QueueStatus) || undefined,
      }),
    refetchInterval: 10000, // 10 second polling
  });

  // Query patients for check-in modal dropdown
  const { data: patientsData } = useQuery({
    queryKey: ["checkin-patients-list"],
    queryFn: () => patientApi.list({ limit: 50 }),
    enabled: isCheckInOpen,
  });

  // Query appointments for selected patient
  const { data: patientAppointments } = useQuery({
    queryKey: ["checkin-patient-appointments", selectedPatientId],
    queryFn: () => patientApi.getAppointments(selectedPatientId),
    enabled: isCheckInOpen && !!selectedPatientId,
  });

  const checkInMutation = useMutation({
    mutationFn: (payload: { appointmentId: string; priorityLevel?: number }) =>
      queueApi.checkIn(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["queue-management-list"] });
      setIsCheckInOpen(false);
      setCheckInAppointmentId("");
      setSelectedPatientId("");
    },
    onError: (err: any) => {
      setCheckInError(err.response?.data?.message || err.message || "Check-in failed");
    },
  });

  const callNextMutation = useMutation({
    mutationFn: (id: string) => queueApi.callNext(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["queue-management-list"] });
    },
  });

  const setStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: any }) =>
      queueApi.setStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["queue-management-list"] });
    },
  });

  const updatePriorityMutation = useMutation({
    mutationFn: ({ id, priorityLevel }: { id: string; priorityLevel: number }) =>
      queueApi.updatePriority(id, { priorityLevel }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["queue-management-list"] });
      setPriorityModalQueue(null);
    },
  });

  const handleCheckInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkInAppointmentId.trim()) {
      setCheckInError("Appointment UUID is required");
      return;
    }
    setCheckInError(null);
    checkInMutation.mutate({
      appointmentId: checkInAppointmentId.trim(),
      priorityLevel: Number(checkInPriority) || 0,
    });
  };

  const statusTabs: Array<{ label: string; value: QueueStatus | "" }> = [
    { label: "All Active", value: "" },
    { label: "Waiting", value: "WAITING" },
    { label: "Called", value: "CALLED" },
    { label: "In Consultation", value: "IN_CONSULTATION" },
    { label: "Completed", value: "COMPLETED" },
    { label: "Skipped", value: "SKIPPED" },
  ];

  const patients = patientsData?.data || [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Clock className="w-6 h-6 text-teal-600" />
            <span>Live Queue Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Check-in booked patients, manage queue statuses, call patients, and adjust emergency priorities in real time.
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setCheckInError(null);
            setIsCheckInOpen(true);
          }}
        >
          Check-In Patient
        </Button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {statusTabs.map((tab) => (
          <button
            key={tab.label}
            onClick={() => {
              setStatusFilter(tab.value);
              setPage(1);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              statusFilter === tab.value
                ? "bg-teal-600 text-white shadow-sm"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Queue Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {(() => {
          const queueItems = Array.isArray(data?.data)
            ? data.data
            : Array.isArray((data as any)?.items)
            ? (data as any).items
            : [];

          return (
            <>
              {isLoading ? (
                <div className="p-12 flex justify-center"><Spinner size="lg" /></div>
              ) : isError ? (
                <div className="p-8 text-center text-xs text-rose-500 font-medium">Failed to load live queue.</div>
              ) : queueItems.length === 0 ? (
                <EmptyState
                  title="Queue Empty"
                  description="There are no patients in the queue under this status tab."
                  action={
                    <Button size="sm" variant="primary" onClick={() => setIsCheckInOpen(true)}>
                      Check-In Patient
                    </Button>
                  }
                />
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                        <tr>
                          <th className="py-3 px-4">Token #</th>
                          <th className="py-3 px-4">Patient Name</th>
                          <th className="py-3 px-4">Doctor</th>
                          <th className="py-3 px-4">Priority</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {queueItems.map((q: any) => (
                          <tr key={q.id || Math.random()} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="py-3.5 px-4 font-black text-teal-600 dark:text-teal-400 text-sm">
                              #{q.tokenNumber}
                            </td>
                            <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                              {q.patient ? `${q.patient.firstName || ""} ${q.patient.lastName || ""}` : "Patient Record"}
                              {q.patient?.uhid && (
                                <div className="text-[10px] text-slate-400 font-mono">UHID: {q.patient.uhid}</div>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">
                              Dr. {q.doctor?.firstName || ""} {q.doctor?.lastName || "Staff"}
                            </td>
                            <td className="py-3.5 px-4">
                              <button
                                onClick={() => {
                                  setPriorityModalQueue(q);
                                  setNewPriority(String(q.priorityLevel ?? 0));
                                }}
                                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                  (q.priorityLevel ?? 0) > 0
                                    ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                                }`}
                                title="Click to change priority"
                              >
                                Level {q.priorityLevel ?? 0}
                              </button>
                            </td>
                            <td className="py-3.5 px-4">
                              <Badge variant={q.status ? (q.status.toLowerCase() as any) : "waiting"}>
                                {q.status || "WAITING"}
                              </Badge>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => callNextMutation.mutate(q.id)}
                                  className="p-1.5 rounded-lg text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950"
                                  title="Call Patient"
                                >
                                  <PhoneCall className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setStatusMutation.mutate({ id: q.id, status: "IN_CONSULTATION" })}
                                  className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950"
                                  title="Set In Consultation"
                                >
                                  <ArrowRight className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setStatusMutation.mutate({ id: q.id, status: "COMPLETED" })}
                                  className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                                  title="Set Completed"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setStatusMutation.mutate({ id: q.id, status: "SKIPPED" })}
                                  className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950"
                                  title="Set Skipped"
                                >
                                  <ShieldAlert className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <Pagination meta={data?.pagination || { page: 1, limit: 10, total: queueItems.length, totalPages: 1 }} onPageChange={(p) => setPage(p)} />
                </>
              )}
            </>
          );
        })()}
      </div>

      {/* Check-In Modal */}
      <Modal
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
        title="Check-In Patient to Queue"
        maxWidth="md"
      >
        <form onSubmit={handleCheckInSubmit} className="space-y-4">
          {checkInError && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{checkInError}</span>
            </div>
          )}

          {/* Select Patient */}
          {patients.length > 0 && (
            <Select
              label="Select Patient"
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              options={[
                { label: "-- Select Patient from Directory --", value: "" },
                ...patients.map((p) => ({
                  label: `${p.firstName} ${p.lastName} (${p.uhid})`,
                  value: p.id,
                })),
              ]}
            />
          )}

          {/* Patient's appointments dropdown */}
          {selectedPatientId && patientAppointments && patientAppointments.length > 0 && (
            <Select
              label="Select Appointment to Check-In"
              value={checkInAppointmentId}
              onChange={(e) => setCheckInAppointmentId(e.target.value)}
              options={[
                { label: "-- Select Booked Appointment --", value: "" },
                ...patientAppointments.map((a) => ({
                  label: `Token #${a.tokenNumber} - ${a.appointmentType} (${new Date(a.appointmentDate).toLocaleDateString()})`,
                  value: a.id,
                })),
              ]}
            />
          )}

          <Input
            label="Appointment UUID"
            placeholder="Enter valid Appointment UUID manually"
            value={checkInAppointmentId}
            onChange={(e) => setCheckInAppointmentId(e.target.value)}
          />

          <Input
            label="Priority Level (0 = Regular, Higher = Emergency)"
            type="number"
            min="0"
            max="100"
            value={checkInPriority}
            onChange={(e) => setCheckInPriority(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsCheckInOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={checkInMutation.isPending}>
              Confirm Check-In
            </Button>
          </div>
        </form>
      </Modal>

      {/* Priority Update Modal */}
      {priorityModalQueue && (
        <Modal
          isOpen={!!priorityModalQueue}
          onClose={() => setPriorityModalQueue(null)}
          title={`Update Priority — Token #${priorityModalQueue.tokenNumber}`}
          maxWidth="sm"
        >
          <div className="space-y-4">
            <Input
              label="Priority Level (0-100)"
              type="number"
              min="0"
              max="100"
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value)}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setPriorityModalQueue(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                isLoading={updatePriorityMutation.isPending}
                onClick={() =>
                  updatePriorityMutation.mutate({
                    id: priorityModalQueue.id,
                    priorityLevel: Number(newPriority) || 0,
                  })
                }
              >
                Save Priority
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default QueueManagementPage;
