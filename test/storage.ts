import dotenv from "dotenv";
dotenv.config();
import { describe, it } from 'node:test';
import { data_access_load, } from "../bootstrap/application";
import pg from "pg";
import assert from "node:assert";

const PG_CONFIG = {
  host: process.env.TEST_DB_HOST,
  port: parseInt(process.env.TEST_DB_PORT as string, 10),
  database: process.env.TEST_DB_NAME,
  user: process.env.TEST_DB_USER,
  password: process.env.TEST_DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 1000,
  connectionTimeoutMillis: 1000,
  maxUses: 7500,
};

const { repository, query, transaction, start } = data_access_load({ storage: "main" }, {
  npm: { pg, },
  app: { logger: console, },
  config: { storage: { pg: PG_CONFIG } },
});

describe("main", async () => {
  await start();

  await describe("storage: [postgres]", async () => {
    it("transaction", async () => {
      await query("CREATE table IF NOT EXISTS a (num int)");
      await query("CREATE table IF NOT EXISTS b (num int)");
      assert.rejects(async () => {
        await transaction(async (query: any) => {
          await Promise.all([
            query("INSERT INTO a VALUES($1)", ["text"]),
            query("INSERT INTO b VALUES($1)", [1]),
          ]);
        });
      });

      await transaction(async (query: any) => {
        const [a, b] = await Promise.all([
          query("SELECT num FROM a"),
          query("SELECT num FROM b"),
        ]);
        assert.strictEqual(a.rows.length, 0);
        assert.ok(a.rows.length === b.rows.length);
      });
    });
  });

});


//! explicit client transaction
// const client = new pg.Client(PG_CONFIG);
// await client.connect();
// await client.query("CREATE table IF NOT EXISTS a (num int)");
// await client.query("create table IF NOT EXISTS b (num int)");
// try {
//   await client.query("BEGIN");
//   await Promise.all([
//     client.query("INSERT INTO a VALUES($1)", ['text']),
//     client.query("INSERT INTO b VALUES($1)", [1]),
//   ]);
//   await client.query("COMMIT");
// } catch (e) {
//   console.log(e);
//   await client.query("ROLLBACK");
// }
// await client.end();