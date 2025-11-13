# MetaMask Setup for PixelGenesis

## Fix: Network Showing "GOTEST" and "GO" Instead of "ETH"

If MetaMask is showing the wrong network name or currency, follow these steps:

### Option 1: Remove and Re-add the Network (Recommended)

1. **Open MetaMask**
2. Click on the network dropdown (top of MetaMask)
3. Click "Settings" or the gear icon
4. Scroll down to "Networks"
5. Find "Hardhat Local" or "GOTEST" network
6. Click the three dots (⋮) next to it
7. Click "Delete" or "Remove"
8. Confirm deletion

9. **Add the network again manually:**
   - Click "Add Network" → "Add a network manually"
   - Enter these **exact** values:
     - **Network Name:** `Hardhat Local`
     - **RPC URL:** `http://127.0.0.1:8545`
     - **Chain ID:** `1337`
     - **Currency Symbol:** `ETH` (make sure it's ETH, not GO!)
     - **Block Explorer URL:** (leave empty)
   - Click "Save"

### Option 2: Use the App's Auto-Add Feature

1. Make sure the Hardhat node is running: `npm run node`
2. Open the PixelGenesis app
3. Click "Connect Wallet"
4. MetaMask will prompt to add the network
5. **IMPORTANT:** Before clicking "Approve", check that:
   - Network Name shows: "Hardhat Local"
   - Currency Symbol shows: "ETH"
6. If it shows "GOTEST" or "GO", click "Cancel" and use Option 1 instead

### Option 3: Edit Existing Network

1. Open MetaMask
2. Click network dropdown → Settings
3. Find the network (might be called "GOTEST" or "Hardhat Local")
4. Click on it to edit
5. Change:
   - **Network Name:** `Hardhat Local`
   - **Currency Symbol:** `ETH`
6. Click "Save"

### Verify the Setup

After adding/editing the network:
1. Select "Hardhat Local" network in MetaMask
2. Check that:
   - Network name shows: "Hardhat Local"
   - Currency shows: "ETH" (not "GO")
   - Chain ID: 1337
3. You should see test ETH in your account (10000 ETH from Hardhat)

### Troubleshooting

**If you still see "GO" or "GOTEST":**
- Clear MetaMask cache: Settings → Advanced → Reset Account (this won't delete your accounts)
- Or completely remove the network and add it fresh
- Make sure you're using the correct Chain ID: `1337`

**If the network won't connect:**
- Make sure Hardhat node is running: `npm run node`
- Check the RPC URL is exactly: `http://127.0.0.1:8545`
- Try restarting the Hardhat node

### Quick Network Configuration

Copy these exact values when adding the network:

```
Network Name: Hardhat Local
RPC URL: http://127.0.0.1:8545
Chain ID: 1337
Currency Symbol: ETH
Block Explorer: (leave empty)
```

**Important:** The Currency Symbol MUST be "ETH" (uppercase), not "GO" or "Go" or anything else!

