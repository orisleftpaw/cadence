import { env } from '$env/dynamic/private';
import { findLocalUser } from '$lib/server/db/index.js';
import { json } from '@sveltejs/kit';
const HOST = new URL(env.ORIGIN).host;

export async function GET({ url }) {
	const resource = url.searchParams.get('resource');
	if (!resource) return new Response(null, { status: 400 });
	if (!resource.startsWith('acct:')) return new Response(null, { status: 400 });

	const parts = resource.substring(5).split('@');
	if (parts.length !== 2) return new Response(null, { status: 400 });

	const username = parts[0];
	const domain = parts[1];
	if (domain !== env.WEBFINGER) return new Response(null, { status: 404 });

	const user = await findLocalUser({ username });
	if (!user) return new Response(null, { status: 404 });

	return json(
		{
			subject: `acct:${user.username}@${HOST}`,
			aliases: [`${env.ORIGIN}/~${user.username}`],
			links: [
				{
					rel: 'http://webfinger.net/rel/profile-page',
					type: 'text/html',
					href: `${env.ORIGIN}/~${user.username}`
				},
				{
					rel: 'self',
					type: 'application/activity+json',
					href: `${env.ORIGIN}/~${user.username}/actor`
				},
				{
					rel: 'self',
					type: 'application/ld+json; profile="https://www.w3.org/ns/activitystreams"',
					href: `${env.ORIGIN}/~${user.username}/actor`
				}
			]
		},
		{
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Content-Type': 'application/jrd+json'
			}
		}
	);
}
