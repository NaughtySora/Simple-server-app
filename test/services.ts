import { describe, it } from 'node:test';
import { services_load } from '../bootstrap/application';
import { config, data, node, npm, storage, utils } from './mocks';
import assert from 'node:assert';
import jwtSession from '../src/application/session/jwt';
import jwt from 'jsonwebtoken';
import scrypt from '../src/application/security/scrypt';
import crypto from 'node:crypto';
import loader from '../loader';
import path from 'node:path';

const app = {
  session: jwtSession({ npm: { jwt }, config } as any),
  security: scrypt({ node: { crypto } } as any),
  validator: loader.module(
    path.resolve(__dirname, "../src/application/validator/jsonschema"),
    { npm, utils },
  ),
};

const mockStorage = storage();

const services = services_load({
  storage: mockStorage, app,
  utils, node: node(),
}) as DomainServices;

describe('services', async () => {
  await mockStorage.start();

  await describe('user service', async () => {
    await it('create', async () => {
      const mess = Math.random().toFixed(10).replace('.', '');
      const email = `user${mess}@gmail.com`;
      const nickname = `user${mess}`;
      const tokens = await services.user.create({
        password: `hash${mess}`,
        email,
        nickname,
      });
      assert.ok(typeof tokens.access === 'string');
      assert.ok(typeof tokens.refresh === 'string');

      it('get', async () => {
        const { id } = await mockStorage.repository.user.getByEmail(email, () => { });
        const user = await services.user.get(id);
        assert.strictEqual(user.nickname, nickname);
        assert.strictEqual(user.email, email);
        assert.ok(typeof user.id === "string");
      });

      await describe('validation service', async () => {
        await it('http - bearer', async () => {
          const tests = data.http.bearer(tokens.access);
          const service = services.validation.http.bearer;
          for (const test of tests) {
            const data = test.task as any;
            const throws = test.throws;
            if (throws) await assert.rejects(() => service(data));
            else await service(data);
          }
        });
      });
    });
  });

  await describe('validation service', async () => {
    it('user - credentials', () => {
      const service = services.validation.user.credentials;
      for (const test of data.user.credentials) {
        const data = test.data as any;
        const throws = test.throws;
        if (throws) assert.throws(() => service(data));
        else service(data);
      }
    });
  });
});
