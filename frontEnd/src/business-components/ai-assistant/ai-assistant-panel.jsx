import { useAppDispatch, useAppSelector } from '../../app-store';
import { suggestReplyThunk, summarizeRoomThunk } from '../../app-store/ai-assistant';
import { chatActions } from '../../app-store/chat';
import { USER_ROLE } from '../../enumerations';
import { EmptyState, Icon, InlineError, TraceList, TypedText } from '../../shared-components';

export const AiAssistantPanel = () => {
  const dispatch = useAppDispatch();
  const role = useAppSelector((s) => s.login.user?.role);
  const activeRoomId = useAppSelector((s) => s.chat.activeRoomId);
  const { isLoading, result, error } = useAppSelector((s) => s.aiAssistant);
  const isMentor = role === USER_ROLE.MENTOR;

  return (
    <aside className="pane pane-right" aria-label="AI copilot">
      <div className="ai-head">
        <Icon name="sparkles" />
        AI copilot
      </div>
      <div className="pane-scroll">
        <div className="ai-actions">
          {isMentor && (
            <button className="btn" disabled={!activeRoomId || isLoading} onClick={() => void dispatch(suggestReplyThunk())}>
              <Icon name="wand" />
              Suggest a reply
            </button>
          )}
          <button
            className={`btn ${isMentor ? 'btn-secondary' : ''}`}
            disabled={!activeRoomId || isLoading}
            onClick={() => void dispatch(summarizeRoomThunk())}
          >
            <Icon name="list" />
            Summarize conversation
          </button>
        </div>

        {!activeRoomId && (
          <div className="explain">
            <p className="ai-note">Open a conversation and the copilot can help:</p>
            <ul>
              <li>
                <span className="action-icon">
                  <Icon name="list" size={16} />
                </span>
                <div>
                  <b>Summarize</b>
                  <small>Topics and action items from the chat, as structured JSON.</small>
                </div>
              </li>
              {isMentor && (
                <li>
                  <span className="action-icon">
                    <Icon name="wand" size={16} />
                  </span>
                  <div>
                    <b>Suggest a reply</b>
                    <small>Drafted from the chat plus the knowledge base (RAG), with sources.</small>
                  </div>
                </li>
              )}
              <li>
                <span className="action-icon">
                  <Icon name="shield" size={16} />
                </span>
                <div>
                  <b>Guarded</b>
                  <small>Chat text is treated as untrusted data and checked before the model sees it.</small>
                </div>
              </li>
            </ul>
          </div>
        )}

        {isLoading && (
          <div className="ai-thinking" aria-busy="true" role="status">
            <span className="typing-dots">
              <i />
              <i />
              <i />
            </span>
            Reading the chat and the knowledge base…
            <div className="skeleton" style={{ height: 14, width: '90%' }} />
            <div className="skeleton" style={{ height: 14, width: '70%' }} />
            <div className="skeleton" style={{ height: 14, width: '82%' }} />
          </div>
        )}
        {error && <InlineError message={error} />}

        {result?.kind === 'suggestion' && (
          <div className="ai-card">
            <div className="section-title" style={{ margin: 0 }}>
              Suggested reply
            </div>
            <p className="text">
              <TypedText text={result.suggested_reply} />
            </p>
            <div className="ai-meta">
              <span className="chip">tone: {result.tone}</span>
              {result.sources.map((s) => (
                <span className="chip" key={s} title="Knowledge-base document used (RAG)">
                  source: {s}
                </span>
              ))}
              {!result.sources.length && <span className="chip">no sources</span>}
            </div>
            <button className="btn btn-sm" onClick={() => dispatch(chatActions.setDraft(result.suggested_reply))}>
              <Icon name="check" size={16} />
              Use as draft
            </button>
          </div>
        )}

        {result?.kind === 'summary' && (
          <div className="ai-card">
            <div className="section-title" style={{ margin: 0 }}>
              Summary
            </div>
            <p className="text">
              <TypedText text={result.summary} />
            </p>
            {!!result.topics.length && (
              <div className="ai-meta">
                {result.topics.map((t) => (
                  <span className="chip" key={t}>
                    {t}
                  </span>
                ))}
              </div>
            )}
            {!!result.action_items.length && (
              <ul className="todo">
                {result.action_items.map((a) => (
                  <li key={`${a.owner}-${a.task}`}>
                    <span className="chip">{a.owner}</span>
                    {a.task}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {!result && !isLoading && !error && activeRoomId && (
          <EmptyState icon="sparkles" title="Nothing generated yet" hint="Results appear here along with the pipeline steps behind them." />
        )}

        {result && (
          <section>
            <div className="section-title">How it was made</div>
            <TraceList trace={result.trace} />
          </section>
        )}
      </div>
    </aside>
  );
};
