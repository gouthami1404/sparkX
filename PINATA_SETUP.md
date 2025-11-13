# Pinata IPFS Setup Guide

NexID uses Pinata for reliable IPFS document storage. Follow these steps to set up Pinata.

## Why Pinata?

- ✅ Reliable document storage (pinned files stay available)
- ✅ Fast upload and retrieval
- ✅ Free tier available (1GB storage)
- ✅ Professional IPFS infrastructure
- ✅ Better than public IPFS API (no rate limits)

## Step 1: Create Pinata Account

1. Go to [https://app.pinata.cloud/](https://app.pinata.cloud/)
2. Click "Sign Up" (or "Log In" if you have an account)
3. Complete the registration

## Step 2: Get Your API Key (JWT Token)

1. Once logged in, go to **Developers** section (in the left sidebar)
2. Click **"API Keys"**
3. Click **"New Key"** button
4. Configure the key:
   - **Key Name:** NexID (or any name you prefer)
   - **Admin Pin/Unpin:** ✅ Enable (to pin files)
   - **Pin Policies:** Leave default or customize
   - **User Pinned Data:** ✅ Enable (to view your pinned files)
5. Click **"Create Key"**
6. **IMPORTANT:** Copy the **JWT Token** immediately (you won't see it again!)
   - It looks like: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## Step 3: Configure in NexID

1. In your project, go to `frontend/` directory
2. Copy the example env file:
   ```bash
   cd frontend
   cp .env.example .env
   ```
3. Open `frontend/.env` in a text editor
4. Paste your JWT token:
   ```
   REACT_APP_PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
5. Save the file

## Step 4: Restart Frontend

1. Stop the frontend if it's running (Ctrl+C)
2. Restart it:
   ```bash
   npm run frontend
   ```
   Or:
   ```bash
   cd frontend
   npm start
   ```

## Step 5: Test It!

1. Open the app in your browser
2. Connect your wallet
3. Go to **Issuer Dashboard**
4. Try uploading a document
5. Check the browser console - you should see: "File uploaded to Pinata: Qm..."
6. The document should now be stored on Pinata!

## Verify Files on Pinata

1. Go to [https://app.pinata.cloud/](https://app.pinata.cloud/)
2. Click **"Files"** in the sidebar
3. You should see your uploaded documents listed there
4. Click on any file to view details and access the IPFS hash

## Troubleshooting

### Error: "Pinata upload failed: Invalid JWT"

**Solution:**
- Make sure your JWT token is correct
- Check that you copied the full token (it's very long)
- Make sure there are no extra spaces in `.env` file
- Restart the frontend after updating `.env`

### Error: "Pinata upload failed: Unauthorized"

**Solution:**
- Your JWT token might have expired
- Generate a new API key in Pinata
- Update the `.env` file with the new token
- Restart the frontend

### Files Not Appearing in Pinata Dashboard

**Solution:**
- Wait a few seconds - Pinata might take a moment to index
- Check the browser console for any errors
- Verify the upload was successful (check transaction hash)
- Make sure you're logged into the correct Pinata account

### Still Using Public IPFS

If you see "Public IPFS upload" in console:
- Check that `REACT_APP_PINATA_JWT` is set in `.env`
- Make sure the `.env` file is in `frontend/` directory
- Restart the frontend server
- Check browser console for any errors

## Pinata Free Tier Limits

- **Storage:** 1 GB
- **Bandwidth:** Unlimited
- **Files:** Unlimited
- **API Calls:** 1000/day

For production, consider upgrading to a paid plan for more storage.

## Security Notes

⚠️ **Important:**
- Never commit `.env` file to Git (it's already in `.gitignore`)
- Don't share your JWT token publicly
- If your token is compromised, revoke it in Pinata and create a new one
- Use different keys for development and production

## Alternative: Use Public IPFS

If you don't want to use Pinata, the app will automatically fall back to public IPFS API. However, this is less reliable and has rate limits.

To disable Pinata:
1. Remove or comment out `REACT_APP_PINATA_JWT` in `.env`
2. Or set `usePinata: false` in `frontend/src/config.js`

## Need Help?

- Pinata Documentation: [https://docs.pinata.cloud/](https://docs.pinata.cloud/)
- Pinata Support: [https://pinata.cloud/support](https://pinata.cloud/support)

---

**That's it!** Your documents will now be stored reliably on Pinata's IPFS network! 🎉

