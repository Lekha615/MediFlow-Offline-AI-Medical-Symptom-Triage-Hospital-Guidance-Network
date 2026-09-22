import React, { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "../common/Modal";
import { Input } from "../common/Input";
import { Select } from "../common/Select";
import { Button } from "../common/Button";
import { Staff, StaffCreatePayload, StaffType } from "../../types/staff";
import { hospitalApi } from "../../api/hospitalApi";

const staffCreateSchema = z.object({
  email: z.string().email("Invalid email").trim().toLowerCase(),
  phoneNumber: z.string().regex(/^[0-9]{10,15}$/, "Phone must be 10-15 digits"),
  password: z.string().min(8, "Min 8 chars").max(72),
  hospitalId: z.string().min(1, "Please select a Hospital"),
  type: z.enum(["RECEPTIONIST", "LAB_TECHNICIAN", "AMBULANCE_DRIVER", "ADMIN", "OTHER"]),
  firstName: z.string().trim().min(1, "First name is required").max(100),
  lastName: z.string().trim().min(1, "Last name is required").max(100),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]).optional(),
});

type StaffFormValues = z.infer<typeof staffCreateSchema>;

export interface StaffFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: StaffCreatePayload) => Promise<void>;
  initialData?: Staff | null;
  defaultType?: StaffType;
  title: string;
}

export const StaffFormModal: React.FC<StaffFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  defaultType = "RECEPTIONIST",
  title,
}) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch active hospitals
  const { data: hospitalsList } = useQuery({
    queryKey: ["hospitals-form-list-staff"],
    queryFn: () => hospitalApi.list({ limit: 50, status: "ACTIVE" }),
    enabled: isOpen,
  });

  const hospitals = hospitalsList?.data || [];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<StaffFormValues>({
    resolver: zodResolver(staffCreateSchema),
    defaultValues: initialData
      ? {
          email: initialData.user?.email || "",
          phoneNumber: initialData.user?.phoneNumber || "9876543210",
          password: "Receptionist@12345",
          hospitalId: initialData.hospitalId,
          type: initialData.type,
          firstName: initialData.firstName,
          lastName: initialData.lastName,
          status: (initialData.user?.status as any) || "ACTIVE",
        }
      : {
          type: defaultType,
          password: "Receptionist@12345",
          status: "ACTIVE",
        },
  });

  const selectedHospitalId = watch("hospitalId");

  // Auto select default hospital if available and not yet set
  useEffect(() => {
    if (!selectedHospitalId && hospitals.length > 0) {
      setValue("hospitalId", hospitals[0].id);
    }
  }, [hospitals, selectedHospitalId, setValue]);

  const handleFormSubmit: SubmitHandler<StaffFormValues> = async (values) => {
    setErrorMessage(null);
    try {
      await onSubmit(values as StaffCreatePayload);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.message || "Operation failed");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="md">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3">
        {errorMessage && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {errorMessage}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input label="First Name" placeholder="Rachel" error={errors.firstName?.message} {...register("firstName")} />
          <Input label="Last Name" placeholder="Green" error={errors.lastName?.message} {...register("lastName")} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input label="Email Address" type="email" placeholder="receptionist@mediflow.com" error={errors.email?.message} {...register("email")} />
          <Input label="Phone Number" placeholder="9666666666" error={errors.phoneNumber?.message} {...register("phoneNumber")} />
        </div>

        {!initialData && (
          <Input label="Account Password" type="password" placeholder="••••••••" error={errors.password?.message} {...register("password")} />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Staff Type */}
          <Select
            label="Staff Role / Position"
            options={[
              { label: "Receptionist (Front Desk)", value: "RECEPTIONIST" },
              { label: "Lab Technician", value: "LAB_TECHNICIAN" },
              { label: "Ambulance Driver", value: "AMBULANCE_DRIVER" },
              { label: "Hospital Admin Staff", value: "ADMIN" },
              { label: "Other Healthcare Staff", value: "OTHER" },
            ]}
            error={errors.type?.message}
            {...register("type")}
          />

          {/* Account Status */}
          <Select
            label="Account Status"
            options={[
              { label: "Active", value: "ACTIVE" },
              { label: "Inactive", value: "INACTIVE" },
              { label: "Suspended", value: "SUSPENDED" },
            ]}
            error={errors.status?.message}
            {...register("status")}
          />
        </div>

        {/* Real Hospital Dropdown */}
        <Select
          label="Hospital Facility"
          options={
            hospitals.length > 0
              ? hospitals.map((h) => ({ label: `${h.name} (${h.code})`, value: h.id }))
              : [{ label: "No Active Hospitals Found", value: "" }]
          }
          error={errors.hospitalId?.message}
          {...register("hospitalId")}
        />

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 mt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Provision Staff Account
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default StaffFormModal;
