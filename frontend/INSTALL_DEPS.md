# Install Dependencies - Step by Step

## The Error You're Seeing

- **404 error**: Missing resource (probably vite.svg favicon - I've fixed this)
- **500 error on index.css**: TailwindCSS not installed or not processing

## Fix: Install All Dependencies

### Step 1: Navigate to frontend folder

```bash
cd frontend
```

### Step 2: Install dependencies

```bash
npm install
```

This will install:
- ✅ vite
- ✅ @vitejs/plugin-react
- ✅ tailwindcss
- ✅ postcss
- ✅ autoprefixer
- ✅ framer-motion
- ✅ react-router-dom
- ✅ lucide-react
- ✅ ethers
- ✅ axios

### Step 3: Verify installation

Check that node_modules exists:
```bash
dir node_modules
```

### Step 4: Start dev server

```bash
npm run dev
```

## If npm install fails

Try clearing cache:
```bash
npm cache clean --force
npm install
```

## If you see "command not found"

Make sure Node.js is installed:
```bash
node --version
npm --version
```

Should show version numbers (v16+ for Node, v8+ for npm)

## After Installation

The errors should be gone! The app will:
- ✅ Load without 404/500 errors
- ✅ Show the new pixel-themed design
- ✅ Have all animations working

