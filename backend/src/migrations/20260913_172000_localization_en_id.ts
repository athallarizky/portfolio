// Sprint-24: enable content localization (en + id) — moves the localized fields of
// articles/projects into per-locale storage. Destructive by design: the old plain
// columns are dropped, so content MUST be re-imported from a v2 export taken before
// running this (see docs/sprint-24/reports/phase-0-report.md §5 runbook).
//
// Hand-written (the repo has no migration history — schema historically arrived via
// dev-push / snapshot). DDL extracted by diffing .schema of payload.db before vs
// after the dev-mode push, so `migrate` converges a pre-sprint-24 DB to the exact
// pushed schema.
//
// NOTE: `payload migrate` prompts to proceed when the DB carries a batch -1
// dev-push row — run non-interactively as `printf 'y\n' | npx payload migrate`.

import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/drizzle/sqlite'
import { sql } from 'drizzle-orm'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // articles — drop the now-localized plain columns
  await db.run(sql`ALTER TABLE "articles" DROP COLUMN "title"`)
  await db.run(sql`ALTER TABLE "articles" DROP COLUMN "excerpt"`)
  await db.run(sql`ALTER TABLE "articles" DROP COLUMN "body"`)
  await db.run(sql`ALTER TABLE "articles" DROP COLUMN "seo_meta_title"`)
  await db.run(sql`ALTER TABLE "articles" DROP COLUMN "seo_meta_description"`)

  // projects — same
  await db.run(sql`ALTER TABLE "projects" DROP COLUMN "title"`)
  await db.run(sql`ALTER TABLE "projects" DROP COLUMN "excerpt"`)
  await db.run(sql`ALTER TABLE "projects" DROP COLUMN "body"`)
  await db.run(sql`ALTER TABLE "projects" DROP COLUMN "seo_meta_title"`)
  await db.run(sql`ALTER TABLE "projects" DROP COLUMN "seo_meta_description"`)

  // projects.features became a localized array — existing rows (if any) are EN data,
  // hence DEFAULT 'en' so the NOT NULL column can be added non-destructively.
  await db.run(sql`ALTER TABLE "projects_features" ADD COLUMN "_locale" text NOT NULL DEFAULT 'en'`)
  await db.run(sql`CREATE INDEX "projects_features_locale_idx" ON "projects_features" ("_locale")`)

  // per-locale storage for scalar localized fields
  await db.run(sql`
    CREATE TABLE "articles_locales" (
      "title" text NOT NULL,
      "excerpt" text,
      "body" text,
      "seo_meta_title" text,
      "seo_meta_description" text,
      "id" integer PRIMARY KEY NOT NULL,
      "_locale" text NOT NULL,
      "_parent_id" integer NOT NULL,
      FOREIGN KEY ("_parent_id") REFERENCES "articles"("id") ON UPDATE no action ON DELETE cascade
    )
  `)
  await db.run(
    sql`CREATE UNIQUE INDEX "articles_locales_locale_parent_id_unique" ON "articles_locales" ("_locale","_parent_id")`,
  )
  await db.run(sql`
    CREATE TABLE "projects_locales" (
      "title" text NOT NULL,
      "excerpt" text,
      "body" text,
      "seo_meta_title" text,
      "seo_meta_description" text,
      "id" integer PRIMARY KEY NOT NULL,
      "_locale" text NOT NULL,
      "_parent_id" integer NOT NULL,
      FOREIGN KEY ("_parent_id") REFERENCES "projects"("id") ON UPDATE no action ON DELETE cascade
    )
  `)
  await db.run(
    sql`CREATE UNIQUE INDEX "projects_locales_locale_parent_id_unique" ON "projects_locales" ("_locale","_parent_id")`,
  )
}

// Best-effort reverse: restores the pre-localization column layout. Values are NOT
// moved back — restore content from a v2 archive after down().
export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP INDEX IF EXISTS "articles_locales_locale_parent_id_unique"`)
  await db.run(sql`DROP TABLE IF EXISTS "articles_locales"`)
  await db.run(sql`DROP INDEX IF EXISTS "projects_locales_locale_parent_id_unique"`)
  await db.run(sql`DROP TABLE IF EXISTS "projects_locales"`)
  await db.run(sql`DROP INDEX IF EXISTS "projects_features_locale_idx"`)
  await db.run(sql`ALTER TABLE "projects_features" DROP COLUMN "_locale"`)

  // NOT NULL without default is illegal on a table with rows — default '' keeps it applicable.
  await db.run(sql`ALTER TABLE "articles" ADD COLUMN "title" text NOT NULL DEFAULT ''`)
  await db.run(sql`ALTER TABLE "articles" ADD COLUMN "excerpt" text`)
  await db.run(sql`ALTER TABLE "articles" ADD COLUMN "body" text`)
  await db.run(sql`ALTER TABLE "articles" ADD COLUMN "seo_meta_title" text`)
  await db.run(sql`ALTER TABLE "articles" ADD COLUMN "seo_meta_description" text`)
  await db.run(sql`ALTER TABLE "projects" ADD COLUMN "title" text NOT NULL DEFAULT ''`)
  await db.run(sql`ALTER TABLE "projects" ADD COLUMN "excerpt" text`)
  await db.run(sql`ALTER TABLE "projects" ADD COLUMN "body" text`)
  await db.run(sql`ALTER TABLE "projects" ADD COLUMN "seo_meta_title" text`)
  await db.run(sql`ALTER TABLE "projects" ADD COLUMN "seo_meta_description" text`)
}
