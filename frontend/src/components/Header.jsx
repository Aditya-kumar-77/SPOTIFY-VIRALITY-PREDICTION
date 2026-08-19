export default function Header() {
  return (
    <header className="bg-spotify-black border-b border-gray-800">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-spotify-green flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-black" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15v-6l6 3-6 3z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold">Spotify Virality Prediction</h1>
            <p className="text-sm text-gray-400">ML-powered virality scoring</p>
          </div>
        </div>
      </div>
    </header>
  );
}
