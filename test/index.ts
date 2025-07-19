import * as dotenv from 'dotenv';
dotenv.config();
import scrypt from "../src/application/security/scrypt";
import crypto from "node:crypto";
import assert from "node:assert";
import jwt from "jsonwebtoken";
import jwtSession from "../src/application/session/jwt";
import { loadModule } from "../loader";
import path from "node:path";
import validator from "../src/application/validator/jsonschema";
import jsonschema from "json-schema";
import DomainError from '../src/utils/DomainError';

const context = { npm: { jsonschema }, utils: { DomainError } } as Essentials;
const validate = validator(context);

const security = async () => {
  const context = { node: { crypto } } as Essentials;
  const api = scrypt(context);
  const password = '12346aA14323!!@#';
  const hash = await api.hash(password);
  const isValid = await api.compare(password, hash);
  assert.ok(isValid);
};

const session = async () => {
  const config = await loadModule(path.resolve(__dirname, "../src/config"));
  const context = { npm: { jwt }, config } as Essentials;
  const api = jwtSession(context);
  const data = { id: crypto.randomUUID(), email: "john.doe@gmail.com" };
  const token = await api.access(data);
  const decoded = await api.decode(token) as any;
  const isValid = await api.verify(token);
  assert.ok(isValid);
  assert.ok(typeof token === "string");
  assert.strictEqual(decoded.data.data.id, data.id);
  assert.strictEqual(decoded.data.data.email, data.email);
  assert.strictEqual(decoded.data._type, "access");
};

const schema = {
  user: {
    credentials: () => {
      const tests = [
        { data: {}, throws: true },
        { data: { email: "test@gmail.com" }, throws: true },
        {
          data: {
            email: "test@gmail.com",
            password: "aA12312!3"
          },
          throws: true
        },
        {
          data: {
            email: "test@gmail.com",
            password: "aA12312!3",
            nickname: "12"
          },
          throws: true
        },
        {
          data: {
            email: "test@gmail.com",
            password: "aA12312!3",
            nickname: "12_"
          },
          throw: false
        },
        {
          data: {
            email: "test@gmail.com",
            password: "aA12312!3",
            nickname: "1@2_"
          },
          throws: true,
        },
        {
          data: {
            email: "testgmail.com",
            password: "aA12312!3",
            nicnkame: "testnickname"
          },
          throws: true,
        },
        {
          data: {
            email: "testgmail.com",
            password: "aA12312!3",
            nicnkame: "12345678901234567"
          },
          throws: true,
        },
        {
          data: {
            email: "testgmail.com",
            password: "asdq3",
            nickname: "passA1!"
          },
          throws: true,
        },
      ];
      let force = false;
      for (const test of tests) {
        force = false;
        const { data, throws } = test;
        try {
          validate.user.credentials(data as any);
          if (throws) {
            force = true;
            throw new Error(`case should throw ${tests.indexOf(test)}`);
          }
        } catch (e: any) {
          if (!throws || force) {
            throw new Error(e.message);
          }
        }
      }
    },
  }
};

const request = async () => {
  try {
    const res = await fetch("http://localhost:3001/user/create", {
      method: "POST",
      headers: { "Content-Type": "application/json", },
      body: JSON.stringify({ email: "1", }),
    });
    const data = await res.json();
    console.dir(data);
  } catch (e) {
    console.error(e);
  }
};

const runner = async () => {
  // await security();
  // await session();
  // schema.user.credentials();
  await request();
};

runner();