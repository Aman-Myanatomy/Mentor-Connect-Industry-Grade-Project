import { CorsOptions } from 'cors';
import { N_CONF } from './env';

// Allow-list exactly ONE origin (the front-end). Never '*' for an API that uses Authorization headers.
export const corsOptions: CorsOptions = { origin: N_CONF.FRONTEND_URL };
