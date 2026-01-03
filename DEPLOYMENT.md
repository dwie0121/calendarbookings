
# Deploying Kean Drew Studio Manager to Vercel

This guide ensures your application runs correctly in a production environment by handling `.tsx` transpilation and SPA routing.

## Method 1: Deploy via Vercel Dashboard (Recommended)

1.  **Repository Setup**: 
    *   Upload your project to GitHub.
    *   Ensure `vercel.json` is in the root directory.

2.  **Import to Vercel**:
    *   Go to [Vercel Dashboard](https://vercel.com/dashboard) -> **New Project**.
    *   Select your repository.

3.  **Project Settings (Crucial)**:
    *   **Framework Preset**: Select **Vite**. 
        *   *Vite is excellent at handling `.tsx` files and ESM automatically.*
    *   **Build Command**: If you are not using a `package.json` with scripts, Vercel may ask for one. 
    *   **Alternative (Static)**: If you prefer to keep it strictly static without a build tool, you must rename `index.tsx` to `index.js` and remove all Type annotations. **However, using the Vite preset is the professional standard for this structure.**

4.  **Environment Variables**:
    *   Add `API_KEY` if you integrate Gemini AI features later.

---

## Troubleshooting

### 1. Fixing 404 Errors on Refresh
If you refresh the page on a sub-route and get a 404, ensure the `vercel.json` file is present in your root folder:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### 2. Fixing "Blank Screen" (White Page)
*   **Check Console**: Open browser DevTools (F12). If you see `Uncaught SyntaxError: Unexpected token '<'`, it means the browser is trying to read `.tsx` as plain JavaScript. 
*   **Solution**: Use a build step (Vite) on Vercel, or use a tool like [Babel Standalone](https://babeljs.io/docs/en/babel-standalone) in your `index.html` (though not recommended for production performance).
*   **Module Entry**: Ensure `<script type="module" src="index.tsx"></script>` is at the bottom of your `body` tag in `index.html`.

### 3. "Import Map" Issues
*   The current `importmap` uses `esm.sh`. Ensure your production environment has internet access to reach these CDNs.
*   If a specific library (like `recharts`) fails to load, try pinning a specific version in the `importmap` (e.g., `https://esm.sh/recharts@3.6.0`).

---

## Local Development
To test exactly as it will appear on Vercel, use the Vercel CLI locally:
```bash
npm install -g vercel
vercel dev
```
