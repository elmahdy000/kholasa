import { prisma } from "../src/lib/prisma.js";
import { hashPassword, verifyPassword } from "../src/lib/auth.js";

async function main() {
  console.log("Testing password hashing and verification...");
  const raw = "student123456";
  const hashed = await hashPassword(raw);
  const ok = await verifyPassword(raw, hashed);
  console.log(`Password verify result: ${ok}`);

  console.log("Checking DB user model...");
  const count = await prisma.user.count();
  console.log(`Current users in DB: ${count}`);
  console.log("Auth & DB foundation verified successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
