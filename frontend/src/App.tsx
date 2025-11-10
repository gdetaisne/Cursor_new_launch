import { useState } from 'react';

function App() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-black">
        <div className="container mx-auto p-8">
          <div className="glass rounded-2xl p-8 shadow-lg transition-all duration-200 hover:shadow-xl">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                Moverz Admin Portal
              </h1>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-md transition-all duration-200 hover:shadow-lg active:scale-95"
              >
                {darkMode ? '☀️ Light' : '🌙 Dark'}
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-lg text-gray-600 dark:text-gray-300">
                🚀 Setup completed! Backend API: {import.meta.env.VITE_API_URL}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['Dashboard', 'Folders', 'Quotes'].map((item) => (
                  <div
                    key={item}
                    className="glass rounded-xl p-6 transition-transform duration-200 hover:scale-105"
                  >
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {item}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Coming soon...
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

