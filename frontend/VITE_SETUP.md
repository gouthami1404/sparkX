# Vite Setup Fixes

## ⚠️ Important: Environment Variables

Vite uses **`VITE_`** prefix instead of `REACT_APP_`!

### Update your `.env` file:

**OLD (create-react-app):**
```
REACT_APP_PINATA_JWT=...
```

**NEW (Vite):**
```
VITE_PINATA_JWT=...
```

## 🔧 Common Issues & Fixes

### 1. Environment Variables Not Working

**Problem:** `process.env` is undefined in Vite

**Solution:** 
- Use `import.meta.env` instead of `process.env`
- Use `VITE_` prefix instead of `REACT_APP_`
- Update `.env` file with `VITE_` prefix

### 2. JSON Import Errors

**Problem:** Cannot import JSON files

**Solution:** Vite handles JSON imports automatically. Just use:
```js
import data from './file.json'
```

### 3. Port Already in Use

**Problem:** Port 3000 is already in use

**Solution:** Change port in `vite.config.js`:
```js
server: {
  port: 3001, // Change this
}
```

### 4. Missing Dependencies

**Problem:** Module not found errors

**Solution:** Make sure all dependencies are installed:
```bash
cd frontend
npm install
```

### 5. Old Files Causing Conflicts

**Problem:** Old `index.js` or `App.js` files conflicting

**Solution:** The new setup uses:
- `main.jsx` (instead of `index.js`)
- `App.jsx` (instead of `App.js`)

Old files won't cause issues, but you can delete them if you want.

## 📝 Quick Fix Checklist

1. ✅ Update `.env` file - change `REACT_APP_` to `VITE_`
2. ✅ Run `npm install` in frontend folder
3. ✅ Make sure all dependencies are installed
4. ✅ Check that `vite.config.js` exists
5. ✅ Check that `tailwind.config.js` exists
6. ✅ Check that `postcss.config.js` exists

## 🚀 After Fixes

Run:
```bash
cd frontend
npm run dev
```

The app should start without errors!

