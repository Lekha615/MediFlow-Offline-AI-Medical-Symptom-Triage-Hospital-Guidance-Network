import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Stethoscope,
  Users,
  Clock,
  CalendarCheck,
  UserCheck,
  Activity,
  FileText,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { RoleName } from "../../types/auth";
import { getRoleDashboardPath } from "../../pages/dashboard/RoleBasedDashboard";
import { useTranslation } from "../../i18n";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  key: string;
  label: string;
  path: string;
  icon: React.ReactNode;
  roles: RoleName[];
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { role } = useAuth();
  const { t } = useTranslation();
  const currentRole = (typeof role === "string" ? role : (role as any)?.name) as RoleName | undefined;
  const dashboardPath = getRoleDashboardPath(currentRole);

  const navItems: NavItem[] = [
    {
      key: "navigation.dashboard",
      label: "Dashboard",
      path: dashboardPath,
      icon: <LayoutDashboard className="w-5 h-5" />,
      roles: ["SUPER_ADMIN", "HOSPITAL_ADMIN", "DOCTOR", "RECEPTIONIST", "LAB_TECHNICIAN", "PATIENT"],
    },
    // PATIENT ONLY MODULES
    {
      key: "navigation.medicalRecords",
      label: "Medical Records",
      path: "/medical-records",
      icon: <FileText className="w-5 h-5" />,
      roles: ["PATIENT"],
    },
    {
      key: "navigation.symptomTriage",
      label: "Symptom Triage",
      path: "/triage",
      icon: <Activity className="w-5 h-5" />,
      roles: ["PATIENT"],
    },
    {
      key: "navigation.hospitalGuidance",
      label: "Hospital Guidance",
      path: "/guidance",
      icon: <Building2 className="w-5 h-5" />,
      roles: ["PATIENT"],
    },
    {
      key: "navigation.myAppointments",
      label: "My Appointments",
      path: "/appointments",
      icon: <CalendarCheck className="w-5 h-5" />,
      roles: ["PATIENT"],
    },
    // OPERATIONAL & ADMINISTRATIVE MODULES
    {
      key: "navigation.hospitals",
      label: "Hospitals",
      path: "/hospitals",
      icon: <Building2 className="w-5 h-5" />,
      roles: ["SUPER_ADMIN", "HOSPITAL_ADMIN", "PATIENT", "DOCTOR", "RECEPTIONIST"],
    },
    {
      key: "navigation.doctors",
      label: "Doctors",
      path: "/doctors",
      icon: <Stethoscope className="w-5 h-5" />,
      roles: ["SUPER_ADMIN", "HOSPITAL_ADMIN", "RECEPTIONIST"],
    },
    {
      key: "navigation.staffManagement",
      label: "Staff Management",
      path: "/staff",
      icon: <Users className="w-5 h-5" />,
      roles: ["SUPER_ADMIN", "HOSPITAL_ADMIN"],
    },
    {
      key: "navigation.patientsDirectory",
      label: "Patients Directory",
      path: "/patients",
      icon: <Users className="w-5 h-5" />,
      roles: ["SUPER_ADMIN", "HOSPITAL_ADMIN", "DOCTOR", "RECEPTIONIST", "LAB_TECHNICIAN"],
    },
    {
      key: "navigation.liveQueue",
      label: "Live Queue",
      path: "/queue",
      icon: <Clock className="w-5 h-5" />,
      roles: ["SUPER_ADMIN", "HOSPITAL_ADMIN", "DOCTOR", "RECEPTIONIST", "PATIENT"],
    },
    // SHARED USER PROFILE
    {
      key: "navigation.myProfile",
      label: "My Profile",
      path: "/profile",
      icon: <UserCheck className="w-5 h-5" />,
      roles: ["SUPER_ADMIN", "HOSPITAL_ADMIN", "DOCTOR", "RECEPTIONIST", "LAB_TECHNICIAN", "PATIENT"],
    },
  ];

  const allowedNavItems = navItems.filter(
    (item) => currentRole && item.roles.includes(currentRole)
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-100 dark:border-slate-800 lg:hidden">
          <span className="font-extrabold text-base text-slate-900 dark:text-slate-100">
            {t("navigation.mainMenu")}
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
            {currentRole ? `${currentRole.replace("_", " ")} MENU` : t("navigation.mainMenu")}
          </p>

          {allowedNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-semibold shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200"
                }`
              }
            >
              {item.icon}
              <span>{t(item.key)}</span>
            </NavLink>
          ))}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
