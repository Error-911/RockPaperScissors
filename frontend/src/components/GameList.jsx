import { useState, useEffect } from 'react';
import { viewGame } from '../utils/soroban';

export default function GameList({ onJoinGame }) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      // Load games 1-10 (you can adjust this)
      const gamePromises = [];
      for (let i = 1; i <= 10; i++) {
        gamePromises.push(viewGame(i));
      }
      
      const gameResults = await Promise.allSettled(gamePromises);
      const validGames = gameResults
        .filter(result => result.status === 'fulfilled' && result.value.game_id !== 0)
        .map(result => result.value);
      
      setGames(validGames);
    } catch (error) {
      console.error('Error loading games:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading games...</div>;

  return (
    <div className="game-list">
      <h2>Available Games</h2>
      <div className="games-grid">
        {games.map((game) => (
          <div key={game.game_id} className="game-card">
            <h3>Game #{game.game_id}</h3>
            <p>Bet: {game.bet_amount} stroops</p>
            <p>Status: {game.is_completed ? 'Completed' : 'Open'}</p>
            {!game.is_completed && (
              <button onClick={() => onJoinGame(game.game_id)}>
                Join Game
              </button>
            )}
          </div>
        ))}
      </div>
      <button onClick={loadGames} className="refresh-btn">
        Refresh Games
      </button>
    </div>
  );
}