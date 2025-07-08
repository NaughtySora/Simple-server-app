import * as dotenv from 'dotenv';
dotenv.config();
import scrypt from "../src/application/security";
import crypto from "node:crypto";
import assert from "node:assert";
import jwt from "jsonwebtoken";
import jwtSession from "../src/application/session/jwt/index";
import { loadModule } from "../loader";
import path from "node:path";

const security = async () => {
  const context = { node: { crypto } };
  const api = scrypt(context);
  const password = '12346aA14323!!@#';
  const hash = await api.hash(password);
  const isValid = await api.compare(password, hash);
  assert.ok(isValid);
};

const session = async () => {
  const config = await loadModule(path.resolve(__dirname, "../src/config"));
  const context = { npm: { jwt }, config };
  const api = jwtSession(context);
  const data = { id: crypto.randomUUID(), email: "john.doe@gmail.com" };
  const token = await api.access(data);
  const decoded = await api.decode(token);
  const isValid = await api.verify(token);
  assert.ok(isValid);
  assert.ok(typeof token === "string");
  assert.strictEqual(decoded.id, data.id);
  assert.strictEqual(decoded.email, data.email);
};

const runner = async () => {
  await security();
  await session();
};

runner();