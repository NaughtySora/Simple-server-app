import userCreate from '../../domain/services/user/create';
import userGet from '../../domain/services/user/get';
import userLogin from '../../domain/services/user/login';
import userChangePassword from '../../domain/services/user/changePassword';
import userGetPasswordById from '../../domain/services/user/getPasswordById';
import userGetPasswordByEmail from '../../domain/services/user/getPasswordByEmail';
import validationUser from '../../domain/services/validation/user';
import validationHttp from '../../domain/services/validation/http';

declare global {
  interface DomainServices {
    user: {
      create: ReturnType<typeof userCreate>;
      get: ReturnType<typeof userGet>;
      login: ReturnType<typeof userLogin>;
      changePassword: ReturnType<typeof userChangePassword>;
      getPasswordById: ReturnType<typeof userGetPasswordById>;
      getPasswordByEmail: ReturnType<typeof userGetPasswordByEmail>;
    };
    validation: {
      user: ReturnType<typeof validationUser>;
      http: ReturnType<typeof validationHttp>;
    };
  }
}

export {};
