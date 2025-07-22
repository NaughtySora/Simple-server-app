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
import registerUser from "../src/domain/modules/user/register";
import getUser from "../src/domain/modules/user/get";
import loginUser from "../src/domain/modules/user/login";
import resetPassword from "../src/domain/modules/user/resetPassword";

const validator = loader.module(
  path.resolve(__dirname, "../src/application/validator/jsonschema"),
  { npm, utils },
);

const app = {
  session: jwtSession({ npm: { jwt }, config } as any),
  security: scrypt({ node: { crypto } } as any),
  validator,
};

const mockStorage = storage();

const services = services_load({
  storage: mockStorage, app,
  utils, node: node(),
}) as DomainServices;

describe('modules', async () => {
  await describe('user', async () => {
    await it('register', async () => {
      const modules = registerUser(services);
      const controller = modules[0];
      const handler = modules[1];
      for (const test of data.user.credentials) {
        const resource = { body: test.data } as any;
        await it('controller', async () => {
          if (test.throws) {
            await assert.rejects(async () => controller(resource));
          } else {
            await controller(resource);
          }
        });
        if (test.throws) continue;
        await it('handler', async () => {
          const result = await handler(test.data as any) as
            { meta: { code: number, }, response: Tokens };
          assert.strictEqual(result.meta.code, 201);
          assert.ok(typeof result.response.access === "string");
          assert.ok(typeof result.response.access === "string");
        });
      }
    });

    await it('get', async () => {
      const modules = getUser(services);
      const credentials = {
        email: "email@gmail.com",
        nickname: "nick",
        password: "hash",
      };
      const user = await mockStorage.repository.user.create(credentials, () => { });
      await it('controller', async () => {
        const controller = modules[0];
        const session = {
          id: user.userId,
          email: credentials.email,
        };
        const access = await app.session.access(session);
        const tests = data.http.bearer(access);
        for (const test of tests) {
          const resource = { headers: test.task } as any;
          if (test.throws) {
            await assert.rejects(async () => controller(resource));
          } else {
            await controller(resource);
          }
        }
      });
      await it('handler', async () => {
        const id = user.userId;
        const handler = modules[1];
        const result = await handler(id) as { response: any, };
        assert.strictEqual(result.response.nickname, credentials.nickname);
        assert.strictEqual(result.response.email, credentials.email);
        assert.strictEqual(result.response.id, id);
      });
    });

    await it('login', async () => {
      const login = loginUser(services);
      const create = registerUser(services);
      const createHandler = create[1] as any;
      const validCredentials = {
        email: "cool@gmail.com",
        nickname: "coolGuy",
        password: "aA123coolGuy!",
      };
      await createHandler(validCredentials);
      const tests = data.user.login.slice(0);
      tests.push({
        test: {
          email: validCredentials.email,
          password: validCredentials.password,
        },
        throws: false,
      });
      const valid: any = [];
      await it('controller', async () => {
        const controller = login[0];
        for (const test of tests) {
          const resource = { body: test.test } as any
          if (test.throws) {
            await assert.rejects(async () => controller(resource));
          }
          else {
            valid.push(await controller(resource));
          }
        }
      });
      await it('handler', async () => {
        const handler = login[1];
        for (const test of valid) {
          const result = await handler(test as any) as { response: any, };
          assert.strictEqual(result.response.email, test.email);
          assert.ok(typeof result.response.nickname === "string");
          assert.ok(typeof result.response.id === "string");
        }
      });
    });

    await it('reset password', async () => {
      const reset = resetPassword(services);
      const create = registerUser(services);
      const login = loginUser(services);
      const createHandler = create[1] as any;
      const loginHandler = login[1] as any;
      const validCredentials = {
        email: "pretty@gmail.com",
        nickname: "prettyGood",
        password: "asdxSasA6-623#!",
      };
      const desiredPassword = "1234567Aa!";
      await createHandler(validCredentials);
      const user = (await loginHandler(validCredentials)).response;
      const id = user.id;
      const session = { email: validCredentials.email, id, };
      const access = await app.session.access(session);
      const payload = {
        headers: {
          "authorization": `Bearer ${access}`,
        },
        body: {
          email: validCredentials.email,
          password: validCredentials.password,
          desired: desiredPassword,
        },
      };
      await it('controller', async () => {
        await reset[0](payload as any);
      });

      await it('handler', async () => {

      });
    });
  });
});
