export default (context: DomainServicesDependencies) => {
  const { query, repository } = context.storage;
  const security = context.app.security;
  return async (id: string, password: string) => {
    const hash = await security.hash(password);
    await repository.user.updatePassword(id, hash, query);
  };
};
