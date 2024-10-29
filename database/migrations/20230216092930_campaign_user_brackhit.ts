import { Knex } from 'knex';
import { addTimestamps } from '../../src/Tools/utils/migration.utils';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('labl.campaign_user_brackhit', (table) => {
    table
      .string('campaign_user_id')
      .notNullable()
      .references('user_id')
      .inTable('labl.campaign_user');
    table
      .integer('brackhit_id')
      .unsigned()
      .notNullable()
      .references('brackhitId')
      .inTable('labl.brackhit');
    table
      .integer('campaign_id')
      .notNullable()
      .references('id')
      .inTable('labl.campaign');
    table
      .integer('completions')
      .notNullable()
      .defaultTo(1);
    table
      .integer('score')
      .nullable();
    table.primary(['campaign_user_id', 'brackhit_id', 'campaign_id'], {
      constraintName: 'campaign_user_brackhit_pk',
    });
    addTimestamps(knex, table);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('labl.campaign_user_brackhit');
}
