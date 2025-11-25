# 🔧 CORS Error Fix

## The Problem

You were getting this error:
```
Access to fetch at 'http://localhost:3000/api/auth/register/donor' from origin 'http://localhost:5174' 
has been blocked by CORS policy: Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Root Cause

1. **Port Mismatch**: Your frontend runs on port `5174`, but CORS only allowed `5173`
2. **Missing OPTIONS Handling**: Preflight requests (OPTIONS) weren't properly configured
3. **Helmet CSP**: Content Security Policy might have been blocking requests

## The Fix

### ✅ Updated CORS Configuration

1. **Dynamic Origin Matching**: Now allows ANY localhost port in development:
   ```typescript
   /^http:\/\/localhost:\d+$/, // Allows localhost:5173, localhost:5174, etc.
   ```

2. **Better OPTIONS Handling**: Added `optionsSuccessStatus: 200` for legacy browser support

3. **More Allowed Headers**: Added `X-Requested-With` to allowed headers

4. **Development Mode**: In development, all localhost ports are allowed

### ✅ Fixed Helmet CSP

- Disabled CSP in development mode (easier testing)
- Disabled `crossOriginEmbedderPolicy` to allow cross-origin requests

## What Changed

### Before:
```typescript
origin: [
  'http://localhost:5173', // Only this port
  // ...
]
```

### After:
```typescript
origin: function (origin, callback) {
  // Allows ANY localhost port in development
  const allowedOrigins = [
    /^http:\/\/localhost:\d+$/, // Regex pattern for any port
    'https://gihozoinnocente.github.io',
    'https://givelifeapi.up.railway.app',
  ];
  // ...
}
```

## Testing

After restarting your server, try your request again from `http://localhost:5174`. It should work!

## Restart Required

⚠️ **Important**: You need to restart your API server for changes to take effect:

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

## Verification

Check the server logs. You should see:
```
🚀 Server is running on port 3000
📍 Environment: development
🏥 Blood Donation API ready to accept requests
```

Then test from your frontend at `http://localhost:5174` - the CORS error should be gone!

## Additional Notes

- In **production**, only specific origins are allowed
- In **development**, any `localhost:*` port is allowed for flexibility
- The preflight OPTIONS request is now properly handled

## If Issues Persist

1. **Clear browser cache** - Sometimes browsers cache CORS headers
2. **Check server logs** - Look for CORS-related errors
3. **Verify port numbers** - Make sure frontend is actually on 5174
4. **Test with curl** - See if it's a browser-specific issue:
   ```bash
   curl -X OPTIONS http://localhost:3000/api/auth/register/donor \
     -H "Origin: http://localhost:5174" \
     -H "Access-Control-Request-Method: POST" \
     -v
   ```

You should see `Access-Control-Allow-Origin: http://localhost:5174` in the response headers.
