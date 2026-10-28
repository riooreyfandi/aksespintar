import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
});

const result = schema.safeParse(process.env);

if (!result.success) {
  console.error("Pengaturan .env tidak valid:");
  for (const issue of result.error.issues) {
    console.error(`- ${issue.path.join(".") || "(umum)"}: ${issue.message}`);
  }
  process.exit(1);
}

export const env = result.data;