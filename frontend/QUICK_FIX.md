# Quick Fix for 404/500 Errors

## The Problem

You're getting:
- 404 error (missing resource)
- 500 error on index.css (TailwindCSS not processing)

## Solution

### Step 1: Make sure dependencies are installed

```bash
cd frontend
npm install
```

This will install:
- Vite
- TailwindCSS
- PostCSS
- Autoprefixer
- Framer Motion
- React Router
- Lucide React

### Step 2: Restart the dev server

Stop the current server (Ctrl+C) and restart:

```bash
npm run dev
```

### Step 3: If still getting errors

Check that these files exist:
- ✅ `vite.config.js`
- ✅ `tailwind.config.js`
- ✅ `postcss.config.js`
- ✅ `src/index.css`
- ✅ `src/main.jsx`
- ✅ `src/App.jsx`

## Common Issues

### "Cannot find module 'tailwindcss'"
**Fix:** Run `npm install` in frontend folder

### "PostCSS plugin error"
**Fix:** Make sure `postcss.config.js` exists and has correct content

### "index.css 500 error"
**Fix:** 
1. Check `tailwind.config.js` exists
2. Check `postcss.config.js` exists
3. Restart dev server

### Still not working?

Try deleting node_modules and reinstalling:
```bash
cd frontend
rm -rf node_modules  # or on Windows: rmdir /s node_modules
npm install
npm run dev
```

