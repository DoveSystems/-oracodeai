# Quick Netlify Migration (5 Minutes)

## Step 1: Create Netlify Account
1. Go to [netlify.com](https://netlify.com)
2. Sign up with GitHub (recommended)

## Step 2: Deploy Your Project
**Option A: From GitHub (Recommended)**
1. Click "New site from Git"
2. Choose GitHub
3. Select your repository
4. Build settings:
   - Build command: `npm run build` or `pnpm build`
   - Publish directory: `dist`
5. Click "Deploy site"

**Option B: Drag & Drop**
1. Run `npm run build` locally
2. Drag the `dist` folder to Netlify
3. Done!

## Step 3: Verify Headers
1. Wait for deployment to complete
2. Visit your new Netlify URL
3. The app should now show "✅ Full WebContainer Support"
4. Live preview should work!

## Your Project is Already Configured!
Your `netlify.toml` file already contains:
```toml
[[headers]]
  for = "/*"
  [headers.values]
    Cross-Origin-Embedder-Policy = "require-corp"
    Cross-Origin-Resource-Policy = "same-origin"
    Origin-Agent-Cluster = "?1"
    Cross-Origin-Opener-Policy = "same-origin"
```

This will automatically enable WebContainer support.
