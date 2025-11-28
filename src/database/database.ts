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
}).on("connection-error", (err) => {
  console.error("db conn error:", err);
  process.exit(-1);
});

export default db;