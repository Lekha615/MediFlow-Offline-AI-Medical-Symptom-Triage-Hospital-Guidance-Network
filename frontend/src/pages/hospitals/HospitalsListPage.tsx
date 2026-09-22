import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2, Plus, Search, Filter, Edit, Power, Trash2 } from "lucide-react";
import { hospitalApi } from "../../api/hospitalApi";
import { Hospital, HospitalCreatePayload } from "../../types/hospital";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Select } from "../../components/common/Select";
import { Badge } from "../../components/common/Badge";
import { Pagination } from "../../components/common/Pagination";
import { Spinner } from "../../components/common/Spinner";
import { EmptyState } from "../../components/common/EmptyState";
import { HospitalFormModal } from "../../components/hospitals/HospitalFormModal";

export const HospitalsListPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingHospital, setEditingHospital] = useState<Hospital | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["hospitals-list", page, search, typeFilter, statusFilter],
    queryFn: () =>
      hospitalApi.list({
        page,
        limit: 10,
        search: search || undefined,
        type: (typeFilter as any) || undefined,
        status: (statusFilter as any) || undefined,
      }),
  });

  const createMutation = useMutation({
    mutationFn: (payload: HospitalCreatePayload) => hospitalApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hospitals-list"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      hospitalApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hospitals-list"] });
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: any }) =>
      hospitalApi.setStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hospitals-list"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => hospitalApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hospitals-list"] });
    },
  });

  const handleSave = async (payload: HospitalCreatePayload) => {
    if (editingHospital) {
      await updateMutation.mutateAsync({ id: editingHospital.id, payload });
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
            <Building2 className="w-6 h-6 text-teal-600" />
            <span>Hospital Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse registered medical centers, configure status, and add new hospitals.
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setEditingHospital(null);
            setIsModalOpen(true);
          }}
        >
          Add New Hospital
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search by hospital name or code..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="w-full sm:w-48">
          <Select
            placeholder="All Types"
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            options={[
              { label: "Private", value: "PRIVATE" },
              { label: "Government", value: "GOVERNMENT" },
            ]}
          />
        </div>

        <div className="w-full sm:w-48">
          <Select
            placeholder="All Statuses"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            options={[
              { label: "Active", value: "ACTIVE" },
              { label: "Inactive", value: "INACTIVE" },
              { label: "Suspended", value: "SUSPENDED" },
            ]}
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {(() => {
          const hospitalList = Array.isArray(data?.data)
            ? data.data
            : Array.isArray((data as any)?.items)
            ? (data as any).items
            : [];

          return (
            <>
              {isLoading ? (
                <div className="p-12 flex justify-center"><Spinner size="lg" /></div>
              ) : isError ? (
                <div className="p-8 text-center text-xs text-rose-500 font-medium">Failed to load hospitals list. Please check connection.</div>
              ) : hospitalList.length === 0 ? (
                <EmptyState
                  title="No Hospitals Found"
                  description="No hospital records match your filter parameters."
                  action={
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setEditingHospital(null);
                        setIsModalOpen(true);
                      }}
                    >
                      Add Hospital
                    </Button>
                  }
                />
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                        <tr>
                          <th className="py-3 px-4">Hospital Code & Name</th>
                          <th className="py-3 px-4">Type / Speciality</th>
                          <th className="py-3 px-4">Contact</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {hospitalList.map((h: any) => (
                          <tr key={h.id || Math.random()} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="py-3.5 px-4">
                              <span className="font-mono text-[10px] font-bold text-teal-600 dark:text-teal-400 block">
                                {h.code || "N/A"}
                              </span>
                              <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                                {h.name || "Unnamed Hospital"}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 capitalize">
                              {h.type ? String(h.type).toLowerCase() : "N/A"} • {h.speciality || "General"}
                            </td>
                            <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                              <p className="font-medium">{h.contactPhone || "N/A"}</p>
                              <p className="text-[10px] text-slate-400">{h.contactEmail || ""}</p>
                            </td>
                            <td className="py-3.5 px-4">
                              <Badge variant={h.status === "ACTIVE" ? "active" : "inactive"}>
                                {h.status || "ACTIVE"}
                              </Badge>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => {
                                    setEditingHospital(h);
                                    setIsModalOpen(true);
                                  }}
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-teal-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                                  title="Edit Hospital"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    statusMutation.mutate({
                                      id: h.id,
                                      status: h.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
                                    })
                                  }
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                                  title="Toggle Status"
                                >
                                  <Power className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (window.confirm(`Are you sure you want to deactivate ${h.name}?`)) {
                                      deleteMutation.mutate(h.id);
                                    }
                                  }}
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                                  title="Remove Hospital"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <Pagination meta={data?.pagination || { page: 1, limit: 10, total: hospitalList.length, totalPages: 1 }} onPageChange={(p) => setPage(p)} />
                </>
              )}
            </>
          );
        })()}
      </div>

      <HospitalFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSave}
        initialData={editingHospital}
        title={editingHospital ? "Edit Hospital" : "Add New Hospital"}
      />
    </div>
  );
};
