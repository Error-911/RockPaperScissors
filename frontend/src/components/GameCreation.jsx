import { useState } from 'react';
import { createGame } from '../utils/soroban';
import { toast } from 'react-toastify';

export default function GameCreation({ walletAddress }) {
  const [betAmount, setBetAmount] = useState('');
  const [choice, setChoice] = useState('Rock');
  const [loading, setLoading] = useState(false);

  const handleCreateGame = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await createGame(
        walletAddress,
        parseInt(betAmount),
        choice
      );
      
      toast.success(`Game created! Transaction: ${result.hash}`);
      setBetAmount('');
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="game-creation">
      <h2>Create New Game</h2>
      <form onSubmit={handleCreateGame}>
        <div className="form-group">
          <label>Bet Amount (stroops):</label>
          <input
            type="number"
            value={betAmount}
            onChange={(e) => setBetAmount(e.target.value)}
            required
            min="1"
          />
        </div>

        <div className="form-group">
          <label>Your Choice:</label>
          <select value={choice} onChange={(e) => setChoice(e.target.value)}>
            <option value="Rock">🪨 Rock</option>
            <option value="Paper">📄 Paper</option>
            <option value="Scissors">✂️ Scissors</option>
          </select>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Game'}
        </button>
      </form>
    </div>
  );
}