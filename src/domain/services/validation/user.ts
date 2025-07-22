export default (context: DomainServicesDependencies) => {
  const { validator } = context.app;
  const DomainError = context.utils.DomainError;
  const CODES = context.utils.http.CODES;
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
    }
  };
};
