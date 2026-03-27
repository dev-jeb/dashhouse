import { useState } from 'react';
import NavTabs, { ViewId } from './components/NavTabs';
import Briefing from './pages/Briefing';
import CharlestonLocal from './pages/CharlestonLocal';
import Overview from './pages/Overview';
import Forces from './pages/Forces';
import { CensusProvider } from './contexts/CensusContext';
import { FredProvider } from './contexts/FredContext';

function App() {
  const [selectedView, setSelectedView] = useState<ViewId>('briefing');

  return (
    <div className="min-h-screen bg-forest-900 text-forest-50">
      <header className="bg-forest-800 shadow-lg border-b border-forest-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-forest-100">
              Dashhouse
            </h1>
            <NavTabs selectedView={selectedView} onSelectView={setSelectedView} />
          </div>
        </div>
      </header>

      <FredProvider>
        <CensusProvider>
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {selectedView === 'briefing' && <Briefing />}
            {selectedView === 'charleston' && <CharlestonLocal />}
            {selectedView === 'national' && <Overview />}
            {selectedView === 'forces' && <Forces />}
          </main>
        </CensusProvider>
      </FredProvider>

      <footer className="bg-forest-950 mt-12 border-t border-forest-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-forest-300 text-sm">
            Data sources: U.S. Census Bureau, Federal Reserve (FRED), Redfin
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
