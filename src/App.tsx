import { useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useZaparoo } from './hooks/useZaparoo';
import AuthCallback from './components/auth/AuthCallback';
import Auth from './pages/Auth';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import SystemGrid from './components/systems/SystemGrid';
import GameDetails from './components/game/GameDetails';
import GameGrid from './components/GameGrid';
import GameList from './components/GameList';
import BottomNav from './components/BottomNav';
import GameActions from './components/game/GameActions';
import SearchOverlay from './components/SearchOverlay';
import SettingsModal from './components/settings/SettingsModal';
import CardCollection from './components/collection/CardCollection';
import LeaderboardPage from './components/leaderboard/LeaderboardPage';
import AddGameModal from './components/game/AddGameModal';
import RecentGames from './components/dashboard/RecentGames';
import FavoritesCard from './components/systems/FavoritesCard';
import { games } from './data/mockData';
import { systems } from './data/systems';
import { Game, ViewMode } from './types';
import { sortGames } from './utils/gameUtils';
import { SortOption } from './components/search/SortSelect';

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchOpen, setSearchOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedCore, setSelectedCore] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('title');
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [addGameOpen, setAddGameOpen] = useState(false);
  const { isConnected } = useZaparoo();

  const filteredGames = useMemo(() => {
    const filtered = games.filter((game) => {
      const matchesCore = selectedCore ? game.system_id === selectedCore : true;
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        game.title.toLowerCase().includes(query) ||
        (game.genre?.toLowerCase().includes(query) || false) ||
        (game.developer?.toLowerCase().includes(query) || false);
      return matchesCore && matchesSearch;
    });
    return sortGames(filtered, sortBy);
  }, [selectedCore, searchQuery, sortBy]);

  const favoriteGames = useMemo(() => {
    return games.filter(game => game.favorite);
  }, []);

  const handleGameSelect = (game: Game) => {
    setSelectedGame(game);
  };

  const handleGameAdded = (game: Game) => {
    // Update local state or trigger a refresh
    console.log('Game added:', game);
  };

  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route
          path="/"
          element={            
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors relative">
                <Navbar 
                  onOpenSettings={() => setSettingsOpen(true)}
                  onMenuClick={() => setSidebarOpen(true)}
                  onBack={selectedGame ? () => setSelectedGame(null) : selectedCore ? () => setSelectedCore(null) : undefined}
                  showBack={!!selectedCore || !!selectedGame}
                />

                <Sidebar
                  systems={systems}
                  isOpen={sidebarOpen}
                  onClose={() => setSidebarOpen(false)}
                  selectedCore={selectedCore}
                  onCoreSelect={(core) => {
                    setSelectedCore(core);
                    setSidebarOpen(false);
                  }}
                />

                <SettingsModal
                  isOpen={settingsOpen}
                  onClose={() => setSettingsOpen(false)}
                />

                <AddGameModal
                  isOpen={addGameOpen}
                  onClose={() => setAddGameOpen(false)}
                  onGameAdded={handleGameAdded}
                />

                <SearchOverlay
                  isOpen={searchOpen}
                  onClose={() => setSearchOpen(false)}
                  onSearch={setSearchQuery}
                  onSort={setSortBy}
                  sortBy={sortBy}
                />

                <main className="pb-20">
                  {selectedGame ? (
                    <GameDetails
                      game={selectedGame}
                      onBack={() => setSelectedGame(null)} />
                  ) : selectedCore === 'collection' ? (
                    <CardCollection />
                  ) : selectedCore === 'leaderboard' ? (
                    <LeaderboardPage />
                  ) : !selectedCore ? (
                    <div className="p-6 space-y-8">
                      <RecentGames games={games} onGameSelect={handleGameSelect} />
                      <SystemGrid
                        systems={[
                          ...systems,
                          {
                            id: 'favorites',
                            component: <FavoritesCard
                              favoriteCount={favoriteGames.length}
                              onClick={() => setSelectedCore('favorites')}
                            />
                          }
                        ]}
                        onSystemSelect={setSelectedCore}
                      />
                    </div>
                  ) : viewMode === 'grid' ? (
                    <GameGrid games={filteredGames} onGameSelect={handleGameSelect} />
                  ) : (
                    <GameList games={filteredGames} onGameSelect={handleGameSelect} />
                  )}
                </main>

                {!selectedGame && (
                  <GameActions onAddGame={() => setAddGameOpen(true)} />
                )}

                <BottomNav
                  viewMode={viewMode}
                  setViewMode={setViewMode}
                  onMenuClick={() => setSidebarOpen(true)}
                  onSearchClick={() => setSearchOpen(true)} 
                />
              </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;