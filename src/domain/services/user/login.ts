export default (context: DomainServicesDependencies) => {
  const { query, repository } = context.storage;
  return async (data: LoginCredentials) => {
    return repository.user.getByEmail(data.email, query);
  };
};
