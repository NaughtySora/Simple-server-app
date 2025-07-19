export default (context: DomainServicesDependencies) => {
  const storage = context.storage.user;
  return async (credentials: Credentials) => {
    return await storage.create(credentials);
  };
};
