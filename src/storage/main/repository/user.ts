export default ({ query, }: Storage) => {
  return {
    async create(credentials: Credentials) {
      return (await query("select now()")).rows[0];
    },
  }
};