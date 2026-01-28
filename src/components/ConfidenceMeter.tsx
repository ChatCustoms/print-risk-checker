import { ConfidenceLevel } from '../types/index.ts';

interface ConfidenceMeterProps {
  level: ConfidenceLevel;
  unknownCount: number;
}

export const ConfidenceMeter = ({ level, unknownCount }: ConfidenceMeterProps) => {
  const colors = {
    low: 'text-red-600 bg-red-50',
    medium: 'text-yellow-600 bg-yellow-50',
    high: 'text-green-600 bg-green-50',
  };

  const widths = {
    low: 'w-1/3',
    medium: 'w-2/3',
    high: 'w-full',
  };

  const explanations = {
    low: `Based on ${unknownCount} unknown fields. Assessment may be less accurate.`,
    medium: `Based on ${unknownCount} unknown fields. Assessment is reasonably accurate.`,
    high: 'Based on complete information. High confidence in assessment.',
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Confidence Level:</span>
        <span className={`text-sm font-bold uppercase ${colors[level].split(' ')[0]}`}>
          {level}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${
            level === 'low' ? 'bg-red-500' : level === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
          } ${widths[level]}`}
        />
      </div>

      <p className="text-xs text-gray-600">{explanations[level]}</p>
    </div>
  );
};
