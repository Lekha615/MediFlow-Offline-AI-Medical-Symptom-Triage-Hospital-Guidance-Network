import { HospitalType, SpecialityType, EntityStatus } from "@prisma/client";
import { prisma } from "../config/db";

export interface CsvHospitalRow {
  name: string;
  code: string;
  type?: string;
  speciality?: string;
  address: string;
  state: string;
  stateCode?: string;
  city: string;
  contactEmail?: string;
  contactPhone?: string;
  latitude?: number;
  longitude?: number;
  isVerified?: boolean;
}

export interface ImportResult {
  total: number;
  imported: number;
  updated: number;
  errors: Array<{ row: number; code?: string; message: string }>;
}

export class HospitalImportService {
  /**
   * Simple CSV parser that handles quotes and commas
   */
  static parseCsv(csvText: string): Record<string, string>[] {
    const lines = csvText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length < 2) return [];

    const parseLine = (line: string): string[] => {
      const result: string[] = [];
      let current = "";
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === "," && !inQuotes) {
          result.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const rawHeaders = parseLine(lines[0]);
    const headers = rawHeaders.map((h) =>
      h.toLowerCase().replace(/[^a-z0-9]/g, "")
    );

    const rows: Record<string, string>[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = parseLine(lines[i]);
      const row: Record<string, string> = {};
      headers.forEach((h, index) => {
        row[h] = values[index] || "";
      });
      rows.push(row);
    }

    return rows;
  }

  static async importFromCsvContent(csvContent: string): Promise<ImportResult> {
    const parsedRows = this.parseCsv(csvContent);
    const result: ImportResult = {
      total: parsedRows.length,
      imported: 0,
      updated: 0,
      errors: [],
    };

    for (let i = 0; i < parsedRows.length; i++) {
      const rowNumber = i + 2; // 1-indexed, accounting for header
      const row = parsedRows[i];

      try {
        const name = row["name"] || row["hospitalname"] || row["facilityname"];
        const code = (row["code"] || row["hospitalcode"] || `HOSP-${Date.now().toString(36)}-${i}`).toUpperCase().trim();
        const address = row["address"] || row["location"] || "Address not specified";
        const stateName = row["state"] || row["statename"] || "Chhattisgarh";
        const stateCode = (row["statecode"] || (stateName.toLowerCase().includes("chhattisgarh") ? "CG" : stateName.slice(0, 2))).toUpperCase().trim();
        const cityName = row["city"] || row["district"] || row["citydistrict"] || "Raipur";
        
        if (!name || name.length < 2) {
          result.errors.push({
            row: rowNumber,
            code,
            message: "Missing hospital name.",
          });
          continue;
        }

        // Parse HospitalType
        const rawType = (row["type"] || row["hospitaltype"] || "GOVERNMENT").toUpperCase();
        const type: HospitalType =
          rawType.includes("PRIV") ? HospitalType.PRIVATE : HospitalType.GOVERNMENT;

        // Parse SpecialityType
        const rawSpec = (row["speciality"] || row["specialty"] || "GENERAL").toUpperCase();
        let speciality: SpecialityType = SpecialityType.GENERAL;
        if (rawSpec.includes("EYE")) speciality = SpecialityType.EYE;
        else if (rawSpec.includes("DENT")) speciality = SpecialityType.DENTAL;
        else if (rawSpec.includes("AYUR")) speciality = SpecialityType.AYURVEDIC;
        else if (rawSpec.includes("HOME")) speciality = SpecialityType.HOMEOPATHY;
        else if (rawSpec.includes("ALLO")) speciality = SpecialityType.ALLOPATHY;

        // Parse contact
        const contactEmail = row["email"] || row["contactemail"] || `contact.${code.toLowerCase()}@mediflow.org`;
        const contactPhone = (row["phone"] || row["contactphone"] || "07712000000").replace(/[^0-9]/g, "").padEnd(10, "0").slice(0, 15);

        // Parse coordinates (defaulting around Chhattisgarh/India coordinates if missing)
        const lat = parseFloat(row["latitude"] || row["lat"]) || 21.2514;
        const lng = parseFloat(row["longitude"] || row["lng"] || row["long"]) || 81.6296;

        // Parse isVerified
        const rawVerified = (row["verified"] || row["isverified"] || "true").toLowerCase();
        const isVerified = !(rawVerified === "false" || rawVerified === "0" || rawVerified === "no");

        // 1. Ensure State exists
        let state = await prisma.state.findFirst({
          where: {
            OR: [
              { code: stateCode },
              { name: { equals: stateName, mode: "insensitive" } },
            ],
          },
        });

        if (!state) {
          state = await prisma.state.create({
            data: {
              name: stateName,
              code: stateCode,
            },
          });
        }

        // 2. Ensure City exists within state
        let city = await prisma.city.findFirst({
          where: {
            stateId: state.id,
            name: { equals: cityName, mode: "insensitive" },
          },
        });

        if (!city) {
          city = await prisma.city.create({
            data: {
              name: cityName,
              stateId: state.id,
            },
          });
        }

        // 3. Upsert Hospital
        const existingHospital = await prisma.hospital.findUnique({
          where: { code },
        });

        if (existingHospital) {
          await prisma.hospital.update({
            where: { id: existingHospital.id },
            data: {
              name,
              type,
              speciality,
              address,
              cityId: city.id,
              latitude: lat,
              longitude: lng,
              contactEmail,
              contactPhone,
              isVerified,
              status: EntityStatus.ACTIVE,
            },
          });
          result.updated++;
        } else {
          await prisma.hospital.create({
            data: {
              name,
              code,
              type,
              speciality,
              address,
              cityId: city.id,
              latitude: lat,
              longitude: lng,
              contactEmail,
              contactPhone,
              isVerified,
              status: EntityStatus.ACTIVE,
            },
          });
          result.imported++;
        }
      } catch (err: any) {
        result.errors.push({
          row: rowNumber,
          code: row["code"],
          message: err?.message || "Failed to process record.",
        });
      }
    }

    return result;
  }
}
