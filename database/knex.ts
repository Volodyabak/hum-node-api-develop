import knex from 'knex';
import { Model } from 'objection';
import dbConfig from './knexfile';

const db = knex(dbConfig);
Model.knex(db);

export { db };
