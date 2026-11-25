import { HTTP_RESPONSE_STATUS_CODE_ENUM as CODE } from '../enumerations';

// errorHandler middleware turns any of these into { success:false, errors:[{message}] } + httpCode
export class AppError extends Error {
  constructor(public httpCode: number, message: string) { super(message); }
  get errors(): { message: string }[] { return [{ message: this.message }]; }
}
export class BadRequest extends AppError { constructor(m = 'Bad request') { super(CODE.BAD_REQUEST, m); } }
export class NotAuthorized extends AppError { constructor(m = 'Not authenticated') { super(CODE.UNAUTHORIZED, m); } }
export class Forbidden extends AppError { constructor(m = 'Forbidden') { super(CODE.FORBIDDEN, m); } }
export class NotFound extends AppError { constructor(m = 'Not found') { super(CODE.NOT_FOUND, m); } }
export class Conflict extends AppError { constructor(m = 'Conflict') { super(CODE.CONFLICT, m); } }
