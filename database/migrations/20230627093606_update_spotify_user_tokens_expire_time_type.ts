import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('ean_collection.spotify_user_tokens', (table) => {
    table.bigInteger('expire_time').alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('ean_collection.spotify_user_tokens', (table) => {
    table.integer('expire_time').alter();
  });
}
