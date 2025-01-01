import { useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthCallback from './components/auth/AuthCallback';
import Auth from './pages/Auth';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import CollectionPage from './components/collection/CollectionPage';
import LeaderboardPage from './components/leaderboard/LeaderboardPage';
import BrowsePage from './components/browse/BrowsePage';
import GameDetails from './components/game/GameDetails';
import SettingsModal from './components/settings/SettingsModal';
import './styles/carousel.css';

function App() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/collection" element={
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors relative">
            <Navbar 
              onOpenSettings={() => setSettingsOpen(true)}
              onMenuClick={() => setSidebarOpen(true)}
            />
            <Sidebar
              isOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
            />
            <SettingsModal
              isOpen={settingsOpen}
              onClose={() => setSettingsOpen(false)}
            />
            <CollectionPage />
          </div>
        } />
        <Route path="/leaderboard" element={
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors relative">
            <Navbar 
              onOpenSettings={() => setSettingsOpen(true)}
              onMenuClick={() => setSidebarOpen(true)}
            />
            <Sidebar
              isOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
            />
            <SettingsModal
              isOpen={settingsOpen}
              onClose={() => setSettingsOpen(false)}
            />
            <LeaderboardPage />
          </div>
        } />
        <Route
          path="/"
          element={            
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors relative">
                <Navbar 
                  onOpenSettings={() => setSettingsOpen(true)}
                  onMenuClick={() => setSidebarOpen(true)}
                />

                <Sidebar
                  isOpen={sidebarOpen}
                  onClose={() => setSidebarOpen(false)}
                />

                <SettingsModal
                  isOpen={settingsOpen}
                  onClose={() => setSettingsOpen(false)}
                />

                <BrowsePage />
              </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;