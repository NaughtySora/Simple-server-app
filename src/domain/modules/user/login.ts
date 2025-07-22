export default (services: DomainServices) => [
  async ({ body, }: ControllerParameters<LoginCredentials>) => {
    services.validation.user.login(body);
    return body;
  },
  async (data: LoginCredentials) => {
    return { response: await services.user.login(data) };
  },
];
