# NexID - Complete Workflow Guide

## 📋 Step-by-Step Workflow

### **Setup (One Time Only)**

1. **Start Hardhat Node** (Terminal 1)
   ```bash
   npm run node
   ```
   - Keep this running
   - Copy one test account address (e.g., `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`)

2. **Deploy Contracts** (Terminal 2)
   ```bash
   npm run deploy
   ```
   - Wait for deployment to complete
   - Contract addresses are saved automatically

3. **Start Frontend** (Terminal 3)
   ```bash
   npm run dev
   ```
   - Browser opens at `http://localhost:3000`

---

## 🔄 Complete Workflow: Issue & View Credentials

### **Step 1: Connect as ISSUER (Person who issues credentials)**

1. **Open MetaMask**
   - Make sure you're on Hardhat Local network (Chain ID: 1337)
   - Import the test account from Hardhat node output
   - Example: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`

2. **Connect Wallet in NexID**
   - Click "Connect Wallet" on landing page
   - Approve in MetaMask

3. **Issue a Credential**
   - Go to **"Issue Document"** tab
   - Enter **Recipient Address** (the person receiving the credential)
     - Example: `0x976EA74026E726554dB657fA54763abd0C3a0aa9`
   - Enter Document Name (optional)
   - Select a file to upload
   - Click **"Issue Credential"**
   - Approve transaction in MetaMask
   - Wait for success message

4. **Verify It Was Issued**
   - Go to **"Issuer Dashboard"** tab
   - You should see the credential you just issued
   - Shows: Recipient address, Issue date, IPFS hash

---

### **Step 2: Connect as RECIPIENT (Person who received credential)**

1. **Switch Account in MetaMask**
   - Click MetaMask extension
   - Click account dropdown (top)
   - Select the recipient account
   - OR import the recipient account if you don't have it
     - Example: `0x976EA74026E726554dB657fA54763abd0C3a0aa9`

2. **Refresh NexID Page**
   - The page should automatically detect the new account
   - OR click "Disconnect" and "Connect Wallet" again

3. **View Your Documents**
   - Go to **"My Documents"** tab
   - Click **"Refresh"** button
   - You should see the credential issued to you
   - Shows: Issuer address, Issue date, IPFS hash

4. **View Document**
   - Click **"View"** button on the credential
   - Opens the document from IPFS

---

## 🎯 Quick Test Workflow

### **Test with 2 Accounts:**

**Account 1 (Issuer):**
- Address: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
- Action: Issue credential TO Account 2

**Account 2 (Recipient):**
- Address: `0x976EA74026E726554dB657fA54763abd0C3a0aa9`
- Action: View credential in "My Documents"

---

## 🔍 Troubleshooting

### **Issue: "No credentials found"**

**Check 1: Are you using the correct account?**
- Issuer Dashboard: Must be connected with the account that ISSUED the credential
- My Documents: Must be connected with the account that RECEIVED the credential

**Check 2: Was the transaction successful?**
- Open browser console (F12)
- Look for: "Transaction receipt status: 1"
- Look for: "✅ Credential verified on-chain"

**Check 3: Address format**
- Make sure you're using the EXACT address
- Copy-paste the address (don't type it)
- Check console logs for address normalization

**Check 4: Wait for transaction**
- After issuing, wait 2-3 seconds
- Click "Refresh" button in My Documents
- Hardhat network is instant, but UI might need refresh

---

## 📝 Console Logs to Check

### **When Issuing:**
```
✅ Transaction receipt status: 1
✅ Credential verified on-chain
✅ Credentials for subject: 1 [credentialId]
```

### **When Viewing (My Documents):**
```
Loading credentials for subject (normalized): 0x976E...
Contract call result (normalized): [array with credential IDs]
Found credential IDs (normalized): 1 [credentialId]
```

### **When Viewing (Issuer Dashboard):**
```
Loading credentials issued by (normalized): 0xf39F...
Found credential IDs (normalized): 1 [credentialId]
```

---

## 🚨 Common Mistakes

1. **Wrong Account**
   - ❌ Issuing with Account A, then checking My Documents with Account A
   - ✅ Issue with Account A, check My Documents with Account B

2. **Wrong Address Format**
   - ❌ Using lowercase when it should be checksummed
   - ✅ Copy-paste the exact address from MetaMask

3. **Not Refreshing**
   - ❌ Expecting credentials to appear automatically
   - ✅ Click "Refresh" button after switching accounts

4. **Transaction Not Confirmed**
   - ❌ Closing MetaMask before transaction completes
   - ✅ Wait for "Transaction confirmed" message

---

## ✅ Success Checklist

**After Issuing:**
- [ ] Transaction receipt status = 1
- [ ] Success message appears
- [ ] Credential appears in "Issuer Dashboard"
- [ ] Console shows "Credential verified on-chain"

**After Switching to Recipient:**
- [ ] Connected with recipient account
- [ ] Clicked "Refresh" in "My Documents"
- [ ] Credential appears in the list
- [ ] Can click "View" to see document

---

## 🎓 Understanding the Flow

```
ISSUER (Account A)
  ↓
  Issues credential TO → Account B
  ↓
  Credential stored on blockchain
  ↓
RECIPIENT (Account B)
  ↓
  Connects with Account B
  ↓
  Views credential in "My Documents"
```

**Key Points:**
- Issuer sees credentials in **"Issuer Dashboard"** (credentials they issued)
- Recipient sees credentials in **"My Documents"** (credentials issued to them)
- Both use the SAME blockchain, just different views based on account

---

## 💡 Pro Tips

1. **Use Browser Console**
   - Always check console (F12) for detailed logs
   - Look for ✅ checkmarks = success
   - Look for ⚠️ warnings = might need attention

2. **Test with Known Addresses**
   - Use addresses from Hardhat node output
   - Copy-paste to avoid typos

3. **Refresh After Actions**
   - After issuing: Check "Issuer Dashboard"
   - After switching account: Click "Refresh" in "My Documents"

4. **Verify Transaction**
   - Check Hardhat node terminal for transaction logs
   - Should see "CredentialIssued" event

---

## 🆘 Still Not Working?

1. **Check Hardhat Node**
   - Is it still running?
   - Are there any errors in the terminal?

2. **Check Contract Addresses**
   - File: `frontend/src/contractAddresses.json`
   - Should have DIDRegistry and CredentialManager addresses

3. **Check Network**
   - MetaMask: Hardhat Local (Chain ID: 1337)
   - RPC URL: `http://127.0.0.1:8545`

4. **Clear and Retry**
   - Refresh browser (Ctrl+R)
   - Disconnect and reconnect MetaMask
   - Try issuing a new credential

---

**Need more help? Check the console logs and share what you see!**

