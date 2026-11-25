import { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app-store';
import { chatActions, emitTypingThunk, sendMessageThunk } from '../../app-store/chat';
import { MEET_NEW_URL, MEET_URL_REGEX, MESSAGE_MAX_LENGTH } from '../../constants';
import { MESSAGE_KIND, SOCKET_STATUS, USER_ROLE } from '../../enumerations';
import { Avatar, EmptyState, Icon, InlineError, TypingIndicator } from '../../shared-components';
import { formatDay, formatTime } from '../../utils';
import { WelcomeView } from '../welcome/welcome-view';

const GROUP_GAP_MS = 5 * 60_000;

export const ChatView = ({ onOpenFinder }) => {
  const dispatch = useAppDispatch();
  const me = useAppSelector((s) => s.login.user);
  const { rooms, activeRoomId, messagesByRoom, socketStatus, isLoadingMessages, error, draft, typingByRoom } = useAppSelector(
    (s) => s.chat
  );
  const demoAutoReply = useAppSelector((s) => s.aiAssistant.demoAutoReply);
  const typingName = activeRoomId ? typingByRoom[activeRoomId] : null;
  const [meetOpen, setMeetOpen] = useState(false); // UI-only state: is the "share a Meet link" panel open
  const [meetLink, setMeetLink] = useState('');
  const [meetError, setMeetError] = useState(null);
  const typingSent = useRef(false);
  const idleTimer = useRef(0);
  const bottom = useRef(null);
  const input = useRef(null);
  const room = rooms.find((r) => r.id === activeRoomId);
  const messages = activeRoomId ? (messagesByRoom[activeRoomId] ?? []) : [];
  const connected = socketStatus === SOCKET_STATUS.CONNECTED;

  // Opening a chat jumps straight to the latest message; only NEW messages scroll smoothly.
  const lastRoom = useRef(null);
  useEffect(() => {
    const instant = lastRoom.current !== activeRoomId || isLoadingMessages;
    bottom.current?.scrollIntoView({ block: 'end', behavior: instant ? 'auto' : 'smooth' });
    if (instant) void document.fonts?.ready.then(() => bottom.current?.scrollIntoView({ block: 'end', behavior: 'auto' })); // web font changes text height
    if (!isLoadingMessages) lastRoom.current = activeRoomId;
  }, [messages.length, activeRoomId, isLoadingMessages, typingName]);
  useEffect(() => {
    // auto-grow textarea (also when the AI inserts a draft)
    const el = input.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [draft, activeRoomId]);

  const send = (e) => {
    e?.preventDefault();
    if (draft.trim() && connected) {
      void dispatch(sendMessageThunk(draft.trim()));
      window.clearTimeout(idleTimer.current);
      if (typingSent.current) {
        typingSent.current = false;
        dispatch(emitTypingThunk(false));
      }
    }
  };
  // Typing indicator for the other person: "started" once, "stopped" after 1.8s of silence.
  const onType = (value) => {
    dispatch(chatActions.setDraft(value));
    if (!value.trim()) return;
    if (!typingSent.current) {
      typingSent.current = true;
      dispatch(emitTypingThunk(true));
    }
    window.clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => {
      typingSent.current = false;
      dispatch(emitTypingThunk(false));
    }, 1800);
  };
  const shareMeet = (e) => {
    e.preventDefault();
    const link = meetLink.trim();
    if (!MEET_URL_REGEX.test(link)) {
      setMeetError('Paste a Google Meet link like https://meet.google.com/abc-defg-hij');
      return;
    }
    void dispatch(sendMessageThunk(link, MESSAGE_KIND.MEET));
    setMeetLink('');
    setMeetError(null);
    setMeetOpen(false);
  };
  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send();
    }
  };

  if (!room) return <WelcomeView onOpenFinder={onOpenFinder} />;

  return (
    <section className="chat">
      <div className="chat-head">
        <Avatar name={room.otherName} tone="accent" size={40} online={room.otherOnline} />
        <div className="who">
          <b>{room.otherName}</b>
          <small>
            {room.otherHeadline || 'Student'} ·{' '}
            <span className={`presence-text${room.otherOnline ? ' on' : ''}`}>{room.otherOnline ? 'Online' : 'Offline'}</span>
            {!room.otherOnline && demoAutoReply && me?.role === USER_ROLE.STUDENT && ' · AI persona replies (demo)'}
          </small>
        </div>
        <button
          className={`btn btn-secondary btn-sm meet-btn${meetOpen ? ' on' : ''}`}
          onClick={() => setMeetOpen((o) => !o)}
          aria-expanded={meetOpen}
          aria-controls="meet-panel"
        >
          <Icon name="video" size={16} />
          Google Meet
        </button>
      </div>
      {meetOpen && (
        <form id="meet-panel" className="meet-panel" onSubmit={shareMeet}>
          <div className="meet-panel-head">
            <b>Start a video call with {room.otherName.split(' ')[0]}</b>
            <button type="button" className="btn btn-ghost btn-icon btn-sm" aria-label="Close" onClick={() => setMeetOpen(false)}>
              <Icon name="close" size={16} />
            </button>
          </div>
          <ol className="meet-steps">
            <li>
              <a className="btn btn-secondary btn-sm" href={MEET_NEW_URL} target="_blank" rel="noopener noreferrer">
                <Icon name="video" size={16} />
                Open Google Meet
              </a>
              <small>Opens a new meeting in another tab. Copy its link.</small>
            </li>
            <li>
              <div className="meet-input">
                <label htmlFor="meet-link" className="sr-only">
                  Google Meet link
                </label>
                <input
                  id="meet-link"
                  className="input"
                  value={meetLink}
                  onChange={(e) => {
                    setMeetLink(e.target.value);
                    setMeetError(null);
                  }}
                  placeholder="https://meet.google.com/abc-defg-hij"
                  autoComplete="off"
                  spellCheck={false}
                />
                <button className="btn btn-sm" disabled={!meetLink.trim() || !connected}>
                  <Icon name="send" size={15} />
                  Share
                </button>
              </div>
              <small>Paste the link here to share it in the chat.</small>
            </li>
          </ol>
          {meetError && <InlineError message={meetError} />}
        </form>
      )}

      <div className="messages" role="log" aria-live="polite" aria-label="Messages">
        {isLoadingMessages && (
          <div className="msg-skeletons" aria-busy="true">
            <div className="skeleton" style={{ height: 44, width: '55%' }} />
            <div className="skeleton" style={{ height: 44, width: '40%', justifySelf: 'end' }} />
            <div className="skeleton" style={{ height: 44, width: '62%' }} />
          </div>
        )}
        {!isLoadingMessages && !messages.length && (
          <EmptyState
            icon="chat"
            title="No messages yet"
            hint={`Say hello to ${room.otherName.split(' ')[0]} and share what you want to achieve.`}
          />
        )}
        {messages.map((m, i) => {
          const prev = messages[i - 1];
          const mine = m.senderId === me?.id;
          const newDay = !prev || formatDay(prev.createdAt) !== formatDay(m.createdAt);
          const first =
            newDay || prev.senderId !== m.senderId || new Date(m.createdAt).getTime() - new Date(prev.createdAt).getTime() > GROUP_GAP_MS;
          return (
            <div key={m.id} style={{ display: 'contents' }}>
              {newDay && <div className="day">{formatDay(m.createdAt)}</div>}
              <div className={`msg${mine ? ' me' : ''}${first ? ' first' : ''}`}>
                {first && !mine && <span className="name">{m.senderName}</span>}
                {/* React escapes text, so <script> or <img onerror> typed by a user is shown as plain text (XSS-safe). */}
                {m.kind === MESSAGE_KIND.MEET && MEET_URL_REGEX.test(m.body) ? (
                  <div className="meet-card">
                    <span className="meet-card-icon">
                      <Icon name="video" size={20} />
                    </span>
                    <div className="meet-card-text">
                      <b>Google Meet</b>
                      <small>{m.body.replace('https://', '').replace(/\?.*$/, '')}</small>
                    </div>
                    {/* The link is re-validated before it becomes an href (defence in depth: never link arbitrary strings). */}
                    <a className="btn btn-sm" href={m.body} target="_blank" rel="noopener noreferrer">
                      Join
                    </a>
                  </div>
                ) : (
                  <div className="bubble">{m.body}</div>
                )}
                {m.isAutoReply && (
                  <span className="ai-tag" title="Written by the mentor's AI persona because they are offline (demo mode)">
                    <Icon name="sparkles" size={12} />
                    AI reply · demo
                  </span>
                )}
                {(i === messages.length - 1 || messages[i + 1]?.senderId !== m.senderId) && (
                  <time dateTime={m.createdAt}>{formatTime(m.createdAt)}</time>
                )}
              </div>
            </div>
          );
        })}
        {typingName && <TypingIndicator name={typingName} />}
        <div ref={bottom} className="scroll-anchor" />
      </div>

      {error && (
        <div style={{ padding: '0 20px 8px' }}>
          <InlineError message={error} />
        </div>
      )}
      <form className="composer" onSubmit={send}>
        <div className="composer-field">
          <label htmlFor="composer" className="sr-only">
            Message
          </label>
          <textarea
            id="composer"
            ref={input}
            className="textarea"
            rows={1}
            value={draft}
            maxLength={MESSAGE_MAX_LENGTH}
            onChange={(e) => onType(e.target.value)}
            onKeyDown={onKey}
            placeholder={connected ? 'Write a message…' : 'Reconnecting to chat…'}
            title="Enter to send, Shift+Enter for a new line"
          />
          {draft.length > MESSAGE_MAX_LENGTH * 0.8 && (
            <span className="count">
              {draft.length}/{MESSAGE_MAX_LENGTH}
            </span>
          )}
        </div>
        <button className="btn btn-icon" disabled={!connected || !draft.trim()} aria-label="Send message">
          <Icon name="send" />
        </button>
      </form>
    </section>
  );
};
