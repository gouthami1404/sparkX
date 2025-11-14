import React, { useState, useEffect } from 'react';
import {
  getCredentialManagerContract,
  getCredentialManagerContractReadOnly,
} from '../utils/web3';
import { ethers } from 'ethers';
import { uploadToIPFS } from '../utils/ipfs';

const IssuerDashboard = ({ account }) => {
  const [issuedCredentials, setIssuedCredentials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCredentials, setLoadingCredentials] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  // Form state for issuing new credential
  const [subjectAddress, setSubjectAddress] = useState('');
  const [credentialName, setCredentialName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    if (account && account.startsWith('0x') && account.length === 42) {
      loadIssuedCredentials();
    } else {
      setIssuedCredentials([]);
      setLoadingCredentials(false);
      setError(null);
    }
  }, [account]);

  const loadIssuedCredentials = async () => {
    if (!account || !account.startsWith('0x')) {
      return;
    }

    setLoadingCredentials(true);
    setError(null);

    try {
      const contract = getCredentialManagerContractReadOnly();
      
      // Check if contract address is set and valid
      const contractAddress = contract.target || contract.address;
      if (!contractAddress || contractAddress === '0x' || contractAddress === '') {
        console.warn('Contract address not configured');
        setIssuedCredentials([]);
        return;
      }

      let credentialIds = [];
      try {
        credentialIds = await contract.getCredentialsByIssuer(account);
      } catch (callError) {
        // If the call fails with empty result, it might mean no credentials yet
        if (callError.message && callError.message.includes('value="0x"')) {
          console.log('No credentials issued yet');
          setIssuedCredentials([]);
          return;
        }
        throw callError;
      }

      // Handle empty array
      if (!credentialIds || credentialIds.length === 0) {
        setIssuedCredentials([]);
        return;
      }

      const credentialPromises = credentialIds.map(async (credentialId) => {
        try {
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
        } catch (err) {
          console.error(`Error loading credential ${credentialId}:`, err);
          return null; // Return null for failed credentials
        }
      });

      const credentialData = await Promise.all(credentialPromises);
      // Filter out null values (failed credential loads)
      const validCredentials = credentialData.filter(cred => cred !== null);
      setIssuedCredentials(validCredentials);
    } catch (error) {
      console.error('Error loading issued credentials:', error);
      // Don't show error if it's just "no credentials" case
      if (error.message && !error.message.includes('value="0x"')) {
        setError(`Failed to load credentials: ${error.message}`);
      } else {
        // Just set empty array for "no credentials" case
        setIssuedCredentials([]);
      }
    } finally {
      setLoadingCredentials(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Auto-generate credential name from file name if not set
      if (!credentialName) {
        setCredentialName(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleIssueCredential = async (e) => {
    e.preventDefault();

    if (!subjectAddress.trim()) {
      setMessage({ type: 'error', text: 'Subject address is required' });
      return;
    }

    if (!ethers.isAddress(subjectAddress)) {
      setMessage({ type: 'error', text: 'Invalid Ethereum address' });
      return;
    }

    if (!selectedFile) {
      setMessage({ type: 'error', text: 'Please select a file to upload' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // Step 1: Upload file to IPFS
      setMessage({ type: 'info', text: 'Uploading file to IPFS...' });
      const ipfsHash = await uploadToIPFS(selectedFile);
      console.log('File uploaded to IPFS:', ipfsHash);

      // Step 2: Generate credential ID (hash of issuer + subject + timestamp + file name)
      const credentialIdData = `${account}${subjectAddress}${Date.now()}${credentialName}`;
      const credentialId = ethers.id(credentialIdData);

      // Step 3: Issue credential on-chain
      setMessage({ type: 'info', text: 'Issuing credential on blockchain...' });
      const contract = await getCredentialManagerContract();
      const tx = await contract.issueCredential(
        subjectAddress,
        ipfsHash,
        credentialId
      );
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);

      setMessage({ 
        type: 'success', 
        text: `Credential issued successfully! Transaction: ${tx.hash}` 
      });

      // Reset form
      setSubjectAddress('');
      setCredentialName('');
      setSelectedFile(null);
      const fileInput = document.getElementById('file-input');
      if (fileInput) {
        fileInput.value = '';
      }

      // Wait a bit for the blockchain state to update, then reload credentials
      setTimeout(async () => {
        try {
          await loadIssuedCredentials();
        } catch (reloadError) {
          console.error('Error reloading credentials after issue:', reloadError);
          // Don't show error to user, just log it
        }
      }, 2000); // Wait 2 seconds for state to update
    } catch (error) {
      console.error('Error issuing credential:', error);
      setMessage({ 
        type: 'error', 
        text: `Failed to issue credential: ${error.message}` 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (credentialId) => {
    if (!window.confirm('Are you sure you want to revoke this credential?')) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const contract = await getCredentialManagerContract();
      const tx = await contract.revokeCredential(credentialId);
      await tx.wait();

      setMessage({ 
        type: 'success', 
        text: `Credential revoked successfully! Transaction: ${tx.hash}` 
      });

      // Reload credentials
      await loadIssuedCredentials();
    } catch (error) {
      console.error('Error revoking credential:', error);
      setMessage({ 
        type: 'error', 
        text: `Failed to revoke credential: ${error.message}` 
      });
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

  return (
    <div>
      <div className="card">
        <h2>Issue New Credential</h2>

        {message && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleIssueCredential}>
          <div className="form-group">
            <label>Subject Address (Recipient)</label>
            <input
              type="text"
              placeholder="0x..."
              value={subjectAddress}
              onChange={(e) => setSubjectAddress(e.target.value)}
              required
            />
            <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
              The Ethereum address of the user who will receive this credential
            </small>
          </div>

          <div className="form-group">
            <label>Credential Name</label>
            <input
              type="text"
              placeholder="e.g., Degree Certificate, Aadhaar Card, etc."
              value={credentialName}
              onChange={(e) => setCredentialName(e.target.value)}
            />
            <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
              Optional: A name to identify this credential
            </small>
          </div>

          <div className="form-group">
            <label>Document File</label>
            <div className="file-upload">
              <input
                id="file-input"
                type="file"
                onChange={handleFileSelect}
                required
              />
              <label htmlFor="file-input" style={{ cursor: 'pointer' }}>
                {selectedFile ? (
                  <span>Selected: {selectedFile.name}</span>
                ) : (
                  <span>Click to select file or drag and drop</span>
                )}
              </label>
            </div>
            <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
              The document will be uploaded to IPFS. Only the hash will be stored on-chain.
            </small>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Issuing...' : 'Issue Credential'}
          </button>
        </form>
      </div>

      <div className="card">
        <h2>Issued Credentials</h2>
        <p style={{ marginBottom: '20px', color: '#666' }}>
          Manage credentials you have issued. You can revoke them if needed.
        </p>

        {loadingCredentials ? (
          <div className="loading">Loading credentials...</div>
        ) : issuedCredentials.length === 0 ? (
          <div className="empty-state">
            <p>No credentials issued yet.</p>
            <p style={{ fontSize: '0.9rem', marginTop: '10px' }}>
              Issue a credential using the form above.
            </p>
          </div>
        ) : (
          <div className="credential-list">
            {issuedCredentials.map((credential, index) => (
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

                <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                  <a
                    href={getIPFSLink(credential.ipfsHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                    style={{ textDecoration: 'none', display: 'inline-block' }}
                  >
                    View on IPFS
                  </a>
                  {!credential.isRevoked && (
                    <button
                      className="btn btn-danger"
                      onClick={() => handleRevoke(credential.credentialId)}
                      disabled={loading}
                    >
                      Revoke
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          className="btn btn-primary"
          onClick={loadIssuedCredentials}
          style={{ marginTop: '20px' }}
          disabled={loadingCredentials}
        >
          Refresh
        </button>
      </div>
    </div>
  );
};

export default IssuerDashboard;

