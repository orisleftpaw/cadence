import { pgTable, text, pgEnum, date, integer, uuid, boolean, json } from 'drizzle-orm/pg-core';

export const role = pgEnum('role', ['user', 'admin']);

export const accounts = pgTable('accounts', {
	id: uuid().defaultRandom().primaryKey(),
	username: text().notNull(),
	displayName: text().notNull(),
	summary: text().default('Hi there!'),
	avatar: uuid().references(() => images.id),
	domain: text().notNull(),
	url: text(),
	created: date(),
	updated: date().defaultNow(),
	role: role().default('user'),
	password: text(),
	refreshVersion: integer().default(0),
	keys: text()
		.notNull()
		.references(() => keys.id),
	actor: text(),
	inbox: text(),
	outbox: text(),
	followers_collection: text(),
	following_collection: text(),
	liked_collection: text()
});

export const keys = pgTable('keys', {
	id: text().notNull().primaryKey(),
	private: text(),
	public: text().notNull()
});

export const images = pgTable('images', {
	id: uuid().defaultRandom().primaryKey(),
	source: text(),
	proxy: boolean().default(true)
});

export const activities = pgTable('activities', {
	id: text().primaryKey(),
	type: text(),
	actor: text(),
	object: text()
});
