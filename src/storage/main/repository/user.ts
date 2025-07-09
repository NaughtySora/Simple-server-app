export default ({ query, }: RepositoryContext) => {
  return {
    async create(credentials: Credentials) {
      return (await query("select now()")).rows[0];
    },
  }
};