import { fetchMentorsApi } from './service';
import { mentorDirectoryActions } from './slice';

export const fetchMentorsThunk = () => async (dispatch) => {
  dispatch(mentorDirectoryActions.setIsLoading(true));
  dispatch(mentorDirectoryActions.setError(null));
  try {
    dispatch(mentorDirectoryActions.setMentors((await fetchMentorsApi()).data.mentors));
  } catch (e) {
    dispatch(mentorDirectoryActions.setError(e.message));
  } finally {
    dispatch(mentorDirectoryActions.setIsLoading(false));
  }
};
