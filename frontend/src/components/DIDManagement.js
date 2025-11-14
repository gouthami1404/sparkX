import React, { useState, useEffect } from 'react';
import {
  getDIDRegistryContract,
  getDIDRegistryContractReadOnly,
} from '../utils/web3';
import { ethers } from 'ethers';

const DIDManagement = ({ account }) => {
  const [did, setDid] = useState('');
  const [hasDID, setHasDID] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newDID, setNewDID] = useState('');

  useEffect(() => {
    // Only load DID if account is valid and connected
    if (account && account.startsWith('0x') && account.length === 42) {
      loadDID();
    } else {
      // Reset state if account is invalid
      setDid('');
      setHasDID(false);
      setNewDID('');
      setMessage(null);
    }
  }, [account]);

  const loadDID = async () => {
    if (!account || !account.startsWith('0x')) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const contract = getDIDRegistryContractReadOnly();
      
      // Check if contract address is set
      const contractAddress = contract.target || contract.address;
      if (!contractAddress || contractAddress === '0x' || contractAddress === '') {
        console.warn('DIDRegistry contract address not configured');
        setHasDID(false);
        setDid('');
        setNewDID('');
        return;
      }

      let hasRegistered = false;
      try {
        hasRegistered = await contract.hasDID(account);
      } catch (callError) {
        // If the call fails with empty result, it means no DID registered yet
        if (callError.message && callError.message.includes('value="0x"')) {
          console.log('No DID registered yet');
          setHasDID(false);
          setDid('');
          setNewDID('');
          return;
        }
        throw callError;
      }

      setHasDID(hasRegistered);

      if (hasRegistered) {
        try {
          const registeredDID = await contract.getDID(account);
          setDid(registeredDID);
          setNewDID(registeredDID);
        } catch (didError) {
          console.error('Error fetching DID:', didError);
          // If we can't fetch the DID, assume it doesn't exist
          setHasDID(false);
          setDid('');
          setNewDID('');
        }
      } else {
        // Reset if no DID registered
        setDid('');
        setNewDID('');
      }
    } catch (error) {
      console.error('Error loading DID:', error);
      // Only show error if it's not a "no DID" case
      if (error.message && !error.message.includes('value="0x"')) {
        setMessage({ type: 'error', text: `Failed to load DID: ${error.message}` });
      } else {
        // Just set to no DID for empty result case
        setHasDID(false);
        setDid('');
        setNewDID('');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!newDID.trim()) {
      setMessage({ type: 'error', text: 'DID cannot be empty' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const contract = await getDIDRegistryContract();
      const tx = await contract.registerDID(newDID.trim());
      await tx.wait();

      setDid(newDID.trim());
      setHasDID(true);
      setIsEditing(false);
      setMessage({ type: 'success', text: 'DID registered successfully!' });
    } catch (error) {
      console.error('Error registering DID:', error);
      setMessage({ type: 'error', text: `Failed to register DID: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!newDID.trim()) {
      setMessage({ type: 'error', text: 'DID cannot be empty' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const contract = await getDIDRegistryContract();
      const tx = await contract.updateDID(newDID.trim());
      await tx.wait();

      setDid(newDID.trim());
      setIsEditing(false);
      setMessage({ type: 'success', text: 'DID updated successfully!' });
    } catch (error) {
      console.error('Error updating DID:', error);
      setMessage({ type: 'error', text: `Failed to update DID: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  // Don't render if account is not valid
  if (!account || !account.startsWith('0x')) {
    return (
      <div className="card">
        <h2>Decentralized Identifier (DID)</h2>
        <div className="alert alert-info">
          Please connect your wallet to manage your DID.
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Decentralized Identifier (DID)</h2>

      {message && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      {loading && !hasDID && (
        <div className="loading" style={{ padding: '20px', textAlign: 'center' }}>
          Loading...
        </div>
      )}

      <div className="form-group">
        <label>Your Wallet Address (Base Identity)</label>
        <input
          type="text"
          value={account}
          readOnly
          style={{ background: '#f0f0f0', cursor: 'not-allowed' }}
        />
        <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
          Your Ethereum address serves as your base identity in PixelGenesis
        </small>
      </div>

      {hasDID ? (
        <>
          <div className="form-group">
            <label>Registered DID</label>
            <input
              type="text"
              value={isEditing ? newDID : did}
              onChange={(e) => setNewDID(e.target.value)}
              readOnly={!isEditing}
              style={!isEditing ? { background: '#f0f0f0', cursor: 'not-allowed' } : {}}
            />
          </div>

          {!isEditing ? (
            <button
              className="btn btn-primary"
              onClick={() => setIsEditing(true)}
              disabled={loading}
            >
              Edit DID
            </button>
          ) : (
            <>
              <button
                className="btn btn-primary"
                onClick={handleUpdate}
                disabled={loading}
                style={{ marginRight: '10px' }}
              >
                {loading ? 'Updating...' : 'Update DID'}
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setIsEditing(false);
                  setNewDID(did);
                }}
                disabled={loading}
              >
                Cancel
              </button>
            </>
          )}
        </>
      ) : (
        <>
          <div className="form-group">
            <label>Register Your DID</label>
            <input
              type="text"
              placeholder="e.g., did:ethr:0x1234567890abcdef..."
              value={newDID}
              onChange={(e) => setNewDID(e.target.value)}
            />
            <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
              Enter your Decentralized Identifier (DID). Example format: did:ethr:0x...
            </small>
          </div>

          <button
            className="btn btn-primary"
            onClick={handleRegister}
            disabled={loading || !newDID.trim()}
          >
            {loading ? 'Registering...' : 'Register DID'}
          </button>
        </>
      )}
    </div>
  );
};

export default DIDManagement;

