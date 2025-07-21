export default (context: DomainServicesDependencies) => {
  const { validator } = context.app;
  const DomainError = context.utils.DomainError;
  const CODES = context.utils.http.CODES;
  return {
    credentials(data: Credentials) {
      try {
        validator.user.credentials(data);
      } catch (cause) {
        throw new DomainError('User credentials validation failed', {
          code: CODES.badRequest,
          cause,
        });
      }
    },
  };
};
