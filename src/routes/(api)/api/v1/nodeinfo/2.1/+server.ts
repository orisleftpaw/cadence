import { json } from '@sveltejs/kit';
import { npm_package_version } from '$env/static/private';

export function GET() {
	return json(
		{
			version: '2.1',
			software: {
				name: 'cadence',
				version: npm_package_version,
				repository: 'https://github.com/orisleftpaw/cadence'
			},
			protocols: ['activitypub'],
			services: {
				outbound: [],
				inbound: []
			},
			openRegistrations: false,
			usage: {
				localPosts: 0,
				localComments: 0,
				users: {
					total: 0,
					activeHalfyear: 0,
					activeMonth: 0
				}
			},
			metadata: {}
		},
		{
			headers: {
				'Content-Type':
					'application/json; profile="http://nodeinfo.diaspora.software/ns/schema/2.1#"'
			}
		}
	);
}
