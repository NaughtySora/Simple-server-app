type Payload = Record<string, any>;

export default (context: ApplicationDependencies) => {
  const jwt = context.npm.jwt;
  const config = context.config;
  const { duration, secret } = config.session;
  return {
    access(data: Payload) {
      return jwt.sign(
        { data: { data, _type: 'access' }, },
        secret.access,
        { expiresIn: duration.access as any },
      );
    },
    refresh(data: Payload) {
      return jwt.sign(
        { data: { data, _type: 'refresh' }, },
        secret.refresh,
        { expiresIn: duration.refresh as any },
      );
    },
    async verify(token: string) {
      try {
        const decoded = jwt.decode(token) as any;
        if (!decoded) throw new Error("Can't decode token");
        const { _type } = decoded.data;
        const key = secret[_type as keyof typeof secret];
        jwt.verify(token, key);
        return true;
      } catch {
        return false;
      }
    },
    decode(token: string) {
      return jwt.decode(token);
    },
  };
};