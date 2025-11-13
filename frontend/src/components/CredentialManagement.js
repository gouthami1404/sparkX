import React, { useState, useEffect } from 'react';
import {
  getCredentialManagerContractReadOnly,
} from '../utils/web3';
import { ethers } from 'ethers';

const CredentialManagement = ({ account }) => {
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (account && account.startsWith('0x') && account.length === 42) {
      loadCredentials();
    } else {
      setCredentials([]);
      setLoading(false);
      setError(null);
    }
  }, [account]);

  const loadCredentials = async () => {
    if (!account || !account.startsWith('0x')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const contract = getCredentialManagerContractReadOnly();
      const credentialIds = await contract.getCredentialsBySubject(account);

      const credentialPromises = credentialIds.map(async (credentialId) => {
        const credential = await contract.getCredential(credentialId);
        return {
          credentialId: credentialId,
          issuer: credential.issuer,
          subject: credential.subject,
          ipfsHash: credential.ipfsHash,
          isRevoked: credential.isRevoked,
          issuedAt: new Date(Number(credential.issuedAt) * 1000),
          revokedAt: credential.revokedAt > 0 
            ? new Date(Number(credential.revokedAt) * 1000) 
            : null,
        };
      });

      const credentialData = await Promise.all(credentialPromises);
      setCredentials(credentialData);
    } catch (error) {
      console.error('Error loading credentials:', error);
      setError(`Failed to load credentials: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return date.toLocaleString();
  };

  const getIPFSLink = (ipfsHash) => {
    return `https://ipfs.io/ipfs/${ipfsHash}`;
  };

  if (loading) {
    return (
      <div className="card">
        <h2>My Credentials</h2>
        <div className="loading">Loading credentials...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <h2>My Credentials</h2>
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>My Credentials</h2>
      <p style={{ marginBottom: '20px', color: '#666' }}>
        View all credentials issued to your address. Documents are stored on IPFS.
      </p>

      {credentials.length === 0 ? (
        <div className="empty-state">
          <p>No credentials found.</p>
          <p style={{ fontSize: '0.9rem', marginTop: '10px' }}>
            Credentials will appear here once an issuer issues them to your address.
          </p>
        </div>
      ) : (
        <div className="credential-list">
          {credentials.map((credential, index) => (
            <div
              key={index}
              className={`credential-item ${credential.isRevoked ? 'revoked' : ''}`}
            >
              <div className="credential-header">
                <div>
                  <div className="credential-id">
                    ID: {credential.credentialId.substring(0, 20)}...
                  </div>
                </div>
                <div
                  className={`credential-status ${
                    credential.isRevoked ? 'status-revoked' : 'status-active'
                  }`}
                >
                  {credential.isRevoked ? 'Revoked' : 'Active'}
                </div>
              </div>

              <div className="credential-details">
                <div className="credential-detail">
                  <strong>Issuer</strong>
                  <span>{formatAddress(credential.issuer)}</span>
                </div>
                <div className="credential-detail">
                  <strong>Subject</strong>
                  <span>{formatAddress(credential.subject)}</span>
                </div>
                <div className="credential-detail">
                  <strong>IPFS Hash</strong>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                    {credential.ipfsHash}
                  </span>
                </div>
                <div className="credential-detail">
                  <strong>Issued At</strong>
                  <span>{formatDate(credential.issuedAt)}</span>
                </div>
                {credential.revokedAt && (
                  <div className="credential-detail">
                    <strong>Revoked At</strong>
                    <span>{formatDate(credential.revokedAt)}</span>
                  </div>
                )}
              </div>

              <div style={{ marginTop: '15px' }}>
                <a
                  href={getIPFSLink(credential.ipfsHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                  style={{ textDecoration: 'none', display: 'inline-block' }}
                >
                  View on IPFS
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        className="btn btn-primary"
        onClick={loadCredentials}
        style={{ marginTop: '20px' }}
      >
        Refresh
      </button>
    </div>
  );
};

export default CredentialManagement;

