import { useState } from 'react';
import { connectWallet } from '../utils/stellar';

export default function WalletConnect({ onConnect }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConnect = async () => {
    setLoading(true);
    setError('');
    
    try {
      const publicKey = await connectWallet();
      onConnect(publicKey.address);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wallet-connect">
      <button 
        onClick={handleConnect} 
        disabled={loading}
        className="connect-btn"
      >
        {loading ? 'Connecting...' : 'Connect Freighter Wallet'}
      </button>
      {error && <p className="error">{error}</p>}
    </div>
  );
}