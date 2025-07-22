export default (services: DomainServices) => [
  async ({ body }: ControllerParameters<LoginCredentials>) => {
    services.validation.user.login(body);
    return body;
  },
  async (data: LoginCredentials) => {
    const actual = await services.user.getPasswordByEmail(data.email);
    await services.validation.user.comparePasswords(actual, data.password);
    return { response: await services.user.login(data) };
  },
];
