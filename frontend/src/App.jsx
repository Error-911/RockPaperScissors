import { useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import WalletConnect from './components/WalletConnect';
import GameCreation from './components/GameCreation';
import GameList from './components/GameList';
import './App.css';

function App() {
  const [walletAddress, setWalletAddress] = useState('');

  const handleWalletConnect = (address) => {
    setWalletAddress(address);
  };

  const handleJoinGame = (gameId) => {
    // Implement join game logic
    console.log('Joining game:', gameId);
  };

  return (
    <div className="App">
      <header>
        <h1>🎮 Rock-Paper-Scissors Betting</h1>
        {walletAddress && (
          <p className="wallet-info">
            Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </p>
        )}
      </header>

      <main>
        {!walletAddress ? (
          <WalletConnect onConnect={handleWalletConnect} />
        ) : (
          <>
            <GameCreation walletAddress={walletAddress} />
            <GameList onJoinGame={handleJoinGame} />
          </>
        )}
      </main>

      <ToastContainer position="bottom-right" />
    </div>
  );
}

export default App;