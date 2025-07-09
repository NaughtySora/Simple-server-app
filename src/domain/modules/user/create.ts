export default ({ services, app, }: DomainContext) => {
  return [
    async () => { },
    async () => {
      const token = await app.session.access("asd");
      console.log(await app.session.decode(token));
      const data = await services.user.create({});
      return data;
    },
  ]
};