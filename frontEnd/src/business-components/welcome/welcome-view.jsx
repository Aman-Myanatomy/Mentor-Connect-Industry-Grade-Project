import { useAppDispatch, useAppSelector } from '../../app-store';
import { openRoomThunk } from '../../app-store/chat';
import { USER_ROLE } from '../../enumerations';
import { Avatar, Icon } from '../../shared-components';
import { timeAgo } from '../../utils';

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
};

// Shown in the middle when no conversation is open: a friendly start page instead of an empty box.
export const WelcomeView = ({ onOpenFinder }) => {
  const dispatch = useAppDispatch();
  const me = useAppSelector((s) => s.login.user);
  const rooms = useAppSelector((s) => s.chat.rooms);
  const isStudent = me?.role === USER_ROLE.STUDENT;
  const recent = [...rooms].sort((a, b) => (b.lastMessage?.createdAt ?? '').localeCompare(a.lastMessage?.createdAt ?? '')).slice(0, 3);

  const actions = isStudent
    ? [
        {
          icon: 'sparkles',
          title: 'Match me with a mentor',
          text: 'Describe your goal and the AI finds the best fit, and shows how it decided.',
          onClick: () => onOpenFinder('match')
        },
        {
          icon: 'users',
          title: 'Browse all mentors',
          text: 'Search by name or skill and start a conversation directly.',
          onClick: () => onOpenFinder('browse')
        }
      ]
    : [
        {
          icon: 'chat',
          title: 'Students reach you here',
          text: 'When a student starts a chat it appears in your conversation list instantly.'
        },
        {
          icon: 'wand',
          title: 'Let the copilot draft replies',
          text: 'Open a chat and press "Suggest a reply". It uses the platform knowledge base and cites its sources.'
        }
      ];

  return (
    <section className="chat">
      <div className="welcome">
        <div className="welcome-inner">
          <p className="eyebrow">{greeting()}</p>
          <h1>
            {me?.name.split(' ')[0]}, {isStudent ? 'who do you want to learn from?' : 'ready to help someone today?'}
          </h1>
          <div className="action-grid">
            {actions.map((a, i) => (
              <button key={a.title} className="action-card" style={{ '--i': i }} onClick={a.onClick} disabled={!a.onClick}>
                <span className="action-icon">
                  <Icon name={a.icon} size={20} />
                </span>
                <b>{a.title}</b>
                <span>{a.text}</span>
                {a.onClick && <Icon name="arrow" size={16} />}
              </button>
            ))}
          </div>

          {!!recent.length && (
            <div className="recent">
              <div className="section-title">Pick up where you left off</div>
              {recent.map((r, i) => (
                <button key={r.id} className="room" style={{ '--i': i + 2 }} onClick={() => void dispatch(openRoomThunk(r.id))}>
                  <Avatar name={r.otherName} tone="accent" size={40} online={r.otherOnline} />
                  <span className="who">
                    <b>{r.otherName}</b>
                    <small>
                      {r.lastMessage ? (r.lastMessage.kind === 'meet' ? 'Google Meet link' : r.lastMessage.body) : 'No messages yet'}
                    </small>
                  </span>
                  {r.lastMessage && <time className="room-time">{timeAgo(r.lastMessage.createdAt)}</time>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
