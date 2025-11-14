# Quick Start Guide - NexID

## 🚀 Running the Application

### Step-by-Step Commands:

#### **Terminal 1: Start Hardhat Node**
```bash
npm run node
```
- Keep this terminal open
- You'll see test accounts with private keys
- Copy one account address for MetaMask

#### **Terminal 2: Deploy Contracts**
```bash
npm run deploy
```
- Wait for deployment to complete
- Contract addresses are saved automatically

#### **Terminal 3: Start Frontend**
```bash
npm run dev
```
- App opens at `http://localhost:3000`
- Connect MetaMask to use the app

---

## 📋 Complete Setup (First Time Only)

If you haven't installed dependencies yet:

```bash
# Install all dependencies (root + frontend)
npm run install-all
```

---

## 🔧 MetaMask Setup

1. **Add Network:**
   - Network Name: `Hardhat Local`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `1337`
   - Currency Symbol: `ETH`

2. **Import Test Account:**
   - Copy private key from Terminal 1 (Hardhat node output)
   - Import account in MetaMask

3. **Connect Wallet:**
   - Click "Connect Wallet" on the landing page
   - Approve connection in MetaMask

---

## ✅ Verify Everything is Running

- ✅ Terminal 1: Hardhat node running (showing accounts)
- ✅ Terminal 2: Contracts deployed (addresses shown)
- ✅ Terminal 3: Frontend running (browser opened)
- ✅ MetaMask: Connected to Hardhat Local network
- ✅ Browser: Landing page visible

---

## 🛑 Stopping the Application

1. Press `Ctrl + C` in each terminal to stop
2. Close browser tabs
3. Disconnect MetaMask (optional)

---

## 🐛 Troubleshooting

**Frontend not loading?**
- Make sure you ran `npm install` in the `frontend` folder
- Check if port 3000 is already in use

**MetaMask connection failed?**
- Make sure Hardhat node is running
- Verify network settings (Chain ID: 1337)
- Check RPC URL includes `http://`

**Contract errors?**
- Make sure contracts are deployed (`npm run deploy`)
- Verify contract addresses in `frontend/src/contractAddresses.json`

