export default (services: DomainServices) => {
  return [
    async ({ body }: any) => {
      console.log({ body });
      // app.validator.user.credentials(data as Credentials);
      return body;
    },
    async (credentials: Credentials) => {
      // const token = await app.session.access("asd");
      // const data = await services.user.create(credentials);
      return { response: credentials };
    },
  ]
};