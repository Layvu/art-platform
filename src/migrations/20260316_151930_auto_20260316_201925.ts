import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres';

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products" ALTER COLUMN "price" DROP NOT NULL;
  ALTER TABLE "products" ADD COLUMN "quantity" numeric DEFAULT 0;
  ALTER TABLE "products" DROP COLUMN "characteristics";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products" ALTER COLUMN "price" SET NOT NULL;
  ALTER TABLE "products" ADD COLUMN "characteristics" varchar;
  ALTER TABLE "products" DROP COLUMN "quantity";`)
}
