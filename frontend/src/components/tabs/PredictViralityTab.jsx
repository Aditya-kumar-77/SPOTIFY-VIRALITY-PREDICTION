import { useState } from 'react';
import PredictForm from '../PredictForm';
import PredictionResult from '../PredictionResult';
import SampleSongs from '../SampleSongs';

export default function PredictViralityTab() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = async (songData) => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(songData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.error || 'Prediction failed');
      setResult(data);
    } catch (err) {
      setResult({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-neon-green flex items-center gap-3">
          <span className="text-5xl">🎤</span> Predict Virality
        </h1>
        <p className="text-gray-400 mt-2 text-sm">
          Tune the audio features below and let the AI Stacking Ensemble decide whether your track has what it takes to go viral.
        </p>
      </div>

      <div className="bg-[#121822] border border-neon-border rounded-lg p-6 mb-8">
        <h2 className="text-neon-cyan font-bold tracking-widest text-sm mb-4 uppercase flex items-center gap-2">
          <span>🎛️</span> QUICK PRESETS
        </h2>
        <SampleSongs onPredict={handlePredict} />
      </div>

      <div className="bg-[#121822] border border-neon-border rounded-lg p-6 relative">
        <h2 className="text-neon-cyan font-bold tracking-widest text-sm mb-4 uppercase flex items-center gap-2">
          <span>🎚️</span> AUDIO FEATURES
        </h2>
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-8 text-xs text-blue-200">
          <span className="text-orange-400 mr-2">🔥</span> 
          <strong>Tip:</strong> Viral songs in this dataset tend to have <strong>low valence</strong> (~0.29), <strong>high speechiness</strong> (~0.16), <strong>loudness</strong> around -7 dB, and <strong>high danceability</strong> (~0.74). The model also weighs artist popularity and engineered composite features — use the <em>Viral Song Recipe</em> page for the full breakdown.
        </div>
        
        <PredictForm onSubmit={handlePredict} loading={loading} />
      </div>

      {result && (
        <div className="mt-8">
          <PredictionResult result={result} />
        </div>
      )}
    </div>
  );
}
