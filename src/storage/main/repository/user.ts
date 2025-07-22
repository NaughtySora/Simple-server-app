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
  async getPasswordByEmail(email: string, query: any) {
    const table = await query(
      'SELECT password FROM user_system WHERE email = $1',
      [email],
    );
    return table?.rows?.[0] ?? null;
  },
  async getByEmail(email: string, query: any) {
    const table = await query(
      'SELECT nickname, id, email, FROM user_view WHERE email = $1',
      [email],
    );
    return table?.rows?.[0] ?? null;
  },
  async updatePassword(id: string, password: string, query: any) {
    await query('UPDATE user_system SET password = $2 where user_id = $1', [
      id,
      password,
    ]);
  },
  async getPasswordById(id: string, query: any) {
    const table = await query(
      'SELECT password FROM user_system where user_id = $1',
      [id],
    );
    return table?.rows?.[0] ?? null;
  },
};
