import { USER_ROLE } from '../enumerations';
import { UserModel } from '../models';
import { toPublicUser } from './auth-user.service';

export const listMentors = async () =>
  (await UserModel.find({ role: USER_ROLE.MENTOR }).sort({ name: 1 })).map(toPublicUser);

export const findMentorById = async (id: string) => {
  const u = await UserModel.findOne({ _id: id, role: USER_ROLE.MENTOR });
  return u ? toPublicUser(u) : null;
};
