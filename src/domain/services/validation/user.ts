export default (context: DomainServicesDependencies) => {
  const { validator } = context.app;
  const DomainError = context.utils.DomainError;
  const CODES = context.utils.http.CODES;
  const { repository, query } = context.storage;
  const security = context.app.security;
  return {
    credentials(data: Partial<Credentials>) {
      try {
        validator.user.credentials(data);
      } catch (cause) {
        throw new DomainError('User credentials validation failed', {
          code: CODES.badRequest,
          cause,
        });
      }
    },
    login(data: Partial<LoginCredentials>) {
      try {
        validator.user.login(data);
      } catch (cause) {
        throw new DomainError('User credentials validation failed', {
          code: CODES.badRequest,
          cause,
        });
      }
    },
    async comparePasswords(actual: string, desired: string) {
      const isValidPassword = await security.compare(desired, actual);
      if (!isValidPassword) {
        throw new DomainError('Password validation failed', {
          code: CODES.badRequest,
        });
      }
    },
    password(value: string) {
      try {
        validator.user.password(value);
      } catch (cause) {
        throw new DomainError('Invalid password format', {
          code: CODES.badRequest,
          cause,
        });
      }
    },
  };
};
