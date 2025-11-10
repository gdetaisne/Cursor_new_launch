import { useState } from 'react';

function App() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={darkMode ? 'dark' : ''}>
      {/* Apple-style gradient background */}
      <div className="min-h-screen gradient-apple-light dark:gradient-apple-dark">
        <div className="container mx-auto p-8 space-y-8">
          {/* Header with toggle */}
          <div className="glass rounded-3xl p-6 shadow-glass-light dark:shadow-glass-dark animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  🍎 Moverz Admin Portal
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Apple Liquid Glass Design System
                </p>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="btn-apple-secondary"
              >
                {darkMode ? '☀️ Light' : '🌙 Dark'}
              </button>
            </div>
          </div>

          {/* Button Showcase */}
          <div className="card-apple animate-fade-in" style={{ animationDelay: '100ms' }}>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              🎨 Apple Buttons
            </h2>
            <div className="flex flex-wrap gap-4">
              <button className="btn-apple-blue">Primary Action</button>
              <button className="btn-apple-green">Success Action</button>
              <button className="btn-apple-red">Danger Action</button>
              <button className="btn-apple-secondary">Secondary</button>
              <button className="btn-apple-ghost">Ghost Button</button>
              <button className="btn-apple-blue" disabled>
                Disabled
              </button>
            </div>
          </div>

          {/* Badge Showcase */}
          <div className="card-apple animate-fade-in" style={{ animationDelay: '200ms' }}>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              🏷️ Apple Badges
            </h2>
            <div className="flex flex-wrap gap-3">
              <span className="badge-apple">Default</span>
              <span className="badge-apple-blue">Pending</span>
              <span className="badge-apple-green">Completed</span>
              <span className="badge-apple-red">Error</span>
              <span className="badge-apple-orange">Warning</span>
            </div>
          </div>

          {/* Card Variations */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              className="card-apple-interactive animate-scale-in"
              style={{ animationDelay: '300ms' }}
            >
              <div className="text-4xl mb-3">📊</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Dashboard
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Interactive glass card with hover effect
              </p>
            </div>

            <div
              className="glass-interactive rounded-2xl p-6 animate-scale-in"
              style={{ animationDelay: '400ms' }}
            >
              <div className="text-4xl mb-3">📁</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Folders
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Glass interactive with subtle blur
              </p>
            </div>

            <div
              className="glass-strong rounded-2xl p-6 animate-scale-in"
              style={{ animationDelay: '500ms' }}
            >
              <div className="text-4xl mb-3">💰</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Quotes
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Strong glass (more opaque)
              </p>
            </div>
          </div>

          {/* Input Showcase */}
          <div className="card-apple animate-fade-in" style={{ animationDelay: '600ms' }}>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              📝 Apple Inputs
            </h2>
            <div className="space-y-4 max-w-md">
              <input
                type="text"
                placeholder="Nom du client..."
                className="input-apple"
              />
              <input
                type="email"
                placeholder="Email..."
                className="input-apple"
              />
            </div>
          </div>

          {/* Shimmer Text */}
          <div className="card-apple animate-fade-in" style={{ animationDelay: '700ms' }}>
            <h2 className="text-4xl font-bold text-shimmer text-center py-8">
              ✨ Shimmer Effect
            </h2>
          </div>

          {/* Divider */}
          <div className="divider-apple"></div>

          {/* Info Card */}
          <div className="glass-subtle rounded-2xl p-6 text-center animate-fade-in" style={{ animationDelay: '800ms' }}>
            <p className="text-gray-700 dark:text-gray-300">
              🚀 Backend API: <code className="px-2 py-1 bg-gray-100/50 dark:bg-gray-800/50 rounded">
                {import.meta.env.VITE_API_URL || 'http://localhost:3001'}
              </code>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Design inspiré de macOS Sonoma • Liquid Glass UI
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

