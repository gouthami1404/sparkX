# Troubleshooting Guide - Credentials Not Showing

## 🔍 Problem: Credentials Issued But Not Visible

**Symptoms:**
- Transaction succeeds (status: 1)
- Credential issued successfully
- But "Issuer Dashboard" shows "No credentials found"
- Console shows: "Empty result for all address formats"

## 🎯 Root Cause

The credential **WAS stored** (transaction succeeded), but we can't query it back. This usually means:

1. **Contract/ABI Mismatch**: The deployed contract doesn't match the ABI we're using
2. **Address Format Issue**: Contract stores address in one format, we query with another
3. **Contract Not Deployed**: The contract address in `contractAddresses.json` is wrong

## ✅ Solution Steps

### Step 1: Verify Contract Deployment

1. **Check Hardhat Node Terminal**
   - Look for deployment output
   - Should see: `CredentialManager deployed to: 0x...`

2. **Check Contract Address File**
   - File: `frontend/src/contractAddresses.json`
   - Should have: `"CredentialManager": "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"`

3. **Verify in Browser Console**
   - Open console (F12)
   - Go to "Issuer Dashboard"
   - Look for: `Contract address: 0x...`
   - Look for: `✅ Contract code found at address`

### Step 2: Re-deploy Contracts (Recommended)

If contracts might be outdated:

```bash
# Stop Hardhat node (Ctrl+C)
# Restart Hardhat node
npm run node

# In another terminal, redeploy
npm run deploy
```

This ensures:
- Contracts are freshly deployed
- ABI matches the deployed code
- Addresses are updated

### Step 3: Check Transaction Details

1. **In Hardhat Node Terminal**
   - Look for the transaction that issued the credential
   - Find the `from` address (this is `msg.sender` in the contract)
   - Note the exact format (lowercase, checksummed, etc.)

2. **Compare with Your Account**
   - Your MetaMask account: `0x976ea740...` (lowercase)
   - Normalized: `0x976EA740...` (checksummed)
   - Contract stored: `msg.sender` (from transaction)

### Step 4: Query Using Transaction Address

The contract stores `msg.sender` which is the address that **signed the transaction**. This might differ from:
- Your MetaMask display address
- The normalized address we use

**Workaround**: Query using the address from the transaction receipt.

## 🔧 Quick Fix: Re-deploy and Re-issue

**Fastest solution:**

1. **Stop everything**
   ```bash
   # Stop Hardhat node (Ctrl+C in terminal 1)
   # Stop frontend (Ctrl+C in terminal 3)
   ```

2. **Restart Hardhat node**
   ```bash
   npm run node
   ```

3. **Redeploy contracts**
   ```bash
   npm run deploy
   ```

4. **Restart frontend**
   ```bash
   npm run dev
   ```

5. **Issue a NEW credential**
   - Old credentials won't work (different contract instance)
   - Issue a fresh credential
   - Should now appear in Issuer Dashboard

## 🐛 Debugging Commands

### Check Contract Address
```javascript
// In browser console
import { CONTRACT_ADDRESSES } from './config'
console.log('CredentialManager:', CONTRACT_ADDRESSES.CredentialManager)
```

### Check Contract Code
```javascript
// In browser console (after connecting wallet)
const provider = new ethers.BrowserProvider(window.ethereum)
const code = await provider.getCode('0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512')
console.log('Contract code length:', code.length)
// Should be > 1000 (contract has code)
```

### Query Credential Directly
```javascript
// In browser console
const contract = getCredentialManagerContractReadOnly()
const credentialId = '0x2ca5e4ec6e2f3dff46dc7e4bb1d0ef505c900be2ff39d68fa25c2c0c5645550a' // Your credential ID
const cred = await contract.getCredential(credentialId)
console.log('Credential:', cred)
console.log('Stored issuer:', cred.issuer)
```

## 📋 Checklist

- [ ] Hardhat node is running
- [ ] Contracts are deployed (`npm run deploy`)
- [ ] `contractAddresses.json` has correct addresses
- [ ] Contract code exists at address (check console)
- [ ] Using same network (Chain ID: 1337)
- [ ] Connected with correct account
- [ ] Issued credential AFTER last deployment

## 💡 Prevention

**Always:**
1. Deploy contracts FIRST before issuing credentials
2. Check console for "Contract code found" message
3. Issue test credential and verify it appears
4. If contracts are redeployed, issue new credentials (old ones won't work)

## 🆘 Still Not Working?

1. **Check Hardhat Node Logs**
   - Look for errors
   - Check if transactions are being mined

2. **Verify Network**
   - MetaMask: Hardhat Local (Chain ID: 1337)
   - RPC URL: `http://127.0.0.1:8545`

3. **Clear and Restart**
   - Clear browser cache
   - Restart Hardhat node
   - Redeploy contracts
   - Refresh browser

4. **Check Contract ABI**
   - File: `frontend/src/utils/web3.js`
   - Should have all functions from `CredentialManager.sol`

---

**Most Common Fix**: Re-deploy contracts and issue a new credential. Old credentials from previous deployments won't work with new contract instances.

