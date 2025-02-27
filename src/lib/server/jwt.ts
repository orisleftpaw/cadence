import { env } from '$env/dynamic/private';
import jwt from 'jsonwebtoken';
import { db } from './db';
import { accounts } from './db/schema';
import { eq } from 'drizzle-orm';

const JWT_REFRESH_SECRET = env.JWT_REFRESH_SECRET as string;
const JWT_ACCESS_SECRET = env.JWT_ACCESS_SECRET as string;
if (!JWT_ACCESS_SECRET || !JWT_REFRESH_SECRET)
	throw new Error('Missing JWT_ACCESS_SECRET or JWT_REFRESH_SECRET');

export interface Tokens {
	accessToken: string;
	refreshToken: string;
}

export interface AccessTokenData {
	id: string;
}

export interface RefreshTokenData extends AccessTokenData {
	version: number;
}

export interface VerifyTokensResponse {
	id: string;
	tokens?: Tokens;
}

export class JWTValidationError extends Error {
	constructor(message: string, options?: ErrorOptions) {
		super(message, options);
	}
}

export function createUserTokens(user: { id: string; refreshVersion: number }): Tokens {
	const refreshToken = jwt.sign(
		{
			id: user.id,
			version: user.refreshVersion
		},
		JWT_REFRESH_SECRET,
		{
			expiresIn: '30d'
		}
	);

	const accessToken = jwt.sign(
		{
			id: user.id
		},
		JWT_ACCESS_SECRET,
		{ expiresIn: '15min' }
	);

	return { refreshToken, accessToken };
}

export async function verifyUserTokens(tokens: { accessToken: string; refreshToken: string }) {
	if (!tokens || !tokens?.refreshToken) throw new JWTValidationError('Missing JWTs');

	let accessTokenData;
	try {
		const data = jwt.verify(tokens.accessToken, JWT_ACCESS_SECRET);
		if (typeof data === 'string') throw new Error('Incorrect typing on access token?');
		accessTokenData = data as AccessTokenData;
	} catch (_) {}

	let refreshTokenData;
	try {
		const data = jwt.verify(tokens.refreshToken, JWT_REFRESH_SECRET);
		if (typeof data === 'string') throw new Error('Incorrect typing on refresh token?');
		refreshTokenData = data as RefreshTokenData;
	} catch (_) {}

	if (!refreshTokenData)
		throw new JWTValidationError('Invalid refresh token at refresh token read');

	if (accessTokenData) return accessTokenData as VerifyTokensResponse;
	else {
		const [user] = await db.select().from(accounts).where(eq(accounts.id, refreshTokenData.id));
		if (!user || user.refreshVersion !== refreshTokenData.version)
			throw new JWTValidationError('Invalid refresh token at version step');

		const newTokens = createUserTokens({ id: user.id, refreshVersion: user.refreshVersion });
		return { id: user.id, tokens: newTokens } as VerifyTokensResponse;
	}
}
