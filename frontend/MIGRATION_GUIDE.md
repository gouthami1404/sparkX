# Migration Guide: Old Frontend → New Frontend

## ⚠️ Important Changes

The frontend has been completely rebuilt with a new tech stack and design system.

## 🔄 What Changed

### Tech Stack:
- ❌ **Removed**: `react-scripts` (create-react-app)
- ✅ **Added**: Vite (faster builds)
- ✅ **Added**: TailwindCSS (modern styling)
- ✅ **Added**: Framer Motion (animations)
- ✅ **Added**: React Router (navigation)
- ✅ **Added**: Lucide React (icons)

### File Structure:
```
frontend/
├── src/
│   ├── pages/              # New: Page components
│   │   ├── Landing.jsx
│   │   ├── HowItWorks.jsx
│   │   └── Dashboard.jsx
│   ├── components/
│   │   └── dashboard/       # New: Dashboard components
│   │       ├── HomeTab.jsx
│   │       ├── MyDocuments.jsx
│   │       ├── IssueDocument.jsx
│   │       ├── DIDManager.jsx
│   │       └── IssuerDashboard.jsx
│   ├── utils/               # Same: Web3 & IPFS utils
│   ├── config.js            # Same: Configuration
│   └── main.jsx             # Changed: Entry point
├── index.html               # Changed: Vite entry
├── vite.config.js           # New: Vite config
├── tailwind.config.js       # New: Tailwind config
└── postcss.config.js        # New: PostCSS config
```

## 🚀 Setup Steps

1. **Install new dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Keep your existing files:**
   - ✅ `src/utils/web3.js` - Still works
   - ✅ `src/utils/ipfs.js` - Still works
   - ✅ `src/config.js` - Still works
   - ✅ `src/contractAddresses.json` - Still works
   - ✅ `.env` - Still needed for Pinata

3. **Start the new dev server:**
   ```bash
   npm run dev
   ```
   (Instead of `npm start`)

## 🎨 New Features

### Routes:
- `/` - Landing page (if not connected)
- `/how-it-works` - How it works page
- `/dashboard` - Main dashboard (if connected)
  - `/dashboard` - Home tab
  - `/dashboard/documents` - My Documents
  - `/dashboard/issue` - Issue Document
  - `/dashboard/did` - DID Manager
  - `/dashboard/issuer` - Issuer Dashboard

### Design:
- Pixel-themed with neon glow
- Smooth animations
- Responsive design
- Non-technical language

## ⚙️ Build Commands

- **Development**: `npm run dev`
- **Build**: `npm run build`
- **Preview**: `npm run preview`

## 🔧 Troubleshooting

### Port 3000 already in use?
Change port in `vite.config.js`:
```js
server: {
  port: 3001, // Change this
}
```

### Styles not loading?
Make sure TailwindCSS is installed:
```bash
npm install -D tailwindcss postcss autoprefixer
```

### Animations not working?
Check that Framer Motion is installed:
```bash
npm install framer-motion
```

## 📝 Notes

- All existing functionality is preserved
- Same smart contract interactions
- Same IPFS integration
- Just a new, better UI!

