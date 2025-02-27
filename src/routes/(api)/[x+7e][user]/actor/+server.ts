import { env } from '$env/dynamic/private';
import { db, findLocalUser } from '$lib/server/db/index.js';
import { keys } from '$lib/server/db/schema.js';
import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export async function GET({ params, request }) {
	const user = await findLocalUser({ username: params.user });
	if (!user) return new Response(null, { status: 404 });

	const [keypair] = await db
		.select({
			public: keys.public
		})
		.from(keys)
		.where(eq(keys.id, `${env.ORIGIN}/~${user.username}/actor#key`));

	return json(
		{
			'@context': ['https://www.w3.org/ns/activitystreams', { '@language': 'und' }],
			type: 'Person',
			id: `${env.ORIGIN}/~${user.username}/actor`,
			url: `${env.ORIGIN}/~${user.username}`,
			inbox: `${env.ORIGIN}/~${user.username}/inbox`,
			outbox: `${env.ORIGIN}/~${user.username}/outbox`,
			followers: `${env.ORIGIN}/~${user.username}/followers`,
			following: `${env.ORIGIN}/~${user.username}/following`,
			liked: `${env.ORIGIN}/~${user.username}/liked`,
			preferredUsername: user.displayName,
			name: user.displayName,
			summary: user.summary,
			publicKey: {
				id: `${env.ORIGIN}/~${user.username}/actor#key`,
				owner: `${env.ORIGIN}/~${user.username}/actor`,
				publicKeyPem: keypair.public
			}
		},
		{
			headers: {
				'Content-Type': 'application/activity+json'
			}
		}
	);
}
