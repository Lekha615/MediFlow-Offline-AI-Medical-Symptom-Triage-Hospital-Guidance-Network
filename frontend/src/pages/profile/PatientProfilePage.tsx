import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Phone, MapPin, ShieldAlert, CheckCircle2, AlertCircle, Globe } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { patientApi } from "../../api/patientApi";
import { Input } from "../../components/common/Input";
import { Select } from "../../components/common/Select";
import { Button } from "../../components/common/Button";
import { LanguageSelector } from "../../components/common/LanguageSelector";
import { useTranslation } from "../../i18n";

const profileSchema = z.object({
  phoneNumber: z.string().regex(/^[0-9]{10,15}$/, "Phone number must be 10-15 digits"),
  address: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  bloodGroup: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export const PatientProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { t } = useTranslation();
  const patient = user?.patient;

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      phoneNumber: patient?.user?.phoneNumber || "",
      address: patient?.address || "",
      emergencyContactName: patient?.emergencyContactName || "",
      emergencyContactPhone: patient?.emergencyContactPhone || "",
      bloodGroup: patient?.bloodGroup || "",
    },
  });

  const onSubmit = async (values: ProfileFormValues) => {
    setSuccessMessage(null);
    setErrorMessage(null);
    if (!patient?.id) return;

    try {
      await patientApi.update(patient.id, values);
      await refreshUser();
      setSuccessMessage(t("profile.saveSuccess"));
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.message || "Failed to update profile");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Banner Header */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 p-6 rounded-2xl text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <User className="w-5 h-5 text-teal-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
              {t("profile.title")}
            </span>
          </div>
          <h1 className="text-2xl font-black">
            {patient ? `${patient.firstName} ${patient.lastName}` : user?.email}
          </h1>
          <p className="text-xs text-slate-300 font-mono mt-1">
            UHID: {patient?.uhid || "Not assigned"}
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 text-right">
          <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">{t("staff.role")}</p>
          <p className="font-bold text-sm text-teal-300">{user?.role?.name}</p>
        </div>
      </div>

      {/* Language & Preferences Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {t("profile.languagePreferences")}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t("profile.preferredLanguage")}
              </p>
            </div>
          </div>
          <LanguageSelector variant="header" />
        </div>
      </div>

      {/* Profile Editor Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 md:p-8 space-y-6">
        {successMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Read-Only Details */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            {t("profile.personalInfo")} (Read-Only)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
            <div>
              <p className="text-slate-400 font-medium">{t("auth.emailAddress")}</p>
              <p className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">{user?.email}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">{t("auth.gender")}</p>
              <p className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">{patient?.gender || "N/A"}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">{t("auth.dateOfBirth")}</p>
              <p className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                {patient?.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Editable Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 pt-2">
            {t("profile.personalInfo")}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t("auth.phoneNumber")}
              leftIcon={<Phone className="w-4 h-4" />}
              error={errors.phoneNumber?.message}
              {...register("phoneNumber")}
            />

            <Select
              label={t("auth.bloodGroup")}
              options={[
                { label: "Select Blood Group", value: "" },
                { label: "A+", value: "A+" },
                { label: "A-", value: "A-" },
                { label: "B+", value: "B+" },
                { label: "B-", value: "B-" },
                { label: "O+", value: "O+" },
                { label: "O-", value: "O-" },
                { label: "AB+", value: "AB+" },
                { label: "AB-", value: "AB-" },
              ]}
              {...register("bloodGroup")}
            />
          </div>

          <Input
            label={t("auth.address")}
            placeholder="Street address, city, state, postal code"
            leftIcon={<MapPin className="w-4 h-4" />}
            {...register("address")}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <Input
              label="Emergency Contact Name"
              placeholder="Full name of emergency contact"
              leftIcon={<ShieldAlert className="w-4 h-4" />}
              {...register("emergencyContactName")}
            />

            <Input
              label="Emergency Contact Phone"
              placeholder="10-15 digit phone number"
              leftIcon={<Phone className="w-4 h-4" />}
              {...register("emergencyContactPhone")}
            />
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {t("common.save")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientProfilePage;
