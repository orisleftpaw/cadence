import { fail, redirect, type Cookies } from '@sveltejs/kit';
import validation from '$lib/server/validation.js';
import { ZodError } from 'zod';
import { db } from '$lib/server/db/index.js';
import { accounts, keys } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import { createUserTokens, type Tokens } from '$lib/server/jwt.js';
import { env } from '$env/dynamic/private';
import { generateKeypair } from '$lib/server/activitypub/signatures.js';
import { applyTokens } from '$lib';

export function load({ locals }) {
	if (locals?.user?.id) throw redirect(302, '/home');
}

export const actions = {
	login: async ({ request, cookies }) => {
		const body = await request.formData();
		const username = body.get('username') as string | undefined;
		const password = body.get('password') as string | undefined;
		if (!username || !password) return fail(400, { error: 'Invalid username/password.' });

		const [user] = await db
			.select({
				id: accounts.id,
				username: accounts.username,
				password: accounts.password,
				refreshVersion: accounts.refreshVersion
			})
			.from(accounts)
			.where(eq(accounts.username, username));

		if (!user || !user.password || user.refreshVersion === null)
			return fail(400, { error: 'Invalid username/password.' });
		if (!(await Bun.password.verify(password, user.password)))
			return fail(400, { error: 'Invalid username/password.' });

		const tokens = createUserTokens({ id: user.id, refreshVersion: user.refreshVersion });
		applyTokens({ tokens, cookies });

		throw redirect(302, '/home');
	},
	register: async ({ request, cookies }) => {
		const body = await request.formData();
		const username = body.get('username') as string | undefined;
		const password = body.get('password') as string | undefined;

		const validated = await validation.register({ username, password }).catch((_: ZodError) => _);
		if (validated instanceof ZodError) return fail(400, { ...validated.formErrors });

		try {
			const keypair = await generateKeypair();

			// console.log(keypair.privateKey.export().toString());
			// console.log(keypair.publicKey.export().toString());
			// throw new Error();

			await db.insert(keys).values({
				id: `${env.ORIGIN}/~${validated.username}/actor#key`,
				private: keypair.privateKey.export().toString(),
				public: keypair.publicKey.export().toString()
			});

			const [user] = await db
				.insert(accounts)
				.values({
					username: validated.username,
					displayName: validated.username,
					domain: 'local',
					password: await Bun.password.hash(validated.password),
					keys: `${env.ORIGIN}/~${validated.username}/actor#key`
				})
				.returning({ id: accounts.id });

			const tokens = createUserTokens({ id: user.id, refreshVersion: 0 });
			applyTokens({ tokens, cookies });
		} catch (_) {
			console.log(_);
			return fail(400, { error: 'Internal server error.' });
		}

		throw redirect(302, '/home');
	}
};
