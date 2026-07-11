import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema.js';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('[db] DATABASE_URL is required');

// Use a separate client for queries (not migrations)
const queryClient = postgres(url);
export const db = drizzle(queryClient, { schema });
