import validator from '../src/application/validator/jsonschema/user';
import assert from 'node:assert';
import { describe, it } from 'node:test';
import { npm, utils } from './mocks';

const context = { npm, utils } as any;
const user = validator(context);

describe('validator: [jsonschema]', () => {
  describe('schema: [user]', () => {
    it('credentials', () => {
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

      for (const test of tests) {
        const data = test.data as any;
        const throws = test.throws;
        if (throws) assert.throws(() => user.credentials(data));
        else user.credentials(data);
      }
    });
  });
});
