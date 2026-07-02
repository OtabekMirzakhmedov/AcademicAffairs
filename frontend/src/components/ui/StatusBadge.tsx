import './StatusBadge.scss';

export type StatusTone =
  | 'draft'
  | 'submitted'
  | 'validated'
  | 'rejected'
  | 'active'
  | 'inactive'
  | 'neutral';

interface StatusBadgeProps {
  status: StatusTone;
  label?: React.ReactNode;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
  return (
    <span className={`status-badge status-badge--${status}`}>
      <span className="status-badge__dot" />
      <span className="status-badge__label">{label ?? status}</span>
    </span>
  );
};

export default StatusBadge;
