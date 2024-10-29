import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('ean_collection.apple_user_tokens', (table) => {
    table.bigInteger('exp').notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('ean_collection.apple_user_tokens', (table) => {
    table.dropColumn('exp');
  });
}
