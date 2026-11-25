import { useAppDispatch, useAppSelector } from '../../app-store';
import { openRoomThunk } from '../../app-store/chat';
import { USER_ROLE } from '../../enumerations';
import { Avatar, EmptyState } from '../../shared-components';
import { timeAgo } from '../../utils';

export const RoomList = () => {
  const dispatch = useAppDispatch();
  const { rooms, activeRoomId, unreadByRoom } = useAppSelector((s) => s.chat);
  const me = useAppSelector((s) => s.login.user);
  const role = me?.role;
  // Most recent activity first, like every messenger.
  const sorted = [...rooms].sort((a, b) => (b.lastMessage?.createdAt ?? '').localeCompare(a.lastMessage?.createdAt ?? ''));

  return (
    <section>
      <div className="section-title">
        Conversations<span>{rooms.length || ''}</span>
      </div>
      {!rooms.length && (
        <EmptyState
          icon="chat"
          title="No conversations yet"
          hint={
            role === USER_ROLE.STUDENT
              ? 'Match with a mentor above to start your first chat.'
              : 'Students find you through AI matching and start the chat. It will appear here instantly.'
          }
        >
          {role === USER_ROLE.MENTOR && (
            <ol className="dev-steps">
              <li>Open a private/incognito window</li>
              <li>Log in as a student (use the demo chips)</li>
              <li>Browse, then "Start chat" with this mentor</li>
            </ol>
          )}
        </EmptyState>
      )}
      {sorted.map((r, i) => {
        const unread = unreadByRoom[r.id] ?? 0;
        const last = r.lastMessage;
        const preview = !last
          ? 'No messages yet'
          : `${last.senderId === me?.id ? 'You: ' : ''}${last.kind === 'meet' ? 'Google Meet link' : last.body}`;
        return (
          <button
            key={r.id}
            className="room"
            aria-current={r.id === activeRoomId}
            style={{ '--i': i }}
            onClick={() => void dispatch(openRoomThunk(r.id))}
          >
            <Avatar name={r.otherName} tone={role === USER_ROLE.STUDENT ? 'accent' : 'neutral'} size={42} online={r.otherOnline} />
            <span className="who">
              <b>{r.otherName}</b>
              <small className={unread ? 'unread-text' : ''}>{preview}</small>
            </span>
            <span className="room-meta">
              {last && <time className="room-time">{timeAgo(last.createdAt)}</time>}
              {unread > 0 && (
                <span className="badge" aria-label={`${unread} unread`}>
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </section>
  );
};
