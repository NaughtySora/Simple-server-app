export default (context: DomainServicesDependencies) => {
  const { query, repository } = context.storage;
  const DomainError = context.utils.DomainError;
  const security = context.app.security;
  const CODES = context.utils.http.CODES;
  return async (data: LoginCredentials) => {
    const email = data.email;
    const hash = await repository.user.getPasswordByEmail(email, query);
    if (!hash) {
      throw new DomainError('User not found', { code: CODES.badRequest });
    }
    const isValidPassword = await security.compare(data.password, hash);
    if (!isValidPassword) {
      throw new DomainError('Password validation failed', {
        code: CODES.badRequest,
      });
    }
    return await repository.user.getByEmail(email, query);
  };
};
