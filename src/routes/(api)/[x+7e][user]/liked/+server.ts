import { findLocalUser } from '$lib/server/db';
import { json } from '@sveltejs/kit';

export async function GET({ params }) {
	const user = await findLocalUser({ username: params.user });
	if (!user) return new Response(null, { status: 404 });

	return json(
		{
			'@context': 'https://www.w3.org/ns/activitystreams',
			type: 'OrderedCollection',
			totalItems: 0,
			orderedItems: []
		},
		{ headers: { 'Content-Type': 'application/activity+json' } }
	);
}
