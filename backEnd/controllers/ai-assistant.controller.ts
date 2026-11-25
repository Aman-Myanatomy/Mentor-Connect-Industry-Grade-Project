import { Request, Response } from 'express';
import { N_CONF } from '../config';
import { HTTP_RESPONSE_STATUS_CODE_ENUM as CODE } from '../enumerations';
import { IAuthenticatedRequest } from '../interfaces';
import * as Sanitize from '../sanitization';
import * as Services from '../services';
import { sanitizeNValidate } from '../utils';
import * as Validate from '../validation';

const run = (fn: 'matchMentors' | 'roomAction') => (req: Request) => sanitizeNValidate(Sanitize.AiAssistantSanitization, Validate.AiAssistantValidation, fn, req);

export const getStatus = async (_req: Request, res: Response): Promise<void> => {
  res.status(CODE.OK).json({ success: true, data: { mockMode: Services.isMockMode, demoAutoReply: N_CONF.DEMO_AUTO_REPLY } });
};

export const matchMentors = async (req: Request, res: Response): Promise<void> => {
  await run('matchMentors')(req);
  res.status(CODE.OK).json({ success: true, data: await Services.matchMentors(req.body.goal) });
};

export const suggestReply = async (req: Request, res: Response): Promise<void> => {
  await run('roomAction')(req);
  const room = await Services.getRoomForMember(req.params.roomId, (req as IAuthenticatedRequest).user.id);
  res.status(CODE.OK).json({ success: true, data: await Services.suggestReply(String(room._id)) });
};

export const summarizeRoom = async (req: Request, res: Response): Promise<void> => {
  await run('roomAction')(req);
  const room = await Services.getRoomForMember(req.params.roomId, (req as IAuthenticatedRequest).user.id);
  res.status(CODE.OK).json({ success: true, data: await Services.summarizeRoom(String(room._id)) });
};
