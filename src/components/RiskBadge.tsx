import type { RiskLevel } from '../types/index.ts';

interface RiskBadgeProps {
  level: RiskLevel;
  size?: 'small' | 'large';
}

export const RiskBadge = ({ level, size = 'large' }: RiskBadgeProps) => {
  const colors = {
    low: 'bg-green-500 text-white',
    medium: 'bg-yellow-500 text-white',
    high: 'bg-red-500 text-white',
  };

  const sizeClasses = {
    small: 'px-3 py-1 text-sm',
    large: 'px-6 py-3 text-xl',
  };

  return (
    <div
      className={`inline-block rounded-lg font-bold uppercase ${colors[level]} ${sizeClasses[size]}`}
    >
      {level}
    </div>
  );
};
