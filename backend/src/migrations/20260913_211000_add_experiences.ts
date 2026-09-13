// Sprint-26: add the Experiences collection (work history timeline).
//
// Hand-written delta (same situation as the sprint-24 migration: this repo has no
// migration baseline — schema historically arrived via dev-push, so a generated
// migrate:create emits the ENTIRE schema as CREATEs and fails on existing tables).
// DDL lifted verbatim from the generated full-schema draft, trimmed to the delta.
//
// Runbook: printf 'y\n' | npx payload migrate   (the dev-push batch row still prompts)

import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/drizzle/sqlite'
import { sql } from 'drizzle-orm'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`
    CREATE TABLE "experiences" (
      "id" integer PRIMARY KEY NOT NULL,
      "uuid" text,
      "company" text NOT NULL,
      "role" text NOT NULL,
      "employment_type" text,
      "location" text,
      "period" text NOT NULL,
      "url" text,
      "description" text NOT NULL,
      "order" numeric DEFAULT 0,
      "updated_at" text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
      "created_at" text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
    )
  `)
  await db.run(sql`CREATE UNIQUE INDEX "experiences_uuid_idx" ON "experiences" ("uuid")`)
  await db.run(sql`CREATE INDEX "experiences_updated_at_idx" ON "experiences" ("updated_at")`)
  await db.run(sql`CREATE INDEX "experiences_created_at_idx" ON "experiences" ("created_at")`)

  await db.run(sql`
    CREATE TABLE "experiences_highlights" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" text PRIMARY KEY NOT NULL,
      "text" text NOT NULL,
      FOREIGN KEY ("_parent_id") REFERENCES "experiences"("id") ON UPDATE no action ON DELETE cascade
    )
  `)
  await db.run(sql`CREATE INDEX "experiences_highlights_order_idx" ON "experiences_highlights" ("_order")`)
  await db.run(sql`CREATE INDEX "experiences_highlights_parent_id_idx" ON "experiences_highlights" ("_parent_id")`)

  await db.run(sql`
    CREATE TABLE "experiences_stack" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" text PRIMARY KEY NOT NULL,
      "name" text NOT NULL,
      FOREIGN KEY ("_parent_id") REFERENCES "experiences"("id") ON UPDATE no action ON DELETE cascade
    )
  `)
  await db.run(sql`CREATE INDEX "experiences_stack_order_idx" ON "experiences_stack" ("_order")`)
  await db.run(sql`CREATE INDEX "experiences_stack_parent_id_idx" ON "experiences_stack" ("_parent_id")`)

  // locking-refs table gains the new collection's column
  await db.run(sql`ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "experiences_id" integer`)
  await db.run(
    sql`CREATE INDEX "payload_locked_documents_rels_experiences_id_idx" ON "payload_locked_documents_rels" ("experiences_id")`,
  )
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP INDEX IF EXISTS "payload_locked_documents_rels_experiences_id_idx"`)
  await db.run(sql`ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "experiences_id"`)
  await db.run(sql`DROP INDEX IF EXISTS "experiences_stack_parent_id_idx"`)
  await db.run(sql`DROP INDEX IF EXISTS "experiences_stack_order_idx"`)
  await db.run(sql`DROP TABLE IF EXISTS "experiences_stack"`)
  await db.run(sql`DROP INDEX IF EXISTS "experiences_highlights_parent_id_idx"`)
  await db.run(sql`DROP INDEX IF EXISTS "experiences_highlights_order_idx"`)
  await db.run(sql`DROP TABLE IF EXISTS "experiences_highlights"`)
  await db.run(sql`DROP INDEX IF EXISTS "experiences_created_at_idx"`)
  await db.run(sql`DROP INDEX IF EXISTS "experiences_updated_at_idx"`)
  await db.run(sql`DROP INDEX IF EXISTS "experiences_uuid_idx"`)
  await db.run(sql`DROP TABLE IF EXISTS "experiences"`)
}
