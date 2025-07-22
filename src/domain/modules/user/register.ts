export default (services: DomainServices) => {
  return [
    async ({ body }: ControllerParameters<Credentials>) => {
      services.validation.user.credentials(body);
      return body;
    },
    async (credentials: Credentials) => {
      const response = await services.user.create(credentials);
      return { response, meta: { code: 201 } };
    },
  ];
};
