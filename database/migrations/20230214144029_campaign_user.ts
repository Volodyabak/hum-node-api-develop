import { Knex } from 'knex';
import { addTimestamps } from '../../src/Tools/utils/migration.utils';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('labl.campaign_user', (table) => {
    table.increments('id').primary();
    table.string('user_id').unique().notNullable();
    table.string('email').unique().notNullable();
    table.string('name').notNullable();
    addTimestamps(knex, table);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('labl.campaign_user');
}
