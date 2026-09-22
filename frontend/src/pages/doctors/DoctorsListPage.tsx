import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Stethoscope, Plus, Search, Edit, Power, PhoneCall } from "lucide-react";
import { doctorApi } from "../../api/doctorApi";
import { Doctor, DoctorCreatePayload } from "../../types/doctor";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Select } from "../../components/common/Select";
import { Badge } from "../../components/common/Badge";
import { Pagination } from "../../components/common/Pagination";
import { Spinner } from "../../components/common/Spinner";
import { EmptyState } from "../../components/common/EmptyState";
import { DoctorFormModal } from "../../components/doctors/DoctorFormModal";

export const DoctorsListPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [availableFilter, setAvailableFilter] = useState<string>("");

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["doctors-list", page, search, availableFilter],
    queryFn: () =>
      doctorApi.list({
        page,
        limit: 10,
        search: search || undefined,
        available: (availableFilter as any) || undefined,
      }),
  });

  const createMutation = useMutation({
    mutationFn: (payload: DoctorCreatePayload) => doctorApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors-list"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      doctorApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors-list"] });
    },
  });

  const availabilityMutation = useMutation({
    mutationFn: ({ id, isAvailable }: { id: string; isAvailable: boolean }) =>
      doctorApi.setAvailability(id, isAvailable),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors-list"] });
    },
  });

  const handleSave = async (payload: DoctorCreatePayload) => {
    if (editingDoctor) {
      await updateMutation.mutateAsync({ id: editingDoctor.id, payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-indigo-600" />
            <span>Doctors Directory</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage doctor profiles, licenses, consultation fees, and live availability status.
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setEditingDoctor(null);
            setIsModalOpen(true);
          }}
        >
          Onboard New Doctor
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search by doctor name or license number..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="w-full sm:w-56">
          <Select
            placeholder="All Availability"
            value={availableFilter}
            onChange={(e) => {
              setAvailableFilter(e.target.value);
              setPage(1);
            }}
            options={[
              { label: "Available Only", value: "true" },
              { label: "Unavailable Only", value: "false" },
            ]}
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {(() => {
          const doctorList = Array.isArray(data?.data)
            ? data.data
            : Array.isArray((data as any)?.items)
            ? (data as any).items
            : [];

          return (
            <>
              {isLoading ? (
                <div className="p-12 flex justify-center"><Spinner size="lg" /></div>
              ) : isError ? (
                <div className="p-8 text-center text-xs text-rose-500 font-medium">Failed to load doctors directory.</div>
              ) : doctorList.length === 0 ? (
                <EmptyState
                  title="No Doctors Found"
                  description="No doctor records match your filter criteria."
                  action={
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setEditingDoctor(null);
                        setIsModalOpen(true);
                      }}
                    >
                      Onboard Doctor
                    </Button>
                  }
                />
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                        <tr>
                          <th className="py-3 px-4">Doctor Name</th>
                          <th className="py-3 px-4">License & Qualification</th>
                          <th className="py-3 px-4">Fee</th>
                          <th className="py-3 px-4">Availability</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {doctorList.map((d: any) => (
                          <tr key={d.id || Math.random()} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-slate-900 dark:text-slate-100">
                                Dr. {d.firstName || ""} {d.lastName || ""}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                {d.user?.email || "N/A"}
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="font-semibold text-slate-700 dark:text-slate-300">{d.qualification || "General Practitioner"}</div>
                              <div className="text-[10px] text-teal-600 font-mono font-bold">
                                {d.licenseNumber || "N/A"}
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="font-extrabold text-teal-600 dark:text-teal-400">
                                ₹{d.consultationFee || "0"}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <Badge variant={d.isAvailable ? "active" : "inactive"}>
                                {d.isAvailable ? "Available" : "Busy"}
                              </Badge>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() =>
                                    availabilityMutation.mutate({
                                      id: d.id,
                                      isAvailable: !d.isAvailable,
                                    })
                                  }
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-teal-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                                  title="Toggle Availability"
                                >
                                  <Power className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingDoctor(d);
                                    setIsModalOpen(true);
                                  }}
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-teal-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                                  title="Edit"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <Pagination meta={data?.pagination || { page: 1, limit: 10, total: doctorList.length, totalPages: 1 }} onPageChange={(p) => setPage(p)} />
                </>
              )}
            </>
          );
        })()}
      </div>

      <DoctorFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSave}
        initialData={editingDoctor}
        title={editingDoctor ? "Edit Doctor Profile" : "Onboard New Doctor"}
      />
    </div>
  );
};
