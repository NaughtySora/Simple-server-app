type CallbackError = Error | null;

export default (context: ApplicationDependencies) => {
  const node = context.node;
  const { randomBytes, scrypt, timingSafeEqual } = node.crypto;

  const HASH_PARTS = 5;
  const SALT_LEN = 32;
  const KEY_LEN = 64;
  const SCRYPT_PARAMS = { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
  const SCRYPT_PREFIX = '$scrypt$N=32768,r=8,p=1,maxmem=67108864$';

  const parseOptions = (options: string) => {
    const values: [string, number][] = [];
    const parts = options.split(',');
    for (const part of parts) {
      const entity = part.split('=');
      const key = entity[0];
      const value = parseInt(entity[1], 10);
      values.push([key, value]);
    }
    return Object.fromEntries(values);
  };

  const serializeHash = (hash: Buffer, salt: Buffer) => {
    const saltString = salt.toString('base64').split('=')[0];
    const hashString = hash.toString('base64').split('=')[0];
    return `${SCRYPT_PREFIX}${saltString}$${hashString}`;
  };

  const deserializeHash = (passwordHash: string) => {
    const parts = passwordHash.split('$');
    if (parts.length !== HASH_PARTS) {
      throw new Error('Invalid format; Expected $name$options$salt$hash');
    }
    const [, name, options, salt64, hash64] = parts;
    if (name !== 'scrypt') {
      throw new Error('Node.js crypto module only supports scrypt');
    }
    return {
      params: parseOptions(options),
      salt: Buffer.from(salt64, 'base64'),
      hash: Buffer.from(hash64, 'base64'),
    };
  };

  return {
    hash(password: string): Promise<string> {
      return new Promise((resolve, reject) => {
        randomBytes(SALT_LEN, (err: CallbackError, salt: Buffer) => {
          if (err) return void reject(err);
          const callback = (err: CallbackError, hash: Buffer) => {
            if (err) return void reject(err);
            resolve(serializeHash(hash, salt));
          };
          scrypt(password, salt, KEY_LEN, SCRYPT_PARAMS, callback);
        });
      });
    },
    compare(password: string, hashed: string): Promise<boolean> {
      const { params, salt, hash } = deserializeHash(hashed);
      return new Promise((resolve, reject) => {
        const callback = (err: CallbackError, hashedPassword: Buffer) => {
          if (err) return void reject(err);
          resolve(timingSafeEqual(hashedPassword, hash));
        };
        scrypt(password, salt, hash.length, params, callback);
      });
    },
  };
};