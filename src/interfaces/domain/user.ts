interface Credentials {
  email: string;
  password: string;
  nickname: string;
}

interface User {
  id: string;
  email: string;
  nickname: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface UserResetPassword {
  password: string;
  desired: string;
}
