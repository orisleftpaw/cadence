import { checkPostHeaders } from '$lib/server/activitypub/headers';
import { verify } from '$lib/server/activitypub/signatures.js';
import { findLocalUser } from '$lib/server/db';
import { accounts } from '$lib/server/db/schema.js';

async function Follow({ json, user }: ActivityInput) {
	return new Response(null, { status: 501 });
}

export async function POST({ request, params }) {
	const body = await request.arrayBuffer().catch((_: Error) => _);
	if (body instanceof Error) return new Response(null, { status: 400 });
	if (!checkPostHeaders(request)) return new Response(null, { status: 400 });
	if (!verify({ request, body }))
		return new Response('Invalid/missing HTTP Message Signature or Digest', { status: 400 });

	const user = await findLocalUser({ username: params.user });
	if (!user) return new Response(null, { status: 404 });

	try {
		const json = JSON.parse(Buffer.from(body).toString());
		if (json.type === 'Follow') return await Follow({ json, user });
	} catch (_) {
		console.log(_);
		return new Response(null, { status: 500 });
	}

	return new Response(null, { status: 501 });
}

interface ActivityInput {
	json: any;
	user: typeof accounts.$inferSelect;
}
