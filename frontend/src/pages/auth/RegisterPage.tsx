import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Lock, User, Phone, Calendar, AlertCircle, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { AuthLayout } from "../../components/layout/AuthLayout";
import { Input } from "../../components/common/Input";
import { Select } from "../../components/common/Select";
import { Button } from "../../components/common/Button";

const registerSchema = z
  .object({
    email: z.string().email("Invalid email address").trim().toLowerCase(),
    phoneNumber: z.string().regex(/^[0-9]{10,15}$/, "Phone number must be 10-15 digits"),
    password: z
      .string()
      .min(8, "At least 8 characters")
      .max(72)
      .regex(/[A-Z]/, "One uppercase letter required")
      .regex(/[a-z]/, "One lowercase letter required")
      .regex(/[0-9]/, "One number required")
      .regex(/[@$!%*?&#^()_+=-]/, "One special character required"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    firstName: z.string().trim().min(1, "First name is required").max(100),
    lastName: z.string().trim().min(1, "Last name is required").max(100),
    gender: z.enum(["MALE", "FEMALE", "OTHER"]),
    dateOfBirth: z.string().min(1, "Date of birth is required"),
    bloodGroup: z.string().optional(),
    address: z.string().optional(),
    emergencyContactName: z.string().optional(),
    emergencyContactPhone: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      gender: "MALE",
    },
  });

  const passwordValue = watch("password", "");

  const rules = [
    { label: "At least 8 characters", valid: passwordValue.length >= 8 },
    { label: "One uppercase letter (A-Z)", valid: /[A-Z]/.test(passwordValue) },
    { label: "One lowercase letter (a-z)", valid: /[a-z]/.test(passwordValue) },
    { label: "One number (0-9)", valid: /[0-9]/.test(passwordValue) },
    { label: "One special character (@$!%*?&)", valid: /[@$!%*?&#^()_+=-]/.test(passwordValue) },
  ];

  const onSubmit = async (values: RegisterFormValues) => {
    setErrorMessage(null);
    try {
      const { confirmPassword, ...payload } = values;
      await registerAuth(payload);
      navigate("/dashboard");
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || err.message || "Registration failed"
      );
    }
  };

  return (
    <AuthLayout
      title="Patient Registration"
      subtitle="Create your MediFlow patient account"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        {errorMessage && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="First Name"
            placeholder="John"
            leftIcon={<User className="w-4 h-4" />}
            error={errors.firstName?.message}
            {...register("firstName")}
          />
          <Input
            label="Last Name"
            placeholder="Doe"
            leftIcon={<User className="w-4 h-4" />}
            error={errors.lastName?.message}
            {...register("lastName")}
          />
        </div>

        <Input
          label="Email Address"
          type="email"
          placeholder="patient@example.com"
          leftIcon={<Mail className="w-4 h-4" />}
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          label="Phone Number"
          placeholder="9876543210"
          leftIcon={<Phone className="w-4 h-4" />}
          error={errors.phoneNumber?.message}
          {...register("phoneNumber")}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Gender"
            options={[
              { label: "Male", value: "MALE" },
              { label: "Female", value: "FEMALE" },
              { label: "Other", value: "OTHER" },
            ]}
            error={errors.gender?.message}
            {...register("gender")}
          />

          <Input
            label="Date of Birth"
            type="date"
            leftIcon={<Calendar className="w-4 h-4" />}
            error={errors.dateOfBirth?.message}
            {...register("dateOfBirth")}
          />
        </div>

        {/* Password & Confirm Password with Visibility Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Input
              label="Password"
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

          <div className="relative">
            <Input
              label="Confirm Password"
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
        </div>

        {/* Real-Time Password Requirements Checklist */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Password Criteria
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px]">
            {rules.map((rule, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <CheckCircle2
                  className={`w-3 h-3 ${
                    rule.valid ? "text-emerald-600" : "text-slate-400"
                  }`}
                />
                <span className={rule.valid ? "text-slate-900 font-medium" : "text-slate-500"}>
                  {rule.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <Button
          type="submit"
          className="w-full mt-4"
          size="lg"
          isLoading={isSubmitting}
        >
          Create Patient Account
        </Button>

        <div className="text-center mt-4 pt-3 border-t border-slate-200">
          <p className="text-xs text-slate-600">
            Already have an account?{" "}
            <Link to="/login" className="text-teal-600 font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};

export default RegisterPage;
