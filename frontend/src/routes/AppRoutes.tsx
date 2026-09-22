import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ProtectedRoute } from "./ProtectedRoute";
import { DashboardLayout } from "../components/layout/DashboardLayout";

import { LandingPage } from "../pages/landing/LandingPage";
import { LoginPage } from "../pages/auth/LoginPage";
import { RegisterPage } from "../pages/auth/RegisterPage";
import { StaffOnboardingPage } from "../pages/auth/StaffOnboardingPage";
import { ForgotPasswordPage } from "../pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "../pages/auth/ResetPasswordPage";
import { UnauthorizedPage } from "../pages/auth/UnauthorizedPage";

import { RoleBasedDashboard } from "../pages/dashboard/RoleBasedDashboard";
import { SuperAdminDashboard } from "../pages/dashboard/SuperAdminDashboard";
import { HospitalAdminDashboard } from "../pages/dashboard/HospitalAdminDashboard";
import { DoctorDashboard } from "../pages/dashboard/DoctorDashboard";
import { ReceptionistDashboard } from "../pages/dashboard/ReceptionistDashboard";
import { LabTechDashboard } from "../pages/dashboard/LabTechDashboard";
import { PatientDashboard } from "../pages/dashboard/PatientDashboard";

import { SymptomTriagePage } from "../pages/triage/SymptomTriagePage";
import { HospitalGuidancePage } from "../pages/hospitals/HospitalGuidancePage";
import { HospitalDetailsPage } from "../pages/hospitals/HospitalDetailsPage";
import { HospitalsListPage } from "../pages/hospitals/HospitalsListPage";
import { DoctorsListPage } from "../pages/doctors/DoctorsListPage";
import { StaffListPage } from "../pages/staff/StaffListPage";
import { PatientsListPage } from "../pages/patients/PatientsListPage";
import { QueueManagementPage } from "../pages/queue/QueueManagementPage";
import { PatientQueuePage } from "../pages/queue/PatientQueuePage";
import { AppointmentsPage } from "../pages/appointments/AppointmentsPage";
import { PatientProfilePage } from "../pages/profile/PatientProfilePage";
import { NotFoundPage } from "../pages/NotFoundPage";

import { ErrorBoundary } from "../components/common/ErrorBoundary";

const QueuePageDispatcher: React.FC = () => {
  const { role } = useAuth();
  if (role === "PATIENT") {
    return <PatientQueuePage />;
  }
  return <QueueManagementPage />;
};

