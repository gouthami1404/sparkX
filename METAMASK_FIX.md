# Fix MetaMask Network Connection Error

## Error: "Could not fetch chain ID. Is your RPC URL correct?"

This error means MetaMask cannot connect to your Hardhat node. Follow these steps:

## Step 1: Make Sure Hardhat Node is Running

**Open a terminal and run:**
```bash
npm run node
```

You should see output like:
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/
```

**IMPORTANT:** Keep this terminal open! The Hardhat node must be running for MetaMask to connect.

## Step 2: Use the EXACT RPC URL

When adding the network in MetaMask, use this **EXACT** RPC URL:

```
http://127.0.0.1:8545
```

**NOT:**
- ❌ `127.0.0.1:8545` (missing http://)
- ❌ `localhost:8545` (might not work)
- ❌ `http://localhost:8545` (might not work)

**YES:**
- ✅ `http://127.0.0.1:8545` (correct!)

## Step 3: Complete Network Settings

Enter these **exact** values in MetaMask:

1. **Network Name:** `Hardhat Local`
2. **RPC URL:** `http://127.0.0.1:8545` (with http://)
3. **Chain ID:** `1337`
4. **Currency Symbol:** `ETH`
5. **Block Explorer URL:** (leave empty)

## Step 4: Verify Connection

After clicking "Save", MetaMask should:
- ✅ Connect successfully
- ✅ Show "Hardhat Local" as the network
- ✅ Display ETH as currency
- ✅ Show your account balance (10000 ETH from Hardhat)

## Common Issues & Solutions

### Issue 1: "Could not fetch chain ID"

**Causes:**
- Hardhat node is not running
- Wrong RPC URL format
- Port 8545 is blocked by firewall

**Solutions:**
1. Make sure `npm run node` is running in a terminal
2. Use `http://127.0.0.1:8545` (not just `127.0.0.1:8545`)
3. Check Windows Firewall isn't blocking port 8545
4. Try restarting the Hardhat node

### Issue 2: "Network name may not correctly match"

This is just a warning. You can ignore it and click "Save anyway" or "I understand". The network will work fine.

### Issue 3: Still can't connect

**Try these steps:**

1. **Check if Hardhat is running:**
   - Open browser and go to: `http://127.0.0.1:8545`
   - You should see a JSON response (not an error)

2. **Use localhost instead:**
   - Try RPC URL: `http://localhost:8545`
   - Some systems prefer localhost over 127.0.0.1

3. **Check port:**
   - Make sure nothing else is using port 8545
   - Run: `netstat -ano | findstr :8545` (Windows)
   - If something else is using it, kill that process

4. **Restart everything:**
   - Stop Hardhat node (Ctrl+C)
   - Close MetaMask
   - Start Hardhat node again: `npm run node`
   - Open MetaMask and try adding network again

## Quick Test

To verify Hardhat is accessible:

1. Open a browser
2. Go to: `http://127.0.0.1:8545`
3. You should see a JSON response with Hardhat info

If you get "This site can't be reached", Hardhat is not running or not accessible.

## Still Having Issues?

1. Make sure you're using the latest version of MetaMask
2. Try clearing MetaMask cache: Settings → Advanced → Reset Account
3. Try a different browser
4. Check if antivirus/firewall is blocking localhost connections

