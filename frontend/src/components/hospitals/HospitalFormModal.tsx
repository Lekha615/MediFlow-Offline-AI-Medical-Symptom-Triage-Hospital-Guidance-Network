import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "../common/Modal";
import { Input } from "../common/Input";
import { Select } from "../common/Select";
import { Button } from "../common/Button";
import { Hospital, HospitalCreatePayload } from "../../types/hospital";

const hospitalSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(255),
  code: z.string().trim().min(2, "Code must be at least 2 characters").max(20).transform((v) => v.toUpperCase()),
  type: z.enum(["GOVERNMENT", "PRIVATE"]),
  speciality: z.enum(["EYE", "DENTAL", "AYURVEDIC", "HOMEOPATHY", "ALLOPATHY", "GENERAL"]),
  address: z.string().trim().min(5, "Address must be at least 5 characters"),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  contactEmail: z.string().email("Invalid email").max(255),
  contactPhone: z.string().regex(/^[0-9]{10,15}$/, "Phone must be 10-15 digits"),
  cityId: z.string().uuid("Please select a valid City ID or enter UUID"),
});

export interface HospitalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: HospitalCreatePayload) => Promise<void>;
  initialData?: Hospital | null;
  title: string;
}

export const HospitalFormModal: React.FC<HospitalFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title,
}) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof hospitalSchema>>({
    resolver: zodResolver(hospitalSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          code: initialData.code,
          type: initialData.type,
          speciality: initialData.speciality,
          address: initialData.address,
          latitude: Number(initialData.latitude),
          longitude: Number(initialData.longitude),
          contactEmail: initialData.contactEmail,
          contactPhone: initialData.contactPhone,
          cityId: initialData.cityId,
        }
      : {
          type: "PRIVATE",
          speciality: "GENERAL",
          latitude: 19.076,
          longitude: 72.8777,
        },
  });

  const handleFormSubmit = async (values: z.infer<typeof hospitalSchema>) => {
    setErrorMessage(null);
    try {
      await onSubmit(values as HospitalCreatePayload);
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
          <Input label="Hospital Name" placeholder="City General Hospital" error={errors.name?.message} {...register("name")} />
          <Input label="Hospital Code" placeholder="CGH01" error={errors.code?.message} {...register("code")} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Type"
            options={[
              { label: "Private", value: "PRIVATE" },
              { label: "Government", value: "GOVERNMENT" },
            ]}
            error={errors.type?.message}
            {...register("type")}
          />
          <Select
            label="Speciality"
            options={[
              { label: "General", value: "GENERAL" },
              { label: "Allopathy", value: "ALLOPATHY" },
              { label: "Eye", value: "EYE" },
              { label: "Dental", value: "DENTAL" },
              { label: "Ayurvedic", value: "AYURVEDIC" },
              { label: "Homeopathy", value: "HOMEOPATHY" },
            ]}
            error={errors.speciality?.message}
            {...register("speciality")}
          />
        </div>

        <Input label="Street Address" placeholder="123 Health Ave, Suite 400" error={errors.address?.message} {...register("address")} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input label="Contact Email" type="email" placeholder="info@cgh.com" error={errors.contactEmail?.message} {...register("contactEmail")} />
          <Input label="Contact Phone" placeholder="9876543210" error={errors.contactPhone?.message} {...register("contactPhone")} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input label="City UUID" placeholder="City UUID from database" error={errors.cityId?.message} {...register("cityId")} />
          <Input label="Latitude" type="number" step="any" error={errors.latitude?.message} {...register("latitude")} />
          <Input label="Longitude" type="number" step="any" error={errors.longitude?.message} {...register("longitude")} />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 mt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Save Hospital
          </Button>
        </div>
      </form>
    </Modal>
  );
};
