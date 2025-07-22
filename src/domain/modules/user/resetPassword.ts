export default (services: DomainServices) => [
  async ({ body, headers }: ControllerParameters<UserResetPassword>) => {
    const password = body.password;
    const desired = body.desired;
    const [id] = await Promise.all([
      services.validation.http.bearer(headers),
      services.validation.user.password(password),
      services.validation.user.password(desired),
    ]);
    return { id, password, desired };
  },
  async (data: UserResetPassword & { id: string }) => {
    const actual = await services.user.getPasswordById(data.id);
    await services.validation.user.comparePasswords(actual, data.password);
    await services.user.changePassword(data.id, data.desired);
    return { response: undefined, meta: { code: 204 } };
  },
];
