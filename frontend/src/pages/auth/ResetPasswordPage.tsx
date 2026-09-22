import React, { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ShieldAlert, ArrowLeft } from "lucide-react";
import { authApi } from "../../api/authApi";
import { AuthLayout } from "../../components/layout/AuthLayout";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(72)
      .regex(/[A-Z]/, "Must contain one uppercase letter")
      .regex(/[a-z]/, "Must contain one lowercase letter")
      .regex(/[0-9]/, "Must contain one number")
      .regex(/[@$!%*?&#^()_+=-]/, "Must contain one special character"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const passwordValue = watch("password", "");

  const rules = [
    { label: "At least 8 characters", valid: passwordValue.length >= 8 },
    { label: "One uppercase letter (A-Z)", valid: /[A-Z]/.test(passwordValue) },
    { label: "One lowercase letter (a-z)", valid: /[a-z]/.test(passwordValue) },
    { label: "One number (0-9)", valid: /[0-9]/.test(passwordValue) },
    { label: "One special character (@$!%*?&)", valid: /[@$!%*?&#^()_+=-]/.test(passwordValue) },
  ];

  const onSubmit = async (values: ResetPasswordFormValues) => {
    setErrorMessage(null);
    if (!token) {
      setErrorMessage("Reset token is missing or invalid.");
      return;
    }

    try {
      await authApi.resetPassword(token, values.password);
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to reset password. Token may be expired.");
    }
  };

  if (!token && !isSuccess) {
    return (
      <AuthLayout
        title="Invalid Reset Link"
        subtitle="Password reset token missing or expired"
      >
        <div className="space-y-4 text-center py-2">
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
            <span>No valid security reset token found in URL parameters.</span>
          </div>

          <p className="text-xs text-slate-600">
            Please request a new password recovery link to reset your credentials.
          </p>

          <div className="pt-2">
            <Link to="/forgot-password">
              <Button variant="primary" className="w-full">
                Request New Reset Link
              </Button>
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Set New Password"
      subtitle="Create a secure new password for your MediFlow account"
    >
      {!isSuccess ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* New Password Input */}
          <div className="relative">
            <Input
              label="New Password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              error={errors.password?.message}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-8 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Confirm Password Input */}
          <div className="relative">
            <Input
              label="Confirm New Password"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-8 text-slate-400 hover:text-slate-600"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Password Requirements Checklist */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Password Requirements
            </p>
            {rules.map((rule, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <CheckCircle2
                  className={`w-3.5 h-3.5 ${
                    rule.valid ? "text-emerald-600" : "text-slate-400"
                  }`}
                />
                <span className={rule.valid ? "text-slate-900 font-medium" : "text-slate-500"}>
                  {rule.label}
                </span>
              </div>
            ))}
          </div>

          <Button
            type="submit"
            className="w-full mt-2"
            size="lg"
            isLoading={isSubmitting}
          >
            Update Password
          </Button>

          <div className="text-center mt-4 pt-3 border-t border-slate-200">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-teal-600 font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </form>
      ) : (
        <div className="space-y-4 text-center py-2">
          <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <h3 className="text-lg font-bold text-slate-900">Password Updated</h3>
          <p className="text-xs text-slate-600">
            Your credentials have been reset successfully. You can now sign in with your new password.
          </p>

          <div className="pt-4 border-t border-slate-200">
            <Button
              variant="primary"
              className="w-full"
              onClick={() => navigate("/login")}
            >
              Sign In Now
            </Button>
          </div>
        </div>
      )}
    </AuthLayout>
  );
};

export default ResetPasswordPage;
