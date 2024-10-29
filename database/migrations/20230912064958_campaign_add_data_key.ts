import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('labl.campaign', (table) => {
    table.dropColumn('data');
    table.string('data_key');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('labl.campaign', (table) => {
    table.dropColumn('data_key');
    table.jsonb('data');
  });
}
