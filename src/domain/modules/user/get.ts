export default (services: DomainServices) => [
  async ({ headers }: any) => {
    return await services.validation.http.bearer(headers);
  },
  async (id: string) => {
    return { response: await services.user.get(id) };
  },
];
