import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@shared/schema";

const connectionString = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
const pool = new Pool({ connectionString, ssl: process.env.NEON_DATABASE_URL ? { rejectUnauthorized: false } : undefined });
export const db = drizzle(pool, { schema });
