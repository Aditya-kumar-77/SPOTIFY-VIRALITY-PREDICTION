export default function Sidebar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'predict', label: 'Predict Virality', icon: '✨' },
    { id: 'data_insights', label: 'Data Insights', icon: '📊' },
    { id: 'history', label: 'Prediction History', icon: '📜' },
    { id: 'viral_recipe', label: 'Viral Song Recipe', icon: '🧪' },
  ];

  return (
    <aside className="w-64 bg-[#080B10] border-r border-neon-border flex flex-col min-h-screen">
      <div className="p-6">
        <h1 className="text-2xl font-black text-neon-green flex items-center gap-2">
          <span>🎤</span> Predict Virality
        </h1>
        <p className="text-xs text-gray-400 mt-2 ml-8">AI Prediction System</p>
      </div>
      
      <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
        app
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full text-left px-4 py-2 rounded-md text-sm transition-colors duration-200 ${
              activeTab === item.id
                ? 'bg-neon-border text-white font-semibold'
                : 'text-gray-400 hover:bg-neon-border/50 hover:text-white'
            }`}
          >
            <span className="mr-3">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-neon-border text-xs text-gray-500 text-center">
        Built with React + Tailwind
      </div>
    </aside>
  );
}
