import { Knex } from 'knex';
import { addTimestamps } from '../../src/Tools/utils/migration.utils';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('labl.campaign_logs', (table) => {
    table.increments('id');
    table.string('user_id');
    table
      .integer('campaign_id')
      .notNullable()
      .references('id')
      .inTable('labl.campaign');
    table.string('action').notNullable();
    table.string('url');
    table.string('ip').notNullable();
    table.string('user_agent').notNullable();
    addTimestamps(knex, table);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('labl.campaign_logs');
}
