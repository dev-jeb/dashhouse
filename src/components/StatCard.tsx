import React from 'react';

interface StatCardProps {
  label: string;
  value: number | null;
  unit?: string;
  className?: string;
  hoverDescription?: string;
  timePeriod?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  unit = '%',
  className = '',
  hoverDescription = '',
  timePeriod = ''
}) => {
  const displayValue = value !== null ? `${value}${unit}` : 'No data';

  return (
    <div className={`bg-forest-800 p-6 rounded-lg border border-forest-600 shadow-lg relative group hover:bg-forest-700 transition-colors duration-200 ${className}`}>
      <div className="h-12 flex items-center">
        <div className="group-hover:hidden">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-forest-400">{label}</h3>
            {timePeriod && (
              <span className="text-sm text-forest-300">({timePeriod})</span>
            )}
          </div>
          <span className="text-3xl font-bold text-forest-100">
            {displayValue}
          </span>
        </div>
        {hoverDescription && (
          <div className="hidden group-hover:flex w-full h-full items-center text-sm text-forest-200 pr-1 leading-relaxed">
            {hoverDescription}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;