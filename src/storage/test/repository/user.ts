const storage = new Map();
const primary = new Map();
const emailIndex = new Map();

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
    emailIndex.set(user.email, user);
    return { id, userId: user_id };
  },
  async getById(id: string) {
    const { nickname, email, user_id } = primary.get(id);
    return {
      nickname,
      email,
      id: user_id,
    };
  },
  async _getByEmail(email: string) {
    return emailIndex.get(email);
  },
};
