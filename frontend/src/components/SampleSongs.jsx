import { useState, useEffect } from 'react';

export default function SampleSongs({ onPredict }) {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/sample-songs')
      .then((r) => r.json())
      .then((d) => setSongs(d.songs || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading || songs.length === 0) return null;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Sample Songs (from training data)</h2>
      <p className="text-gray-400 mb-4 text-sm">Click a song to predict its virality.</p>
      <div className="space-y-2">
        {songs.map((s, i) => (
          <button
            key={i}
            onClick={() => onPredict(s)}
            className="w-full text-left px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700 hover:border-spotify-green hover:bg-gray-800 transition flex justify-between items-center"
          >
            <span>
              <strong>{s.track_name}</strong> — {s.artist_name}
            </span>
            <span className="text-spotify-green text-sm">Predict →</span>
          </button>
        ))}
      </div>
    </div>
  );
}
