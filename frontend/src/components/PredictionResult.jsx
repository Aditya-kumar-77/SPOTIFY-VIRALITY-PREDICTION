export default function PredictionResult({ result }) {
  if (result.error) {
    return (
      <div className="rounded-xl bg-red-900/30 border border-red-700 p-6">
        <p className="text-red-400">Error: {result.error}</p>
      </div>
    );
  }

  const pct = (result.virality_percentage != null ? result.virality_percentage : result.virality_probability * 100).toFixed(1);
  const isViral = result.is_viral;

  return (
    <div className="rounded-xl bg-gray-800/50 border border-gray-700 p-6">
      <h3 className="text-lg font-semibold mb-4">Prediction Result</h3>
      <div className="flex items-center gap-6 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-spotify-green">{pct}%</span>
            <span className="text-gray-400">chance to go viral</span>
          </div>
          <div className="mt-2 h-3 rounded-full bg-gray-700 overflow-hidden">
            <div
              className="h-full bg-spotify-green rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        <div
          className={`px-4 py-2 rounded-full font-semibold ${
            isViral ? 'bg-spotify-green/20 text-spotify-green' : 'bg-gray-700 text-gray-400'
          }`}
        >
          {isViral ? 'Likely Viral' : 'Unlikely Viral'}
        </div>
      </div>
      <p className="mt-4 text-sm text-gray-400">
        Confidence: <span className="text-gray-300 capitalize">{result.confidence}</span>
      </p>
    </div>
  );
}
