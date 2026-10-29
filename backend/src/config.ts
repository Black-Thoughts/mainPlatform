import dotenv from "dotenv";

dotenv.config();

function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const config = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 5550),
  dbUri: requireEnv("DB_URI"),
  clientOrigin: requireEnv("CLIENT_ORIGIN"),
  runtimeOrigin: requireEnv("RUNTIME_ORIGIN"),
};