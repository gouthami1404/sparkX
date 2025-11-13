# PixelGenesis: Decentralized Digital Identity & Credential Vault

A decentralized web application that gives users self-sovereign control over their identity and documents using Ethereum smart contracts and IPFS.

## Features

- **DID Registry**: Register and manage Decentralized Identifiers (DIDs) on Ethereum
- **Verifiable Credentials**: Issue, store, and manage credentials with IPFS document storage
- **Selective Disclosure**: Share minimal credential information without exposing full documents
- **Revocation**: Issuers can revoke credentials when needed
- **IPFS Integration**: Documents stored on IPFS, only hashes stored on-chain

## Project Structure

```
pixelgenesis/
├── contracts/          # Solidity smart contracts
├── scripts/           # Deployment scripts
├── test/              # Hardhat tests
├── frontend/          # React frontend application
└── hardhat.config.js  # Hardhat configuration
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm run install-all
```

### 2. Start Local Hardhat Network

In one terminal:
```bash
npm run node
```

This will start a local Hardhat node and provide test accounts with ETH.

### 3. Deploy Contracts

In another terminal:
```bash
npm run deploy
```

Copy the deployed contract addresses and update `frontend/src/config.js` with them.

### 4. Start Frontend

```bash
npm run frontend
```

The app will open at `http://localhost:3000`

## Usage

1. **Connect MetaMask**: 
   - Add Hardhat network (localhost:8545, Chain ID: 1337)
   - Import one of the test accounts from Hardhat node output
   
2. **Register DID**: Connect wallet and register your DID

3. **Issue Credentials**: As an issuer, upload documents to IPFS and issue credentials

4. **View Credentials**: View all your credentials and their status

5. **Selective Disclosure**: Generate proof objects with minimal information

6. **Revoke Credentials**: Issuers can revoke credentials when needed

## Tech Stack

- **Smart Contracts**: Solidity ^0.8.20
- **Development**: Hardhat
- **Frontend**: React + ethers.js
- **Storage**: IPFS (via IPFS HTTP API)
- **Wallet**: MetaMask

## License

MIT

