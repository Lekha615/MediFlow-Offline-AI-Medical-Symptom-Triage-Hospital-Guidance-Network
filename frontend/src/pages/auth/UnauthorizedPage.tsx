import React from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, ArrowLeft, LayoutDashboard } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/common/Button";

export const UnauthorizedPage: React.FC = () => {
  const { role } = useAuth();

  return (
    <div className="min-h-screen bg-[#f0f4f8] text-slate-900 flex items-center justify-center p-6 selection:bg-rose-600 selection:text-white">
      <div className="max-w-md w-full bg-white border border-slate-200 p-8 rounded-3xl shadow-xl text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
            HTTP 403 Forbidden
          </span>
          <h1 className="text-2xl font-black text-slate-900">Unauthorized Portal Access</h1>
          <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
            Your account role <strong className="text-teal-600">{role || "USER"}</strong> does not have authorization to access this page or module.
          </p>
        </div>

        <div className="pt-4 border-t border-slate-200 space-y-3">
          <Link to="/dashboard">
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              leftIcon={<LayoutDashboard className="w-4 h-4" />}
            >
              Return to My Authorized Workspace
            </Button>
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go to Landing Page</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
