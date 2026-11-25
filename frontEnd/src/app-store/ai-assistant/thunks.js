import { fetchAiStatusApi, suggestReplyApi, summarizeRoomApi } from './service';
import { aiAssistantActions } from './slice';

export const fetchAiStatusThunk = () => async (dispatch) => {
  try {
    dispatch(aiAssistantActions.setStatus((await fetchAiStatusApi()).data));
  } catch {
    /* badge just stays hidden */
  }
};

const runForActiveRoom = (kind) => () => async (dispatch, getState) => {
  const roomId = getState().chat.activeRoomId;
  if (!roomId) return;
  dispatch(aiAssistantActions.setIsLoading(true));
  dispatch(aiAssistantActions.setError(null));
  try {
    dispatch(
      aiAssistantActions.setResult(
        kind === 'suggestion' ? { kind, ...(await suggestReplyApi(roomId)).data } : { kind, ...(await summarizeRoomApi(roomId)).data }
      )
    );
  } catch (e) {
    dispatch(aiAssistantActions.setError(e.message));
  } finally {
    dispatch(aiAssistantActions.setIsLoading(false));
  }
};
export const suggestReplyThunk = runForActiveRoom('suggestion');
export const summarizeRoomThunk = runForActiveRoom('summary');
