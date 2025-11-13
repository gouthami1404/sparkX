# What's Next - Using NexID

Great! You've completed the setup. Now let's start using the app!

## ✅ Quick Checklist

Before proceeding, make sure:
- [ ] Hardhat node is running (`npm run node`)
- [ ] Contracts are deployed (`npm run deploy`)
- [ ] Frontend is running (`npm run frontend`)
- [ ] MetaMask is connected to Hardhat Local network
- [ ] You have a test account imported in MetaMask with ETH

## 🚀 Step-by-Step Usage Guide

### Step 1: Connect Your Wallet

1. Open the app in your browser (usually `http://localhost:3000`)
2. Click **"Connect Wallet"** button
3. Approve the connection in MetaMask
4. You should see your wallet address in the header

**Note:** If you see an error about contract addresses, make sure you ran `npm run deploy` and the addresses are saved in `frontend/src/contractAddresses.json`

### Step 2: Register Your DID (Decentralized Identifier)

1. Go to the **"My Identity"** tab
2. You'll see your wallet address (this is your base identity)
3. Enter a DID in the format: `did:ethr:0x...` (you can use your wallet address)
   - Example: `did:ethr:0x5FbDB2315678afecb367f032d93F642f64180aa3`
4. Click **"Register DID"**
5. Approve the transaction in MetaMask
6. Wait for confirmation - you should see "DID registered successfully!"

### Step 3: Issue a Credential (As Issuer)

1. Go to the **"Issuer Dashboard"** tab
2. Fill in the form:
   - **Subject Address:** Enter another test account address (or your own for testing)
   - **Credential Name:** e.g., "Degree Certificate", "Aadhaar Card", etc.
   - **Document File:** Click to select a file (PDF, image, or any document)
3. Click **"Issue Credential"**
4. The app will:
   - Upload your file to IPFS
   - Issue the credential on-chain
   - Show you the transaction hash
5. Approve transactions in MetaMask (upload + issue)

**Tip:** For testing, you can issue a credential to your own address!

### Step 4: View Your Credentials

1. Go to the **"My Credentials"** tab
2. You'll see all credentials issued to your address
3. Each credential shows:
   - Credential ID
   - Issuer address
   - IPFS hash (where document is stored)
   - Issue date
   - Revocation status
4. Click **"View on IPFS"** to see the actual document

### Step 5: Generate Selective Disclosure Proof

1. Go to the **"Selective Disclosure"** tab
2. Select a credential from the dropdown
3. Check the fields you want to disclose (e.g., name, graduation year)
4. Click **"Generate Selective Disclosure Proof"**
5. The app will:
   - Create a proof with only selected fields
   - Upload it to IPFS
   - Show you the proof hash
6. Share this proof hash with verifiers instead of the full document!

### Step 6: Verify a Proof (As Verifier)

1. Still in the **"Selective Disclosure"** tab
2. Scroll to the **"Verify Selective Disclosure Proof"** section
3. Enter:
   - **Credential ID:** The credential ID you want to verify
   - **Proof IPFS Hash:** The proof hash shared with you
4. Click **"Verify Proof"**
5. The app will check:
   - Credential exists on-chain
   - Credential is not revoked
   - Proof data matches on-chain credential
6. View the disclosed fields without seeing the full document!

### Step 7: Revoke a Credential (As Issuer)

1. Go back to **"Issuer Dashboard"**
2. Scroll to **"Issued Credentials"** section
3. Find a credential you issued
4. Click **"Revoke"** button
5. Confirm in MetaMask
6. The credential will be marked as revoked on-chain

## 🎯 Demo Flow for Hackathon

Here's a complete demo flow you can follow:

### Scenario: University Issues Degree Certificate

1. **Setup:**
   - Account 1: University (Issuer)
   - Account 2: Student (Subject)

2. **Student registers DID:**
   - Switch to Account 2 in MetaMask
   - Register DID: `did:ethr:<student-address>`

3. **University issues credential:**
   - Switch to Account 1 in MetaMask
   - Go to Issuer Dashboard
   - Issue credential to Account 2
   - Upload degree certificate PDF

4. **Student views credential:**
   - Switch to Account 2
   - Go to My Credentials
   - View the issued credential

5. **Student creates selective disclosure:**
   - Switch to Account 2
   - Go to Selective Disclosure
   - Select the degree credential
   - Choose fields: name, graduation year, degree
   - Generate proof

6. **Employer verifies proof:**
   - Use the Verify section
   - Enter credential ID and proof hash
   - Verify without seeing full document

7. **University revokes (if needed):**
   - Switch to Account 1
   - Revoke the credential
   - Verify it shows as revoked

## 🔧 Troubleshooting

### "Contract address not set" Error
- Make sure you ran `npm run deploy`
- Check `frontend/src/contractAddresses.json` has addresses

### "Failed to connect wallet" Error
- Make sure MetaMask is on Hardhat Local network
- Check Chain ID is 1337 (or 31337 if you set it up that way)
- Try refreshing the page

### IPFS Upload Fails
- The app will use mock hashes if IPFS is unavailable
- For production, set up your own IPFS node

### Transaction Fails
- Make sure you have ETH in your account (Hardhat gives 10000 ETH)
- Check Hardhat node is still running
- Try increasing gas limit in MetaMask

## 📝 Next Steps for Production

1. **Set up your own IPFS node** (or use Pinata)
2. **Add document encryption** before IPFS upload
3. **Deploy to testnet** (Goerli, Sepolia) for testing
4. **Add more credential types** and schemas
5. **Implement zero-knowledge proofs** for better privacy
6. **Add credential expiration** dates
7. **Create verifier dashboard** for organizations

## 🎉 You're Ready!

Start with Step 1 and work through the features. The app is fully functional and ready for your hackathon demo!

Good luck! 🚀

