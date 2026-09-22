import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { RoleName } from "../types/auth";
import { Spinner } from "../components/common/Spinner";
import { UnauthorizedPage } from "../pages/auth/UnauthorizedPage";

export interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: RoleName[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, isLoading, role } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <UnauthorizedPage />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
