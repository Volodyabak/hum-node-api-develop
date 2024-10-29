import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('labl.campaign_user', (table) => {
    table.string('instagram_username');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('labl.campaign_user', (table) => {
    table.dropColumn('instagram_username');
  });
}
