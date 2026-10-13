import React, { useState, useId } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  Plus,
  Search,
  Filter,
  Edit,
  Power,
  Trash2,
  Stethoscope,
  MapPin,
  Phone,
  Mail,
  FileUp,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Info,
  ExternalLink,
  ShieldCheck,
  Globe,
  Upload,
} from "lucide-react";
import { hospitalApi } from "../../api/hospitalApi";
import { doctorApi } from "../../api/doctorApi";
import { Hospital, HospitalCreatePayload, State, City } from "../../types/hospital";
import { Doctor } from "../../types/doctor";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Select } from "../../components/common/Select";
import { Badge } from "../../components/common/Badge";
import { Modal } from "../../components/common/Modal";
import { Pagination } from "../../components/common/Pagination";
import { Spinner } from "../../components/common/Spinner";
import { EmptyState } from "../../components/common/EmptyState";
import { HospitalFormModal } from "../../components/hospitals/HospitalFormModal";

const CHHATTISGARH_SAMPLE_CSV = `name,code,type,speciality,address,state,stateCode,city,contactEmail,contactPhone,latitude,longitude,isVerified
AIIMS Raipur,AIIMS-RPR,GOVERNMENT,GENERAL,"GE Road, Tatibandh",Chhattisgarh,CG,Raipur,aiimsrpr@mediflow.gov.in,07712573777,21.2568,81.5794,true
Dr. B.R. Ambedkar Memorial Hospital,BRAMH-RPR,GOVERNMENT,GENERAL,"Jail Road, Kapa",Chhattisgarh,CG,Raipur,bramh.rpr@mediflow.gov.in,07712890001,21.2500,81.6500,true
Apollo Hospitals Bilaspur,APOLLO-BSP,PRIVATE,GENERAL,"Rajkishore Nagar, Lingiyadih",Chhattisgarh,CG,Bilaspur,apollo.bsp@mediflow.com,07752407000,22.0910,82.1640,true
JLN Hospital & Research Centre,JLNH-BHI,GOVERNMENT,GENERAL,"Sector 9",Chhattisgarh,CG,Bhilai,jlnh.bhilai@mediflow.org,07882224001,21.1938,81.3509,true
Chhattisgarh Eye Hospital,CEH-RPR,PRIVATE,EYE,"Byron Bazar",Chhattisgarh,CG,Raipur,info@cg-eye.com,07714041122,21.2330,81.6370,true
Shri Shankaracharya Institute of Medical Sciences,SSIMS-BHI,PRIVATE,ALLOPATHY,"Junwani",Chhattisgarh,CG,Bhilai,info@ssims.ac.in,07884088888,21.2180,81.3120,true
Raipur Dental Clinic & Implant Centre,RDC-RPR,PRIVATE,DENTAL,"Shankar Nagar",Chhattisgarh,CG,Raipur,contact@raipurdental.com,07712445566,21.2480,81.6550,true
Government Ayurvedic College & Hospital,GACH-RPR,GOVERNMENT,AYURVEDIC,"GE Road",Chhattisgarh,CG,Raipur,ayush.rpr@mediflow.gov.in,07712263000,21.2420,81.6180,true
Homeopathy Medical Research Hospital,HMRH-BSP,PRIVATE,HOMEOPATHY,"Seepat Road",Chhattisgarh,CG,Bilaspur,hmrh.bsp@mediflow.org,07752251000,22.1000,82.1700,true
Durg District Hospital,DDH-DURG,GOVERNMENT,GENERAL,"Station Road",Chhattisgarh,CG,Durg,dh.durg@mediflow.gov.in,07882322300,21.1904,81.2849,true
Korba Super Speciality Hospital,KSSH-KRB,GOVERNMENT,GENERAL,"Transport Nagar",Chhattisgarh,CG,Korba,kssh.korba@mediflow.gov.in,07759245100,22.3595,82.7501,true
Rajnandgaon Medical College Hospital,RMC-RJN,GOVERNMENT,GENERAL,"Pendri",Chhattisgarh,CG,Rajnandgaon,rmc.rjn@mediflow.gov.in,07744224000,21.0970,81.0360,true
Bastar District Hospital Jagdalpur,BDH-JGD,GOVERNMENT,GENERAL,"Dharampura",Chhattisgarh,CG,Jagdalpur,dh.jagdalpur@mediflow.gov.in,07782222300,19.0740,82.0120,true
Raigarh Medical College Hospital,RMCH-RGH,GOVERNMENT,GENERAL,"Bendharchuwa",Chhattisgarh,CG,Raigarh,rmch.raigarh@mediflow.gov.in,07762224500,21.8974,83.3950,true
Ambikapur Government Medical College,AGMC-AMB,GOVERNMENT,GENERAL,"Surguja",Chhattisgarh,CG,Ambikapur,gmc.ambikapur@mediflow.gov.in,07774223100,23.1180,83.1970,true
Unverified Community Clinic,UNV-DEMO,PRIVATE,GENERAL,"G.E. Road, Supela",Chhattisgarh,CG,Bhilai,unverified@demo.com,07889999999,21.2000,81.3300,false`;

