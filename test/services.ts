import { describe, it } from 'node:test';
import { data_access_load, services_load } from '../bootstrap/application';
import assert from 'node:assert';
import DomainError from '../src/utils/DomainError';
import jwtSession from '../src/application/session/jwt';
import jwt from 'jsonwebtoken';
import scrypt from '../src/application/security/scrypt';
import crypto from 'node:crypto';

const config = {
  session: {
    secret: {
      refresh: 'asnkmaskljkl12jkl12kjl12kl3j2l1k3jk1l23',
      access: 'asdasdasdasdijjkl12kl321jkl3',
    },
    duration: {
      refresh: '7d',
      access: '3d',
    },
  },
};

const storage = data_access_load(
  { storage: 'test' },
  { app: { logger: console } },
) as StorageApi;

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
