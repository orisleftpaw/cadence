import type { Cookies } from '@sveltejs/kit';
import type { Tokens } from './server/jwt';

export function applyTokens({ tokens, cookies }: { tokens: Tokens; cookies: Cookies }) {
	const thirty_days = new Date();
	thirty_days.setDate(thirty_days.getDate() + 30);

	const fifteen_minutes = new Date();
	fifteen_minutes.setMinutes(fifteen_minutes.getMinutes() + 15);

	cookies.set('CADENCE_ACCESS_TOKEN', tokens.accessToken, {
		path: '/',
		sameSite: 'lax',
		expires: fifteen_minutes
	});

	cookies.set('CADENCE_REFRESH_TOKEN', tokens.refreshToken, {
		path: '/',
		sameSite: 'lax',
		expires: thirty_days
	});
}
