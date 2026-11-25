import { USER_ROLE } from '../../enumerations';
import { closeSocket } from '../../middlewares';
import { tokenStore } from '../../utils';

import { getMeApi, loginApi, registerApi } from './service';
import { loginActions } from './slice';

const finishAuth = (dispatch, data) => {
  tokenStore.set(data.accessToken);
  dispatch(loginActions.setSession(data));
};

// expectedRole = which tab the person used ("Student" / "Mentor"). The tab is only a UX hint: the SERVER decides the
// real role. If they differ we refuse to start the session and explain, instead of silently logging them into the wrong UI.
export const loginThunk = (email, password, expectedRole) => async (dispatch) => {
  dispatch(loginActions.setIsLoading(true));
  dispatch(loginActions.setError(null));
  try {
    const { data } = await loginApi(email, password);
    if (expectedRole && data.user.role !== expectedRole) {
      dispatch(
        loginActions.setError(
          `This is a ${data.user.role} account. Please use the "${data.user.role === USER_ROLE.MENTOR ? 'Mentor' : 'Student'}" tab to log in.`
        )
      );
      return;
    }
    finishAuth(dispatch, data);
  } catch (e) {
    dispatch(loginActions.setError(e.message));
  } finally {
    dispatch(loginActions.setIsLoading(false));
  }
};

export const registerThunk = (name, email, password) => async (dispatch) => {
  dispatch(loginActions.setIsLoading(true));
  dispatch(loginActions.setError(null));
  try {
    finishAuth(dispatch, (await registerApi(name, email, password)).data);
  } catch (e) {
    dispatch(loginActions.setError(e.message));
  } finally {
    dispatch(loginActions.setIsLoading(false));
  }
};

// On page reload: if a token is in sessionStorage, ask the server who we are.
export const restoreSessionThunk = () => async (dispatch) => {
  const token = tokenStore.get();
  try {
    if (token) dispatch(loginActions.setSession({ user: (await getMeApi()).data.user, accessToken: token }));
  } catch {
    tokenStore.clear();
  } finally {
    dispatch(loginActions.setIsRestoring(false));
  }
};

export const logoutThunk = () => (dispatch) => {
  closeSocket();
  tokenStore.clear();
  dispatch({ type: 'app/reset' }); // root reducer wipes ALL feature state (no data leaks between accounts)
  dispatch(loginActions.setIsRestoring(false));
};
