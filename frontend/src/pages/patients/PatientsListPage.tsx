import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, Search, Eye, Calendar, Clock } from "lucide-react";
import { patientApi } from "../../api/patientApi";
import { Patient } from "../../types/patient";
import { Input } from "../../components/common/Input";
import { Badge } from "../../components/common/Badge";
import { Pagination } from "../../components/common/Pagination";
import { Spinner } from "../../components/common/Spinner";
import { EmptyState } from "../../components/common/EmptyState";
import { Modal } from "../../components/common/Modal";

export const PatientsListPage: React.FC = () => {
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["patients-list", page, search],
    queryFn: () =>
      patientApi.list({
        page,
        limit: 10,
        search: search || undefined,
      }),
  });

  const { data: patientAppointments } = useQuery({
    queryKey: ["patient-appointments-detail", selectedPatient?.id],
    queryFn: () => patientApi.getAppointments(selectedPatient!.id),
    enabled: !!selectedPatient,
  });

  const { data: patientQueue } = useQuery({
    queryKey: ["patient-queue-detail", selectedPatient?.id],
    queryFn: () => patientApi.getQueueHistory(selectedPatient!.id),
    enabled: !!selectedPatient,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Users className="w-6 h-6 text-teal-600" />
          <span>Patient Directory</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Search patient records, lookup Unique Health IDs (UHID), and inspect patient appointment history.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <Input
          placeholder="Search by UHID, patient name, or phone number..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          leftIcon={<Search className="w-4 h-4" />}
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {(() => {
          const patientList = Array.isArray(data?.data)
            ? data.data
            : Array.isArray((data as any)?.items)
            ? (data as any).items
            : [];

          return (
            <>
              {isLoading ? (
                <div className="p-12 flex justify-center"><Spinner size="lg" /></div>
              ) : isError ? (
                <div className="p-8 text-center text-xs text-rose-500 font-medium">Failed to load patients directory. Please try again.</div>
              ) : patientList.length === 0 ? (
                <EmptyState
                  title="No Patients Found"
                  description="No patient records found matching your search term."
                />
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                        <tr>
                          <th className="py-3 px-4">UHID</th>
                          <th className="py-3 px-4">Patient Name</th>
                          <th className="py-3 px-4">Gender & DOB</th>
                          <th className="py-3 px-4">Contact</th>
                          <th className="py-3 px-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {patientList.map((p: any) => {
                          const genderDisplay = p?.gender ? String(p.gender).toLowerCase() : "N/A";
                          return (
                            <tr key={p.id || Math.random()} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                              <td className="py-3.5 px-4 font-mono font-bold text-teal-600 dark:text-teal-400">
                                {p.uhid || "N/A"}
                              </td>
                              <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                                {p.firstName || "Unnamed"} {p.lastName || "Patient"}
                              </td>
                              <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 capitalize">
                                {genderDisplay} • {p.dateOfBirth ? new Date(p.dateOfBirth).toLocaleDateString() : "N/A"}
                              </td>
                              <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                                {p.user?.phoneNumber || "N/A"}
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                <button
                                  onClick={() => setSelectedPatient(p)}
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-teal-600 hover:bg-slate-100 dark:hover:bg-slate-800 inline-flex items-center gap-1 text-xs font-semibold"
                                >
                                  <Eye className="w-4 h-4" />
                                  <span>View Profile</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <Pagination meta={data?.pagination || { page: 1, limit: 10, total: patientList.length, totalPages: 1 }} onPageChange={(p) => setPage(p)} />
                </>
              )}
            </>
          );
        })()}
      </div>

      {/* Patient Detail Modal */}
      {selectedPatient && (
        <Modal
          isOpen={!!selectedPatient}
          onClose={() => setSelectedPatient(null)}
          title={`Patient Record — ${selectedPatient.firstName || ""} ${selectedPatient.lastName || ""}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400">UHID:</span>{" "}
                  <strong className="font-mono text-teal-600">{selectedPatient.uhid || "N/A"}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Gender:</span>{" "}
                  <strong className="capitalize">{selectedPatient.gender ? String(selectedPatient.gender).toLowerCase() : "N/A"}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Date of Birth:</span>{" "}
                  <strong>{selectedPatient.dateOfBirth ? new Date(selectedPatient.dateOfBirth).toLocaleDateString() : "N/A"}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Blood Group:</span>{" "}
                  <strong>{selectedPatient.bloodGroup || "N/A"}</strong>
                </div>
              </div>
              {selectedPatient.address && (
                <div className="pt-1 text-slate-500">
                  Address: {selectedPatient.address}
                </div>
              )}
            </div>

            {/* Appointments Tab */}
            <div>
              <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 mb-2">
                <Calendar className="w-4 h-4 text-teal-600" />
                <span>Appointment Records</span>
              </h4>

              {(() => {
                const appList = Array.isArray(patientAppointments)
                  ? patientAppointments
                  : Array.isArray((patientAppointments as any)?.data)
                  ? (patientAppointments as any).data
                  : [];

                return (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-48 overflow-y-auto">
                    {appList.map((a: any) => (
                      <div key={a.id || Math.random()} className="py-2 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">
                            Token #{a.tokenNumber} ({a.appointmentType || "Standard"})
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Date: {a.appointmentDate ? new Date(a.appointmentDate).toLocaleDateString() : "N/A"}
                          </p>
                        </div>
                        <Badge variant={a.status === "BOOKED" ? "waiting" : "completed"}>
                          {a.status || "BOOKED"}
                        </Badge>
                      </div>
                    ))}
                    {appList.length === 0 && (
                      <p className="text-slate-400 py-2 text-center">No appointment history.</p>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
