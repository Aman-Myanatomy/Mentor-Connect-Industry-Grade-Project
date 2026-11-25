import { Request, Response } from 'express';
import { HTTP_RESPONSE_STATUS_CODE_ENUM as CODE } from '../enumerations';
import * as Services from '../services';

export const listMentors = async (_req: Request, res: Response): Promise<void> => {
  res.status(CODE.OK).json({ success: true, data: { mentors: await Services.listMentors() } });
};
