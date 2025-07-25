import scrypt from '../src/application/security/scrypt';
import crypto from 'node:crypto';
import assert from 'node:assert';
import { describe, it } from 'node:test';

const context = { node: { crypto } } as any;
const api = scrypt(context);

(async () => {
  await describe('security: [scrypt]', async () => {
    const password = '12346aA14323!!@#';
    await it('hashing/compare', async () => {
      const hash = await api.hash(password);
      const isValid = await api.compare(password, hash);
      assert.ok(isValid);
    });
  });
})();
