import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.renameTable('labl.integration', 'labl.campaign');
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.renameTable('labl.campaign', 'labl.integration');
}
