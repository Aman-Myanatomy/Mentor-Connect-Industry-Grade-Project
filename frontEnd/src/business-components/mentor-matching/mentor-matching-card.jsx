import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app-store';
import { startChatWithMentorThunk } from '../../app-store/chat';
import { matchMentorsThunk } from '../../app-store/mentor-matching';
import { GOAL_MAX_LENGTH, GOAL_MIN_LENGTH } from '../../constants';
import { Avatar, EmptyState, Icon, InlineError, PipelineProgress, ScoreMeter, TraceList } from '../../shared-components';

const EXAMPLES = [
  { label: 'Web security', text: 'I am a beginner and want to learn web security with Node and JWT' },
  { label: 'LLM apps', text: 'I want to build RAG and LLM apps with Python' },
  { label: 'Interviews', text: 'Help me prepare for software engineering interviews' },
  { label: 'Deploy', text: 'I want to ship my first project with Docker and AWS' }
];

export const MentorMatchingCard = () => {
  const dispatch = useAppDispatch();
  const { isMatching, response, error } = useAppSelector((s) => s.mentorMatching);
  const [goal, setGoal] = useState('');
  const ready = goal.trim().length >= GOAL_MIN_LENGTH;

  return (
    <div className="finder-wrap">
      <div className="finder">
        <div className="finder-title">
          <Icon name="sparkles" />
          Find your mentor
        </div>
        <div className="field">
          <label htmlFor="goal" className="sr-only">
            Your learning goal
          </label>
          <textarea
            id="goal"
            className="textarea"
            rows={3}
            maxLength={GOAL_MAX_LENGTH}
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="What do you want to learn or build?"
          />
        </div>
        <div className="chips">
          {EXAMPLES.map((x) => (
            <button key={x.label} type="button" className="chip chip-btn" onClick={() => setGoal(x.text)}>
              {x.label}
            </button>
          ))}
        </div>
        <button className="btn" disabled={isMatching || !ready} onClick={() => void dispatch(matchMentorsThunk(goal))}>
          {isMatching ? (
            <>
              <span className="spinner" />
              Matching
            </>
          ) : (
            'Match me'
          )}
        </button>
        {!ready && goal.length > 0 && <small>Tell us a little more (at least {GOAL_MIN_LENGTH} characters).</small>}
      </div>

      {error && (
        <div className="error-retry">
          <InlineError message={error} />
          <button
            className="btn btn-secondary btn-sm"
            disabled={isMatching || !ready}
            onClick={() => void dispatch(matchMentorsThunk(goal))}
          >
            Try again
          </button>
        </div>
      )}

      {isMatching && <PipelineProgress />}

      {!isMatching && response && (
        <>
          <div className="section-title">Suggested mentors</div>
          {!response.matches.length && (
            <EmptyState icon="users" title="No strong match yet" hint="Try naming specific skills, like React, security or interviews." />
          )}
          <div className="match-list">
            {response.matches.map((m, i) => (
              <article className="match" key={m.mentorId} style={{ '--i': i }}>
                <div className="match-top">
                  <Avatar name={m.mentor.name} tone="accent" size={40} />
                  <div className="who">
                    <b>{m.mentor.name}</b>
                    <small>{m.mentor.headline}</small>
                  </div>
                </div>
                <ScoreMeter score={m.score} />
                <p className="match-reason">{m.reason}</p>
                <div className="chips">
                  {m.mentor.skills.slice(0, 4).map((s) => (
                    <span className="chip" key={s}>
                      {s}
                    </span>
                  ))}
                </div>
                <button className="btn btn-sm" onClick={() => void dispatch(startChatWithMentorThunk(m.mentorId))}>
                  Start chat
                  <Icon name="arrow" size={16} />
                </button>
              </article>
            ))}
          </div>
          <details>
            <summary>How the AI decided</summary>
            <div style={{ marginTop: 12 }}>
              <TraceList trace={response.trace} />
            </div>
          </details>
        </>
      )}
    </div>
  );
};
