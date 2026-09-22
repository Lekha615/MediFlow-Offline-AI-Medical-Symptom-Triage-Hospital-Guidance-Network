import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Plus, Search, Edit, Clock, ShieldCheck, Mail, Phone } from "lucide-react";
import { staffApi } from "../../api/staffApi";
import { Staff, StaffCreatePayload, StaffType } from "../../types/staff";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Select } from "../../components/common/Select";
import { Badge } from "../../components/common/Badge";
import { Pagination } from "../../components/common/Pagination";
import { Spinner } from "../../components/common/Spinner";
import { EmptyState } from "../../components/common/EmptyState";
import { StaffFormModal } from "../../components/staff/StaffFormModal";

export const StaffListPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["staff-list", page, search, typeFilter],
    queryFn: () =>
      staffApi.list({
        page,
        limit: 10,
        search: search || undefined,
        type: (typeFilter as StaffType) || undefined,
      }),
  });

  const createMutation = useMutation({
    mutationFn: (payload: StaffCreatePayload) => staffApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-list"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      staffApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-list"] });
    },
  });

  const handleSave = async (payload: StaffCreatePayload) => {
    if (editingStaff) {
      await updateMutation.mutateAsync({ id: editingStaff.id, payload });
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
            <Users className="w-6 h-6 text-indigo-600" />
            <span>Healthcare Staff Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Provision and manage Receptionists, Front-desk Operators, and Laboratory Technicians across facilities.
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setEditingStaff(null);
            setIsModalOpen(true);
          }}
        >
          Provision New Staff
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search by staff name or email..."
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
            placeholder="All Staff Roles"
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            options={[
              { label: "All Roles", value: "" },
              { label: "Receptionist", value: "RECEPTIONIST" },
              { label: "Lab Technician", value: "LAB_TECHNICIAN" },
              { label: "Ambulance Driver", value: "AMBULANCE_DRIVER" },
              { label: "Hospital Admin Staff", value: "ADMIN" },
            ]}
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center"><Spinner size="lg" /></div>
        ) : isError ? (
          <div className="p-8 text-center text-xs text-rose-500 font-medium">Failed to load staff list. Please try again.</div>
        ) : !data || !Array.isArray(data.data) || data.data.length === 0 ? (
          <EmptyState
            title="No Staff Accounts Found"
            description="No staff records match your criteria."
            action={
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setEditingStaff(null);
                  setIsModalOpen(true);
                }}
              >
                Provision Receptionist / Staff
              </Button>
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Staff Member</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Hospital Facility</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {data.data.map((s) => {
                    const staffTypeDisplay = s?.type ? String(s.type).replace(/_/g, " ") : "STAFF";
                    return (
                      <tr key={s.id || Math.random()} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                            <span>{s.firstName || "Unnamed"} {s.lastName || "Staff"}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2 mt-0.5">
                            <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-slate-400" />{s.user?.email || "N/A"}</span>
                            {s.user?.phoneNumber && (
                              <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" />{s.user.phoneNumber}</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                            {s?.type === "RECEPTIONIST" ? <Clock className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                            {staffTypeDisplay}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                          {s.hospital?.name || "MediFlow Central Hospital"}
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge variant={s.user?.status === "ACTIVE" ? "active" : "inactive"}>
                            {s.user?.status || "ACTIVE"}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setEditingStaff(s);
                                setIsModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                              title="Edit Staff"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <Pagination meta={data.pagination} onPageChange={(p) => setPage(p)} />
          </>
        )}
      </div>

      <StaffFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSave}
        initialData={editingStaff}
        title={editingStaff ? "Edit Staff Account" : "Provision New Staff Member"}
      />
    </div>
  );
};

export default StaffListPage;
