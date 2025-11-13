import React, { useState, useEffect } from 'react';
import './App.css';
import {
  connectWallet,
  getCurrentAccount,
  onAccountsChanged,
  onChainChanged,
  checkMetaMask,
} from './utils/web3';
import DIDManagement from './components/DIDManagement';
import CredentialManagement from './components/CredentialManagement';
import IssuerDashboard from './components/IssuerDashboard';
import SelectiveDisclosure from './components/SelectiveDisclosure';

function App() {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('identity');

  useEffect(() => {
    // Check for existing MetaMask connection on mount
    checkExistingConnection();

    // Only check MetaMask installation
    if (!checkMetaMask()) {
      setError('MetaMask is not installed. Please install MetaMask to use this app.');
      return;
    }

    // Listen for account changes (when user switches accounts in MetaMask)
    onAccountsChanged((newAccount) => {
      if (newAccount) {
        setAccount(newAccount);
      } else {
        // User disconnected
        setAccount(null);
      }
    });

    // Listen for chain changes
    onChainChanged((chainId) => {
      console.log('Chain changed:', chainId);
      // Reload page on chain change
      window.location.reload();
    });
  }, []);

  const checkExistingConnection = async () => {
    if (!checkMetaMask()) {
      return;
    }

    try {
      // Check if MetaMask already has an active connection
      const accounts = await window.ethereum.request({
        method: 'eth_accounts',
      });

      // If there's an active account, restore the connection
      if (accounts && accounts.length > 0) {
        const currentAccount = accounts[0];
        
        // Verify we're on the correct network
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        const targetChainId = `0x${(1337).toString(16)}`; // Chain ID 1337 in hex

        if (chainId === targetChainId) {
          setAccount(currentAccount);
        } else {
          // Wrong network, don't auto-connect
          setAccount(null);
          setError('Please switch to Hardhat Local network (Chain ID: 1337)');
        }
      }
    } catch (error) {
      console.error('Error checking existing connection:', error);
      // Don't set error, just don't auto-connect
    }
  };

  const handleConnect = async () => {
    setLoading(true);
    setError(null);

    try {
      const connectedAccount = await connectWallet();
      setAccount(connectedAccount);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>🔐 NexID</h1>
          <div className="wallet-info">
            {account ? (
              <>
                <div className="wallet-address">
                  {formatAddress(account)}
                </div>
                <button className="btn btn-secondary" onClick={handleConnect} disabled={loading}>
                  {loading ? 'Connecting...' : 'Switch Account'}
                </button>
              </>
            ) : (
              <button className="btn btn-primary" onClick={handleConnect} disabled={loading}>
                {loading ? 'Connecting...' : 'Connect Wallet'}
              </button>
            )}
          </div>
        </header>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {!account ? (
          <div className="card">
            <h2>Welcome to NexID</h2>
            <p style={{ marginBottom: '20px', fontSize: '1.1rem', color: '#666' }}>
              Connect your MetaMask wallet to get started with decentralized identity and credential management.
            </p>
            <div style={{ textAlign: 'center', marginTop: '30px' }}>
              <button 
                className="btn btn-primary" 
                onClick={handleConnect} 
                disabled={loading}
                style={{ fontSize: '1.2rem', padding: '15px 40px' }}
              >
                {loading ? 'Connecting...' : '🔗 Connect Wallet'}
              </button>
            </div>
            <div className="alert alert-info" style={{ marginBottom: '20px' }}>
              <strong>MetaMask Setup:</strong>
              <ul style={{ marginTop: '10px', marginLeft: '20px', lineHeight: '1.8' }}>
                <li>Network Name: <strong>Hardhat Local</strong></li>
                <li>RPC URL: <code style={{ background: '#f0f0f0', padding: '2px 6px', borderRadius: '4px' }}>http://127.0.0.1:8545</code> <strong>(must include http://)</strong></li>
                <li>Chain ID: <strong>1337</strong></li>
                <li>Currency Symbol: <strong>ETH</strong> (not GO!)</li>
              </ul>
              <div className="alert alert-error" style={{ marginTop: '15px', fontSize: '0.9rem' }}>
                <strong>⚠️ Important:</strong> Make sure Hardhat node is running (<code>npm run node</code>) before adding the network!
                <br />
                If you get "Could not fetch chain ID" error, check <code>METAMASK_FIX.md</code> for troubleshooting.
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="tabs">
              <button
                className={`tab ${activeTab === 'identity' ? 'active' : ''}`}
                onClick={() => setActiveTab('identity')}
              >
                My Identity
              </button>
              <button
                className={`tab ${activeTab === 'credentials' ? 'active' : ''}`}
                onClick={() => setActiveTab('credentials')}
              >
                My Credentials
              </button>
              <button
                className={`tab ${activeTab === 'issuer' ? 'active' : ''}`}
                onClick={() => setActiveTab('issuer')}
              >
                Issuer Dashboard
              </button>
              <button
                className={`tab ${activeTab === 'disclosure' ? 'active' : ''}`}
                onClick={() => setActiveTab('disclosure')}
              >
                Selective Disclosure
              </button>
            </div>

            <div className="tab-content">
              {activeTab === 'identity' && <DIDManagement account={account} />}
              {activeTab === 'credentials' && <CredentialManagement account={account} />}
              {activeTab === 'issuer' && <IssuerDashboard account={account} />}
              {activeTab === 'disclosure' && <SelectiveDisclosure account={account} />}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;