const StaffPageDispatcher: React.FC = () => {
  const { role } = useAuth();
  if (role === "DOCTOR") {
    return <DoctorDashboard />;
  }
  if (role === "RECEPTIONIST") {
    return <ReceptionistDashboard />;
  }
  if (role === "LAB_TECHNICIAN") {
    return <LabTechDashboard />;
  }
  if (role === "HOSPITAL_ADMIN") {
    return <StaffListPage />;
  }
  if (role === "SUPER_ADMIN") {
    return <StaffListPage />;
  }
  if (role === "PATIENT") {
    return <UnauthorizedPage />;
  }
  return <StaffListPage />;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* Public Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/register/staff" element={<StaffOnboardingPage />} />
      <Route path="/register/staff/:role" element={<StaffOnboardingPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Main Dashboard Dispatcher */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <RoleBasedDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* DISTINCT ROLE PORTAL DASHBOARDS */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
            <DashboardLayout>
              <ErrorBoundary fallbackTitle="Admin Dashboard could not be loaded.">
                <SuperAdminDashboard />
              </ErrorBoundary>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/hospital/dashboard"
        element={
          <ProtectedRoute allowedRoles={["HOSPITAL_ADMIN"]}>
            <DashboardLayout>
              <ErrorBoundary fallbackTitle="Hospital Dashboard could not be loaded.">
                <HospitalAdminDashboard />
              </ErrorBoundary>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/doctor/dashboard"
        element={
          <ProtectedRoute allowedRoles={["DOCTOR"]}>
            <DashboardLayout>
              <ErrorBoundary fallbackTitle="Doctor Dashboard could not be loaded.">
                <DoctorDashboard />
              </ErrorBoundary>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/reception/dashboard"
        element={
          <ProtectedRoute allowedRoles={["RECEPTIONIST"]}>
            <DashboardLayout>
              <ReceptionistDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/lab/dashboard"
        element={
          <ProtectedRoute allowedRoles={["LAB_TECHNICIAN"]}>
            <DashboardLayout>
              <LabTechDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/patient/dashboard"
        element={
          <ProtectedRoute allowedRoles={["PATIENT"]}>
            <DashboardLayout>
              <ErrorBoundary fallbackTitle="Patient Dashboard could not be loaded.">
                <PatientDashboard />
              </ErrorBoundary>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Symptom Triage */}
      <Route
        path="/triage"
        element={
          <ProtectedRoute allowedRoles={["PATIENT"]}>
            <DashboardLayout>
              <ErrorBoundary fallbackTitle="Symptom Triage could not be loaded.">
                <SymptomTriagePage />
              </ErrorBoundary>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Hospital Guidance & Discovery */}
      <Route
        path="/guidance"
        element={
          <ProtectedRoute allowedRoles={["PATIENT"]}>
            <DashboardLayout>
              <ErrorBoundary fallbackTitle="Hospital Guidance could not be loaded.">
                <HospitalGuidancePage />
              </ErrorBoundary>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Hospital Detail View */}
      <Route
        path="/hospitals/:id"
        element={
          <ProtectedRoute
            allowedRoles={[
              "PATIENT",
              "SUPER_ADMIN",
              "HOSPITAL_ADMIN",
              "RECEPTIONIST",
              "DOCTOR",
            ]}
          >
            <DashboardLayout>
              <HospitalDetailsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Hospitals Admin Management */}
      <Route
        path="/hospitals"
        element={
          <ProtectedRoute allowedRoles={["SUPER_ADMIN", "HOSPITAL_ADMIN"]}>
            <DashboardLayout>
              <HospitalsListPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Doctors Directory */}
      <Route
        path="/doctors"
        element={
          <ProtectedRoute
            allowedRoles={["SUPER_ADMIN", "HOSPITAL_ADMIN", "RECEPTIONIST"]}
          >
            <DashboardLayout>
              <DoctorsListPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Staff Management & Role-Aware Portal */}
      <Route
        path="/staff"
        element={
          <ProtectedRoute
            allowedRoles={[
              "SUPER_ADMIN",
              "HOSPITAL_ADMIN",
              "DOCTOR",
              "RECEPTIONIST",
              "LAB_TECHNICIAN",
            ]}
          >
            <DashboardLayout>
              <ErrorBoundary fallbackTitle="Staff Portal could not be loaded.">
                <StaffPageDispatcher />
              </ErrorBoundary>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Patients Directory */}
      <Route
        path="/patients"
        element={
          <ProtectedRoute
            allowedRoles={[
              "SUPER_ADMIN",
              "HOSPITAL_ADMIN",
              "DOCTOR",
              "RECEPTIONIST",
              "LAB_TECHNICIAN",
            ]}
          >
            <DashboardLayout>
              <ErrorBoundary fallbackTitle="Patients Directory could not be loaded.">
                <PatientsListPage />
              </ErrorBoundary>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Queue System */}
      <Route
        path="/queue"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <QueuePageDispatcher />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* My Appointments */}
      <Route
        path="/appointments"
        element={
          <ProtectedRoute allowedRoles={["PATIENT"]}>
            <DashboardLayout>
              <ErrorBoundary fallbackTitle="Appointments could not be loaded.">
                <AppointmentsPage />
              </ErrorBoundary>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* My Profile */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <ErrorBoundary fallbackTitle="Profile Page could not be loaded.">
                <PatientProfilePage />
              </ErrorBoundary>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* 404 Catch All */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
