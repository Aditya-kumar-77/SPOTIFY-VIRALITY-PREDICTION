import { useState, useEffect } from 'react';

export default function HistoryTab() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/songs')
      .then((r) => r.json())
      .then((d) => {
        setSongs(d.songs || []);
        setLoading(false);
      })
      .catch(() => {
        setSongs([]);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-neon-green flex items-center gap-3">
          <span className="text-5xl">📜</span> Prediction History
        </h1>
        <p className="text-gray-400 mt-2 text-sm">
          Review past viral predictions scored by the AI ensemble. Data is fetched directly from the PostgreSQL database.
        </p>
      </div>

      <div className="bg-[#121822] border border-neon-border rounded-xl p-6 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
        <h2 className="text-neon-cyan font-bold tracking-widest text-sm mb-6 uppercase flex items-center gap-2">
          <span>🕒</span> RECENT PREDICTIONS
        </h2>
        
        {loading ? (
          <div className="text-neon-green py-12 text-center animate-pulse font-mono">Loading history...</div>
        ) : songs.length === 0 ? (
          <div className="text-gray-500 py-12 text-center border-2 border-dashed border-gray-700 rounded-lg">No predictions found in the database.</div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-neon-border">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-neon-cyan uppercase bg-[#080B10] border-b border-neon-border">
                <tr>
                  <th className="px-6 py-4 font-bold tracking-wider">Track</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Artist</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Probability</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Result</th>
                </tr>
              </thead>
              <tbody>
                {songs.map((s) => (
                  <tr key={s.id} className="border-b border-neon-border/50 hover:bg-[#1E293B] transition-colors">
                    <td className="px-6 py-4 text-white font-medium">{s.track_name}</td>
                    <td className="px-6 py-4 text-gray-400">{s.artist_name}</td>
                    <td className="px-6 py-4 text-neon-green font-mono">
                      {(s.virality_probability * 100).toFixed(1)}%
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider ${
                        s.is_viral ? 'bg-neon-green/10 text-neon-green border border-neon-green/30' : 'bg-gray-800 text-gray-400 border border-gray-700'
                      }`}>
                        {s.is_viral ? 'Viral' : 'Not Viral'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
