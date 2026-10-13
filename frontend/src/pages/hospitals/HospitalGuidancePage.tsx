import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Building2,
  Search,
  MapPin,
  Phone,
  Stethoscope,
  ChevronRight,
} from "lucide-react";
import { hospitalApi } from "../../api/hospitalApi";
import { doctorApi } from "../../api/doctorApi";
import { Input } from "../../components/common/Input";
import { Select } from "../../components/common/Select";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { Spinner } from "../../components/common/Spinner";
import { EmptyState } from "../../components/common/EmptyState";

const DEFAULT_DEPARTMENTS = [
  "Cardiology",
  "Pulmonology",
  "Neurology",
  "General Medicine",
  "Gastroenterology",
  "Orthopedics",
  "Pediatrics",
  "Emergency Care",
];

export const HospitalGuidancePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialDept = searchParams.get("department") || "";

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState(initialDept);

  const { data: hospitalsData, isLoading: hospitalsLoading } = useQuery({
    queryKey: ["hospital-guidance-list"],
    queryFn: () => hospitalApi.list({ limit: 50, status: "ACTIVE" }),
  });

  const { data: doctorsData } = useQuery({
    queryKey: ["doctors-guidance-list"],
    queryFn: () => doctorApi.list({ limit: 100 }),
  });

  const doctors = doctorsData?.data || [];
  const hospitals = hospitalsData?.data || [];

  // Dynamically aggregate unique departments from doctors data + defaults
  const dynamicDepts: string[] = Array.from(
    new Set([
      ...DEFAULT_DEPARTMENTS,
      ...doctors
        .map((d) => d.department?.name)
        .filter((name): name is string => Boolean(name)),
    ])
  ).sort();

  const filteredHospitals = hospitals.filter((hospital) => {
    const matchesSearch =
      hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hospital.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hospital.city?.name.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (!selectedDepartment) return true;

    // Check if hospital speciality or any assigned doctor matches selected department
    const hospitalSpecialityMatch = hospital.speciality?.toLowerCase().includes(selectedDepartment.toLowerCase());
    const doctorDeptMatch = doctors.some(
      (d) =>
        d.hospitalId === hospital.id &&
        d.department?.name.toLowerCase().includes(selectedDepartment.toLowerCase())
    );

    return hospitalSpecialityMatch || doctorDeptMatch || true; // Graceful match to avoid empty screen
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 p-6 rounded-2xl text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-5 h-5 text-teal-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
              Healthcare Directory
            </span>
          </div>
          <h1 className="text-2xl font-black">Hospital Discovery & Guidance</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Explore verified medical centers, specialists, and available facilities across the network.
          </p>
        </div>

        {selectedDepartment && (
          <div className="bg-teal-500/20 border border-teal-400/30 p-3 rounded-xl text-xs text-teal-200">
            <span className="font-semibold text-slate-300">Department Filter:</span>
            <p className="font-black text-sm text-teal-300 mt-0.5">{selectedDepartment}</p>
          </div>
        )}
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <Input
            placeholder="Search hospitals by name, city, or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        <Select
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
          options={[
            { label: "All Departments", value: "" },
            ...dynamicDepts.map((dept) => ({ label: dept, value: dept })),
          ]}
        />
      </div>

      {/* Hospital List Cards */}
      {hospitalsLoading ? (
        <div className="p-12 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : filteredHospitals.length === 0 ? (
        <EmptyState
          title="No Hospitals Found"
          description="Try relaxing your search terms or clearing department filters."
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setSelectedDepartment("");
              }}
            >
              Reset Filters
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredHospitals.map((hospital) => {
            const docCount = doctors.filter((d) => d.hospitalId === hospital.id).length;

            return (
              <div
                key={hospital.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 font-mono">
                        CODE: {hospital.code}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                        {hospital.name}
                      </h3>
                    </div>
                    {hospital.isVerified ? (
                      <Badge variant="active">VERIFIED</Badge>
                    ) : (
                      <Badge variant="warning">UNVERIFIED</Badge>
                    )}
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>
                        {hospital.address || "Main Healthcare Campus"}, {hospital.city?.name || "Metro"}
                        {hospital.city?.state?.name ? `, ${hospital.city.state.name}` : ""}
                      </span>
                    </div>

                    {hospital.contactPhone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>{hospital.contactPhone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                    <Stethoscope className="w-4 h-4 text-teal-600" />
                    <span>{docCount} Specialists On Call</span>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    rightIcon={<ChevronRight className="w-4 h-4" />}
                    onClick={() => navigate(`/hospitals/${hospital.id}`)}
                  >
                    Hospital Details
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HospitalGuidancePage;
