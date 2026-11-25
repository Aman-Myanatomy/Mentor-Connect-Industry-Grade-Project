export const TypingIndicator = ({ name }) => (
  <div className="typing" role="status" aria-label={`${name} is typing`}>
    <span className="typing-dots">
      <i />
      <i />
      <i />
    </span>
    <small>{name.split(' ')[0]} is typing</small>
  </div>
);
