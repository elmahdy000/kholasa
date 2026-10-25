import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  AppError,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  tooManyRequests,
  jsonError,
  jsonOk,
  parseJson,
} from "@/lib/http";

describe("HTTP helpers", () => {
  it("creates proper AppError subclasses with status codes", () => {
    expect(badRequest("test 400")).toMatchObject({ status: 400, message: "test 400" });
    expect(unauthorized("test 401")).toMatchObject({ status: 401, message: "test 401" });
    expect(forbidden("test 403")).toMatchObject({ status: 403, message: "test 403" });
    expect(notFound("test 404")).toMatchObject({ status: 404, message: "test 404" });
    expect(conflict("test 409")).toMatchObject({ status: 409, message: "test 409" });
    expect(tooManyRequests("test 429")).toMatchObject({ status: 429, message: "test 429" });
  });

  it("converts AppError into NextResponse with correct status", async () => {
    const res = jsonError(new AppError(403, "غير مسموح", "AUTH_FORBIDDEN"));
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body).toEqual({ error: "غير مسموح", code: "AUTH_FORBIDDEN" });
  });

  it("parses valid JSON against a Zod schema", async () => {
    const schema = z.object({
      name: z.string(),
      age: z.number().int().min(1),
    });
    const req = new Request("http://localhost/api/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Omar", age: 18 }),
    });
    const parsed = await parseJson(req, schema);
    expect(parsed).toEqual({ name: "Omar", age: 18 });
  });

  it("throws badRequest when request body is not valid JSON", async () => {
    const schema = z.object({ value: z.string() });
    const req = new Request("http://localhost/api/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-json-content",
    });
    await expect(parseJson(req, schema)).rejects.toThrow("JSON غير صالح");
  });

  it("produces standardized jsonOk responses", async () => {
    const res = jsonOk({ success: true, count: 5 });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({ success: true, count: 5 });
  });
});
