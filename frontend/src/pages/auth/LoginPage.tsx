import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Mail,
  Lock,
  AlertCircle,
  User,
  ShieldCheck,
  Stethoscope,
  Building2,
  Clock,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { AuthLayout } from "../../components/layout/AuthLayout";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import { getApiErrorMessage } from "../../api/client";
import { getRoleDashboardPath } from "../dashboard/RoleBasedDashboard";
import { useTranslation } from "../../i18n";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address").trim().toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type PortalMode = "PATIENT" | "STAFF";

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialMode = searchParams.get("mode") === "STAFF" ? "STAFF" : "PATIENT";
  const initialRole = searchParams.get("role") || "DOCTOR";

  const [portalMode, setPortalMode] = useState<PortalMode>(initialMode);
  const [selectedStaffRole, setSelectedStaffRole] = useState<string>(initialRole);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    setErrorMessage(null);
    try {
      const loggedUser = await login(values);
      const roleName = typeof loggedUser.role === "string" ? loggedUser.role : loggedUser.role?.name;
      const path = getRoleDashboardPath(roleName);
      navigate(path);
    } catch (err: any) {
      setErrorMessage(getApiErrorMessage(err));
    }
  };

  const demoAccounts = [
    {
      role: "SUPER_ADMIN",
      label: t("header.roleSuperAdmin"),
      email: "admin@mediflow.com",
      pass: "Admin@12345",
      icon: <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />,
    },
    {
      role: "HOSPITAL_ADMIN",
      label: t("header.roleHospitalAdmin"),
      email: "hospitaladmin@mediflow.com",
      pass: "HospitalAdmin@12345",
      icon: <Building2 className="w-3.5 h-3.5 text-blue-400" />,
    },
    {
      role: "DOCTOR",
      label: t("header.roleDoctor"),
      email: "doctor@mediflow.com",
      pass: "Doctor@12345",
      icon: <Stethoscope className="w-3.5 h-3.5 text-teal-400" />,
    },
    {
      role: "RECEPTIONIST",
      label: t("header.roleReceptionist"),
      email: "receptionist@mediflow.com",
      pass: "Receptionist@12345",
      icon: <Clock className="w-3.5 h-3.5 text-amber-400" />,
    },
    {
      role: "PATIENT",
      label: t("header.rolePatient"),
      email: "patient@mediflow.com",
      pass: "Patient@12345",
      icon: <User className="w-3.5 h-3.5 text-emerald-400" />,
    },
  ];

  const fillDemoAccount = (acc: typeof demoAccounts[0]) => {
    setValue("email", acc.email);
    setValue("password", acc.pass);
    if (acc.role === "PATIENT") {
      setPortalMode("PATIENT");
    } else {
      setPortalMode("STAFF");
      setSelectedStaffRole(acc.role);
    }
    setErrorMessage(null);
  };

  return (
    <AuthLayout
      title={portalMode === "PATIENT" ? t("auth.patientPortal") : t("auth.staffPortal")}
      subtitle={
        portalMode === "PATIENT"
          ? t("auth.patientPortalSubtitle")
          : t("auth.staffPortalSubtitle")
      }
    >
      <div className="space-y-4">
        {/* Dual Portal Selector Tabs */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-800/80 border border-slate-700/80">
          <button
            type="button"
            onClick={() => {
              setPortalMode("PATIENT");
              setErrorMessage(null);
            }}
            className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              portalMode === "PATIENT"
                ? "bg-teal-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>{t("auth.patientPortalTab")}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setPortalMode("STAFF");
              setErrorMessage(null);
            }}
            className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              portalMode === "STAFF"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{t("auth.staffPortalTab")}</span>
          </button>
        </div>

        {/* Quick Demo Credentials Bar */}
        <div className="space-y-1.5 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {t("auth.quickCredentials")}
            </span>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
            {demoAccounts.map((acc) => (
              <button
                key={acc.role}
                type="button"
                onClick={() => fillDemoAccount(acc)}
                className="px-2 py-1 rounded-lg bg-slate-900/60 hover:bg-slate-700/80 border border-slate-700/60 text-[11px] font-semibold text-slate-200 flex items-center gap-1.5 whitespace-nowrap transition-all"
              >
                {acc.icon}
                <span>{acc.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 pt-1">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <Input
            label={t("auth.emailAddress")}
            type="email"
            placeholder={
              portalMode === "PATIENT" ? "patient@mediflow.com" : "doctor@mediflow.com"
            }
            leftIcon={<Mail className="w-4 h-4" />}
            error={errors.email?.message}
            {...register("email")}
          />

          <div className="space-y-1">
            <Input
              label={t("auth.password")}
              type="password"
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              error={errors.password?.message}
              {...register("password")}
            />
            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-xs text-teal-400 hover:text-teal-300 font-semibold hover:underline"
              >
                {t("auth.forgotPassword")}
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            className={`w-full mt-2 ${
              portalMode === "STAFF"
                ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                : "bg-teal-600 hover:bg-teal-500 text-white"
            }`}
            size="lg"
            isLoading={isSubmitting}
            rightIcon={<ChevronRight className="w-4 h-4" />}
          >
            {portalMode === "PATIENT" ? t("auth.signInPatientButton") : t("auth.signInStaffButton")}
          </Button>

          {/* Footer Links & Notices */}
          <div className="text-center mt-5 pt-3 border-t border-slate-700/50 space-y-2 text-xs">
            {portalMode === "PATIENT" ? (
              <p className="text-slate-400">
                {t("auth.newPatient")}{" "}
                <Link to="/register" className="text-teal-400 font-semibold hover:underline">
                  {t("auth.createPatientAccount")}
                </Link>
              </p>
            ) : (
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-left text-slate-200 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-indigo-300">{t("auth.staffProvisioningTitle")}</p>
                    <p className="text-[11px] leading-snug text-slate-300">
                      {t("auth.staffProvisioningDesc")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1.5">
                  <Link
                    to={`/register/staff?role=${selectedStaffRole}`}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 font-bold flex items-center gap-1.5 transition-all"
                  >
                    <Stethoscope className="w-3.5 h-3.5" />
                    <span>{t("auth.createStaffAccount")}</span>
                  </Link>

                  <Link to="/register" className="text-slate-400 hover:text-teal-400 font-semibold hover:underline">
                    {t("auth.patientRegistration")}
                  </Link>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
