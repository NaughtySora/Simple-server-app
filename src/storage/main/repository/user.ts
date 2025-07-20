export default {
  async create(user: Credentials, query: any,) {
    const table = await query(
      "INSERT INTO user_system(nickname, password, email) \
      VALUES($1, $2, $3) RETURNING user_id AS \"userId\", id",
      [user.nickname, user.password, user.email],
    );
    return table.rows[0];
  },
};
