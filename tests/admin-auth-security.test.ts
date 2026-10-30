import { describe, expect, it, vi } from "vitest";
import bcrypt from "bcryptjs";

vi.mock("@/lib/prisma", () => ({ prisma: {} }));
vi.mock("next/headers", () => ({ cookies: vi.fn() }));

import { verifyPassword } from "@/lib/auth";

describe("admin password verification", () => {
  it("accepts only the password matching the stored hash, including for demo passwords", async () => {
    const hash = await bcrypt.hash("Unique-account-password!", 4);
    expect(await verifyPassword("Unique-account-password!", hash)).toBe(true);
    for (const password of ["Admin@123", "Student@123", "admin123", "student123", "123456", "Admin@Kholasa2026!", "Student@Kholasa2026!"]) {
      expect(await verifyPassword(password, hash)).toBe(false);
    }
  });
});
