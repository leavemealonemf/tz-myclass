import knex, { Knex } from 'knex';
import dotenv from 'dotenv';

dotenv.config();

const db: Knex = knex({
  client: 'pg',
  connection: process.env.PG_CONNSTRING,
  pool: {
    min: 2,
    max: 10
  }
});

export default db;