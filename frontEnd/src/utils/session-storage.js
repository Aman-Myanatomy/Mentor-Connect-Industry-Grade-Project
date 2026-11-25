import { SESSION_TOKEN_KEY } from '../constants';

// sessionStorage (not localStorage): the token disappears when the tab closes.
// TRADE-OFF to discuss in class: any JS on the page can read it, so XSS = account takeover.
// React escapes all text by default, and we never use dangerouslySetInnerHTML.
export const tokenStore = {
  get: () => {
    try {
      return sessionStorage.getItem(SESSION_TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set: (t) => {
    try {
      sessionStorage.setItem(SESSION_TOKEN_KEY, t);
    } catch {
      /* storage blocked */
    }
  },
  clear: () => {
    try {
      sessionStorage.removeItem(SESSION_TOKEN_KEY);
    } catch {
      /* storage blocked */
    }
  }
};
