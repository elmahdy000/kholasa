import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockCount, mockFindMany, mockFindUnique } = vi.hoisted(() => ({
  mockCount: vi.fn(),
  mockFindMany: vi.fn(),
  mockFindUnique: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    examAttempt: {
      count: mockCount,
      findMany: mockFindMany,
      findUnique: mockFindUnique,
    },
  },
}));

import { ExamAttemptService } from "@/services/exam/attempt";

describe("admin attempts list and pagination", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns single attempt when id is supplied", async () => {
    mockFindUnique.mockResolvedValue({ id: "attempt-1", title: "اختبار تجريبي" });

    const result = await ExamAttemptService.getAdminAttemptsList({ id: "attempt-1" });
    expect(mockFindUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "attempt-1" } })
    );
    expect(result).toEqual({ id: "attempt-1", title: "اختبار تجريبي" });
    expect(mockCount).not.toHaveBeenCalled();
    expect(mockFindMany).not.toHaveBeenCalled();
  });

  it("returns paginated attempts with calculated pagination metadata", async () => {
    mockCount.mockResolvedValue(45);
    mockFindMany.mockResolvedValue([
      { id: "attempt-1", title: "اختبار 1" },
      { id: "attempt-2", title: "اختبار 2" },
    ]);

    const result = (await ExamAttemptService.getAdminAttemptsList({
      page: 2,
      pageSize: 20,
      mode: "EXAM",
      search: "أحمد",
    })) as any;

    expect(mockCount).toHaveBeenCalledWith({
      where: expect.objectContaining({
        mode: "EXAM",
        OR: expect.arrayContaining([
          expect.objectContaining({ user: { name: { contains: "أحمد", mode: "insensitive" } } }),
        ]),
      }),
    });

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 20,
        take: 20,
        orderBy: { startedAt: "desc" },
      })
    );

    expect(result.pagination).toEqual({
      page: 2,
      pageSize: 20,
      totalCount: 45,
      totalPages: 3,
    });
    expect(result.attempts).toHaveLength(2);
  });
});
