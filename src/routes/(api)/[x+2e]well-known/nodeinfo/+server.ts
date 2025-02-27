import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';

export function GET() {
	return json({
		links: [
			{
				rel: 'http://nodeinfo.diaspora.software/ns/schema/2.0',
				href: `${env.ORIGIN}/api/v1/nodeinfo/2.0`
			},
			{
				rel: 'http://nodeinfo.diaspora.software/ns/schema/2.1',
				href: `${env.ORIGIN}/api/v1/nodeinfo/2.1`
			}
		]
	});
}
