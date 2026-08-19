import { useState } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import Sidebar from './components/Sidebar';
import PredictViralityTab from './components/tabs/PredictViralityTab';
import DataInsightsTab from './components/tabs/DataInsightsTab';
import HistoryTab from './components/tabs/HistoryTab';
import ViralSongRecipeTab from './components/tabs/ViralSongRecipeTab';

function App() {
  const [activeTab, setActiveTab] = useState('predict');

  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-neon-dark text-gray-300 font-sans overflow-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 overflow-y-auto w-full relative">
          {activeTab === 'predict' && <PredictViralityTab />}
          {activeTab === 'data_insights' && <DataInsightsTab />}
          {activeTab === 'history' && <HistoryTab />}
          {activeTab === 'viral_recipe' && <ViralSongRecipeTab />}

        </main>
      </div>
    </ErrorBoundary>
  );
}

export default App;
