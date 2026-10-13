import fs from "fs";
import path from "path";
import { HospitalImportService } from "../services/hospital-import.service";
import { prisma } from "../config/db";

async function main() {
  const filePathArg = process.argv[2];
  const targetPath = filePathArg
    ? path.resolve(process.cwd(), filePathArg)
    : path.resolve(__dirname, "../../data/verified_hospitals_chhattisgarh.csv");

  console.log(`📂 Reading hospital CSV file from: ${targetPath}`);

  if (!fs.existsSync(targetPath)) {
    console.error(`❌ File not found: ${targetPath}`);
    process.exit(1);
  }

  const csvContent = fs.readFileSync(targetPath, "utf-8");
  console.log(`🔄 Parsing and importing records...`);

  const result = await HospitalImportService.importFromCsvContent(csvContent);

  console.log(`\n================ IMPORT RESULTS ================`);
  console.log(`Total Rows Processed : ${result.total}`);
  console.log(`Successfully Imported: ${result.imported}`);
  console.log(`Updated Existing     : ${result.updated}`);
  console.log(`Errors Encountered   : ${result.errors.length}`);

  if (result.errors.length > 0) {
    console.log(`\n⚠️ Errors Detail:`);
    result.errors.forEach((e) => {
      console.log(` - Row ${e.row} [${e.code || "N/A"}]: ${e.message}`);
    });
  }

  console.log(`================================================\n`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("❌ CSV import failed:", err);
  process.exit(1);
});
