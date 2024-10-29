import { Knex } from 'knex';
import { addTimestamps } from '../../src/Tools/utils/migration.utils';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('labl.campaign_brackhit_user_choice', (table) => {
    table
      .integer('campaign_id')
      .notNullable()
      .references('id')
      .inTable('labl.campaign');
    table
      .integer('brackhit_id')
      .unsigned()
      .notNullable()
      .references('brackhitId')
      .inTable('labl.brackhit');
    table
      .string('campaign_user_id')
      .notNullable()
      .references('user_id')
      .inTable('labl.campaign_user');
    table
      .integer('round_id')
      .notNullable();
    table
      .integer('choice_id')
      .notNullable();
    table
      .unique(['campaign_id', 'brackhit_id', 'campaign_user_id', 'round_id'], {
      indexName: 'unique_round',
    });
    addTimestamps(knex, table);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('labl.campaign_brackhit_user_choice');
}
