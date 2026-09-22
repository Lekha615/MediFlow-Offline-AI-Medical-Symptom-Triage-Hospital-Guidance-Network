import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Spinner } from "../../components/common/Spinner";

export const getRoleDashboardPath = (role?: any): string => {
  const roleName = typeof role === "string" ? role : role?.name;
  switch (roleName) {
    case "SUPER_ADMIN":
      return "/admin/dashboard";
    case "HOSPITAL_ADMIN":
      return "/hospital/dashboard";
    case "DOCTOR":
      return "/doctor/dashboard";
    case "RECEPTIONIST":
      return "/reception/dashboard";
    case "LAB_TECHNICIAN":
      return "/lab/dashboard";
    case "PATIENT":
      return "/patient/dashboard";
    default:
      return "/login";
  }
};

export const RoleBasedDashboard: React.FC = () => {
  const { role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="p-12 flex justify-center items-center min-h-[50vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  const targetPath = getRoleDashboardPath(role);
  return <Navigate to={targetPath} replace />;
};

export default RoleBasedDashboard;
