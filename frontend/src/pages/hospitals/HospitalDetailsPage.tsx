import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Stethoscope,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Globe,
} from "lucide-react";
import { hospitalApi } from "../../api/hospitalApi";
import { doctorApi } from "../../api/doctorApi";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { Spinner } from "../../components/common/Spinner";
import { EmptyState } from "../../components/common/EmptyState";
import { Doctor } from "../../types/doctor";

export const HospitalDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: hospital, isLoading: hospitalLoading } = useQuery({
    queryKey: ["hospital-detail", id],
    queryFn: () => hospitalApi.getById(id!),
    enabled: !!id,
  });

  const { data: doctorsData, isLoading: doctorsLoading } = useQuery({
    queryKey: ["hospital-doctors", id],
    queryFn: () => doctorApi.list({ hospitalId: id, limit: 50 }),
    enabled: !!id,
  });

  if (hospitalLoading) {
    return (
      <div className="p-12 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!hospital) {
    return (
      <EmptyState
        title="Hospital Not Found"
        description="The requested medical center could not be found."
        action={
          <Button variant="outline" onClick={() => navigate("/hospitals")}>
            Back to Hospitals Directory
          </Button>
        }
      />
    );
  }

  const doctors: Doctor[] = Array.isArray(doctorsData?.data)
    ? doctorsData.data
    : Array.isArray((doctorsData as any)?.items)
    ? (doctorsData as any).items
    : [];

  const isVerified = Boolean(hospital.isVerified);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        leftIcon={<ArrowLeft className="w-4 h-4" />}
        onClick={() => navigate(-1)}
      >
        Back
      </Button>

      {/* Hospital Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 p-6 md:p-8 rounded-2xl text-white shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-5 h-5 text-teal-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                Hospital Profile
              </span>
            </div>
            <h1 className="text-3xl font-black">{hospital.name}</h1>
            <p className="text-xs text-slate-300 font-mono mt-1">
              CODE: {hospital.code}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isVerified ? (
              <Badge variant="active" className="flex items-center gap-1 text-xs px-3 py-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>VERIFIED REGISTRY</span>
              </Badge>
            ) : (
              <Badge variant="warning" className="flex items-center gap-1 text-xs px-3 py-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>UNVERIFIED RECORD</span>
              </Badge>
            )}

            <Badge variant={hospital.status.toLowerCase() as any} className="text-xs px-3 py-1">
              {hospital.status}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-4 border-t border-white/10 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-teal-400 shrink-0" />
            <span>
              {hospital.address || "Main Campus"}, {hospital.city?.name || "Metro"}
              {hospital.city?.state?.name ? `, ${hospital.city.state.name}` : ""}
            </span>
          </div>

          {hospital.contactPhone && (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-teal-400 shrink-0" />
              <span>{hospital.contactPhone}</span>
            </div>
          )}

          {hospital.contactEmail && (
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-teal-400 shrink-0" />
              <span>{hospital.contactEmail}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-teal-400 shrink-0" />
            <span className="capitalize">
              {String(hospital.type).toLowerCase()} • {String(hospital.speciality).toLowerCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Doctors & Specialists Directory */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-teal-600" />
            <span>Associated Doctors & Medical Staff</span>
          </h3>
          <Badge variant="waiting">{doctors.length} Doctors</Badge>
        </div>

        {doctorsLoading ? (
          <div className="p-8 flex justify-center">
            <Spinner />
          </div>
        ) : doctors.length === 0 ? (
          <div className="py-8 text-center space-y-2">
            <Stethoscope className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500 font-medium">
              No doctors are currently affiliated with this medical center in the system registry.
            </p>
            <p className="text-[11px] text-slate-400">
              Doctor affiliations are strictly verified against the database and never artificially invented.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {doctors.map((doc) => (
              <div
                key={doc.id}
                className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        Dr. {doc.firstName} {doc.lastName}
                      </h4>
                      <p className="text-xs font-semibold text-teal-600 dark:text-teal-400">
                        {doc.department?.name || "General OPD"}
                      </p>
                    </div>
                    <Badge variant={doc.isAvailable ? "active" : "inactive"}>
                      {doc.isAvailable ? "Available" : "Away"}
                    </Badge>
                  </div>

                  <div className="mt-2 text-xs text-slate-500 space-y-1">
                    <p>
                      License:{" "}
                      <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">
                        {doc.licenseNumber}
                      </span>
                    </p>
                    <p>Qualification: {doc.qualification}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Consultation Fee</span>
                  <span className="font-black text-slate-900 dark:text-slate-100">
                    ₹{doc.consultationFee || "0.00"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HospitalDetailsPage;
