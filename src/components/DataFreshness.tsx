import React from 'react';

interface DataFreshnessProps {
  date: string | null;
  label?: string;
}

const DataFreshness: React.FC<DataFreshnessProps> = ({ date, label = 'Last updated' }) => {
  if (!date) return null;

  const d = new Date(date + 'T00:00:00');
  const formatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <span className="text-xs text-forest-400">
      {label}: {formatted}
    </span>
  );
};

export default DataFreshness;
