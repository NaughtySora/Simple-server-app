import { describe, it } from 'node:test';
import { data_access_load, services_load } from '../bootstrap/application';
import assert from 'node:assert';
import DomainError from '../src/utils/DomainError';
import jwtSession from '../src/application/session/jwt';
import jwt from 'jsonwebtoken';
import scrypt from '../src/application/security/scrypt';
import crypto from 'node:crypto';
import * as http from "../src/utils/http";
import loader from '../loader';
import * as jsonschema from "json-schema";
import path from 'node:path';

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

const node = loader.node([
  "util",
  "url",
  "timers",
  "stream",
  "process",
  "perf_hooks",
  "os",
  "net",
  "fs",
  "events",
  "crypto",
  "console",
  "child_process",
  "cluster",
  "buffer",
  "path",
  "http"
]) as any;

const utils = { DomainError, http };
const npm = { jsonschema };

const app = {
  session: jwtSession({ npm: { jwt }, config } as any),
  security: scrypt({ node: { crypto } } as any),
  validator: loader.module(
    path.resolve(__dirname, "../src/application/validator/jsonschema"),
    { npm, utils },
  ),
};

const services = services_load({
  storage, app,
  utils, node,
}) as DomainServices;

describe('services', async () => {
  await storage.start();

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
        //@ts-ignore - method only for testing for now
        const { user_id } = await storage.repository.user._getByEmail(email);
        const user = await services.user.get(user_id);
        assert.strictEqual(user.nickname, nickname);
        assert.strictEqual(user.email, email);
        assert.ok(typeof user.id === "string");
      });

      await describe('validation service', async () => {
        await it('http - bearer', async () => {
          const tests = [
            { task: {}, throws: true },
            { task: { 'authorization': "" }, throws: true },
            { task: { 'authorization': `Bearer ${tokens.access}` }, throws: false },
            { task: { 'authorization': `notBearer ${tokens.access}` }, throws: true },
          ];

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
      const tests = [
        { data: {}, throws: true },
        { data: { email: 'test@gmail.com' }, throws: true },
        {
          data: {
            email: 'test@gmail.com',
            password: 'aA12312!3',
          },
          throws: true,
        },
        {
          data: {
            email: 'test@gmail.com',
            password: 'aA12312!3',
            nickname: '12',
          },
          throws: true,
        },
        {
          data: {
            email: 'test@gmail.com',
            password: 'aA12312!3',
            nickname: '12_',
          },
          throw: false,
        },
        {
          data: {
            email: 'test@gmail.com',
            password: 'aA12312!3',
            nickname: '1@2_',
          },
          throws: true,
        },
        {
          data: {
            email: 'testgmail.com',
            password: 'aA12312!3',
            nicnkame: 'testnickname',
          },
          throws: true,
        },
        {
          data: {
            email: 'testgmail.com',
            password: 'aA12312!3',
            nicnkame: '12345678901234567',
          },
          throws: true,
        },
        {
          data: {
            email: 'testgmail.com',
            password: 'asdq3',
            nickname: 'passA1!',
          },
          throws: true,
        },
      ];
      const service = services.validation.user.credentials;
      for (const test of tests) {
        const data = test.data as any;
        const throws = test.throws;
        if (throws) assert.throws(() => service(data));
        else service(data);
      }
    });
  })
});
