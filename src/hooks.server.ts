import { applyTokens } from '$lib';
import { JWTValidationError, verifyUserTokens } from '$lib/server/jwt';
import { redirect } from '@sveltejs/kit';

export const handle = async ({ event, resolve }) => {
	const { cookies, locals } = event;

	const refreshToken = cookies.get('CADENCE_REFRESH_TOKEN') as string;
	const accessToken = cookies.get('CADENCE_ACCESS_TOKEN') as string;

	const user = await verifyUserTokens({ refreshToken, accessToken }).catch((_) => _);
	if (user instanceof JWTValidationError) {
		cookies.delete('CADENCE_ACCESS_TOKEN', { path: '/' });
		cookies.delete('CADENCE_REFRESH_TOKEN', { path: '/' });

		if (event.route.id && event.route.id.includes('(app)')) return redirect(302, '/');
	}

	if (user.tokens) applyTokens({ tokens: user.tokens, cookies });

	locals.user = { id: user.id };

	const response = await resolve(event);
	console.log(
		event.request.headers.get('X-Forwarded-For') || event.getClientAddress(),
		response.status,
		event.request.url
	);
	return response;
};

export async function handleError({ error, status }) {
	if (status !== 404) console.log(error);
}
