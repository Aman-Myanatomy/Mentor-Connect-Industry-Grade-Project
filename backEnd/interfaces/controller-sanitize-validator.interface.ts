import { ValidationChain } from 'express-validator';

export interface ISanitizeAndValidate extends Record<string, ValidationChain[]> {}
