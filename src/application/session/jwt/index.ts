type Payload = Record<string, any>;

export default (context: any) => {
  const jwt = context.npm.jwt;
  const config = context.config;
  return {
    access(data: Payload) {
      return jwt.sign(
        { ...data, _type: 'access' },
        config.session.secret.access,
        { expiresIn: config.session.duration.access },
      );
    },
    refresh(data: Payload) {
      return jwt.sign(
        { ...data, _type: 'refresh' },
        config.session.secret.refresh,
        { expiresIn: config.session.duration.refresh },
      );
    },
    async verify(token: string) {
      try {
        const { _type } = jwt.decode(token);
        const key = config.session.secret[_type];
        await jwt.verify(token, key);
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