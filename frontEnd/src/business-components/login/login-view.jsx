import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app-store';
import { loginActions, loginThunk, registerThunk } from '../../app-store/login';
import { USER_ROLE } from '../../enumerations';
import { Icon, InlineError } from '../../shared-components';

const DEMO_MENTORS = [
  { name: 'Priya', email: 'priya@mentors.dev' },
  { name: 'Marcus', email: 'marcus@mentors.dev' },
  { name: 'Aisha', email: 'aisha@mentors.dev' },
  { name: 'Diego', email: 'diego@mentors.dev' },
  { name: 'Sara', email: 'sara@mentors.dev' },
  { name: 'Kofi', email: 'kofi@mentors.dev' }
];
const DEMO_MENTOR_PASSWORD = 'Mentor-2026-demo';
const DEMO_STUDENTS = [
  { name: 'Riya', email: 'riya@students.dev' },
  { name: 'Arjun', email: 'arjun@students.dev' },
  { name: 'Neha', email: 'neha@students.dev' }
];
const DEMO_STUDENT_PASSWORD = 'Student-2026-demo';

const FEATURES = [
  { icon: 'sparkles', title: 'AI mentor matching', text: 'Describe your goal; we find the mentors whose experience fits it.' },
  { icon: 'chat', title: 'Real-time conversations', text: 'Talk to senior engineers instantly, no email ping-pong.' },
  { icon: 'shield', title: 'Built with security in mind', text: 'Validated input, role-based access and guarded AI prompts.' }
];

// Decorative looping demo of the product (pure CSS, no state): question -> typing -> answer with sources.
const HeroPreview = () => (
  <div className="preview" aria-hidden="true">
    <div className="preview-bar">
      <span className="live live-connected">
        <i />
        Live
      </span>
      <span>Priya Nair · AppSec mentor</span>
    </div>
    <div className="preview-body">
      <div className="pv pv-1">How do I start with web security?</div>
      <div className="pv pv-typing">
        <span className="typing-dots">
          <i />
          <i />
          <i />
        </span>
      </div>
      <div className="pv pv-2">
        Start with the OWASP Top 10, then build a login and attack it yourself.
        <span className="ai-tag">
          <Icon name="sparkles" size={12} />
          AI copilot · source: web-security-roadmap
        </span>
      </div>
    </div>
  </div>
);

export const LoginView = () => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((s) => s.login);
  const [role, setRole] = useState(USER_ROLE.STUDENT);
  const [isRegister, setIsRegister] = useState(false);
  const isMentor = role === USER_ROLE.MENTOR;
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    void dispatch(
      isRegister && !isMentor ? registerThunk(form.name, form.email, form.password) : loginThunk(form.email, form.password, role)
    );
  };
  const switchRole = (r) => {
    setRole(r);
    setIsRegister(false);
    dispatch(loginActions.setError(null));
  };

  return (
    <section className="auth">
      <div className="auth-hero">
        <span className="orb orb-a" aria-hidden="true" />
        <span className="orb orb-b" aria-hidden="true" />
        <h1>Learn faster from people who have done it.</h1>
        <p>MentorConnect pairs students with senior mentors and keeps the conversation moving, with an AI copilot in the loop.</p>
        <HeroPreview />
        <ul className="feature-list">
          {FEATURES.map((f) => (
            <li key={f.title}>
              <span className="feature-icon">
                <Icon name={f.icon} />
              </span>
              <div>
                <b>{f.title}</b>
                <span>{f.text}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="auth-panel">
        <form className="auth-form" onSubmit={submit}>
          <div className="segmented" role="tablist" aria-label="Log in as" data-active={role}>
            <span className="segmented-thumb" aria-hidden="true" />
            <button type="button" role="tab" aria-selected={!isMentor} onClick={() => switchRole(USER_ROLE.STUDENT)}>
              <Icon name="chat" size={15} />
              Student
            </button>
            <button type="button" role="tab" aria-selected={isMentor} onClick={() => switchRole(USER_ROLE.MENTOR)}>
              <Icon name="users" size={15} />
              Mentor
            </button>
          </div>
          <div>
            <h2>{isMentor ? 'Mentor sign in' : isRegister ? 'Create your student account' : 'Student sign in'}</h2>
            <p className="sub">
              {isMentor
                ? 'Mentor accounts are created by the MentorConnect team. Log in to answer students.'
                : isRegister
                  ? 'It takes less than a minute.'
                  : 'Log in to find mentors and continue your chats.'}
            </p>
          </div>
          {isRegister && !isMentor && (
            <div className="field">
              <label htmlFor="name">Full name</label>
              <input
                id="name"
                className="input"
                value={form.name}
                onChange={set('name')}
                autoComplete="name"
                required
                minLength={2}
                maxLength={60}
              />
            </div>
          )}
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" className="input" value={form.email} onChange={set('email')} autoComplete="email" required />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="input"
              value={form.password}
              onChange={set('password')}
              autoComplete={isRegister && !isMentor ? 'new-password' : 'current-password'}
              required
              minLength={isRegister && !isMentor ? 10 : 1}
              placeholder={isRegister && !isMentor ? 'At least 10 characters' : ''}
            />
          </div>
          {error && <InlineError message={error} />}
          <button className="btn btn-block" disabled={isLoading}>
            {isLoading && <span className="spinner" />}
            {isLoading ? 'Please wait' : isRegister && !isMentor ? 'Create account' : isMentor ? 'Log in as mentor' : 'Log in'}
          </button>
          {!isRegister && (
            <div className="demo-box">
              <span>Workshop demo: pick {isMentor ? 'a mentor' : 'a student'} to fill the form</span>
              <div className="chips">
                {(isMentor ? DEMO_MENTORS : DEMO_STUDENTS).map((m) => (
                  <button
                    key={m.email}
                    type="button"
                    className="chip chip-btn"
                    onClick={() => setForm({ ...form, email: m.email, password: isMentor ? DEMO_MENTOR_PASSWORD : DEMO_STUDENT_PASSWORD })}
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          {!isMentor && (
            <p className="auth-switch">
              {isRegister ? 'Already have an account? ' : 'New student? '}
              <button type="button" onClick={() => setIsRegister(!isRegister)}>
                {isRegister ? 'Log in' : 'Create an account'}
              </button>
            </p>
          )}
        </form>
      </div>
    </section>
  );
};
