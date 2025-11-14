# Pinata Environment Variables Setup

## Quick Setup Instructions

Create a file named `.env` in the `frontend/` directory with the following content:

```env
REACT_APP_PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIyZGU5ODhmMS0xMmM1LTRlMTItOWE1MC1lZWRmOGQ2YWEyNTAiLCJlbWFpbCI6ImhpcmVtYXRoZGhhbmFuamF5NTExQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiJmNjE1ZDRlMzU5MDhlZTM5N2EyZiIsInNjb3BlZEtleVNlY3JldCI6IjU5ZDVlOWUzOGQwZGYyY2RjNDhkZWQ1Y2I4M2NiOGM1ZjljNjMxYmRjOTFhY2Y4YmRmZmM4NDg2ZDFlOTRlOTYiLCJleHAiOjE3OTQ2MDM5NDJ9.0CYVqNA4Ek4KR0KlGuMw5ME_U65obztcB4912wQtB0A

# Optional: If JWT doesn't work, you can use API Key/Secret instead
# REACT_APP_PINATA_API_KEY=f615d4e35908ee397a2f
# REACT_APP_PINATA_API_SECRET=59d5e9e38d0df2cdc48ded5cb83cb8c5f9c631bdc91acf8bdffc8486d1e94e96
```

## Steps:

1. **Navigate to frontend folder:**
   ```bash
   cd frontend
   ```

2. **Create the .env file:**
   - Windows: Create a new file named `.env` (no extension)
   - Copy the content above into it
   - Save the file

3. **Restart the frontend:**
   ```bash
   # Stop the frontend (Ctrl+C if running)
   npm start
   ```

## Your Pinata Credentials:

- **JWT Token:** ✅ Configured (preferred method)
- **API Key:** f615d4e35908ee397a2f (backup method)
- **API Secret:** 59d5e9e38d0df2cdc48ded5cb83cb8c5f9c631bdc91acf8bdffc8486d1e94e96 (backup method)

## How It Works:

1. **Primary Method:** Uses JWT token (already configured above)
2. **Fallback Method:** If JWT fails, automatically tries API Key/Secret
3. **Final Fallback:** If Pinata fails, uses public IPFS API

## Verification:

After restarting, when you upload a document:
- Check browser console for: "File uploaded to Pinata: Qm..."
- Files will appear in your Pinata dashboard: https://app.pinata.cloud/
- All documents are permanently pinned to IPFS

## Security:

✅ The `.env` file is already in `.gitignore` - your keys are safe!

