export default (services: DomainServices) => [
  async ({ headers }: ControllerParameters<{}>) => {
    return await services.validation.http.bearer(headers);
  },
  async (id: string) => {
    return {
      response: await services.user.get(id),
    };
  },
];
