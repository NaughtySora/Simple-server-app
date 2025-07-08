

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
    verify(token: string) {
      const { _type } = jwt.decode(token);
      return jwt.verify(token, _type);
    },
    decode(token: string) {
      return jwt.decode(token);
    },
  };
};