const storage = new Map();
const primary = new Map();
const emailIndex = new Map();
// all _function is for testing and shouldn't be implements in no testing interfaces.
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
    const user = primary.get(id);
    if (!user) return null;
    return {
      nickname: user.nickname,
      email: user.email,
      id: user.user_id,
    };
  },
  async getPasswordByEmail(email: string) {
    const user = emailIndex.get(email);
    if (!user) return null;
    return user.password;
  },
  async getByEmail(email: string) {
    const user = emailIndex.get(email);
    if (!user) return null;
    return {
      nickname: user.nickname,
      email: user.email,
      id: user.user_id,
    };
  },
  async updatePassword(id: string, password: string) {
    const user = primary.get(id);
    user.password = password;
  },
  async getPasswordById(id: string) {
    const user = primary.get(id);
    return user.password ?? null;
  }
};
