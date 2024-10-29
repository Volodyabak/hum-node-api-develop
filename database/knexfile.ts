import * as dotenv from 'dotenv';
import { Knex } from 'knex';
import { knexSnakeCaseMappers } from 'objection';

dotenv.config({ path: '../.env' });

const dbConfig: Knex.Config = {
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    charset: 'utf8mb4',

    connectTimeout: 60 * 60 * 1000,
  },
  migrations: {
    directory: 'migrations',
    extension: 'ts',
  },
  pool: {
    min: 0,
    max: 7,
  },
  ...knexSnakeCaseMappers(),
};

export default dbConfig;
