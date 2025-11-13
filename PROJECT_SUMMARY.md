# PixelGenesis - Project Summary

## Overview

PixelGenesis is a complete decentralized web application for managing digital identity and verifiable credentials. It provides users with self-sovereign control over their identity and documents using Ethereum smart contracts and IPFS.

## Architecture

### Smart Contracts (Solidity)

1. **DIDRegistry.sol**
   - Manages Decentralized Identifiers (DIDs)
   - Functions: `registerDID()`, `updateDID()`, `getDID()`, `hasDID()`
   - One DID per Ethereum address
   - Events: `DIDRegistered`, `DIDUpdated`

2. **CredentialManager.sol**
   - Manages Verifiable Credentials (VCs)
   - Functions: `issueCredential()`, `revokeCredential()`, `getCredential()`, `verifyCredential()`
   - Tracks credentials by subject and issuer
   - Events: `CredentialIssued`, `CredentialRevoked`

### Frontend (React)

**Main Components:**
- `App.js` - Main application with tab navigation
- `DIDManagement.js` - Register and manage DIDs
- `CredentialManagement.js` - View user's credentials
- `IssuerDashboard.js` - Issue and revoke credentials
- `SelectiveDisclosure.js` - Generate and verify selective disclosure proofs

**Utilities:**
- `web3.js` - MetaMask integration, contract interactions
- `ipfs.js` - IPFS file upload and retrieval
- `config.js` - Contract addresses and configuration

## Key Features

### ✅ Implemented Features

1. **Wallet Connection**
   - MetaMask integration
   - Automatic network switching
   - Account change detection

2. **DID Management**
   - Register DID linked to Ethereum address
   - Update existing DID
   - View registered DID

3. **Credential Issuance**
   - Upload documents to IPFS
   - Issue credentials on-chain
   - Track credentials by issuer and subject

4. **Credential Viewing**
   - List all user credentials
   - View credential details
   - Check revocation status
   - Access IPFS documents

5. **Credential Revocation**
   - Issuer can revoke credentials
   - Revoked status visible on-chain
   - Timestamp tracking

6. **Selective Disclosure**
   - Generate proofs with selected fields only
   - Store proofs on IPFS
   - Verify proofs against on-chain credentials
   - Privacy-preserving credential sharing

## Technology Stack

- **Smart Contracts**: Solidity ^0.8.20
- **Development Framework**: Hardhat
- **Frontend**: React 18
- **Web3 Library**: ethers.js v6
- **Storage**: IPFS (via HTTP API)
- **Wallet**: MetaMask
- **Network**: Hardhat Local (Chain ID: 31337)

## Project Structure

```
pixelgenesis/
├── contracts/                    # Solidity smart contracts
│   ├── DIDRegistry.sol
│   └── CredentialManager.sol
├── scripts/                      # Deployment and utility scripts
│   ├── deploy.js
│   └── verify-setup.js
├── test/                         # Hardhat test suite
│   ├── DIDRegistry.test.js
│   └── CredentialManager.test.js
├── frontend/                     # React frontend application
│   ├── public/
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── DIDManagement.js
│   │   │   ├── CredentialManagement.js
│   │   │   ├── IssuerDashboard.js
│   │   │   └── SelectiveDisclosure.js
│   │   ├── utils/               # Utility functions
│   │   │   ├── web3.js
│   │   │   └── ipfs.js
│   │   ├── App.js
│   │   ├── config.js
│   │   └── contractAddresses.json
│   └── package.json
├── hardhat.config.js            # Hardhat configuration
├── package.json                 # Root package.json
├── README.md                    # Main documentation
├── SETUP.md                     # Detailed setup guide
└── PROJECT_SUMMARY.md           # This file
```

## Testing

Comprehensive test suite covering:
- DID registration and updates
- Credential issuance
- Credential revocation
- Access control (only issuer can revoke)
- Edge cases and error handling

Run tests with: `npm test`

## Deployment

1. Start Hardhat node: `npm run node`
2. Deploy contracts: `npm run deploy`
3. Start frontend: `npm run frontend`

Contract addresses are automatically saved to `frontend/src/contractAddresses.json`.

## Security Considerations

- Only contract owner can register/update their own DID
- Only issuer can revoke their credentials
- Documents stored on IPFS (off-chain)
- Only IPFS hashes stored on-chain
- Selective disclosure prevents full document exposure

## Future Enhancements

- Full W3C Verifiable Credentials compliance
- Zero-knowledge proofs for selective disclosure
- Document encryption before IPFS upload
- Multi-signature credential issuance
- Credential expiration dates
- Credential templates and schemas
- Verifier dashboard
- Mobile app support

## Demo Flow

1. **Setup**: Deploy contracts, start frontend
2. **User Registration**: Connect wallet, register DID
3. **Issuer**: Issue credential to user (upload doc to IPFS)
4. **User**: View credentials in "My Credentials"
5. **Selective Disclosure**: Generate proof with selected fields
6. **Verification**: Verify proof against on-chain credential
7. **Revocation**: Issuer revokes credential if needed

## Notes for Hackathon Demo

- All operations use local Hardhat network (no real ETH needed)
- IPFS uses public API (may have rate limits)
- Mock IPFS hashes generated if API unavailable (for demo)
- Clear error messages guide users
- UI is responsive and user-friendly
- Code is well-commented for explanation

## License

MIT

