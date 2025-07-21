export default {
  async create(user: Credentials, query: any) {
    const table = await query(
      'INSERT INTO user_system(nickname, password, email) \
      VALUES($1, $2, $3) RETURNING user_id AS "userId", id',
      [user.nickname, user.password, user.email],
    );
    return table?.rows?.[0] ?? null;
  },
  async getById(id: string, query: any) {
    const table = await query(
      'SELECT nickname, id, email, FROM user_view WHERE id = $1',
      [id],
    );
    return table?.rows?.[0] ?? null;
  },
};
