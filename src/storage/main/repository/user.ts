export default ({ context, query }: any) => {
  return {
    async create(credentials: Credentials) {
      return (await query("select now()")).rows[0];
    },
  }
};