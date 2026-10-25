import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { ZodError, type ZodType } from "zod";

export class AppError extends Error {
  status: number;
  code?: string;
  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
  }
}

export const badRequest = (message = "طلب غير صالح") => new AppError(400, message);
export const unauthorized = (message = "غير مصرح") => new AppError(401, message);
export const forbidden = (message = "ممنوع") => new AppError(403, message);
export const notFound = (message = "غير موجود") => new AppError(404, message);
export const conflict = (message = "تعارض في البيانات") => new AppError(409, message);
export const tooManyRequests = (message = "محاولات كثيرة، حاول لاحقاً") =>
  new AppError(429, message);

export function jsonError(err: unknown): NextResponse {
  if (err instanceof AppError) {
    return NextResponse.json({ error: err.message, code: err.code }, { status: err.status });
  }
  if (err instanceof ZodError) {
    return NextResponse.json(
      { error: "بيانات غير صالحة", issues: err.issues },
      { status: 400 }
    );
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2025") {
      return NextResponse.json({ error: "غير موجود" }, { status: 404 });
    }
    if (err.code === "P2002") {
      return NextResponse.json({ error: "القيمة مستخدمة بالفعل" }, { status: 409 });
    }
    if (err.code === "P2003") {
      return NextResponse.json({ error: "العنصر مرتبط ببيانات أخرى" }, { status: 409 });
    }
  }
  console.error(err);
  return NextResponse.json({ error: "حدث خطأ غير متوقع" }, { status: 500 });
}

export async function parseJson<T>(req: Request, schema: ZodType<T>): Promise<T> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw badRequest("JSON غير صالح");
  }
  const result = schema.safeParse(body);
  if (!result.success) {
    throw result.error;
  }
  return result.data;
}

export function jsonOk<T>(data: T, init?: ResponseInit): NextResponse {
  return NextResponse.json(data, init);
}
