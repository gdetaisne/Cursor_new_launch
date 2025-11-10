import { useState } from 'react';

function App() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="container mx-auto p-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                ✅ Moverz Admin Portal
              </h1>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                {darkMode ? '☀️ Light' : '🌙 Dark'}
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                🚀 <strong>Phase 0 : Setup COMPLET</strong>
              </p>
              
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
                <li>✅ Vite 7.2.2</li>
                <li>✅ React 19.2.0</li>
                <li>✅ TypeScript 5.9.3</li>
                <li>✅ Tailwind CSS 3.4.17</li>
                <li>✅ Dark mode fonctionne</li>
              </ul>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  📡 Backend API: <code className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                    {import.meta.env.VITE_API_URL || 'http://localhost:3001'}
                  </code>
                </p>
              </div>

              <div className="pt-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  🎯 Prochaine étape : <span className="text-blue-600">Phase 1 - Layout & Navigation</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
