import React from "react";
import { Link } from "react-router-dom";
import { LogOut, User as UserIcon, Menu, Shield, Bot } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { ThemeToggle } from "../common/ThemeToggle";
import { LanguageSelector } from "../common/LanguageSelector";
import { Badge } from "../common/Badge";
import { useTranslation } from "../../i18n";

export interface HeaderProps {
  onToggleSidebar?: () => void;
  onToggleAssistant?: () => void;
  isAssistantOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onToggleAssistant,
  isAssistantOpen,
}) => {
  const { user, role, logout } = useAuth();
  const { t } = useTranslation();

  const roleVariantMap: Record<string, any> = {
    SUPER_ADMIN: "admin",
    HOSPITAL_ADMIN: "admin",
    DOCTOR: "doctor",
    RECEPTIONIST: "receptionist",
    LAB_TECHNICIAN: "neutral",
    PATIENT: "patient",
  };

  const roleTranslationMap: Record<string, string> = {
    SUPER_ADMIN: t("header.roleSuperAdmin"),
    HOSPITAL_ADMIN: t("header.roleHospitalAdmin"),
    DOCTOR: t("header.roleDoctor"),
    RECEPTIONIST: t("header.roleReceptionist"),
    LAB_TECHNICIAN: t("header.roleLabTech"),
    PATIENT: t("header.rolePatient"),
  };

  const roleStr = typeof role === "string" ? role : (role as any)?.name || "";
  const roleDisplay = roleTranslationMap[roleStr] || roleStr.replace("_", " ");

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label={t("header.toggleMenu")}
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold text-lg shadow-sm shadow-teal-600/30">
            M
          </div>
          <span className="font-extrabold text-lg text-slate-900 dark:text-slate-100 tracking-tight">
            Medi<span className="text-teal-600 dark:text-teal-400">Flow</span>
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-2.5">
        <LanguageSelector variant="header" />
        <ThemeToggle />

        {/* AI Assistant Trigger Button */}
        {onToggleAssistant && (
          <button
            type="button"
            onClick={onToggleAssistant}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              isAssistantOpen
                ? "bg-teal-600 text-white shadow-sm"
                : "bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 hover:bg-teal-100 dark:hover:bg-teal-900/80"
            }`}
            title={t("header.toggleAssistant")}
          >
            <Bot className="w-4 h-4" />
            <span className="hidden sm:inline">{t("header.aiAssistant")}</span>
          </button>
        )}

        {roleStr && (
          <Badge variant={roleVariantMap[roleStr] || "neutral"} className="hidden sm:inline-flex">
            <Shield className="w-3 h-3 mr-1" />
            {roleDisplay}
          </Badge>
        )}

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block" />

        <div className="flex items-center gap-2.5">
          <Link to="/profile" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-teal-600 dark:text-teal-400 font-semibold text-sm">
              {user?.email?.[0]?.toUpperCase() || <UserIcon className="w-4 h-4" />}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[140px]">
                {user?.email}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">
                {roleDisplay}
              </p>
            </div>
          </Link>

          <button
            onClick={() => logout()}
            className="p-2 rounded-lg text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            title={t("auth.logout")}
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
