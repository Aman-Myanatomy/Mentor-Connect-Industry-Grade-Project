import { useAppDispatch, useAppSelector } from '../app-store';
import { logoutThunk } from '../app-store/login';
import { SOCKET_STATUS } from '../enumerations';
import { Avatar } from './avatar';
import { Icon } from './icon';
import { ThemeToggle } from './theme-toggle';

export const AppHeader = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.login.user);
  const mockMode = useAppSelector((s) => s.aiAssistant.mockMode);
  const socketStatus = useAppSelector((s) => s.chat.socketStatus);
  return (
    <header className="app-header">
      <div className="brand">
        <span className="brand-mark">
          <Icon name="chat" size={16} />
        </span>
        MentorConnect
      </div>
      <div className="header-right">
        {user && (
          <>
            {mockMode && (
              <span className="pill pill-warn" title="No GEMINI_API_KEY set: AI answers are simulated">
                Mock AI
              </span>
            )}
            <span className={`live live-${socketStatus}`} title={`Realtime: ${socketStatus}`}>
              <i />
              {socketStatus === SOCKET_STATUS.CONNECTED ? 'Live' : 'Offline'}
            </span>
            <span className="user-chip">
              <Avatar name={user.name} size={28} />
              <span className="user-meta">
                <b>{user.name}</b>
                <small>{user.role}</small>
              </span>
              <span className={`pill role-${user.role}`}>{user.role === 'mentor' ? 'Mentor' : 'Student'}</span>
            </span>
          </>
        )}
        {/* Always visible (also on the login page): Light / Dark, remembered in localStorage. */}
        <ThemeToggle />
        {user && (
          <button className="btn btn-ghost btn-icon" onClick={() => dispatch(logoutThunk())} aria-label="Log out">
            <Icon name="logout" />
          </button>
        )}
      </div>
    </header>
  );
};
