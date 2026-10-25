import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL is required")
    .regex(/^postgres(ql)?:\/\//, "DATABASE_URL must be a postgres connection string"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_URL: z.string().url().optional(),
  OTP_DELIVERY: z.enum(["console", "webhook"]).default("console"),
  OTP_WEBHOOK_URL: z.string().url().optional(),
  OTP_DEV_ECHO: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
  SEED_ADMIN_PASSWORD: z.string().optional(),
  UPLOAD_DIR: z.string().min(1).default("storage/uploads"),
});

export type Env = z.infer<typeof schema>;

function parseEnv(): Env {
  // Treat empty strings (e.g. `KEY=` in .env) as unset.
  const raw = Object.fromEntries(
    Object.entries(process.env).filter(([, v]) => v !== undefined && v !== ""),
  );
  const result = schema.safeParse(raw);
  if (!result.success) {
    const details = result.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid environment configuration:\n${details}`);
  }
  return result.data;
}

// Server-only: do not import from client components.
export const env: Env = parseEnv();
