# NexID Setup Guide

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MetaMask browser extension
- Git

## Step-by-Step Setup

### 1. Install Dependencies

```bash
# Install root dependencies (Hardhat, etc.)
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

Or use the convenience script:
```bash
npm run install-all
```

### 2. Start Local Hardhat Network

Open a terminal and run:
```bash
npm run node
```

This will:
- Start a local Hardhat node on `http://127.0.0.1:8545`
- Display test accounts with private keys and ETH balances
- Keep running until you stop it (Ctrl+C)

**Important:** Keep this terminal open. You'll need these test accounts for MetaMask.

### 3. Configure MetaMask

1. Open MetaMask in your browser
2. Click the network dropdown (usually shows "Ethereum Mainnet")
3. Click "Add Network" → "Add a network manually"
4. Enter the following:
   - **Network Name:** Hardhat Local
   - **RPC URL:** http://127.0.0.1:8545
   - **Chain ID:** 1337
   - **Currency Symbol:** ETH
5. Click "Save"

6. Import a test account:
   - In MetaMask, click the account icon → "Import Account"
   - Copy a private key from the Hardhat node terminal output
   - Paste it and click "Import"
   - You should see the account with 10000 ETH

### 4. Deploy Smart Contracts

Open a **new terminal** (keep the Hardhat node running) and run:

```bash
npm run deploy
```

This will:
- Compile the contracts
- Deploy them to the local Hardhat network
- Display the contract addresses
- Save addresses to `frontend/src/contractAddresses.json`

**Note:** The contract addresses will be automatically saved. If you redeploy, make sure to update the frontend config.

### 5. Start the Frontend

In the same terminal (or a new one), run:

```bash
npm run frontend
```

Or:
```bash
cd frontend
npm start
```

The app will open at `http://localhost:3000`

### 6. Using the Application

1. **Connect Wallet:**
   - Click "Connect Wallet" in the app
   - Approve the connection in MetaMask
   - Make sure you're on the "Hardhat Local" network

2. **Register DID:**
   - Go to "My Identity" tab
   - Enter a DID (e.g., `did:ethr:0x...`)
   - Click "Register DID"

3. **Issue Credentials (as Issuer):**
   - Go to "Issuer Dashboard" tab
   - Enter a subject address (another test account)
   - Select a document file
   - Click "Issue Credential"
   - The file will be uploaded to IPFS and credential issued on-chain

4. **View Credentials:**
   - Go to "My Credentials" tab
   - See all credentials issued to your address
   - Click "View on IPFS" to see the document

5. **Selective Disclosure:**
   - Go to "Selective Disclosure" tab
   - Select a credential
   - Choose fields to disclose
   - Generate proof
   - Share the proof hash with verifiers

6. **Revoke Credentials:**
   - Go to "Issuer Dashboard"
   - Find a credential you issued
   - Click "Revoke" to revoke it

## Troubleshooting

### MetaMask Connection Issues

- Make sure MetaMask is on the correct network (Hardhat Local, Chain ID: 1337)
- Try refreshing the page
- Check that the Hardhat node is still running

### Contract Deployment Issues

- Ensure the Hardhat node is running before deploying
- Check that port 8545 is not in use by another application
- Try redeploying: `npm run deploy`

### IPFS Upload Issues

- The app uses public IPFS API which may have rate limits
- For production, set up your own IPFS node or use Pinata
- The app will use mock hashes if IPFS is unavailable (for demo purposes)

### Frontend Not Loading

- Check that all dependencies are installed: `cd frontend && npm install`
- Clear browser cache
- Check browser console for errors

## Testing

Run the Hardhat tests:

```bash
npm test
```

This will run all test cases for:
- DID Registry (registration, updates, retrieval)
- Credential Manager (issuance, revocation, verification)

## Project Structure

```
pixelgenesis/
├── contracts/              # Solidity smart contracts
│   ├── DIDRegistry.sol
│   └── CredentialManager.sol
├── scripts/                # Deployment scripts
│   └── deploy.js
├── test/                   # Hardhat tests
│   ├── DIDRegistry.test.js
│   └── CredentialManager.test.js
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── utils/          # Web3 and IPFS utilities
│   │   └── App.js          # Main app component
│   └── package.json
├── hardhat.config.js       # Hardhat configuration
└── package.json
```

## Next Steps

- Set up your own IPFS node for production
- Add encryption for sensitive documents
- Implement full W3C Verifiable Credentials standard
- Add more sophisticated selective disclosure (zero-knowledge proofs)
- Deploy to a testnet (Goerli, Sepolia) for testing

## Support

For issues or questions, check:
- Hardhat documentation: https://hardhat.org/docs
- ethers.js documentation: https://docs.ethers.org
- IPFS documentation: https://docs.ipfs.io

