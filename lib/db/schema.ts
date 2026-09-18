import { boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const user = pgTable('user', {
  id: text('id').primaryKey(), name: text('name').notNull(), email: text('email').notNull().unique(), emailVerified: boolean('emailVerified').notNull().default(false), image: text('image'), createdAt: timestamp('createdAt').notNull().defaultNow(), updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})
export const session = pgTable('session', {
  id: text('id').primaryKey(), expiresAt: timestamp('expiresAt').notNull(), token: text('token').notNull().unique(), createdAt: timestamp('createdAt').notNull().defaultNow(), updatedAt: timestamp('updatedAt').notNull().defaultNow(), ipAddress: text('ipAddress'), userAgent: text('userAgent'), userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
})
export const account = pgTable('account', {
  id: text('id').primaryKey(), accountId: text('accountId').notNull(), providerId: text('providerId').notNull(), userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }), accessToken: text('accessToken'), refreshToken: text('refreshToken'), idToken: text('idToken'), accessTokenExpiresAt: timestamp('accessTokenExpiresAt'), refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'), scope: text('scope'), password: text('password'), createdAt: timestamp('createdAt').notNull().defaultNow(), updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})
export const verification = pgTable('verification', {
  id: text('id').primaryKey(), identifier: text('identifier').notNull(), value: text('value').notNull(), expiresAt: timestamp('expiresAt').notNull(), createdAt: timestamp('createdAt').defaultNow(), updatedAt: timestamp('updatedAt').defaultNow(),
})

export const routerSettings = pgTable('router_settings', {
  userId: text('user_id').primaryKey(), ollamaBaseUrl: text('ollama_base_url').notNull().default('http://127.0.0.1:11434'), ollamaModel: text('ollama_model').notNull().default('llama3.2:3b'), openRouterModel: text('openrouter_model').notNull().default('openai/gpt-4o-mini'), openAiModel: text('openai_model').notNull().default('gpt-4o-mini'), localFirst: boolean('local_first').notNull().default(true), updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const routingActivity = pgTable('routing_activity', {
  id: text('id').primaryKey(), userId: text('user_id').notNull(), task: text('task').notNull(), skill: text('skill').notNull(), model: text('model').notNull(), provider: text('provider').notNull(), tokens: text('tokens').notNull(), route: text('route').notNull(), createdAt: timestamp('created_at').notNull().defaultNow(),
})