export const HospitalsListPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { role } = useAuth();
  const isAdmin = role === "SUPER_ADMIN" || role === "HOSPITAL_ADMIN";
  const fileInputId = useId();

  // Filter States
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [stateFilter, setStateFilter] = useState<string>("");
  const [cityFilter, setCityFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [specialityFilter, setSpecialityFilter] = useState<string>("");
  const [verifiedFilter, setVerifiedFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Modals
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingHospital, setEditingHospital] = useState<Hospital | null>(null);
  const [selectedHospitalForDoctors, setSelectedHospitalForDoctors] = useState<Hospital | null>(null);
  const [selectedHospitalForDetails, setSelectedHospitalForDetails] = useState<Hospital | null>(null);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState<boolean>(false);
  const [csvInput, setCsvInput] = useState<string>("");
  const [csvUploadStatus, setCsvUploadStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  // 1. Fetch States for filter dropdown
  const { data: statesData } = useQuery({
    queryKey: ["states-list"],
    queryFn: () => hospitalApi.getStates(),
  });
  const states = Array.isArray(statesData) ? statesData : [];

  // 2. Fetch Cities for filter dropdown (cascading on stateFilter)
  const { data: citiesData } = useQuery({
    queryKey: ["cities-list", stateFilter],
    queryFn: () => hospitalApi.getCities(stateFilter || undefined),
  });
  const cities = Array.isArray(citiesData) ? citiesData : [];

  // 3. Fetch real Hospitals from backend with active filters & pagination
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [
      "hospitals-list",
      page,
      search,
      stateFilter,
      cityFilter,
      typeFilter,
      specialityFilter,
      verifiedFilter,
      statusFilter,
    ],
    queryFn: () =>
      hospitalApi.list({
        page,
        limit: 10,
        search: search.trim() || undefined,
        stateId: stateFilter || undefined,
        cityId: cityFilter || undefined,
        type: (typeFilter as any) || undefined,
        speciality: (specialityFilter as any) || undefined,
        isVerified: verifiedFilter || undefined,
        status: (statusFilter as any) || undefined,
      }),
  });

  // 4. Fetch Doctors for selected hospital in modal
  const { data: doctorsData, isLoading: doctorsLoading } = useQuery({
    queryKey: ["hospital-doctors", selectedHospitalForDoctors?.id],
    queryFn: () =>
      doctorApi.list({
        hospitalId: selectedHospitalForDoctors?.id,
        limit: 50,
      }),
    enabled: !!selectedHospitalForDoctors?.id,
  });

  const doctorsList: Doctor[] = Array.isArray(doctorsData?.data)
    ? doctorsData.data
    : Array.isArray((doctorsData as any)?.items)
    ? (doctorsData as any).items
    : [];

  // Mutations
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

  const importCsvMutation = useMutation({
    mutationFn: (csvText: string) => hospitalApi.importCsv(csvText),
    onSuccess: (res) => {
      setCsvUploadStatus({
        success: true,
        message: `Successfully processed ${res.total} records (${res.imported} imported, ${res.updated} updated).`,
      });
      queryClient.invalidateQueries({ queryKey: ["hospitals-list"] });
      queryClient.invalidateQueries({ queryKey: ["states-list"] });
      queryClient.invalidateQueries({ queryKey: ["cities-list"] });
    },
    onError: (err: any) => {
      setCsvUploadStatus({
        success: false,
        message: err?.response?.data?.message || err?.message || "CSV Import failed.",
      });
    },
  });

  const handleSave = async (payload: HospitalCreatePayload) => {
    if (editingHospital) {
      await updateMutation.mutateAsync({ id: editingHospital.id, payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setStateFilter("");
    setCityFilter("");
    setTypeFilter("");
    setSpecialityFilter("");
    setVerifiedFilter("");
    setStatusFilter("");
    setPage(1);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCsvInput((event.target?.result as string) || "");
      };
      reader.readAsText(file);
    }
  };

  const hasActiveFilters = Boolean(
    search ||
      stateFilter ||
      cityFilter ||
      typeFilter ||
      specialityFilter ||
      verifiedFilter ||
      statusFilter
  );

  const hospitalList = Array.isArray(data?.data)
    ? data.data
    : Array.isArray((data as any)?.items)
    ? (data as any).items
    : [];

  const paginationMeta = data?.pagination || {
    page,
    limit: 10,
    total: hospitalList.length,
    totalPages: 1,
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Building2 className="w-7 h-7 text-teal-600" />
            <span>Hospital & Healthcare Directory</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse verified medical centers, specialty hospitals, affiliated specialists, and geographic registries across Indian states.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Upload className="w-4 h-4 text-teal-600" />}
              onClick={() => {
                setCsvInput("");
                setCsvUploadStatus(null);
                setIsCsvModalOpen(true);
              }}
            >
              Import CSV
            </Button>
          )}

          {isAdmin && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => {
                setEditingHospital(null);
                setIsModalOpen(true);
              }}
            >
              Add Hospital
            </Button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Keyword Search */}
          <div className="md:col-span-2">
            <Input
              placeholder="Search by hospital name, code, city, state, or address..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            />
          </div>

          {/* State Filter */}
          <div>
            <Select
              value={stateFilter}
              onChange={(e) => {
                setStateFilter(e.target.value);
                setCityFilter("");
                setPage(1);
              }}
              options={[
                { label: "All States (India)", value: "" },
                ...states.map((s) => ({
                  label: `${s.name} (${s.code})`,
                  value: s.id,
                })),
              ]}
            />
          </div>

          {/* District / City Filter */}
          <div>
            <Select
              value={cityFilter}
              onChange={(e) => {
                setCityFilter(e.target.value);
                setPage(1);
              }}
              options={[
                { label: "All Cities / Districts", value: "" },
                ...cities.map((c) => ({
                  label: c.name,
                  value: c.id,
                })),
              ]}
            />
          </div>
        </div>

        {/* Second Filter Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          {/* Hospital Type */}
          <div>
            <Select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              options={[
                { label: "All Types", value: "" },
                { label: "Government", value: "GOVERNMENT" },
                { label: "Private", value: "PRIVATE" },
              ]}
            />
          </div>

          {/* Speciality */}
          <div>
            <Select
              value={specialityFilter}
              onChange={(e) => {
                setSpecialityFilter(e.target.value);
                setPage(1);
              }}
              options={[
                { label: "All Specialties", value: "" },
                { label: "General", value: "GENERAL" },
                { label: "Eye", value: "EYE" },
                { label: "Dental", value: "DENTAL" },
                { label: "Ayurvedic", value: "AYURVEDIC" },
                { label: "Homeopathy", value: "HOMEOPATHY" },
                { label: "Allopathy", value: "ALLOPATHY" },
              ]}
            />
          </div>

          {/* Verified / Unverified */}
          <div>
            <Select
              value={verifiedFilter}
              onChange={(e) => {
                setVerifiedFilter(e.target.value);
                setPage(1);
              }}
              options={[
                { label: "All Verifications", value: "" },
                { label: "Verified Only", value: "true" },
                { label: "Unverified Only", value: "false" },
              ]}
            />
          </div>

          {/* Status */}
          <div>
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              options={[
                { label: "All Statuses", value: "" },
                { label: "Active", value: "ACTIVE" },
                { label: "Inactive", value: "INACTIVE" },
                { label: "Suspended", value: "SUSPENDED" },
              ]}
            />
          </div>

          {/* Reset Filters */}
          <div className="col-span-2 sm:col-span-4 md:col-span-1 flex items-center justify-end">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                onClick={handleResetFilters}
                className="w-full text-slate-500 hover:text-slate-800"
              >
                Reset
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Hospitals Table & Cards Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center space-y-3">
            <Spinner size="lg" />
            <p className="text-xs text-slate-500 font-medium">Fetching real hospital records from MediFlow registry...</p>
          </div>
        ) : isError ? (
          <div className="p-12 text-center space-y-3">
            <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
            <p className="text-xs text-rose-600 font-semibold">
              Failed to connect or retrieve hospital data.
            </p>
            <Button size="sm" variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : hospitalList.length === 0 ? (
          <div className="p-12">
            <EmptyState
              title="No Hospitals Found"
              description="No registered hospitals match the specified state, district, type, or search parameters."
              action={
                hasActiveFilters ? (
                  <Button variant="outline" size="sm" onClick={handleResetFilters}>
                    Reset Search & Filters
                  </Button>
                ) : isAdmin ? (
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
                ) : undefined
              }
            />
          </div>
        ) : (
          <>
            {/* Table View */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-200/80 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Hospital & Code</th>
                    <th className="py-3 px-4">Verification</th>
                    <th className="py-3 px-4">Type & Speciality</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4 text-center">Doctors</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {hospitalList.map((h: Hospital) => {
                    const isVerified = Boolean(h.isVerified);
                    const doctorsCount = h._count?.doctors ?? 0;

                    return (
                      <tr
                        key={h.id}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        {/* Name & Code */}
                        <td className="py-3.5 px-4">
                          <span className="font-mono text-[10px] font-bold text-teal-600 dark:text-teal-400 block tracking-wider">
                            {h.code || "N/A"}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-slate-100 text-sm block">
                            {h.name}
                          </span>
                        </td>

                        {/* Verification Status */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {isVerified ? (
                            <Badge variant="active" className="flex items-center gap-1 w-fit">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>VERIFIED</span>
                            </Badge>
                          ) : (
                            <div className="space-y-0.5">
                              <Badge variant="warning" className="flex items-center gap-1 w-fit">
                                <AlertTriangle className="w-3 h-3 text-amber-600" />
                                <span>UNVERIFIED</span>
                              </Badge>
                              <span className="text-[10px] text-amber-700 dark:text-amber-400 block font-medium">
                                Pending registry check
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Type & Speciality */}
                        <td className="py-3.5 px-4">
                          <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 capitalize mr-1">
                            {h.type ? String(h.type).toLowerCase() : "N/A"}
                          </span>
                          <span className="text-slate-600 dark:text-slate-400 font-medium capitalize">
                            • {h.speciality ? String(h.speciality).toLowerCase() : "General"}
                          </span>
                        </td>

                        {/* Location */}
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 max-w-xs">
                          <div className="flex items-start gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-slate-100 text-xs">
                                {h.city?.name || "City"}, {h.city?.state?.name || h.city?.state?.code || "State"}
                              </p>
                              <p className="text-[11px] text-slate-500 truncate max-w-[200px]" title={h.address}>
                                {h.address || "Address not provided"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                          {h.contactPhone && (
                            <p className="flex items-center gap-1 text-[11px] font-medium">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{h.contactPhone}</span>
                            </p>
                          )}
                          {h.contactEmail && (
                            <p className="flex items-center gap-1 text-[10px] text-slate-400 truncate max-w-[150px]" title={h.contactEmail}>
                              <Mail className="w-3 h-3 text-slate-400" />
                              <span>{h.contactEmail}</span>
                            </p>
                          )}
                        </td>

                        {/* View Doctors Option */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <Button
                            variant={doctorsCount > 0 ? "secondary" : "outline"}
                            size="sm"
                            leftIcon={<Stethoscope className="w-3.5 h-3.5 text-indigo-600" />}
                            onClick={() => setSelectedHospitalForDoctors(h)}
                            className="text-xs"
                          >
                            View Doctors ({doctorsCount})
                          </Button>
                        </td>

                        {/* Action buttons */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            {/* View Hospital Details Modal */}
                            <button
                              onClick={() => setSelectedHospitalForDetails(h)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-teal-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                              title="View Hospital Details"
                            >
                              <Info className="w-4 h-4" />
                            </button>

                            {isAdmin && (
                              <button
                                onClick={() => {
                                  setEditingHospital(h);
                                  setIsModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                                title="Edit Hospital Profile"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            )}

                            {isAdmin && (
                              <button
                                onClick={() =>
                                  statusMutation.mutate({
                                    id: h.id,
                                    status: h.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
                                  })
                                }
                                className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                                title="Toggle Status (Active/Inactive)"
                              >
                                <Power className="w-4 h-4" />
                              </button>
                            )}

                            {isAdmin && role === "SUPER_ADMIN" && (
                              <button
                                onClick={() => {
                                  if (window.confirm(`Are you sure you want to deactivate ${h.name}?`)) {
                                    deleteMutation.mutate(h.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                                title="Delete Hospital Record"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800">
              <Pagination
                meta={paginationMeta}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          </>
        )}
      </div>

      {/* ========================================================
          MODAL 1: VIEW DOCTORS ASSOCIATED WITH HOSPITAL
      ======================================================== */}
      {selectedHospitalForDoctors && (
        <Modal
          isOpen={!!selectedHospitalForDoctors}
          onClose={() => setSelectedHospitalForDoctors(null)}
          title={`Affiliated Doctors - ${selectedHospitalForDoctors.name}`}
          maxWidth="xl"
        >
          <div className="space-y-4">
            {/* Hospital mini header */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-teal-600">
                  CODE: {selectedHospitalForDoctors.code}
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {selectedHospitalForDoctors.address},{" "}
                  {selectedHospitalForDoctors.city?.name},{" "}
                  {selectedHospitalForDoctors.city?.state?.name}
                </p>
              </div>
              <Badge variant={selectedHospitalForDoctors.isVerified ? "active" : "warning"}>
                {selectedHospitalForDoctors.isVerified ? "VERIFIED REGISTRY" : "UNVERIFIED RECORD"}
              </Badge>
            </div>

            {doctorsLoading ? (
              <div className="py-12 flex justify-center">
                <Spinner />
              </div>
            ) : doctorsList.length === 0 ? (
              <div className="py-8 px-4 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
                <Stethoscope className="w-8 h-8 text-slate-300 mx-auto" />
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  No Affiliated Doctors Registered
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  There are currently no certified doctor profiles associated with this medical center in the system. Doctor affiliations are strictly tracked and never artificially invented.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>{doctorsList.length} Verified Affiliation(s)</span>
                  <span>Availability Status</span>
                </div>

                {doctorsList.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-slate-900 dark:text-slate-100">
                          Dr. {doc.firstName} {doc.lastName}
                        </h4>
                        <span className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded">
                          {doc.department?.name || "General Specialty"}
                        </span>
                      </div>

                      <div className="text-xs text-slate-500 space-y-0.5">
                        <p>
                          License: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{doc.licenseNumber}</span>
                        </p>
                        <p>Qualification: {doc.qualification}</p>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <Badge variant={doc.isAvailable ? "active" : "inactive"}>
                        {doc.isAvailable ? "Available" : "Away"}
                      </Badge>
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        ₹{doc.consultationFee || "0.00"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedHospitalForDoctors(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================
          MODAL 2: HOSPITAL DETAILS METADATA
      ======================================================== */}
      {selectedHospitalForDetails && (
        <Modal
          isOpen={!!selectedHospitalForDetails}
          onClose={() => setSelectedHospitalForDetails(null)}
          title="Hospital Information"
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-teal-600">
                    CODE: {selectedHospitalForDetails.code}
                  </span>
                  <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
                    {selectedHospitalForDetails.name}
                  </h3>
                </div>
                <Badge variant={selectedHospitalForDetails.isVerified ? "active" : "warning"}>
                  {selectedHospitalForDetails.isVerified ? "VERIFIED RECORD" : "UNVERIFIED RECORD"}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                <div>
                  <span className="text-slate-400 font-medium">Type:</span>{" "}
                  <span className="font-bold capitalize">{selectedHospitalForDetails.type?.toLowerCase()}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Speciality:</span>{" "}
                  <span className="font-bold capitalize">{selectedHospitalForDetails.speciality?.toLowerCase()}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200">Address:</span>
                  <p>{selectedHospitalForDetails.address}</p>
                  <p className="text-slate-500">
                    {selectedHospitalForDetails.city?.name},{" "}
                    {selectedHospitalForDetails.city?.state?.name} (
                    {selectedHospitalForDetails.city?.state?.code})
                  </p>
                </div>
              </div>

              {selectedHospitalForDetails.contactPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Phone: {selectedHospitalForDetails.contactPhone}</span>
                </div>
              )}

              {selectedHospitalForDetails.contactEmail && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Email: {selectedHospitalForDetails.contactEmail}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-teal-600 shrink-0" />
                <span>
                  Coordinates: {selectedHospitalForDetails.latitude},{" "}
                  {selectedHospitalForDetails.longitude}
                </span>
              </div>
            </div>

            {/* Departments */}
            {selectedHospitalForDetails.departments && selectedHospitalForDetails.departments.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Active Departments:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedHospitalForDetails.departments.map((dept) => (
                    <span
                      key={dept.id}
                      className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-[11px] font-medium"
                    >
                      {dept.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-between items-center">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Stethoscope className="w-4 h-4" />}
                onClick={() => {
                  const h = selectedHospitalForDetails;
                  setSelectedHospitalForDetails(null);
                  setSelectedHospitalForDoctors(h);
                }}
              >
                View Doctors
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedHospitalForDetails(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================
          MODAL 3: IMPORT VERIFIED HOSPITALS VIA CSV
      ======================================================== */}
      {isCsvModalOpen && (
        <Modal
          isOpen={isCsvModalOpen}
          onClose={() => setIsCsvModalOpen(false)}
          title="Import Verified Hospital Records (CSV)"
          maxWidth="xl"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-500">
              Import verified hospital facilities into PostgreSQL. Records automatically map to existing states/districts or provision new locations dynamically.
            </p>

            {csvUploadStatus && (
              <div
                className={`p-3 rounded-xl text-xs font-medium border ${
                  csvUploadStatus.success
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-rose-50 text-rose-800 border-rose-200"
                }`}
              >
                {csvUploadStatus.message}
              </div>
            )}

            <div className="flex items-center justify-between gap-2">
              <label htmlFor={fileInputId} className="cursor-pointer">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors">
                  <FileUp className="w-3.5 h-3.5" /> Choose CSV File
                </span>
                <input
                  id={fileInputId}
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCsvInput(CHHATTISGARH_SAMPLE_CSV)}
                className="text-xs text-teal-600 hover:text-teal-700"
              >
                Load Chhattisgarh Verified Sample
              </Button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                CSV Payload (Header: name, code, type, speciality, address, state, city, contactEmail, contactPhone, isVerified)
              </label>
              <textarea
                rows={8}
                value={csvInput}
                onChange={(e) => setCsvInput(e.target.value)}
                placeholder="name,code,type,speciality,address,state,city,contactEmail,contactPhone,isVerified..."
                className="w-full text-xs font-mono p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCsvModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Upload className="w-3.5 h-3.5" />}
                disabled={!csvInput.trim() || importCsvMutation.isPending}
                onClick={() => importCsvMutation.mutate(csvInput)}
              >
                {importCsvMutation.isPending ? "Importing Records..." : "Execute Import"}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Hospital Form Modal (Add / Edit) */}
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

export default HospitalsListPage;
