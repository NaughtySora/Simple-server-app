import dotenv from 'dotenv';
dotenv.config();
import { describe, it } from 'node:test';
import { data_access_load } from '../bootstrap/application';
import pg from 'pg';
import assert from 'node:assert';
import { storage } from './mocks';

describe.skip('main - testing transaction critical section', async () => {
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
  const { query, transaction, start } = data_access_load(
    { storage: 'main' },
    {
      npm: { pg },
      app: { logger: console },
      config: { storage: { pg: PG_CONFIG } },
    },
  );
  await start();

  await describe('storage: [postgres]', async () => {
    it('transaction', async () => {
      await query('CREATE table IF NOT EXISTS a (num int)');
      await query('CREATE table IF NOT EXISTS b (num int)');
      assert.rejects(async () => {
        await transaction(async (query: any) => {
          await Promise.all([
            query('INSERT INTO a VALUES($1)', ['text']),
            query('INSERT INTO b VALUES($1)', [1]),
          ]);
        });
      });

      await transaction(async (query: any) => {
        const [a, b] = await Promise.all([
          query('SELECT num FROM a'),
          query('SELECT num FROM b'),
        ]);
        assert.strictEqual(a.rows.length, 0);
        assert.ok(a.rows.length === b.rows.length);
      });
    });
  });
});

describe('test - testing js map vs storage interface compatibility', async () => {
  const mockStorage = storage();
  await mockStorage.start();

  await describe('storage: [js map]', async () => {
    it('transaction', async () => {
      await mockStorage.query('CREATE table IF NOT EXISTS a (num int)');
      await mockStorage.query('CREATE table IF NOT EXISTS b (num int)');
      await assert.rejects(async () => {
        await mockStorage.transaction(async (query: any) => {
          await Promise.all([
            query('INSERT INTO a VALUES($1)', ['text']),
            query('INSERT INTO b VALUES($1)', [1]),
          ]);
          throw new Error("test reject")
        });
      }, {
        message: "test reject"
      });

      await mockStorage.transaction(async (query: any) => {
        const [a, b] = await Promise.all([
          query('SELECT num FROM a', { rows: { length: 0 } }),
          query('SELECT num FROM b', { rows: { length: 0 } }),
        ]);
        assert.strictEqual(a.rows.length, 0);
        assert.ok(a.rows.length === b.rows.length);
      });
    });
  });
});
