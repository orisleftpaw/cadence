import { USER_AGENT } from '$lib/config';

export async function apfetch({ url }: { url: string }) {
	const response = await fetch(url, {
		headers: {
			'User-Agent': USER_AGENT,
			Accept: 'application/ld+json; profile="https://www.w3.org/ns/activitystreams"'
		}
	});

	return response;
}
