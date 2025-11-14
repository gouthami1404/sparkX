# NexID Frontend - Setup Instructions

## 🚀 Quick Start

The frontend has been completely redesigned with a modern pixel-themed, neon glow aesthetic using:

- **Vite** (instead of create-react-app) - Faster builds
- **TailwindCSS** - Modern utility-first styling
- **Framer Motion** - Smooth animations
- **React Router** - Page navigation
- **Lucide React** - Beautiful icons

## 📦 Installation

```bash
cd frontend
npm install
```

## 🏃 Run Development Server

```bash
npm run dev
```

The app will open at `http://localhost:3000`

## 🎨 New Features

### Pages:
1. **Landing Page** (`/`) - Beautiful hero section with animated orbs
2. **How It Works** (`/how-it-works`) - Step-by-step explanation
3. **Dashboard** (`/dashboard`) - Main app with tabs:
   - Home - Document categories
   - My Documents - View your credentials
   - Issue Document - Issue new credentials
   - DID Manager - Manage your DID
   - Issuer Dashboard - Manage issued credentials

### Design System:
- **Colors**: Dark background (#0D0D0D), Neon Cyan (#00FFC6), Neon Purple (#A855F7)
- **Fonts**: Press Start 2P (pixel font) for titles, Inter for body
- **Effects**: Glowing orbs, neon buttons, glassmorphism cards, smooth animations

## 🔧 Configuration

Make sure you have:
1. `.env` file in `frontend/` with your Pinata JWT token
2. Contract addresses in `src/contractAddresses.json`
3. Hardhat node running on `http://127.0.0.1:8545`

## 📱 Responsive Design

The app is fully responsive and works on:
- Desktop
- Tablet
- Mobile

## 🎯 Key Improvements

- ✅ Modern pixel-themed design
- ✅ Smooth Framer Motion animations
- ✅ Better UX with non-technical language
- ✅ Document categories (Educational, Employment, Medical, Confidential)
- ✅ Improved error handling
- ✅ Faster build times with Vite
- ✅ Better code organization

Enjoy your new NexID frontend! 🎉

