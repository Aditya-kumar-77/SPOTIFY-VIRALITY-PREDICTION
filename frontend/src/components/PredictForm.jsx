import { useState } from 'react';

const SLIDER_FIELDS = [
  { key: 'danceability', label: 'Danceability', min: 0, max: 1, step: 0.01, icon: '💃' },
  { key: 'speechiness', label: 'Speechiness', min: 0, max: 1, step: 0.01, icon: '🗣️' },
  { key: 'loudness', label: 'Loudness (dB)', min: -60, max: 0, step: 0.1, icon: '🔊' },
  { key: 'energy', label: 'Energy', min: 0, max: 1, step: 0.01, icon: '⚡' },
  { key: 'acousticness', label: 'Acousticness', min: 0, max: 1, step: 0.01, icon: '🎸' },
  { key: 'tempo', label: 'Tempo (BPM)', min: 50, max: 220, step: 1, icon: '🥁' },
  { key: 'valence', label: 'Valence', min: 0, max: 1, step: 0.01, icon: '🎭' },
  { key: 'liveness', label: 'Liveness', min: 0, max: 1, step: 0.01, icon: '🎤' },
  { key: 'instrumentalness', label: 'Instrumentalness', min: 0, max: 1, step: 0.01, icon: '🎹' },
];

export default function PredictForm({ onSubmit, loading }) {
  const [form, setForm] = useState({
    track_name: '',
    artist_name: '',
    tempo: 123,
    loudness: -7.30,
    duration_ms: 232000,
    danceability: 0.74,
    energy: 0.66,
    valence: 0.29,
    acousticness: 0.28,
    speechiness: 0.16,
    instrumentalness: 0.11,
    liveness: 0.12,
  });

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const parsed = (type === 'number' || type === 'range') ? parseFloat(value) || 0 : value;
    setForm((f) => ({ ...f, [name]: parsed }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      key: 0,
      mode: 1,
      time_signature: 4,
      explicit: 0,
    });
  };

  // Inject a custom style for the neon range slider thumbs
  return (
    <>
      <style>{`
        input[type=range] {
          -webkit-appearance: none;
        }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #00FF80;
          cursor: pointer;
          border: 2px solid #080B10;
        }
        input[type=range]::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #00FF80;
          cursor: pointer;
          border: 2px solid #080B10;
        }
      `}</style>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">Track Name</label>
            <input
              type="text"
              name="track_name"
              value={form.track_name}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[#080B10] border-b border-gray-700 text-white placeholder-gray-600 focus:outline-none focus:border-neon-green transition-colors"
              placeholder="Song title"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">Artist Name</label>
            <input
              type="text"
              name="artist_name"
              value={form.artist_name}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[#080B10] border-b border-gray-700 text-white placeholder-gray-600 focus:outline-none focus:border-neon-green transition-colors"
              placeholder="Artist"
            />
          </div>
        </div>

        <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {SLIDER_FIELDS.map(({ key, label, min, max, step, icon }) => (
            <div key={key} className="relative">
              <div className="flex justify-between text-xs font-semibold mb-3">
                <label className="flex items-center gap-2 text-white">
                  <span>{icon}</span> {label}
                </label>
                <span className="text-neon-green bg-[#080B10] px-2 py-0.5 rounded border border-neon-border/50">
                  {(form[key] ?? 0).toFixed(step < 1 ? 2 : 0)}
                </span>
              </div>
              <div className="relative pt-1">
                <input
                  type="range"
                  name={key}
                  value={form[key] ?? 0}
                  onChange={handleChange}
                  min={min}
                  max={max}
                  step={step}
                  className="w-full h-1 bg-red-600 rounded-full appearance-none outline-none z-10 relative"
                />
              </div>
              <div className="flex justify-between text-[10px] text-gray-500 mt-2 font-mono">
                <span>{min.toFixed(step < 1 ? 2 : 0)}</span>
                <span>{max.toFixed(step < 1 ? 2 : 0)}</span>
              </div>
            </div>
          ))}
          
          <div className="relative">
            <div className="flex justify-between text-xs font-semibold mb-3">
              <label className="flex items-center gap-2 text-white">
                <span>⏱️</span> Duration (ms)
              </label>
              <span className="text-neon-green bg-[#080B10] px-2 py-0.5 rounded border border-neon-border/50">
                {form.duration_ms}
              </span>
            </div>
            <div className="relative pt-1">
              <input
                type="range"
                name="duration_ms"
                value={form.duration_ms}
                onChange={handleChange}
                min={30000}
                max={600000}
                step={1000}
                className="w-full h-1 bg-red-600 rounded-full appearance-none outline-none z-10 relative"
              />
            </div>
             <div className="flex justify-between text-[10px] text-gray-500 mt-2 font-mono">
                <span>30000</span>
                <span>600000</span>
              </div>
          </div>
        </div>

        <div className="pt-4 border-t border-neon-border">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 rounded-full bg-neon-green text-black font-extrabold shadow-[0_0_15px_rgba(0,255,128,0.4)] hover:shadow-[0_0_25px_rgba(0,255,128,0.6)] hover:bg-white transition-all duration-300 disabled:opacity-50 flex items-center gap-2"
          >
            <span>{loading ? '⏳' : '🧪'}</span> {loading ? 'Predicting…' : 'Predict Virality'}
          </button>
        </div>
      </form>
    </>
  );
}
