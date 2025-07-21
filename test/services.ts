import dotenv from 'dotenv';
dotenv.config();
import { describe, it } from 'node:test';
import { data_access_load, services_load } from '../bootstrap/application';
import pg from 'pg';
import assert from 'node:assert';
import DomainError from '../src/utils/DomainError';
import jwtSession from '../src/application/session/jwt';
import loader from '../loader';
import path from 'node:path';
import jwt from 'jsonwebtoken';
import scrypt from '../src/application/security/scrypt';
import crypto from 'node:crypto';

const storage = data_access_load(
  { storage: 'main' },
  {
    npm: { pg },
    app: { logger: console },
    config: {
      storage: {
        pg: {
          host: process.env.DB_HOST,
          port: parseInt(process.env.DB_PORT as string, 10),
          database: process.env.DB_NAME,
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          max: 20,
          idleTimeoutMillis: 1000,
          connectionTimeoutMillis: 1000,
          maxUses: 7500,
        },
      },
    },
  },
) as StorageApi;

const config = loader.module(path.resolve(__dirname, '../src/config'));

const app = {
  session: jwtSession({ npm: { jwt }, config } as any),
  security: scrypt({ node: { crypto } } as any),
};

const services = services_load({
  storage,
  app,
  utils: { DomainError },
}) as DomainServices;

describe('services', async () => {
  await storage.start();

  await describe('user', async () => {
    it('create', async () => {
      const mess = Math.random().toFixed(10).replace('.', '');
      const tokens = await services.user.create({
        password: `hash${mess}`,
        email: `user${mess}@gmail.com`,
        nickname: `user${mess}`,
      });
      assert.ok(typeof tokens.access === 'string');
      assert.ok(typeof tokens.refresh === 'string');
    });
  });
});
