import fs from "fs";
import path from "path";
import { PrismaClient, Role, SchoolCategory } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function normalizeEgyptianPhone(rawPhone) {
  if (!rawPhone) return null;
  // Convert Arabic numerals to Latin
  let clean = rawPhone
    .trim()
    .replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d))
    .replace(/\D/g, "");

  if (clean.startsWith("201") && clean.length === 12) {
    clean = "0" + clean.slice(2);
  } else if (clean.startsWith("00201") && clean.length === 14) {
    clean = "0" + clean.slice(4);
  } else if ((clean.startsWith("10") || clean.startsWith("11") || clean.startsWith("12") || clean.startsWith("15")) && clean.length === 10) {
    clean = "0" + clean;
  }

  return clean;
}

async function main() {
  console.log("🚀 Starting student import from CSV...");

  // 1. Resolve System and Grade for 2nd Baccalaureate
  let system = await prisma.educationalSystem.findFirst({
    where: {
      OR: [{ code: "baccalaureate" }, { name: { contains: "بكالوريا" } }],
    },
  });

  if (!system) {
    system = await prisma.educationalSystem.findFirst();
  }

  if (!system) {
    console.error("❌ No EducationalSystem found in database. Please seed systems first.");
    process.exit(1);
  }

  let grade = await prisma.grade.findFirst({
    where: {
      systemId: system.id,
      OR: [
        { code: "bacc_g11" },
        { name: { contains: "الثاني" } },
        { name: { contains: "تانية" } },
      ],
    },
  });

  if (!grade) {
    grade = await prisma.grade.findFirst({ where: { systemId: system.id } });
  }

  console.log(`📚 Target System: ${system.name} (${system.id})`);
  console.log(`🎓 Target Grade: ${grade?.name || "N/A"} (${grade?.id})`);

  // 2. Read and parse CSV
  const csvPath = path.resolve(process.cwd(), "scratch/students_2nd_bac_active.csv");
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV file not found at ${csvPath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(csvPath, "utf-8");
  const lines = raw.trim().split("\n").filter(Boolean);
  const rows = lines.slice(1);

  console.log(`📋 Found ${rows.length} student records in CSV.`);

  let createdCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < rows.length; i++) {
    const parts = rows[i].split(",").map((s) => s.trim());
    const loginCode = parts[0]?.toUpperCase();
    const rawPhone = parts[1];
    const name = parts[2];
    const language = parts[3];
    const status = parts[4];
    const paymentStatus = parts[5];

    if (!loginCode || !name) {
      skippedCount++;
      continue;
    }

    const phone = normalizeEgyptianPhone(rawPhone);
    const schoolCategory = language?.includes("لغات") ? SchoolCategory.LANGUAGES : SchoolCategory.ARABIC;

    // Use loginCode as initial password
    const hashedPassword = await bcrypt.hash(loginCode, 10);

    try {
      // Check existing by loginCode or phone
      const existing = await prisma.user.findFirst({
        where: {
          OR: [
            { loginCode },
            ...(phone ? [{ phone }] : []),
          ],
        },
      });

      if (existing) {
        await prisma.user.update({
          where: { id: existing.id },
          data: {
            name,
            phone: phone || existing.phone,
            loginCode,
            schoolCategory,
            systemId: system.id,
            gradeId: grade ? grade.id : existing.gradeId,
            role: Role.STUDENT,
          },
        });
        updatedCount++;
      } else {
        await prisma.user.create({
          data: {
            name,
            phone: phone || null,
            loginCode,
            password: hashedPassword,
            role: Role.STUDENT,
            schoolCategory,
            systemId: system.id,
            gradeId: grade?.id || null,
            maxDevices: 1,
            boundDevices: [],
          },
        });
        createdCount++;
      }

      if ((i + 1) % 100 === 0 || i === rows.length - 1) {
        console.log(`⏳ Processed ${i + 1}/${rows.length} students...`);
      }
    } catch (err) {
      console.error(`⚠️ Error importing student ${name} (${loginCode}):`, err.message);
      skippedCount++;
    }
  }

  console.log("\n==========================================");
  console.log("✅ Student Import Completed Successfully!");
  console.log(`- Total Records Processed: ${rows.length}`);
  console.log(`- Newly Created: ${createdCount}`);
  console.log(`- Updated: ${updatedCount}`);
  console.log(`- Skipped / Errors: ${skippedCount}`);
  console.log("==========================================");
}

main()
  .catch((e) => {
    console.error("Fatal import error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

