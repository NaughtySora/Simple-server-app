export default {
  secret: {
    refresh: process.env.SESSION_SECRET_REFRESH as string,
    access: process.env.SESSION_SECRET_ACCESS as string,
  },
  duration: {
    refresh: process.env.SESSION_DURATION_REFRESH as string,
    access: process.env.SESSION_DURATION_ACCESS as string,
  },
};
