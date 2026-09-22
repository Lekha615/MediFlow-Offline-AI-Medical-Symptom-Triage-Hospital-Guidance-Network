import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "../common/Modal";
import { Input } from "../common/Input";
import { Select } from "../common/Select";
import { Button } from "../common/Button";
import { Doctor, DoctorCreatePayload } from "../../types/doctor";
import { hospitalApi } from "../../api/hospitalApi";

const doctorCreateSchema = z.object({
  email: z.string().email("Invalid email").trim().toLowerCase(),
  phoneNumber: z.string().regex(/^[0-9]{10,15}$/, "Phone must be 10-15 digits"),
  password: z.string().min(8, "Min 8 chars").max(72),
  hospitalId: z.string().min(1, "Please select a Hospital"),
  departmentId: z.string().min(1, "Please select a Department"),
  roomId: z.string().optional().or(z.literal("")),
  licenseNumber: z.string().trim().min(2, "License number is required").max(100),
  firstName: z.string().trim().min(1, "First name is required").max(100),
  lastName: z.string().trim().min(1, "Last name is required").max(100),
  qualification: z.string().trim().min(2, "Qualification is required").max(255),
  consultationFee: z.coerce.number().min(0, "Fee must be positive"),
  isAvailable: z.boolean().optional(),
});

type DoctorFormValues = z.infer<typeof doctorCreateSchema>;

export interface DoctorFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: DoctorCreatePayload) => Promise<void>;
  initialData?: Doctor | null;
  title: string;
}

export const DoctorFormModal: React.FC<DoctorFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title,
}) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch active hospitals
  const { data: hospitalsList } = useQuery({
    queryKey: ["hospitals-form-list"],
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
  } = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorCreateSchema),
    defaultValues: initialData
      ? {
          email: initialData.user?.email || "",
          phoneNumber: initialData.user?.phoneNumber || "9876543210",
          password: "Doctor@12345",
          hospitalId: initialData.hospitalId,
          departmentId: initialData.departmentId,
          roomId: initialData.roomId || "",
          licenseNumber: initialData.licenseNumber,
          firstName: initialData.firstName,
          lastName: initialData.lastName,
          qualification: initialData.qualification,
          consultationFee: Number(initialData.consultationFee),
          isAvailable: initialData.isAvailable,
        }
      : {
          consultationFee: 500,
          isAvailable: true,
          password: "Doctor@12345",
        },
  });

  const selectedHospitalId = watch("hospitalId");

  // Fetch hospital detail with real departments & rooms whenever selected hospital changes
  const { data: hospitalDetail } = useQuery({
    queryKey: ["hospital-detail-for-doctor-form", selectedHospitalId],
    queryFn: () => hospitalApi.getById(selectedHospitalId),
    enabled: !!selectedHospitalId && isOpen,
  });

  const departments = (hospitalDetail as any)?.departments || [];
  const rooms = (hospitalDetail as any)?.rooms || [];

  // Auto select default hospital if available and not yet set
  useEffect(() => {
    if (!selectedHospitalId && hospitals.length > 0) {
      setValue("hospitalId", hospitals[0].id);
    }
  }, [hospitals, selectedHospitalId, setValue]);

  // Auto select first department if available and not set
  useEffect(() => {
    if (departments.length > 0) {
      const currentDept = watch("departmentId");
      if (!currentDept || !departments.some((d: any) => d.id === currentDept)) {
        setValue("departmentId", departments[0].id);
      }
    }
  }, [departments, setValue, watch]);

  const handleFormSubmit = async (values: DoctorFormValues) => {
    setErrorMessage(null);
    try {
      const payload: DoctorCreatePayload = {
        ...values,
        roomId: values.roomId ? values.roomId : undefined,
      };
      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.message || "Operation failed");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="lg">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3">
        {errorMessage && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {errorMessage}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input label="First Name" placeholder="Sarah" error={errors.firstName?.message} {...register("firstName")} />
          <Input label="Last Name" placeholder="Smith" error={errors.lastName?.message} {...register("lastName")} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input label="Email Address" type="email" placeholder="dr.sarah@mediflow.com" error={errors.email?.message} {...register("email")} />
          <Input label="Phone Number" placeholder="9876543210" error={errors.phoneNumber?.message} {...register("phoneNumber")} />
        </div>

        {!initialData && (
          <Input label="Account Password" type="password" placeholder="••••••••" error={errors.password?.message} {...register("password")} />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input label="License Number" placeholder="MED-998877" error={errors.licenseNumber?.message} {...register("licenseNumber")} />
          <Input label="Qualification" placeholder="MD, Cardiology" error={errors.qualification?.message} {...register("qualification")} />
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Real Department Dropdown */}
          <Select
            label="Department"
            options={
              departments.length > 0
                ? departments.map((d: any) => ({ label: `${d.name} (${d.code})`, value: d.id }))
                : [{ label: "-- Select Hospital First --", value: "" }]
            }
            error={errors.departmentId?.message}
            {...register("departmentId")}
          />

          {/* Real Consulting Room Dropdown */}
          <Select
            label="Consulting Room (Optional)"
            options={[
              { label: "-- None / General Desk --", value: "" },
              ...rooms.map((r: any) => ({
                label: `Room ${r.roomNumber} (${r.floor || "1st Floor"})`,
                value: r.id,
              })),
            ]}
            error={errors.roomId?.message}
            {...register("roomId")}
          />
        </div>

        <Input
          label="Consultation Fee (₹)"
          type="number"
          step="any"
          error={errors.consultationFee?.message}
          {...register("consultationFee")}
        />

        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="isAvailable"
            className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
            {...register("isAvailable")}
          />
          <label htmlFor="isAvailable" className="text-xs font-semibold text-slate-700">
            Available for Consultations Immediately
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 mt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Provision Doctor Account
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default DoctorFormModal;
