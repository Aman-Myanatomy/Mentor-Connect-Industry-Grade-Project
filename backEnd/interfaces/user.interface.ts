import { Request } from 'express';
import { USER_ROLE } from '../enumerations';

// What we are willing to send to a browser. NEVER includes passwordHash.
export interface IUserPublic {
  id: string;
  name: string;
  email: string;
  role: USER_ROLE;
  headline: string;
  bio: string;
  skills: string[];
}

export interface IAuthenticatedRequest extends Request {
  user: IUserPublic;
}
