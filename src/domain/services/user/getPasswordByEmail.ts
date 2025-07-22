export default (context: DomainServicesDependencies) => {
  const { query, repository } = context.storage;
  const DomainError = context.utils.DomainError;
  const CODES = context.utils.http.CODES;
  return async (email: string) => {
    const password = await repository.user.getPasswordByEmail(email, query);
    if (!password) {
      throw new DomainError('User not found', { code: CODES.badRequest });
    }
    return password;
  };
};
