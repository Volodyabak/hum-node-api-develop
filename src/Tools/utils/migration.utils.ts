import { Knex } from 'knex';

export function addTimestamps(knex: Knex, table: Knex.CreateTableBuilder) {
  table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  table
    .timestamp('updated_at')
    .notNullable()
    .defaultTo(knex.raw('CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP'));
}
