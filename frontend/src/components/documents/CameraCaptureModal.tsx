import React, { useRef, useState, useEffect } from "react";
import { Camera, RefreshCw, Check, X, AlertCircle } from "lucide-react";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (base64Data: string, fileName: string) => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && !capturedImage) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, capturedImage]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      setCameraError("Camera access denied or device unavailable. You can upload files directly.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const handleSnap = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      setCapturedImage(dataUrl);
      stopCamera();
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const handleConfirm = () => {
    if (capturedImage) {
      const fileName = `Captured_Document_${Date.now()}.jpg`;
      onCapture(capturedImage, fileName);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Capture Document Photo" maxWidth="md">
      <div className="space-y-4">
        {cameraError ? (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-600 text-xs flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{cameraError}</span>
          </div>
        ) : capturedImage ? (
          <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950">
            <img src={capturedImage} alt="Captured Document" className="w-full h-64 object-contain" />
            <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
              Photo Captured
            </div>
          </div>
        ) : (
          <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 h-64 flex items-center justify-center">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            <div className="absolute inset-0 border-2 border-dashed border-teal-400/50 m-4 rounded-lg pointer-events-none flex items-center justify-center">
              <span className="text-[10px] text-teal-300 font-medium bg-slate-950/60 px-3 py-1 rounded-full">
                Position prescription or lab report inside frame
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button size="sm" variant="outline" onClick={onClose}>
            Cancel
          </Button>

          {capturedImage ? (
            <>
              <Button size="sm" variant="secondary" leftIcon={<RefreshCw className="w-4 h-4" />} onClick={handleRetake}>
                Retake
              </Button>
              <Button size="sm" variant="primary" leftIcon={<Check className="w-4 h-4" />} onClick={handleConfirm}>
                Use Photo
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              variant="primary"
              disabled={!!cameraError}
              leftIcon={<Camera className="w-4 h-4" />}
              onClick={handleSnap}
            >
              Snap Photo
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
