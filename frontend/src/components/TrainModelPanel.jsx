import { useState } from 'react';

export default function TrainModelPanel({ onTrainingComplete }) {
  const [numSongs, setNumSongs] = useState(500);
  const [isTraining, setIsTraining] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleTrain = async () => {
    setIsTraining(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/train', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ num_songs: numSongs }),
      });

      if (!response.ok) {
        throw new Error('Training pipeline failed to execute');
      }

      setSuccess(true);
      if (onTrainingComplete) {
        onTrainingComplete();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsTraining(false);
    }
  };

  return (
    <div className="bg-[#121822] border border-neon-border rounded-xl p-6 mb-8 col-span-full shadow-[0_0_15px_rgba(0,0,0,0.5)]">
      <h2 className="text-neon-cyan font-bold tracking-widest text-sm mb-4 uppercase flex items-center gap-2">
        <span>⚙️</span> CUSTOM MODEL TRAINING
      </h2>
      <p className="text-gray-400 text-sm mb-6">
        Hyper-tune the AI Engine by specifying how many songs to scrape from Spotify and train the Stacking Ensemble on. Note: Large datasets take minutes to train.
      </p>

      <div className="flex flex-col md:flex-row gap-6 items-end">
        <div className="flex-1 w-full">
          <label className="flex justify-between text-xs font-bold text-gray-400 mb-3 uppercase tracking-wide">
            <span>Number of Songs to Analyze</span>
            <span className="text-neon-green">{numSongs.toLocaleString()}</span>
          </label>
          <div className="relative pt-1">
            <input
              type="range"
              min="100"
              max="10000"
              step="100"
              value={numSongs}
              onChange={(e) => setNumSongs(e.target.value)}
              disabled={isTraining}
              className="w-full h-1 bg-red-600 rounded-full appearance-none outline-none z-10 relative cursor-pointer"
            />
          </div>
          <div className="flex justify-between text-[10px] text-gray-600 mt-2 font-mono">
            <span>100</span>
            <span>10,000</span>
          </div>
        </div>

        <button
          onClick={handleTrain}
          disabled={isTraining}
          className="w-full md:w-auto px-8 py-3 rounded-full bg-neon-green text-black font-extrabold shadow-[0_0_15px_rgba(0,255,128,0.4)] hover:shadow-[0_0_25px_rgba(0,255,128,0.6)] hover:bg-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
        >
          {isTraining ? (
            <>
              <span className="animate-spin text-xl">⏳</span> Training...
            </>
          ) : (
            <>
              <span className="text-xl">🚀</span> Start Pipeline
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/50 text-red-400 text-sm rounded">
          <span className="font-bold">Error:</span> {error}
        </div>
      )}
      
      {success && (
        <div className="mt-4 p-3 bg-neon-green/10 border border-neon-green/30 text-neon-green text-sm rounded">
          <span className="font-bold">✓ Success!</span> Model pipeline completed and visualizations updated!
        </div>
      )}
    </div>
  );
}
