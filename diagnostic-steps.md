# Using the Built-in Diagnostics

1. **Open your deployed site**
2. **Click "Diagnostics" in the header** (top-right corner)
3. **Look for red X marks** - these show what's failing
4. **Check the "Potential Isolation Breakers" section**
5. **Take a screenshot** and share it with me

The diagnostics will show:
- ✅ or ❌ crossOriginIsolated
- ✅ or ❌ SharedArrayBuffer available  
- ✅ or ❌ Secure Context (HTTPS)
- ✅ or ❌ Top-level browsing context
- ✅ or ❌ Worker API
- ✅ or ❌ Service Workers API

Most likely you'll see ❌ on the first two items.
