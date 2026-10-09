import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FileText,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Activity,
  Pill,
  Check,
  Eye,
  Lock,
  Sparkles,
  ExternalLink,
  Info,
} from "lucide-react";
import { documentApi, MedicalDocumentRecord } from "../../api/documentApi";
import { Button } from "../common/Button";
import { Badge } from "../common/Badge";
import { Spinner } from "../common/Spinner";
import { Modal } from "../common/Modal";

interface PatientMedicalHistorySectionProps {
  patientId: string;
  patientName?: string;
  isDoctorView?: boolean;
}

export const PatientMedicalHistorySection: React.FC<PatientMedicalHistorySectionProps> = ({
  patientId,
  patientName,
  isDoctorView = true,
}) => {
  const queryClient = useQueryClient();
  const [selectedDoc, setSelectedDoc] = useState<MedicalDocumentRecord | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [doctorNotes, setDoctorNotes] = useState("");
  const [editedData, setEditedData] = useState<any>(null);

  const { data: docData, isLoading } = useQuery({
    queryKey: ["patient-documents-intelligence", patientId],
    queryFn: () => documentApi.getByPatient(patientId),
    enabled: !!patientId,
  });

  const doctorVerifyMutation = useMutation({
    mutationFn: ({ docId, payload }: { docId: string; payload: any }) =>
      documentApi.doctorVerify(docId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient-documents-intelligence", patientId] });
      setIsVerifying(false);
      setSelectedDoc(null);
    },
  });

  const handleOpenDoc = (doc: MedicalDocumentRecord) => {
    setSelectedDoc(doc);
    setEditedData(JSON.parse(JSON.stringify(doc.extractedData || {})));
    setDoctorNotes(doc.doctorNotes || "");
    setIsViewerOpen(true);
  };

  const handleDoctorVerifySubmit = () => {
    if (!selectedDoc) return;
    doctorVerifyMutation.mutate({
      docId: selectedDoc.id,
      payload: {
        extractedData: editedData,
        doctorNotes,
      },
    });
  };

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <Spinner />
      </div>
    );
  }

  const documents = docData?.documents || [];
  const aggregated = docData?.aggregatedSummary;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 p-5 rounded-2xl text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-teal-400" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-400">
              AI Medical Document Intelligence
            </span>
          </div>
          <h3 className="text-xl font-black">
            Clinical History & Medical Documents — {patientName || "Patient Profile"}
          </h3>
          <p className="text-xs text-slate-300 mt-0.5">
            Original prescriptions, lab reports, discharge summaries & AI-extracted health data.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-right">
          <div>
            <p className="text-[10px] text-slate-300 uppercase tracking-wider font-bold">
              Verification Status
            </p>
            <p className="text-xs font-bold text-teal-300">
              {aggregated?.verifiedCount || 0} Doctor Verified / {documents.length} Total
            </p>
          </div>
        </div>
      </div>

      {/* Aggregated Health Snapshot Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 text-teal-600 font-bold text-xs uppercase tracking-wider mb-2">
            <Activity className="w-4 h-4" />
            <span>Diagnoses ({aggregated?.diseases?.length || 0})</span>
          </div>
          <div className="space-y-1 max-h-24 overflow-y-auto">
            {aggregated?.diseases?.slice(0, 3).map((d: any, idx: number) => (
              <div key={idx} className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                <span>{d.name}</span>
              </div>
            )) || <p className="text-xs text-slate-400">No diagnoses extracted.</p>}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-2">
            <Pill className="w-4 h-4" />
            <span>Active Meds ({aggregated?.medicines?.length || 0})</span>
          </div>
          <div className="space-y-1 max-h-24 overflow-y-auto">
            {aggregated?.medicines?.slice(0, 3).map((m: any, idx: number) => (
              <div key={idx} className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                <span>{m.name} ({m.dosage})</span>
              </div>
            )) || <p className="text-xs text-slate-400">No active medications.</p>}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-wider mb-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Allergies ({aggregated?.allergies?.length || 0})</span>
          </div>
          <div className="space-y-1 max-h-24 overflow-y-auto">
            {aggregated?.allergies?.slice(0, 3).map((a: any, idx: number) => (
              <div key={idx} className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                <span>{a.allergen}</span>
              </div>
            )) || <p className="text-xs text-slate-400">No allergies flagged.</p>}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider mb-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Lab Findings</span>
          </div>
          <div className="space-y-1 max-h-24 overflow-y-auto">
            {aggregated?.labResults?.slice(0, 3).map((l: any, idx: number) => (
              <div key={idx} className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                <span>{l.testName}</span>
                <span className={l.status === "ABNORMAL" ? "text-amber-600 font-bold" : "text-emerald-600"}>
                  {l.resultValue} {l.unit}
                </span>
              </div>
            )) || <p className="text-xs text-slate-400">No lab reports found.</p>}
          </div>
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden space-y-3 p-5">
        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <FileText className="w-4 h-4 text-teal-600" />
          <span>Uploaded Clinical Documents & AI OCR Extractions</span>
        </h4>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {documents.map((doc) => {
            const isDoctorVerified = doc.isVerified || doc.status === "DOCTOR_VERIFIED";
            const extracted = doc.extractedData as any;

            return (
              <div
                key={doc.id}
                className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 p-2 rounded-xl transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                        {doc.title || doc.fileName}
                      </h5>

                      {/* CLEAR VISUAL DISTINCTION BETWEEN VERIFIED & UNVERIFIED */}
                      {isDoctorVerified ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Doctor Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-800">
                          <Sparkles className="w-3 h-3 text-amber-600 animate-pulse" />
                          AI-Extracted (Unverified)
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 mt-0.5">
                      Type: <span className="font-semibold text-slate-700 dark:text-slate-300">{doc.documentType}</span> • Uploaded:{" "}
                      {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : "N/A"}
                    </p>

                    {doc.summary && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2 italic bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                        "{doc.summary}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                  <Button size="sm" variant="outline" leftIcon={<Eye className="w-4 h-4" />} onClick={() => handleOpenDoc(doc)}>
                    View & Review
                  </Button>
                </div>
              </div>
            );
          })}

          {documents.length === 0 && (
            <p className="py-8 text-center text-xs text-slate-400">
              No medical documents recorded for this patient.
            </p>
          )}
        </div>
      </div>

      {/* Document Review & Verification Modal */}
      {selectedDoc && (
        <Modal
          isOpen={isViewerOpen}
          onClose={() => setIsViewerOpen(false)}
          title={`Clinical Document — ${selectedDoc.title}`}
          maxWidth="2xl"
        >
          <div className="space-y-5 text-xs">
            {/* Distinction Banner */}
            <div
              className={`p-3.5 rounded-xl border flex items-center justify-between ${
                selectedDoc.isVerified
                  ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 text-emerald-800 dark:text-emerald-200"
                  : "bg-amber-50 dark:bg-amber-950/40 border-amber-200 text-amber-800 dark:text-amber-200"
              }`}
            >
              <div className="flex items-center gap-2">
                {selectedDoc.isVerified ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                )}
                <div>
                  <p className="font-bold text-xs">
                    {selectedDoc.isVerified
                      ? "Clinical Verification Locked"
                      : "AI-Extracted Data (Pending Clinical Verification)"}
                  </p>
                  <p className="text-[11px] opacity-90">
                    {selectedDoc.isVerified
                      ? `Verified by licensed doctor (${selectedDoc.verifiedBy?.email || "Staff Doctor"}) on ${
                          selectedDoc.verifiedAt ? new Date(selectedDoc.verifiedAt).toLocaleString() : "Recently"
                        }.`
                      : "This information was extracted by AI and requires physician review before clinical usage."}
                  </p>
                </div>
              </div>
            </div>

            {/* Document Preview & OCR Text Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col justify-between h-56">
                <div className="flex items-center justify-between text-slate-400 text-[11px] mb-2">
                  <span className="font-bold">Original File Preview</span>
                  <a
                    href={selectedDoc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-teal-400 hover:underline flex items-center gap-1"
                  >
                    Open <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                {selectedDoc.fileUrl?.startsWith("data:image") || selectedDoc.mimeType?.includes("image") ? (
                  <img src={selectedDoc.fileUrl} alt="Document" className="w-full h-40 object-contain rounded-lg" />
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 text-slate-500">
                    <FileText className="w-10 h-10 mb-1" />
                    <span>PDF Clinical Attachment ({selectedDoc.fileName})</span>
                  </div>
                )}
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800 h-56 overflow-y-auto space-y-2">
                <span className="font-bold text-slate-700 dark:text-slate-300 text-[11px] block">
                  AI Summary & Findings
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-mono">
                  {selectedDoc.summary || "No summary available."}
                </p>
                {selectedDoc.disclaimer && (
                  <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-2 p-2 bg-amber-500/10 rounded-lg font-sans">
                    {selectedDoc.disclaimer}
                  </p>
                )}
              </div>
            </div>

            {/* Extracted Entities Table / Editor */}
            <div className="space-y-3 pt-2">
              <h5 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-600" />
                <span>Extracted Medical Data Points</span>
              </h5>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Diagnoses */}
                <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                  <span className="font-bold text-xs text-teal-600">Diagnoses & Conditions</span>
                  <div className="space-y-1.5">
                    {editedData?.diseases?.map((d: any, idx: number) => (
                      <div key={idx} className="p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-900 dark:text-slate-100">{d.name}</p>
                          <p className="text-[10px] text-slate-400">{d.category || "General"}</p>
                        </div>
                        <Badge variant={d.needsReview ? "warning" : "completed"}>
                          {d.confidence}% Conf.
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Medicines */}
                <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                  <span className="font-bold text-xs text-indigo-600">Medicines & Dosages</span>
                  <div className="space-y-1.5">
                    {editedData?.medicines?.map((m: any, idx: number) => (
                      <div key={idx} className="p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-900 dark:text-slate-100">{m.name} ({m.dosage})</p>
                          <p className="text-[10px] text-slate-400">{m.frequency} • {m.duration || "N/A"}</p>
                        </div>
                        <Badge variant={m.needsReview ? "warning" : "completed"}>
                          {m.confidence}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Doctor Verification Notes & Action */}
            {isDoctorView && (
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                <label className="block font-bold text-slate-900 dark:text-slate-100">
                  Doctor Clinical Verification Notes:
                </label>
                <textarea
                  rows={2}
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                  placeholder="Add physician notes or confirm accuracy before locking summary..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 outline-none"
                />

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <Info className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>Verifying marks the summary as clinically confirmed for MediFlow EMR.</span>
                  </div>

                  <Button
                    size="sm"
                    variant="primary"
                    leftIcon={<Lock className="w-4 h-4" />}
                    isLoading={doctorVerifyMutation.isPending}
                    onClick={handleDoctorVerifySubmit}
                  >
                    Verify & Lock Summary
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
