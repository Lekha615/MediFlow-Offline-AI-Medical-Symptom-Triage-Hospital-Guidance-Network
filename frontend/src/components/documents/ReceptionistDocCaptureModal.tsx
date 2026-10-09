import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload, Camera, FileText, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { documentApi } from "../../api/documentApi";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { Input } from "../common/Input";
import { CameraCaptureModal } from "./CameraCaptureModal";

interface ReceptionistDocCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  patientName: string;
  uhid: string;
}

export const ReceptionistDocCaptureModal: React.FC<ReceptionistDocCaptureModalProps> = ({
  isOpen,
  onClose,
  patientId,
  patientName,
  uhid,
}) => {
  const queryClient = useQueryClient();
  const [docType, setDocType] = useState<string>("PRESCRIPTION");
  const [title, setTitle] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [capturedBase64, setCapturedBase64] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [successDoc, setSuccessDoc] = useState<any>(null);

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

      setUploadProgress(40);
      const res = await documentApi.uploadDocument({
        patientId,
        title: title || `${docType.replace("_", " ")} — ${patientName}`,
        documentType: docType,
        fileName,
        mimeType,
        fileSize,
        fileData: fileData || undefined,
        documentDate: new Date().toISOString(),
      });
      setUploadProgress(100);
      return res;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["patient-documents-intelligence", patientId] });
      queryClient.invalidateQueries({ queryKey: ["receptionist-queue"] });
      setSuccessDoc(data);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setCapturedBase64(null);
      if (!title) {
        setTitle(e.target.files[0].name.split(".")[0]);
      }
    }
  };

  const handleCameraCapture = (base64Data: string, fileName: string) => {
    setCapturedBase64(base64Data);
    setFile(null);
    setTitle(`Photo Capture — ${new Date().toLocaleTimeString()}`);
  };

  const handleReset = () => {
    setFile(null);
    setCapturedBase64(null);
    setTitle("");
    setSuccessDoc(null);
    setUploadProgress(0);
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`Reception Desk Document Attachment — ${patientName}`}
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3.5 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900 rounded-xl text-orange-900 dark:text-orange-200 flex items-center justify-between">
            <div>
              <p className="font-bold">Link Document to Patient Profile</p>
              <p className="text-[11px] opacity-90">
                UHID: <span className="font-mono font-bold">{uhid}</span> • Attached documents will be processed via OCR and made available to consulting doctors.
              </p>
            </div>
          </div>

          {successDoc ? (
            <div className="p-5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 rounded-2xl text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                  Document Attached & Linked Successfully!
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Status:{" "}
                  <strong className="text-amber-600">
                    {successDoc.status === "NEEDS_REVIEW" ? "Needs Review (Flagged items found)" : "Processed & Ready"}
                  </strong>
                </p>
              </div>

              {successDoc.summary && (
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-left">
                  <p className="font-bold text-[11px] text-teal-600 mb-1 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    AI Extracted Summary
                  </p>
                  <p className="text-slate-700 dark:text-slate-300">{successDoc.summary}</p>
                </div>
              )}

              <div className="flex justify-center gap-2 pt-2">
                <Button size="sm" variant="outline" onClick={handleReset}>
                  Attach Another Document
                </Button>
                <Button size="sm" variant="primary" onClick={onClose}>
                  Done & Close
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Select Document Category:
                </label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold"
                >
                  <option value="PRESCRIPTION">Previous Doctor Prescription</option>
                  <option value="LAB_REPORT">Laboratory Investigation Report</option>
                  <option value="DISCHARGE_SUMMARY">Hospital Discharge Summary</option>
                  <option value="MEDICAL_REPORT">General Medical Record</option>
                  <option value="OTHER">Other Health Document</option>
                </select>
              </div>

              <Input
                label="Document Title"
                placeholder="e.g. Previous Cardiology Prescription (Aug 2026)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              {/* Upload or Camera Toggle Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <label className="p-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-teal-500 bg-slate-50 dark:bg-slate-800/40 text-center cursor-pointer flex flex-col items-center gap-1 transition-all">
                  <Upload className="w-6 h-6 text-teal-600" />
                  <span className="font-bold text-slate-700 dark:text-slate-200">
                    {file ? file.name : "Choose File (PDF / Image)"}
                  </span>
                  <span className="text-[10px] text-slate-400">PDF, PNG, JPG up to 10MB</span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={() => setIsCameraOpen(true)}
                  className="p-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-orange-500 bg-slate-50 dark:bg-slate-800/40 text-center cursor-pointer flex flex-col items-center gap-1 transition-all"
                >
                  <Camera className="w-6 h-6 text-orange-500" />
                  <span className="font-bold text-slate-700 dark:text-slate-200">
                    {capturedBase64 ? "Photo Snapped!" : "Snap Photo with Camera"}
                  </span>
                  <span className="text-[10px] text-slate-400">Direct webcam document capture</span>
                </button>
              </div>

              {/* Upload Progress Bar */}
              {uploadMutation.isPending && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    <span>Uploading & Running AI OCR Extraction...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-600 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <Button size="sm" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  disabled={!file && !capturedBase64}
                  isLoading={uploadMutation.isPending}
                  onClick={() => uploadMutation.mutate()}
                >
                  Process & Link Document
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />
    </>
  );
};
