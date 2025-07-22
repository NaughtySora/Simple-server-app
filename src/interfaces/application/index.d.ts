import security from '../../application/security/scrypt';
import session from '../../application/session/jwt';
import userValidator from '../../application/validator/jsonschema/user';

declare global {
  interface ApplicationServices {
    logger: Console;
    security: ReturnType<typeof security>;
    session: ReturnType<typeof session>;
    validator: {
      user: ReturnType<typeof userValidator>;
    };
  }
}

export {};
