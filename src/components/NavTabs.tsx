import React from 'react';

export type ViewId = 'briefing' | 'charleston' | 'national' | 'forces';

interface NavTab {
  id: ViewId;
  label: string;
}

const TABS: NavTab[] = [
  { id: 'briefing', label: 'Briefing' },
  { id: 'charleston', label: 'Charleston' },
  { id: 'national', label: 'National' },
  { id: 'forces', label: 'Forces' },
];

interface NavTabsProps {
  selectedView: ViewId;
  onSelectView: (view: ViewId) => void;
}

const NavTabs: React.FC<NavTabsProps> = ({ selectedView, onSelectView }) => {
  return (
    <nav className="flex space-x-4">
      {TABS.map(tab => (
        <button
          key={tab.id}
          onClick={() => onSelectView(tab.id)}
          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            selectedView === tab.id
              ? 'bg-forest-600 text-forest-50'
              : 'text-forest-200 hover:bg-forest-700 hover:text-forest-100'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
};

export default NavTabs;
