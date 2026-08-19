export default function ViralSongRecipeTab() {
  const recipeData = [
    { title: 'Danceability', value: '0.63 - 0.83', median: '0.78', desc: 'Rhythm suitability for dancing', icon: '🎯' },
    { title: 'Energy', value: '0.62 - 0.64', median: '0.63', desc: 'Intensity & physical activity', icon: '⚡' },
    { title: 'Valence (Mood)', value: '0.13 - 0.46', median: '0.18', desc: 'Positiveness of the track', icon: '🎭' },
    { title: 'Speechiness', value: '0.08 - 0.25', median: '0.18', desc: 'Quantity of spoken words', icon: '🗣️' },
    { title: 'Acousticness', value: '0.22 - 0.33', median: '0.32', desc: 'Acoustic instrument confidence', icon: '🎸' },
    { title: 'Instrumentalness', value: '0.04 - 0.17', median: '0.04', desc: 'Absence of vocals', icon: '🎹' },
    { title: 'Tempo (BPM)', value: '108.69 - 116.73', median: '114.29', desc: 'Beats per minute', icon: '🥁' },
    { title: 'Loudness (dB)', value: '-9.28 - -5.68', median: '-6.87', desc: 'Overall mix loudness', icon: '🔈' },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-neon-green">
          <span className="mr-3">🧪</span>Viral Song Recipe
        </h1>
        <p className="text-gray-400 mt-2 text-sm">
          Data-driven dissection of the optimal audio DNA for a chart-topping viral hit. Ranges are derived from the IQR of confirmed viral songs in our training set.
        </p>
      </div>

      <div className="mb-6">
        <h2 className="text-neon-cyan font-bold tracking-widest text-sm mb-4 uppercase flex items-center gap-2">
          <span>🎯</span> OPTIMAL VIRAL AUDIO SIGNATURE
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {recipeData.map((item, idx) => (
          <div key={idx} className="bg-[#121822] border border-neon-border hover:border-neon-green/50 transition-colors p-5 rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.5)]">
            <h3 className="text-neon-cyan text-xs font-bold tracking-widest uppercase mb-2">{item.title}</h3>
            <div className="text-2xl font-bold text-white mb-4 tracking-tight">{item.value}</div>
            
            {/* Fake progress bar */}
            <div className="h-2 w-full bg-[#080B10] rounded-full mb-4 overflow-hidden">
              <div 
                className={`h-full ${idx % 2 === 0 ? 'bg-gradient-to-r from-neon-green to-neon-cyan' : 'bg-[#1E293B]'}`} 
                style={{ width: `${60 + (idx * 5)}%` }}
              ></div>
            </div>
            
            <p className="text-xs text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">
              <span className="font-semibold text-gray-400 border-b border-gray-600 border-dotted pb-[1px] cursor-help" title={`Median: ${item.median}`}>Median: {item.median}</span> 
              {' • '} {item.desc}
            </p>
          </div>
        ))}
      </div>

      <button className="bg-transparent border border-[#1E293B] text-neon-cyan hover:bg-[#1E293B] hover:text-white px-4 py-2 rounded text-sm font-semibold transition-colors flex items-center gap-2">
        <span>⬇️</span> Download Recipe as JSON
      </button>

      <div className="mt-12">
        <h2 className="text-neon-cyan font-bold tracking-widest text-sm mb-4 uppercase flex items-center gap-2">
          <span>📉</span> VIRAL VS NON-VIRAL — FEATURE MEANS
        </h2>
        <div className="bg-[#121822] border border-neon-border rounded-xl p-4 flex items-center justify-center overflow-hidden">
           <img src="/viral_vs_nonviral.png" alt="Viral vs Non-Viral Feature Distributions" className="w-full h-auto object-contain bg-white/5 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
