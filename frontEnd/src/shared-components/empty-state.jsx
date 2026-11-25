import { Icon } from './icon';

export const EmptyState = ({ icon, title, hint, children }) => (
  <div className="empty">
    <span className="empty-icon">
      <Icon name={icon} size={22} />
    </span>
    <p className="empty-title">{title}</p>
    {hint && <p className="empty-hint">{hint}</p>}
    {children}
  </div>
);

export const InlineError = ({ message }) => (
  <p className="inline-error" role="alert">
    <Icon name="alert" size={16} />
    {message}
  </p>
);
