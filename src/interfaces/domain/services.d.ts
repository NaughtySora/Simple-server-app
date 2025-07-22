import userCreate from '../../domain/services/user/create';
import userGet from '../../domain/services/user/get';
import userLogin from '../../domain/services/user/login';
import validationUser from '../../domain/services/validation/user';
import validationHttp from '../../domain/services/validation/http';

declare global {
  interface DomainServices {
    user: {
      create: ReturnType<typeof userCreate>;
      get: ReturnType<typeof userGet>;
      login: ReturnType<typeof userLogin>;
    };
    validation: {
      user: ReturnType<typeof validationUser>;
      http: ReturnType<typeof validationHttp>;
    };
  }
}

export { };
