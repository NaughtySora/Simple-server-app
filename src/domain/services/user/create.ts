export default (context: DomainServicesDependencies) => {
  const transaction = context.storage.transaction;
  const storage = context.storage.repository;
  const { session, security } = context.app;
  return async (credentials: Credentials) => {
    const email = credentials.email;
    const password = await security.hash(credentials.password);
    let tokens: any = null;
    await transaction(async (query: any) => {
      const { id, userId } = await storage.user.create(
        { email, nickname: credentials.nickname, password },
        query,
      );
      const sessionCredentials = { id: userId, email };
      const [access, refresh] = await Promise.all([
        session.access(sessionCredentials),
        session.refresh(sessionCredentials),
      ]);
      tokens = { access, refresh };
      await storage.session.create({ id, tokens }, query);
    });
    return tokens as Tokens;
  };
};
