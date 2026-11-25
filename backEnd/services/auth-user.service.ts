// Auth: bcrypt password hashes + JWT bearer access tokens.
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ACCESS_TOKEN_EXPIRY, BCRYPT_ROUNDS } from '../constants';
import { N_CONF } from '../config';
import { USER_ROLE } from '../enumerations';
import { IUserPublic } from '../interfaces';
import { IUser, UserModel } from '../models';
import { Conflict, NotAuthorized } from '../utils';

export const toPublicUser = (u: IUser): IUserPublic => ({
  id: String(u._id), name: u.name, email: u.email, role: u.role, headline: u.headline, bio: u.bio, skills: u.skills
});

// Pin the algorithm: blocks the classic "alg: none" JWT attack.
const sign = (userId: string): string =>
  jwt.sign({ sub: userId }, N_CONF.JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY, algorithm: 'HS256' });

// Dummy hash: unknown emails cost the same time as wrong passwords => no user enumeration via timing.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', BCRYPT_ROUNDS);

export const registerStudent = async (name: string, email: string, password: string): Promise<{ user: IUserPublic; accessToken: string }> => {
  if (await UserModel.exists({ email })) throw new Conflict('Email already registered');
  // Role is hard-coded here (and the controller only picks name/email/password) => no mass-assignment privilege escalation.
  const user = await UserModel.create({ name, email, passwordHash: await bcrypt.hash(password, BCRYPT_ROUNDS), role: USER_ROLE.STUDENT });
  return { user: toPublicUser(user), accessToken: sign(String(user._id)) };
};

export const login = async (email: string, password: string): Promise<{ user: IUserPublic; accessToken: string }> => {
  const user = await UserModel.findOne({ email }).select('+passwordHash');
  const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !ok) throw new NotAuthorized('Invalid email or password');   // same message either way
  return { user: toPublicUser(user), accessToken: sign(String(user._id)) };
};

export const authenticateToken = async (token: string): Promise<IUserPublic> => {
  try {
    const { sub } = jwt.verify(token, N_CONF.JWT_SECRET, { algorithms: ['HS256'] }) as jwt.JwtPayload;
    const user = await UserModel.findById(sub);
    if (!user) throw new Error('user gone');
    return toPublicUser(user);
  } catch {
    throw new NotAuthorized('Invalid or expired access token.');
  }
};
