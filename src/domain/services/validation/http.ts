export default (context: DomainServicesDependencies) => {
  const DomainError = context.utils.DomainError;
  const STATUSES = context.node.http.STATUS_CODES;
  const CODES = context.utils.http.CODES;
  const unauthorized = () => {
    throw new DomainError(STATUSES[CODES.unauthorized] as string, {
      code: CODES.unauthorized,
    });
  };
  const session = context.app.session;
  return {
    async bearer(headers: any) {
      const authorization = headers['authorization'];
      if (authorization === undefined) unauthorized();
      const parts = authorization.split(' ');
      const method = parts[0].toLowerCase();
      if (method !== 'bearer') unauthorized();
      const token = parts[1];
      if (!token) unauthorized();
      try {
        const data = await session.decode(token);
        const id = (data as any)?.data?.data?.id;
        if (typeof id !== 'string') throw new Error('id is not defined');
        return id;
      } catch (cause) {
        throw new DomainError(STATUSES[CODES.forbidden] as string, {
          code: CODES.forbidden,
          cause,
        });
      }
    },
  };
};
