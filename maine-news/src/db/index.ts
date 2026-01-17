import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;

let sql: any;

if (connectionString) {
    try {
        sql = neon(connectionString);
    } catch (e) {
        console.warn('Failed to initialize neon client:', e);
        // Fallback or re-throw depending on need.
        // For build, we might allow it to pass if we don't query.
        sql = (strings: any, ...values: any[]) => { throw new Error('DB not initialized properly'); };
    }
} else {
    // Fallback for build time if env var is missing
    console.warn('DATABASE_URL missing, employing fallback for build.');
    sql = (strings: any, ...values: any[]) => { throw new Error('DATABASE_URL not set'); };
}

export const db = drizzle(sql, { schema });
