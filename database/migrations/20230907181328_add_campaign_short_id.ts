import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('labl.campaign', (table) => {
    table.string('short_id', 6).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('labl.campaign', (table) => {
    table.dropColumn('short_id');
  });
}
