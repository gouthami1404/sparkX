import React, { useState, useEffect } from 'react';
import {
  getCredentialManagerContractReadOnly,
} from '../utils/web3';
import { ethers } from 'ethers';
import { uploadJSONToIPFS, fetchJSONFromIPFS } from '../utils/ipfs';

const SelectiveDisclosure = ({ account }) => {
  const [credentials, setCredentials] = useState([]);
  const [selectedCredential, setSelectedCredential] = useState(null);
  const [disclosureFields, setDisclosureFields] = useState({});
  const [proofHash, setProofHash] = useState('');
  const [proofData, setProofData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingCredentials, setLoadingCredentials] = useState(true);
  const [message, setMessage] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);

  // Verification state
  const [verifyCredentialId, setVerifyCredentialId] = useState('');
  const [verifyProofHash, setVerifyProofHash] = useState('');

  useEffect(() => {
    if (account && account.startsWith('0x') && account.length === 42) {
      loadCredentials();
    } else {
      setCredentials([]);
      setLoadingCredentials(false);
    }
  }, [account]);

  const loadCredentials = async () => {
    if (!account || !account.startsWith('0x')) {
      return;
    }

    setLoadingCredentials(true);

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
        };
      });

      const credentialData = await Promise.all(credentialPromises);
      // Filter out revoked credentials
      setCredentials(credentialData.filter(c => !c.isRevoked));
    } catch (error) {
      console.error('Error loading credentials:', error);
      setMessage({ type: 'error', text: `Failed to load credentials: ${error.message}` });
    } finally {
      setLoadingCredentials(false);
    }
  };

  const handleCredentialSelect = async (credentialId) => {
    const credential = credentials.find(c => c.credentialId === credentialId);
    setSelectedCredential(credential);
    setDisclosureFields({});
    setProofHash('');
    setProofData(null);
    setMessage(null);

    // Try to fetch the credential document from IPFS to show available fields
    try {
      const document = await fetchJSONFromIPFS(credential.ipfsHash);
      // Pre-populate with some common fields if they exist
      const fields = {};
      if (document.name) fields.name = true;
      if (document.dateOfBirth) fields.dateOfBirth = true;
      if (document.graduationYear) fields.graduationYear = true;
      if (document.degree) fields.degree = true;
      if (document.institution) fields.institution = true;
      setDisclosureFields(fields);
    } catch (error) {
      console.log('Could not fetch credential document, using empty fields');
    }
  };

  const handleFieldToggle = (fieldName) => {
    setDisclosureFields(prev => ({
      ...prev,
      [fieldName]: !prev[fieldName]
    }));
  };

  const handleGenerateProof = async () => {
    if (!selectedCredential) {
      setMessage({ type: 'error', text: 'Please select a credential first' });
      return;
    }

    const selectedFields = Object.keys(disclosureFields).filter(
      key => disclosureFields[key]
    );

    if (selectedFields.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one field to disclose' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // Fetch the full credential document from IPFS
      let fullDocument = {};
      try {
        fullDocument = await fetchJSONFromIPFS(selectedCredential.ipfsHash);
      } catch (error) {
        console.log('Could not fetch full document, creating proof with minimal data');
      }

      // Create selective disclosure proof with only selected fields
      const proof = {
        credentialId: selectedCredential.credentialId,
        issuer: selectedCredential.issuer,
        subject: selectedCredential.subject,
        disclosedFields: {},
        timestamp: new Date().toISOString(),
        proofType: 'SelectiveDisclosure',
      };

      // Add only selected fields to the proof
      selectedFields.forEach(field => {
        if (fullDocument[field] !== undefined) {
          proof.disclosedFields[field] = fullDocument[field];
        } else {
          // If field not in document, add placeholder
          proof.disclosedFields[field] = '[Field exists but value not available]';
        }
      });

      // Upload proof to IPFS
      const ipfsHash = await uploadJSONToIPFS(proof);
      setProofHash(ipfsHash);
      setProofData(proof);
      setMessage({ 
        type: 'success', 
        text: `Selective disclosure proof generated! IPFS Hash: ${ipfsHash}` 
      });
    } catch (error) {
      console.error('Error generating proof:', error);
      setMessage({ 
        type: 'error', 
        text: `Failed to generate proof: ${error.message}` 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyProof = async () => {
    if (!verifyCredentialId.trim() || !verifyProofHash.trim()) {
      setMessage({ type: 'error', text: 'Please provide both credential ID and proof hash' });
      return;
    }

    setLoading(true);
    setMessage(null);
    setVerificationResult(null);

    try {
      // Step 1: Verify credential exists on-chain and is not revoked
      const contract = getCredentialManagerContractReadOnly();
      const isValid = await contract.verifyCredential(verifyCredentialId);
      
      if (!isValid) {
        setVerificationResult({
          valid: false,
          message: 'Credential does not exist or has been revoked',
        });
        return;
      }

      // Step 2: Get credential details from chain
      const credential = await contract.getCredential(verifyCredentialId);

      // Step 3: Fetch proof from IPFS
      const proof = await fetchJSONFromIPFS(verifyProofHash);

      // Step 4: Verify proof matches credential
      const credentialIdMatch = proof.credentialId === verifyCredentialId;
      const issuerMatch = proof.issuer.toLowerCase() === credential.issuer.toLowerCase();
      const subjectMatch = proof.subject.toLowerCase() === credential.subject.toLowerCase();

      if (credentialIdMatch && issuerMatch && subjectMatch) {
        setVerificationResult({
          valid: true,
          message: 'Proof is valid! Credential exists on-chain and proof data matches.',
          credential: {
            issuer: credential.issuer,
            subject: credential.subject,
            isRevoked: credential.isRevoked,
          },
          proof: proof,
        });
      } else {
        setVerificationResult({
          valid: false,
          message: 'Proof data does not match on-chain credential',
          details: {
            credentialIdMatch,
            issuerMatch,
            subjectMatch,
          },
        });
      }
    } catch (error) {
      console.error('Error verifying proof:', error);
      setVerificationResult({
        valid: false,
        message: `Verification failed: ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div>
      <div className="card">
        <h2>Generate Selective Disclosure Proof</h2>
        <p style={{ marginBottom: '20px', color: '#666' }}>
          Create a proof that discloses only selected fields from your credential,
          without revealing the full document.
        </p>

        {message && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}

        {loadingCredentials ? (
          <div className="loading">Loading credentials...</div>
        ) : credentials.length === 0 ? (
          <div className="empty-state">
            <p>No active credentials available for selective disclosure.</p>
          </div>
        ) : (
          <>
            <div className="form-group">
              <label>Select Credential</label>
              <select
                value={selectedCredential?.credentialId || ''}
                onChange={(e) => handleCredentialSelect(e.target.value)}
                style={{ padding: '12px', fontSize: '1rem', borderRadius: '8px', width: '100%' }}
              >
                <option value="">-- Select a credential --</option>
                {credentials.map((credential, index) => (
                  <option key={index} value={credential.credentialId}>
                    Credential {credential.credentialId.substring(0, 16)}... (Issued: {credential.issuedAt.toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>

            {selectedCredential && (
              <>
                <div className="form-group">
                  <label>Select Fields to Disclose</label>
                  <div style={{ marginTop: '10px' }}>
                    {['name', 'dateOfBirth', 'graduationYear', 'degree', 'institution', 'idNumber'].map(field => (
                      <label key={field} style={{ display: 'block', marginBottom: '10px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={disclosureFields[field] || false}
                          onChange={() => handleFieldToggle(field)}
                          style={{ marginRight: '8px' }}
                        />
                        {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
                      </label>
                    ))}
                  </div>
                  <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
                    Select the fields you want to include in the disclosure proof.
                    Only these fields will be visible to the verifier.
                  </small>
                </div>

                <button
                  className="btn btn-primary"
                  onClick={handleGenerateProof}
                  disabled={loading}
                >
                  {loading ? 'Generating...' : 'Generate Selective Disclosure Proof'}
                </button>

                {proofHash && (
                  <div className="proof-section">
                    <h3 style={{ marginBottom: '15px', color: '#667eea' }}>Proof Generated</h3>
                    <div className="form-group">
                      <label>Proof IPFS Hash</label>
                      <input
                        type="text"
                        value={proofHash}
                        readOnly
                        style={{ background: '#f0f0f0', fontFamily: 'monospace' }}
                      />
                      <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
                        Share this hash with verifiers. They can use it to verify your credential
                        without seeing the full document.
                      </small>
                    </div>

                    {proofData && (
                      <div>
                        <label>Proof Data (JSON)</label>
                        <div className="proof-json">
                          <pre>{JSON.stringify(proofData, null, 2)}</pre>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      <div className="card">
        <h2>Verify Selective Disclosure Proof</h2>
        <p style={{ marginBottom: '20px', color: '#666' }}>
          As a verifier, verify a selective disclosure proof by checking it against
          the on-chain credential.
        </p>

        <div className="form-group">
          <label>Credential ID</label>
          <input
            type="text"
            placeholder="0x..."
            value={verifyCredentialId}
            onChange={(e) => setVerifyCredentialId(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Proof IPFS Hash</label>
          <input
            type="text"
            placeholder="Qm..."
            value={verifyProofHash}
            onChange={(e) => setVerifyProofHash(e.target.value)}
          />
        </div>

        <button
          className="btn btn-primary"
          onClick={handleVerifyProof}
          disabled={loading}
        >
          {loading ? 'Verifying...' : 'Verify Proof'}
        </button>

        {verificationResult && (
          <div className="proof-section" style={{ marginTop: '20px' }}>
            <h3 style={{ marginBottom: '15px', color: '#667eea' }}>Verification Result</h3>
            <div className={`alert alert-${verificationResult.valid ? 'success' : 'error'}`}>
              <strong>{verificationResult.valid ? '✓ Valid' : '✗ Invalid'}</strong>
              <p style={{ marginTop: '10px' }}>{verificationResult.message}</p>
            </div>

            {verificationResult.valid && verificationResult.proof && (
              <div>
                <label>Disclosed Fields</label>
                <div className="proof-json">
                  <pre>{JSON.stringify(verificationResult.proof.disclosedFields, null, 2)}</pre>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectiveDisclosure;

