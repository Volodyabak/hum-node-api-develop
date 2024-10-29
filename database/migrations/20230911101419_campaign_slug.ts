import { Knex } from 'knex';
import { addTimestamps } from '../../src/Tools/utils/migration.utils';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('labl.campaign_slug', (table) => {
    table.increments('id').primary();
    table
      .integer('campaign_id')
      .references('id')
      .inTable('labl.campaign')
      .onDelete('CASCADE')
      .notNullable();
    table.string('name').notNullable();
    table.string('slug').notNullable().unique();
    addTimestamps(knex, table);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('labl.campaign_slug');
}
