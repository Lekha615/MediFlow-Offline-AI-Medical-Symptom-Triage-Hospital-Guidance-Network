import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ShieldCheck,
  Building2,
  Stethoscope,
  Clock,
  ArrowLeft,
  ChevronRight,
  UserPlus,
  Lock,
  FlaskConical,
  CheckCircle2,
  AlertCircle,
  Database,
} from "lucide-react";
import { AuthLayout } from "../../components/layout/AuthLayout";
import { Button } from "../../components/common/Button";
import { useAuth } from "../../context/AuthContext";
import { DoctorFormModal } from "../../components/doctors/DoctorFormModal";
import { StaffFormModal } from "../../components/staff/StaffFormModal";
import { doctorApi } from "../../api/doctorApi";
import { staffApi } from "../../api/staffApi";
import { DoctorCreatePayload } from "../../types/doctor";
import { StaffCreatePayload } from "../../types/staff";

export const StaffOnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, role, login } = useAuth();

  const initialRole = (searchParams.get("role") || "DOCTOR").toUpperCase();
  const [activeRoleTab, setActiveRoleTab] = useState<string>(initialRole);

  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [provisionedCreds, setProvisionedCreds] = useState<{ email: string; pass: string; roleName: string } | null>(null);
  const [isAutoLogingIn, setIsAutoLogingIn] = useState(false);

  const isAdmin = role === "SUPER_ADMIN" || role === "HOSPITAL_ADMIN";

  const handleAdminAuth = async () => {
    setIsAutoLogingIn(true);
    try {
      await login({ email: "admin@mediflow.com", password: "Admin@12345" });
      setSuccessNotice("Authenticated as Super Admin! Select a staff role below to provision.");
    } catch (err: any) {
      setSuccessNotice("Failed to authenticate as Super Admin. Please ensure database is seeded.");
    } finally {
      setIsAutoLogingIn(false);
    }
  };

  const handleCreateDoctor = async (payload: DoctorCreatePayload) => {
    await doctorApi.create(payload);
    setSuccessNotice(`Doctor account for Dr. ${payload.firstName} ${payload.lastName} provisioned successfully!`);
    setProvisionedCreds({
      email: payload.email,
      pass: payload.password,
      roleName: "DOCTOR",
    });
  };

  const handleCreateStaff = async (payload: StaffCreatePayload) => {
    await staffApi.create(payload);
    setSuccessNotice(`Staff account for ${payload.firstName} ${payload.lastName} (${payload.type}) provisioned successfully!`);
    setProvisionedCreds({
      email: payload.email,
      pass: payload.password,
      roleName: payload.type,
    });
  };

  const handleTestLoginWithProvisioned = async () => {
    if (!provisionedCreds) return;
    try {
      await login({ email: provisionedCreds.email, password: provisionedCreds.pass });
      navigate("/dashboard");
    } catch (err: any) {
      alert("Failed to login with new credentials: " + err.message);
    }
  };

  return (
    <AuthLayout
      title="Staff Account Provisioning Workspace"
      subtitle="Provision Healthcare Staff & Doctor accounts linked to real database facility records."
    >
      <div className="space-y-4 py-1">
        {/* Role Selector Tabs */}
        <div className="grid grid-cols-4 p-1 rounded-xl bg-slate-100 border border-slate-200 text-[11px] font-bold">
          <button
            type="button"
            onClick={() => setActiveRoleTab("DOCTOR")}
            className={`py-2 px-1 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeRoleTab === "DOCTOR"
                ? "bg-teal-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Doctor</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveRoleTab("RECEPTIONIST")}
            className={`py-2 px-1 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeRoleTab === "RECEPTIONIST"
                ? "bg-amber-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Receptionist</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveRoleTab("HOSPITAL_ADMIN")}
            className={`py-2 px-1 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeRoleTab === "HOSPITAL_ADMIN"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Hosp Admin</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveRoleTab("LAB_TECHNICIAN")}
            className={`py-2 px-1 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeRoleTab === "LAB_TECHNICIAN"
                ? "bg-sky-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Lab Tech</span>
          </button>
        </div>

        {/* Provisioning Notice & Policy */}
        <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-slate-800 text-xs space-y-2.5">
          <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
            <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>Provisioning Policy for {activeRoleTab.replace("_", " ")}</span>
          </div>

          <p className="leading-relaxed text-slate-600 text-[11px]">
            Doctor, Receptionist and Healthcare Staff accounts are provisioned by an authorized administrator using real database Hospital and Department IDs.
          </p>

          <div className="flex items-center gap-2 pt-1 text-[11px] text-teal-800 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span>Uses database entity dropdowns (`hospitalId` & `departmentId`). No manual UUIDs.</span>
          </div>
        </div>

        {/* Success Notice */}
        {successNotice && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successNotice}</span>
            </div>

            {provisionedCreds && (
              <div className="p-2.5 rounded-lg bg-white border border-emerald-200 flex items-center justify-between text-[11px] shadow-2xs">
                <div>
                  <p className="text-slate-600 font-medium">New Account Credentials:</p>
                  <p className="font-mono text-emerald-800 font-semibold">{provisionedCreds.email} | {provisionedCreds.pass}</p>
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={handleTestLoginWithProvisioned}
                >
                  Test Login Now
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Action Controls */}
        <div className="space-y-3 pt-2">
          {isAdmin ? (
            <div className="space-y-2">
              <p className="text-xs text-emerald-700 font-semibold text-center">
                ✓ Authenticated as {role?.replace("_", " ")}. Click to open provisioning form:
              </p>

              {activeRoleTab === "DOCTOR" ? (
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold"
                  leftIcon={<Stethoscope className="w-4 h-4" />}
                  onClick={() => setIsDoctorModalOpen(true)}
                >
                  Provision New Doctor Account
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                  leftIcon={<UserPlus className="w-4 h-4" />}
                  onClick={() => setIsStaffModalOpen(true)}
                >
                  Provision {activeRoleTab.replace("_", " ")} Account
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
                <p className="text-xs text-slate-600">
                  Staff provisioning requires Administrator authorization.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                    isLoading={isAutoLogingIn}
                    leftIcon={<ShieldCheck className="w-3.5 h-3.5" />}
                    onClick={handleAdminAuth}
                  >
                    Login as Admin to Provision
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-slate-300 text-slate-700 hover:bg-slate-100"
                    leftIcon={<Stethoscope className="w-3.5 h-3.5" />}
                    onClick={() => {
                      if (activeRoleTab === "DOCTOR") setIsDoctorModalOpen(true);
                      else setIsStaffModalOpen(true);
                    }}
                  >
                    Open Form (Dev Mode)
                  </Button>
                </div>
              </div>

              <Button
                variant="secondary"
                size="lg"
                className="w-full"
                onClick={() => navigate(`/login?mode=STAFF&role=${activeRoleTab}`)}
                rightIcon={<ChevronRight className="w-4 h-4" />}
              >
                Sign In to Staff Workspace
              </Button>
            </div>
          )}

          {/* Navigation Links */}
          <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-200">
            <Link
              to="/register"
              className="text-teal-600 font-semibold hover:underline flex items-center gap-1"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Patient Registration</span>
            </Link>

            <Link
              to="/login"
              className="text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Login</span>
            </Link>
          </div>
        </div>

        {/* Doctor Form Modal */}
        <DoctorFormModal
          isOpen={isDoctorModalOpen}
          onClose={() => setIsDoctorModalOpen(false)}
          onSubmit={handleCreateDoctor}
          title="Provision New Doctor Account"
        />

        {/* Staff Form Modal */}
        <StaffFormModal
          isOpen={isStaffModalOpen}
          onClose={() => setIsStaffModalOpen(false)}
          onSubmit={handleCreateStaff}
          defaultType={
            activeRoleTab === "HOSPITAL_ADMIN"
              ? "ADMIN"
              : (activeRoleTab as any) || "RECEPTIONIST"
          }
          title={`Provision ${activeRoleTab.replace("_", " ")} Account`}
        />
      </div>
    </AuthLayout>
  );
};

export default StaffOnboardingPage;
