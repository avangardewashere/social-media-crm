type RequiredEnvVar =
  | "NEXT_PUBLIC_APP_URL"
  | "DATABASE_URL"
  | "AUTH_SECRET"
  | "FACEBOOK_APP_ID"
  | "FACEBOOK_APP_SECRET"
  | "FACEBOOK_VERIFY_TOKEN"
  | "REDIS_URL";

const readRequiredEnv = (name: RequiredEnvVar): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

export type Env = {
  NODE_ENV: "development" | "test" | "production";
  NEXT_PUBLIC_APP_URL: string;
  DATABASE_URL: string;
  AUTH_SECRET: string;
  AUTH_TRUST_HOST: boolean;
  FACEBOOK_APP_ID: string;
  FACEBOOK_APP_SECRET: string;
  FACEBOOK_VERIFY_TOKEN: string;
  REDIS_URL: string;
  MEDIA_STORAGE_PROVIDER: string | null;
  MEDIA_STORAGE_BUCKET: string | null;
  MEDIA_STORAGE_REGION: string | null;
  MEDIA_STORAGE_ACCESS_KEY_ID: string | null;
  MEDIA_STORAGE_SECRET_ACCESS_KEY: string | null;
};

export const env: Env = {
  NODE_ENV:
    process.env.NODE_ENV === "production" ||
    process.env.NODE_ENV === "test" ||
    process.env.NODE_ENV === "development"
      ? process.env.NODE_ENV
      : "development",
  NEXT_PUBLIC_APP_URL: readRequiredEnv("NEXT_PUBLIC_APP_URL"),
  DATABASE_URL: readRequiredEnv("DATABASE_URL"),
  AUTH_SECRET: readRequiredEnv("AUTH_SECRET"),
  AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST === "true",
  FACEBOOK_APP_ID: readRequiredEnv("FACEBOOK_APP_ID"),
  FACEBOOK_APP_SECRET: readRequiredEnv("FACEBOOK_APP_SECRET"),
  FACEBOOK_VERIFY_TOKEN: readRequiredEnv("FACEBOOK_VERIFY_TOKEN"),
  REDIS_URL: readRequiredEnv("REDIS_URL"),
  MEDIA_STORAGE_PROVIDER: process.env.MEDIA_STORAGE_PROVIDER ?? null,
  MEDIA_STORAGE_BUCKET: process.env.MEDIA_STORAGE_BUCKET ?? null,
  MEDIA_STORAGE_REGION: process.env.MEDIA_STORAGE_REGION ?? null,
  MEDIA_STORAGE_ACCESS_KEY_ID: process.env.MEDIA_STORAGE_ACCESS_KEY_ID ?? null,
  MEDIA_STORAGE_SECRET_ACCESS_KEY: process.env.MEDIA_STORAGE_SECRET_ACCESS_KEY ?? null,
};
