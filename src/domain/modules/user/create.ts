export default ({ services, app, }: DomainContext) => {
  return [
    async ({ data }: any) => {
      console.log({ data });
      app.validator.user.credentials(data as Credentials);
      return data;
    },
    async (credentials: Credentials) => {
      const token = await app.session.access("asd");
      const data = await services.user.create(credentials);
      return data;
    },
  ]
};