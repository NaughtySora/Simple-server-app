export default (context: ServicesContext) => {
  const storage = context.storage.user;
  return async (credentials: Credentials) => {
    return await storage.create(credentials);
  };
};
