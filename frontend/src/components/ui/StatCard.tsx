import type { LucideIcon } from 'lucide-react';
import './StatCard.scss';

type Tone = 'primary' | 'success' | 'warning' | 'error' | 'neutral';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  tone?: Tone;
  hint?: React.ReactNode;
  footer?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon: Icon,
  tone = 'primary',
  hint,
  footer,
}) => {
  return (
    <div className={`stat-card stat-card--${tone}`}>
      <div className="stat-card__header">
        <span className="stat-card__label">{label}</span>
        <span className="stat-card__icon">
          <Icon size={18} strokeWidth={2} />
        </span>
      </div>
      <div className="stat-card__value">{value}</div>
      {hint && <div className="stat-card__hint">{hint}</div>}
      {footer && <div className="stat-card__footer">{footer}</div>}
    </div>
  );
};

export default StatCard;
