import DomainError from '../../utils/DomainError';
import NetworkError from '../../utils/NetworkError';
import { CODES } from '../../utils/http';

declare global {
  interface Utils {
    DomainError: typeof DomainError;
    NetworkError: typeof NetworkError;
    http: {
      CODES;
    };
  }
}

export {};
