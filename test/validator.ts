import validator from '../src/application/validator/jsonschema/user';
import assert from 'node:assert';
import { describe, it } from 'node:test';
import { data, npm, utils } from './mocks';

const context = { npm, utils } as any;
const user = validator(context);

describe('validator: [jsonschema]', () => {
  describe('schema: [user]', () => {
    it('credentials', () => {
      for (const test of data.user.credentials) {
        const data = test.data as any;
        const throws = test.throws;
        if (throws) assert.throws(() => user.credentials(data));
        else user.credentials(data);
      }
    });
  });
});
