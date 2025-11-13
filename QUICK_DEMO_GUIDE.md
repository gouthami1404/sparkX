# Quick Demo Guide - NexID

## ⚡ Fast 5-Minute Demo Script

### Setup (Before Presentation)
```bash
# Terminal 1: Start Hardhat
npm run node

# Terminal 2: Deploy (if not done)
npm run deploy

# Terminal 3: Start Frontend
npm run frontend
```

### Demo Flow (5 minutes)

#### 1. Introduction (30 sec)
"NexID - Decentralized Identity & Credential Vault. Let me show you how it works."

#### 2. Connect & Register DID (1 min)
- Click "Connect Wallet"
- Go to "My Identity"
- Register DID: `did:ethr:0x[your-address]`
- Show transaction confirmation

#### 3. Issue Credential (1.5 min)
- Switch to issuer account
- Go to "Issuer Dashboard"
- Enter subject address
- Upload document
- Issue credential
- Show IPFS hash

#### 4. View Credential (30 sec)
- Switch back to subject account
- Go to "My Credentials"
- Show credential details
- Click "View on IPFS"

#### 5. Selective Disclosure (1.5 min)
- Go to "Selective Disclosure"
- Select credential
- Choose fields (name, graduation year)
- Generate proof
- Show proof hash and JSON
- Verify proof (show verification result)

#### 6. Wrap Up (30 sec)
"Users control their identity, documents on IPFS, selective disclosure for privacy. Questions?"

---

## 🎯 Key Points to Emphasize

1. **Self-Sovereign:** "Users own their identity"
2. **Decentralized:** "No central server, documents on IPFS"
3. **Privacy:** "Selective disclosure - share only what's needed"
4. **Verifiable:** "On-chain verification, can't be faked"
5. **Revocable:** "Issuers can revoke when needed"

---

## 🚨 If Something Breaks

**If transaction fails:**
- "This is a demo environment, but in production..."
- Show the UI/flow anyway
- Explain what would happen

**If IPFS is slow:**
- "IPFS uses public API, in production we'd use our own node"
- Show mock hash if needed

**If MetaMask doesn't connect:**
- Have screenshots ready
- Explain the flow verbally

---

## 📝 One-Liner Summary

"NexID is a decentralized identity system where users control their credentials, documents are stored on IPFS, and selective disclosure allows privacy-preserving verification."

Good luck! 🎉

