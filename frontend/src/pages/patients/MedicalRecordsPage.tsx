import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FileText,
  Upload,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Calendar,
  Activity,
  Pill,
  ShieldCheck,
  Eye,
  Edit,
  Trash2,
  Sparkles,
  Plus,
  Info,
  Check,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { documentApi, MedicalDocumentRecord } from "../../api/documentApi";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { Spinner } from "../../components/common/Spinner";
import { Modal } from "../../components/common/Modal";
import { Input } from "../../components/common/Input";
import { CameraCaptureModal } from "../../components/documents/CameraCaptureModal";

export const MedicalRecordsPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const patientId = user?.patient?.id;

  const [activeTab, setActiveTab] = useState<"records" | "timeline" | "summary">("records");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<MedicalDocumentRecord | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  // Form State for Upload
  const [title, setTitle] = useState("");
  const [docType, setDocType] = useState("PRESCRIPTION");
  const [documentDate, setDocumentDate] = useState(new Date().toISOString().split("T")[0]);
  const [file, setFile] = useState<File | null>(null);
  const [capturedBase64, setCapturedBase64] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Patient Edit/Review state
  const [reviewExtractedData, setReviewExtractedData] = useState<any>(null);
  const [patientNotes, setPatientNotes] = useState("");

  const { data: docData, isLoading } = useQuery({
    queryKey: ["patient-documents-intelligence", patientId],
    queryFn: () => documentApi.getByPatient(patientId!),
    enabled: !!patientId,
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      let fileData = capturedBase64;
      let fileName = file?.name || `Document_${Date.now()}.jpg`;
      let mimeType = file?.type || "image/jpeg";
      let fileSize = file?.size || 1024;

      if (file && !fileData) {
        fileData = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      }

      setUploadProgress(50);
      const res = await documentApi.uploadDocument({
        patientId: patientId!,
        title: title || fileName,
        documentType: docType,
        fileName,
        mimeType,
        fileSize,
        fileData: fileData || undefined,
        documentDate,
      });
      setUploadProgress(100);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient-documents-intelligence", patientId] });
      setIsUploadOpen(false);
      resetUploadForm();
    },
  });

  const confirmMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      documentApi.patientConfirm(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient-documents-intelligence", patientId] });
      setIsReviewOpen(false);
      setSelectedDoc(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => documentApi.deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient-documents-intelligence", patientId] });
      setIsReviewOpen(false);
      setSelectedDoc(null);
    },
  });

  const resetUploadForm = () => {
    setTitle("");
    setDocType("PRESCRIPTION");
    setFile(null);
    setCapturedBase64(null);
    setUploadProgress(0);
  };

  const handleOpenReview = (doc: MedicalDocumentRecord) => {
    setSelectedDoc(doc);
    setReviewExtractedData(JSON.parse(JSON.stringify(doc.extractedData || {})));
    setPatientNotes(doc.patientNotes || "");
    setIsReviewOpen(true);
  };

  const handleConfirmReview = () => {
    if (!selectedDoc) return;
    confirmMutation.mutate({
      id: selectedDoc.id,
      payload: {
        extractedData: reviewExtractedData,
        patientNotes,
      },
    });
  };

  const handleCameraCapture = (base64Data: string, fileName: string) => {
    setCapturedBase64(base64Data);
    setFile(null);
    if (!title) setTitle(`Captured Document — ${new Date().toLocaleDateString()}`);
  };

  const documents = docData?.documents || [];
  const timeline = docData?.timeline || [];
  const aggregated = docData?.aggregatedSummary;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Hero Banner */}
      <div className="bg-gradient-to-r from-teal-800 via-slate-900 to-indigo-950 p-6 rounded-2xl text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-teal-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
              MediFlow AI Health Vault
            </span>
          </div>
          <h1 className="text-2xl font-black">My Medical Records & Document Intelligence</h1>
          <p className="text-xs text-slate-300 mt-1">
            Upload prescriptions, lab reports & discharge summaries. AI automatically extracts structured health data & builds your timeline.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<Camera className="w-4 h-4" />}
            onClick={() => setIsCameraOpen(true)}
          >
            Camera Capture
          </Button>
          <Button
            size="sm"
            variant="primary"
            leftIcon={<Upload className="w-4 h-4" />}
            onClick={() => setIsUploadOpen(true)}
          >
            Upload Document
          </Button>
        </div>
      </div>

      {/* NON-DEFINITIVE AI MEDICAL DISCLAIMER BANNER */}
      <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-2xl text-amber-900 dark:text-amber-200 flex items-start gap-3 text-xs">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold">Medical AI Disclaimer:</strong> AI-extracted diagnoses, medications, and lab results are generated for intelligence assistance and record management only. They do not constitute a definitive medical diagnosis or replace clinical evaluation by a licensed physician.
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab("records")}
          className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
            activeTab === "records"
              ? "bg-teal-600 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Uploaded Documents ({documents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("timeline")}
          className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
            activeTab === "timeline"
              ? "bg-teal-600 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Chronological Health Timeline</span>
        </button>

        <button
          onClick={() => setActiveTab("summary")}
          className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
            activeTab === "summary"
              ? "bg-teal-600 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>AI Health Summary</span>
        </button>
      </div>

      {/* TAB 1: UPLOADED DOCUMENTS */}
      {activeTab === "records" && (
        <div className="space-y-4">
          {isLoading ? (
            <div className="p-12 flex justify-center"><Spinner size="lg" /></div>
          ) : documents.length === 0 ? (
            <div className="p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
              <FileText className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                No Medical Documents Uploaded Yet
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Upload your previous doctor prescriptions, lab reports, or discharge summaries to build your intelligent health record.
              </p>
              <Button size="sm" variant="primary" leftIcon={<Upload className="w-4 h-4" />} onClick={() => setIsUploadOpen(true)}>
                Upload First Record
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((doc) => {
                const extracted = doc.extractedData as any;
                const isVerified = doc.isVerified || doc.status === "DOCTOR_VERIFIED";

                return (
                  <div
                    key={doc.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded-md">
                          {doc.documentType}
                        </span>

                        <Badge
                          variant={
                            isVerified
                              ? "completed"
                              : doc.status === "NEEDS_REVIEW"
                              ? "warning"
                              : doc.status === "VERIFIED_BY_PATIENT"
                              ? "waiting"
                              : "waiting"
                          }
                        >
                          {isVerified
                            ? "Doctor Verified"
                            : doc.status === "NEEDS_REVIEW"
                            ? "Needs Review"
                            : doc.status === "VERIFIED_BY_PATIENT"
                            ? "Patient Confirmed"
                            : "Processed"}
                        </Badge>
                      </div>

                      <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm line-clamp-1">
                        {doc.title}
                      </h4>

                      <p className="text-xs text-slate-400">
                        Date: {doc.documentDate ? new Date(doc.documentDate).toLocaleDateString() : "N/A"}
                      </p>

                      {doc.summary && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 italic bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl">
                          "{doc.summary}"
                        </p>
                      )}

                      <div className="flex flex-wrap gap-1 pt-1">
                        {extracted?.diseases?.slice(0, 2).map((d: any, idx: number) => (
                          <span key={idx} className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md font-medium">
                            {d.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">
                        {extracted?.flaggedForReviewCount > 0 ? `⚠️ ${extracted.flaggedForReviewCount} items for review` : "✓ High Confidence"}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        leftIcon={<Eye className="w-3.5 h-3.5" />}
                        onClick={() => handleOpenReview(doc)}
                      >
                        Review & Edit
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CHRONOLOGICAL HEALTH TIMELINE */}
      {activeTab === "timeline" && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Clock className="w-5 h-5 text-teal-600" />
            <span>Patient Chronological Medical History</span>
          </h3>

          <div className="relative border-l-2 border-teal-500/30 ml-4 space-y-6">
            {timeline.map((item, idx) => (
              <div key={item.id} className="relative pl-6">
                {/* Bullet node */}
                <div className="absolute -left-2.5 top-1.5 w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] font-bold shadow-md">
                  {idx + 1}
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400">
                        {new Date(item.date).toLocaleDateString()}
                      </span>
                      <span className="text-[10px] uppercase font-bold bg-teal-100 dark:bg-teal-950 text-teal-700 px-2 py-0.5 rounded-md">
                        {item.documentType}
                      </span>
                    </div>

                    {item.isVerified && (
                      <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Doctor Verified
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    {item.title}
                  </h4>

                  {item.summary && <p className="text-xs text-slate-600 dark:text-slate-300">{item.summary}</p>}

                  <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
                    <span>Diagnoses: <strong>{item.diagnosesCount}</strong></span>
                    <span>Medicines: <strong>{item.medicinesCount}</strong></span>
                    <span>Abnormal Labs: <strong className={item.abnormalLabsCount > 0 ? "text-amber-600" : ""}>{item.abnormalLabsCount}</strong></span>
                  </div>
                </div>
              </div>
            ))}

            {timeline.length === 0 && (
              <p className="text-xs text-slate-400 pl-6 py-4">No chronological events found.</p>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: AI HEALTH SUMMARY */}
      {activeTab === "summary" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Extracted Diagnoses */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-600" />
                <span>Extracted Diagnoses & Conditions</span>
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {aggregated?.diseases?.map((d: any, idx: number) => (
                  <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="font-bold text-xs text-slate-900 dark:text-slate-100">{d.name}</p>
                      <p className="text-[10px] text-slate-400">{d.category || "General Condition"}</p>
                    </div>
                    <Badge variant={d.needsReview ? "warning" : "completed"}>
                      {d.confidence}% Conf.
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Extracted Medications */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Pill className="w-4 h-4 text-indigo-600" />
                <span>Extracted Medicines & Dosages</span>
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {aggregated?.medicines?.map((m: any, idx: number) => (
                  <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="font-bold text-xs text-slate-900 dark:text-slate-100">{m.name} ({m.dosage})</p>
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
      )}

      {/* UPLOAD DOCUMENT MODAL */}
      <Modal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} title="Upload Medical Document" maxWidth="lg">
        <div className="space-y-4 text-xs">
          <Input
            label="Document Title"
            placeholder="e.g. Apollo Hospital Prescription (Oct 2026)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Document Type:
              </label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold"
              >
                <option value="PRESCRIPTION">Prescription</option>
                <option value="LAB_REPORT">Lab Report</option>
                <option value="DISCHARGE_SUMMARY">Discharge Summary</option>
                <option value="MEDICAL_REPORT">Medical Report</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <Input
              label="Document Date"
              type="date"
              value={documentDate}
              onChange={(e) => setDocumentDate(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="p-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-teal-500 bg-slate-50 dark:bg-slate-800/40 text-center cursor-pointer flex flex-col items-center gap-1 transition-all">
              <Upload className="w-6 h-6 text-teal-600" />
              <span className="font-bold text-slate-700 dark:text-slate-200">
                {file ? file.name : "Choose File (PDF/Image)"}
              </span>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setFile(e.target.files[0]);
                    setCapturedBase64(null);
                  }
                }}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={() => setIsCameraOpen(true)}
              className="p-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 bg-slate-50 dark:bg-slate-800/40 text-center cursor-pointer flex flex-col items-center gap-1 transition-all"
            >
              <Camera className="w-6 h-6 text-indigo-500" />
              <span className="font-bold text-slate-700 dark:text-slate-200">
                {capturedBase64 ? "Photo Snapped!" : "Snap Photo"}
              </span>
            </button>
          </div>

          {uploadMutation.isPending && (
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-bold text-slate-600">
                <span>Running OCR & AI Intelligence Engine...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-teal-600 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3">
            <Button size="sm" variant="outline" onClick={() => setIsUploadOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant="primary"
              disabled={!file && !capturedBase64}
              isLoading={uploadMutation.isPending}
              onClick={() => uploadMutation.mutate()}
            >
              Process & Extract
            </Button>
          </div>
        </div>
      </Modal>

      {/* PATIENT REVIEW & CONFIRM MODAL */}
      {selectedDoc && (
        <Modal
          isOpen={isReviewOpen}
          onClose={() => setIsReviewOpen(false)}
          title={`Review Extracted Info — ${selectedDoc.title}`}
          maxWidth="xl"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 rounded-xl text-teal-900 dark:text-teal-200">
              <p className="font-bold">Patient Verification & Correction</p>
              <p className="text-[11px]">
                Please review AI-extracted diagnoses and medications. You can correct any details before confirming.
              </p>
            </div>

            {/* Extracted Diagnoses List */}
            <div>
              <h5 className="font-bold text-slate-900 dark:text-slate-100 mb-2">Diagnoses</h5>
              <div className="space-y-2">
                {reviewExtractedData?.diseases?.map((d: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={d.name}
                      onChange={(e) => {
                        const updated = { ...reviewExtractedData };
                        updated.diseases[idx].name = e.target.value;
                        setReviewExtractedData(updated);
                      }}
                      className="w-full p-2 border rounded-lg bg-white dark:bg-slate-900"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Extracted Medicines List */}
            <div>
              <h5 className="font-bold text-slate-900 dark:text-slate-100 mb-2">Medicines & Dosage</h5>
              <div className="space-y-2">
                {reviewExtractedData?.medicines?.map((m: any, idx: number) => (
                  <div key={idx} className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={m.name}
                      onChange={(e) => {
                        const updated = { ...reviewExtractedData };
                        updated.medicines[idx].name = e.target.value;
                        setReviewExtractedData(updated);
                      }}
                      className="p-2 border rounded-lg bg-white dark:bg-slate-900"
                    />
                    <input
                      type="text"
                      value={m.dosage}
                      onChange={(e) => {
                        const updated = { ...reviewExtractedData };
                        updated.medicines[idx].dosage = e.target.value;
                        setReviewExtractedData(updated);
                      }}
                      className="p-2 border rounded-lg bg-white dark:bg-slate-900"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Your Personal Notes / Comments:
              </label>
              <textarea
                rows={2}
                value={patientNotes}
                onChange={(e) => setPatientNotes(e.target.value)}
                placeholder="Add any notes for your consulting doctor..."
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
              <Button
                size="sm"
                variant="danger"
                leftIcon={<Trash2 className="w-4 h-4" />}
                isLoading={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(selectedDoc.id)}
              >
                Delete Document
              </Button>

              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setIsReviewOpen(false)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  leftIcon={<Check className="w-4 h-4" />}
                  isLoading={confirmMutation.isPending}
                  onClick={handleConfirmReview}
                >
                  Confirm & Save Information
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />
    </div>
  );
};
