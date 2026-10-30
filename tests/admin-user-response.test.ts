import { describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({ findUnique: vi.fn().mockResolvedValue(null), create: vi.fn().mockResolvedValue({ id: "new-user", attempts: [], progress: [] }) }));
vi.mock("@/lib/prisma", () => ({ prisma: { user: db } }));
vi.mock("bcryptjs", () => ({ default: { hash: vi.fn().mockResolvedValue("stored-hash") } }));
import { UserMutationsService } from "@/services/user/mutations";

describe("admin user creation response", () => {
  it("selects safe user fields and the relations needed by the user table", async () => {
    await UserMutationsService.createUser({ name: "Test", phone: "01000000000", password: "Valid-password!", role: "STUDENT" }, "ADMIN");
    const query = db.create.mock.calls[0][0];
    expect(query.select).not.toHaveProperty("password");
    expect(query).not.toHaveProperty("include");
    expect(query.select.attempts).toBeDefined();
    expect(query.select.progress).toBeDefined();
  });
});
