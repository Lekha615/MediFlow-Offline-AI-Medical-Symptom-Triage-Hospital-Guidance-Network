import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, ShieldAlert } from "lucide-react";
import { authApi } from "../../api/authApi";
import { getApiErrorMessage } from "../../api/client";
import { AuthLayout } from "../../components/layout/AuthLayout";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid registered email address").trim().toLowerCase(),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const ForgotPasswordPage: React.FC = () => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const res = await authApi.forgotPassword(values.email);
      setIsSuccess(true);
      setSuccessMessage(res.message);
    } catch (err: any) {
      if (err.message?.includes("not yet active")) {
        setErrorMessage("Backend password reset API (/api/auth/forgot-password) is not currently implemented on the server. Please contact your Hospital Administrator or Super Admin to reset your account password.");
      } else {
        setErrorMessage(getApiErrorMessage(err));
      }
    }
  };

  return (
    <AuthLayout
      title="Reset Your Password"
      subtitle="Enter your email to receive recovery instructions"
    >
      {!isSuccess ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
              <div>
                <p className="font-bold text-amber-300">System Notice</p>
                <p className="text-amber-200/80 text-[11px] mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          <Input
            label="Registered Email Address"
            type="email"
            placeholder="patient@example.com"
            leftIcon={<Mail className="w-4 h-4" />}
            error={errors.email?.message}
            {...register("email")}
          />

          <Button
            type="submit"
            className="w-full mt-2"
            size="lg"
            isLoading={isSubmitting}
          >
            Send Reset Instructions
          </Button>

          <div className="text-center mt-6 pt-4 border-t border-slate-700/50">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-teal-400 font-semibold transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </form>
      ) : (
        <div className="space-y-4 text-center py-2">
          <div className="w-12 h-12 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <h3 className="text-lg font-bold text-white">Reset Request Processed</h3>
          <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
            {successMessage}
          </p>

          <div className="pt-4 border-t border-slate-700/50">
            <Link to="/login">
              <Button variant="outline" className="w-full text-slate-200 border-slate-700 hover:bg-slate-800">
                Return to Sign In
              </Button>
            </Link>
          </div>
        </div>
      )}
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
