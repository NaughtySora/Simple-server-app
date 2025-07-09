export default (context: ServicesContext) => {
  const storage = context.storage.user;

  return {
    async create(credentials: Credentials) {
      return await storage.create(credentials);
    }
  }
}