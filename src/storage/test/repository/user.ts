const storage = new Map();
const primary = new Map();

export default {
  async create(data: Credentials) {
    const { email, nickname, password } = data;
    const user_id = crypto.randomUUID();
    const id = storage.size;
    const date = new Date().toISOString();
    const user = {
      id,
      user_id,
      email,
      nickname,
      password,
      create_at: date,
      updated_at: date,
    };
    storage.set(id, user);
    primary.set(user_id, user);
    return { id, userId: user_id };
  },
};
