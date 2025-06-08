import { useState } from 'react';
import Overview from './components/Overview';
import { CensusProvider } from './contexts/CensusContext';

function App() {

  const [selectedView, setSelectedView] = useState<string>('overview');

  return (
    <div className="min-h-screen bg-forest-900 text-forest-50">
      <header className="bg-forest-800 shadow-lg border-b border-forest-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-forest-100">
              Economic Dashboard
            </h1>
            <nav className="flex space-x-4">
              <button
                onClick={() => setSelectedView('overview')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${selectedView === 'overview'
                  ? 'bg-forest-600 text-forest-50'
                  : 'text-forest-200 hover:bg-forest-700 hover:text-forest-100'
                  }`}
              >
                Overview
              </button>
            </nav>
          </div>
        </div>
      </header>
      <CensusProvider>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {selectedView === 'overview' && <Overview />}
        </main>
      </CensusProvider>

      <footer className="bg-forest-950 mt-12 border-t border-forest-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-forest-300 text-sm">
            Data source: U.S. Census Bureau
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;