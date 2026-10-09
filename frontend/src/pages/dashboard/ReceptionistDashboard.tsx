import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { UserCheck, Clock, Plus, Search, ArrowRight, FileText, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import { queueApi } from "../../api/queueApi";
import { patientApi } from "../../api/patientApi";
import { Button } from "../../components/common/Button";
import { ReceptionistDocCaptureModal } from "../../components/documents/ReceptionistDocCaptureModal";

export const ReceptionistDashboard: React.FC = () => {
  const [selectedPatientForCapture, setSelectedPatientForCapture] = useState<any>(null);

  const { data: queueItems } = useQuery({
    queryKey: ["receptionist-queue"],
    queryFn: () => queueApi.list({ limit: 5 }),
  });

  const { data: patients } = useQuery({
    queryKey: ["receptionist-patients"],
    queryFn: () => patientApi.list({ limit: 5 }),
  });

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-orange-900 via-slate-900 to-teal-950 p-6 rounded-2xl text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <UserCheck className="w-5 h-5 text-orange-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-orange-400">Reception Desk</span>
          </div>
          <h2 className="text-2xl font-black">Front Desk Command Center</h2>
          <p className="text-xs text-slate-300 mt-1">Check in walk-in patients, manage queue tickets, attach documents & search directory.</p>
        </div>
        <Link to="/queue">
          <Button size="sm" variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
            Check-In Patient
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Live Active Queue</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {queueItems?.pagination?.total || 0}
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Total Registered Patients</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {patients?.pagination?.total || 0}
            </h3>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Live Queue Tokens & Document Attachment</h3>
          <Link to="/queue" className="text-xs font-semibold text-teal-600 hover:underline flex items-center gap-1">
            <span>Manage All Queues</span>
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
                {activeQueue.map((item: any) => (
                  <div key={item.id || Math.random()} className="py-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950 px-2.5 py-1 rounded-lg">
                        Token #{item.tokenNumber}
                      </span>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-slate-100">
                          {item.patient ? `${item.patient.firstName || ""} ${item.patient.lastName || ""}` : "Patient"}
                        </p>
                        <p className="text-slate-400 text-[11px]">
                          UHID: {item.patient?.uhid || "N/A"} • Doctor: Dr. {item.doctor?.firstName || ""} {item.doctor?.lastName || "Staff"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.patient && (
                        <Button
                          size="sm"
                          variant="outline"
                          leftIcon={<Upload className="w-3.5 h-3.5 text-orange-500" />}
                          onClick={() => setSelectedPatientForCapture(item.patient)}
                        >
                          Attach Doc/Photo
                        </Button>
                      )}
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                        {item.status || "WAITING"}
                      </span>
                    </div>
                  </div>
                ))}
                {activeQueue.length === 0 && (
                  <p className="py-6 text-center text-xs text-slate-400">No active queue entries.</p>
                )}
              </>
            );
          })()}
        </div>
      </div>

      {selectedPatientForCapture && (
        <ReceptionistDocCaptureModal
          isOpen={!!selectedPatientForCapture}
          onClose={() => setSelectedPatientForCapture(null)}
          patientId={selectedPatientForCapture.id}
          patientName={`${selectedPatientForCapture.firstName || ""} ${selectedPatientForCapture.lastName || ""}`}
          uhid={selectedPatientForCapture.uhid || "N/A"}
        />
      )}
    </div>
  );
};
