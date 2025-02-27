import { drizzle } from 'drizzle-orm/node-postgres';
import { env } from '$env/dynamic/private';
import { Pool } from 'pg';
import { accounts } from './schema';
import { and, eq } from 'drizzle-orm';
if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
const pool = new Pool({ connectionString: env.DATABASE_URL });
export const db = drizzle(pool);

export async function findLocalUser({ username }: { username: string }) {
	try {
		const [user] = await db
			.select()
			.from(accounts)
			.where(and(eq(accounts.username, username), eq(accounts.domain, 'local')));

		return user;
	} catch (_) {
		return false;
	}
}
