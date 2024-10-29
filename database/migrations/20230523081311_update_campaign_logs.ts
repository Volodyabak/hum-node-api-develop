import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('labl.campaign_logs', (table) => {
    table.string('city').notNullable();
    table.string('region');
    table.string('country').notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('labl.campaign_logs', (table) => {
    table.dropColumns('city', 'region', 'country');
  });
}
