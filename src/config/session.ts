export default {
  secret: {
    refresh: process.env.SESSION_SECRET_REFRESH,
    access: process.env.SESSION_SECRET_ACCESS,
  },
  duration: {
    refresh: process.env.SESSION_DURATION_REFRESH,
    access: process.env.SESSION_DURATION_ACCESS,
  },
};
