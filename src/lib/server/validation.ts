import z from 'zod';

export const username = z
	.string()
	.trim()
	.min(1, 'Username must be at least 1 character.')
	.max(32, 'Username cannot be longer than 32 characters.')
	.regex(/[a-z0-9_]/gi, 'Usernames must be alphanumeric.')
	.refine((_) => _ !== 'cadence', 'Cannot use system username.');

export const password = z
	.string()
	.min(8, 'Password must be at least 8 characters.')
	.max(255, 'Password cannot be longer than 255 characters.');

export default {
	register: z.object({
		username: username.refine(() => true, 'Username in use.'),
		password: password
	}).parseAsync
};
