import { initials } from '../utils';

// `online` omitted => plain avatar. true/false => a presence dot (green = connected right now).
export const Avatar = ({ name, tone = 'neutral', size = 36, online }) => (
  <span className="avatar-wrap">
    <span className={`avatar avatar-${tone}`} style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }} aria-hidden="true">
      {initials(name)}
    </span>
    {online !== undefined && <i className={`presence-dot${online ? ' on' : ''}`} title={online ? 'Online' : 'Offline'} />}
  </span>
);
