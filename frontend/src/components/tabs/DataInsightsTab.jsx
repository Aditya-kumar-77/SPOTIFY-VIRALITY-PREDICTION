import { useState, useEffect } from 'react';
import TrainModelPanel from '../TrainModelPanel';

export default function DataInsightsTab() {
  const [songsAnalyzed, setSongsAnalyzed] = useState(500);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      if (data.songsAnalyzed) {
        setSongsAnalyzed(data.songsAnalyzed);
      }
    } catch (err) {
      console.error('Failed to fetch stats', err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);
  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-neon-green">
          <span className="mr-3">🎵</span>Spotify Viral Hit Prediction System
        </h1>
        <p className="text-gray-400 mt-2 text-sm text-balance">
          End-to-end machine learning pipeline that predicts whether a song will go viral based on its audio DNA — powered by a Stacking Ensemble of CatBoost • LightGBM • XGBoost • Random Forest • Logistic Regression.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-[#121822] border border-neon-border rounded-xl p-6">
          <div className="text-3xl mb-2">🎵</div>
          <div className="text-4xl font-bold text-neon-green mb-1">{songsAnalyzed}</div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">Songs Analyzed</div>
        </div>
        <div className="bg-[#121822] border border-neon-border rounded-xl p-6">
          <div className="text-3xl mb-2">⚙️</div>
          <div className="text-4xl font-bold text-neon-green mb-1">70</div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">Engineered Features</div>
        </div>
        <div className="bg-[#121822] border border-neon-border rounded-xl p-6">
          <div className="text-3xl mb-2">🤖</div>
          <div className="text-4xl font-bold text-neon-green mb-1">6</div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">Models Trained</div>
        </div>
        <div className="bg-[#121822] border border-neon-border rounded-xl p-6">
          <div className="text-3xl mb-2">🏆</div>
          <div className="text-4xl font-bold text-neon-green mb-1">1.0000</div>
          <div className="text-xs text-gray-500 uppercase tracking-wider leading-tight">Best Accuracy •<br/>Logistic_Regression</div>
        </div>
      </div>

      <TrainModelPanel onTrainingComplete={fetchStats} />

      <div className="mb-8">
        <h2 className="text-neon-cyan font-bold tracking-widest text-sm mb-4 uppercase flex items-center gap-2">
          <span>📈</span> DATASET VISUALISATIONS
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-2 flex items-center justify-center overflow-hidden">
             <img src="/correlation_matrix.png" alt="Correlation Matrix" className="w-full h-auto object-cover opacity-90 hover:opacity-100 transition-opacity" />
          </div>
          <div className="bg-white rounded-lg p-2 flex items-center justify-center overflow-hidden">
             <img src="/feature_distributions.png" alt="Feature Distributions" className="w-full h-auto object-cover opacity-90 hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>
    </div>
  );
}
