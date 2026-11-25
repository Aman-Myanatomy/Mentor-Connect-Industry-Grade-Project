import { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app-store';
import { startChatWithMentorThunk } from '../../app-store/chat';
import { fetchMentorsThunk } from '../../app-store/mentor-directory';
import { Avatar, EmptyState, Icon, InlineError } from '../../shared-components';

export const MentorDirectory = () => {
  const dispatch = useAppDispatch();
  const { mentors, isLoading, error } = useAppSelector((s) => s.mentorDirectory);
  const [query, setQuery] = useState('');
  const [skill, setSkill] = useState(null);

  useEffect(() => {
    if (!mentors.length) void dispatch(fetchMentorsThunk());
  }, [dispatch, mentors.length]);

  const topSkills = useMemo(() => {
    const count = new Map();
    mentors.forEach((m) => m.skills.forEach((s) => count.set(s, (count.get(s) ?? 0) + 1)));
    return [...count.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([s]) => s);
  }, [mentors]);

  const visible = mentors.filter((m) => {
    const hay = `${m.name} ${m.headline} ${m.bio} ${m.skills.join(' ')}`.toLowerCase();
    return (!query || hay.includes(query.toLowerCase())) && (!skill || m.skills.includes(skill));
  });

  return (
    <div className="finder-wrap">
      <div className="field">
        <label htmlFor="mentor-search" className="sr-only">
          Search mentors
        </label>
        <input
          id="mentor-search"
          className="input"
          type="search"
          placeholder="Search by name or skill"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      {!!topSkills.length && (
        <div className="chips">
          {topSkills.map((s) => (
            <button
              key={s}
              type="button"
              className={`chip chip-btn${skill === s ? ' chip-on' : ''}`}
              aria-pressed={skill === s}
              onClick={() => setSkill(skill === s ? null : s)}
            >
              {s}
            </button>
          ))}
        </div>
      )}
      {error && <InlineError message={error} />}
      {isLoading && (
        <div className="match-list" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton" style={{ height: 96 }} />
          ))}
        </div>
      )}
      {!isLoading && !error && !visible.length && (
        <EmptyState icon="users" title="No mentors found" hint="Try a different search or clear the skill filter." />
      )}
      <div className="match-list">
        {visible.map((m, i) => (
          <article className="match mentor-card" key={m.id} style={{ '--i': i }}>
            <div className="match-top">
              <Avatar name={m.name} tone="accent" size={40} />
              <div className="who">
                <b>{m.name}</b>
                <small>{m.headline}</small>
              </div>
            </div>
            <div className="chips">
              {m.skills.slice(0, 4).map((s) => (
                <span className="chip" key={s}>
                  {s}
                </span>
              ))}
            </div>
            <button className="btn btn-sm" onClick={() => void dispatch(startChatWithMentorThunk(m.id))}>
              Start chat
              <Icon name="arrow" size={16} />
            </button>
          </article>
        ))}
      </div>
    </div>
  );
};
