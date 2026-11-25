import { matchMentorsApi } from './service';
import { mentorMatchingActions } from './slice';

export const matchMentorsThunk = (goal) => async (dispatch) => {
  dispatch(mentorMatchingActions.setIsMatching(true));
  dispatch(mentorMatchingActions.setError(null));
  try {
    dispatch(mentorMatchingActions.setResponse((await matchMentorsApi(goal)).data));
  } catch (e) {
    dispatch(mentorMatchingActions.setError(e.message));
  } finally {
    dispatch(mentorMatchingActions.setIsMatching(false));
  }
};
