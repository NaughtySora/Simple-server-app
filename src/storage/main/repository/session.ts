export default {
  async create({ id, tokens }: TokensCreation, query: any,) {
    await query(
      "INSERT INTO user_session(user_id, access, refresh) values($1, $2, $3)",
      [id, tokens.access, tokens.refresh],
    );
  },
};
