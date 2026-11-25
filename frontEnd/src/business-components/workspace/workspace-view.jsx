import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app-store';
import { fetchAiStatusThunk } from '../../app-store/ai-assistant';
import { connectChatSocketThunk, disconnectChatSocketThunk, fetchRoomsThunk } from '../../app-store/chat';
import { USER_ROLE } from '../../enumerations';
import { Icon } from '../../shared-components';
import { AiAssistantPanel } from '../ai-assistant/ai-assistant-panel';
import { ChatView } from '../chat/chat-view';
import { RoomList } from '../chat/room-list';
import { MentorDirectory } from '../mentor-directory/mentor-directory';
import { MentorMatchingCard } from '../mentor-matching/mentor-matching-card';

const TABS = [
  { id: 'people', label: 'People', icon: 'users' },
  { id: 'chat', label: 'Chat', icon: 'chat' },
  { id: 'ai', label: 'Copilot', icon: 'sparkles' }
];

export const WorkspaceView = () => {
  const dispatch = useAppDispatch();
  const { user, accessToken } = useAppSelector((s) => s.login);
  const activeRoomId = useAppSelector((s) => s.chat.activeRoomId);
  const [pane, setPane] = useState('people'); // only used on small screens
  const [finder, setFinder] = useState('match');

  useEffect(() => {
    if (!accessToken) return;
    void dispatch(fetchAiStatusThunk());
    void dispatch(fetchRoomsThunk());
    dispatch(connectChatSocketThunk(accessToken));
    return () => {
      dispatch(disconnectChatSocketThunk());
    };
  }, [dispatch, accessToken]);

  useEffect(() => {
    if (activeRoomId) setPane('chat');
  }, [activeRoomId]);

  return (
    <>
      <main className="workspace" data-pane={pane}>
        <aside className="pane pane-left" aria-label="Mentors and conversations">
          {/* Pinned above the scrolling list: the switch is always reachable, however long the list is. */}
          {user?.role === USER_ROLE.STUDENT && (
            <div className="pane-top">
              <div className="segmented" role="tablist" aria-label="Find a mentor" data-active={finder}>
                <span className="segmented-thumb" aria-hidden="true" />
                <button role="tab" aria-selected={finder === 'match'} onClick={() => setFinder('match')}>
                  <Icon name="sparkles" size={15} />
                  AI match
                </button>
                <button role="tab" aria-selected={finder === 'browse'} onClick={() => setFinder('browse')}>
                  <Icon name="users" size={15} />
                  Browse
                </button>
              </div>
            </div>
          )}
          <div className="pane-scroll">
            {user?.role === USER_ROLE.STUDENT && (finder === 'match' ? <MentorMatchingCard /> : <MentorDirectory />)}
            <RoomList />
          </div>
        </aside>
        <ChatView
          onOpenFinder={(f) => {
            setFinder(f);
            setPane('people');
          }}
        />
        <AiAssistantPanel />
      </main>
      <nav className="tabbar" role="tablist" aria-label="Sections" data-active={pane}>
        <span className="tabbar-thumb" aria-hidden="true" />
        {TABS.map((t) => (
          <button key={t.id} role="tab" aria-selected={pane === t.id} onClick={() => setPane(t.id)}>
            <Icon name={t.icon} size={20} />
            {t.label}
          </button>
        ))}
      </nav>
    </>
  );
};
