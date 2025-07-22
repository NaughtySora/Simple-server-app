export default (context: DomainServicesDependencies) => {
  const { query, repository } = context.storage;
  return async (id: string) => {
    return repository.user.getById(id, query);
  };
};
