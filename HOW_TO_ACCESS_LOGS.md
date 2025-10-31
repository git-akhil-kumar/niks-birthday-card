# How to Access Logs

## Types of Logs

There are **two types of logs** in the application:

1. **Client-side Logs** - Stored in browser's localStorage
2. **Server-side Logs** - Stored in `server-logs.json` on the server

---

## Method 1: Via UI Buttons (Easiest)

### Client-Side Logs
1. Open the website: `http://localhost:8080/`
2. Scroll down to the **"Made by"** section at the bottom
3. Click the **"View Access Logs"** button (📋 list icon)
4. A modal will pop up showing the last 50 client-side log entries in JSON format

### Server-Side Logs
1. Open the website: `http://localhost:8080/`
2. Scroll down to the **"Made by"** section at the bottom
3. Click the **"View Server Logs"** button (💾 database icon)
4. Enter the access token when prompted (first time only)
   - **Default token**: `change-this-to-a-secure-random-token`
   - The token is stored in localStorage for future use
5. Logs will open in a new window/tab as raw JSON

---

## Method 2: Direct URL Access

### Server-Side Logs (via URL)

**Format:**
```
http://localhost:8080/access-logs.php?action=show&limit=2000&token=YOUR_TOKEN
```

**Example:**
```
http://localhost:8080/access-logs.php?action=show&limit=2000&token=change-this-to-a-secure-random-token
```

**Parameters:**
- `action=show` - View logs
- `limit=2000` - Max number of entries (default: 2000, max: 5000)
- `token=YOUR_TOKEN` - Authentication token

---

## Method 3: Using curl (Terminal)

### View Server Logs
```bash
curl "http://localhost:8080/access-logs.php?action=show&limit=10&token=change-this-to-a-secure-random-token"
```

### Clear Server Logs
```bash
curl "http://localhost:8080/access-logs.php?action=clear&token=change-this-to-a-secure-random-token"
```

### Add a Log Entry (automatic - no token needed)
```bash
curl -X POST "http://localhost:8080/access-logs.php?action=add" \
  -H "Content-Type: application/json" \
  -d '{"ts":"2024-10-31T12:00:00Z","ua":"test"}'
```

---

## Setting Your Access Token

The default token is set in `access-logs.php` on line 7:

```php
$SECRET_TOKEN = isset($_ENV['LOGS_TOKEN']) ? $_ENV['LOGS_TOKEN'] : 'change-this-to-a-secure-random-token';
```

**To change it:**

1. **Option 1:** Edit `access-logs.php` and change the default value
2. **Option 2:** Set environment variable:
   ```bash
   export LOGS_TOKEN="your-secure-random-token-here"
   ```

**⚠️ Important:** Change the default token before deploying to production!

---

## Log File Locations

- **Server logs**: `/Users/a0s1kr9/testing/niks-birthday-card/server-logs.json`
- **Client logs**: Browser's localStorage (key: `accessLogs`)
- **Rate limit data**: `/Users/a0s1kr9/testing/niks-birthday-card/.rate-limit.json`

---

## What's Logged?

### Client-Side Logs Include:
- Timestamp
- User agent
- Language
- Referrer
- Viewport size
- Screen resolution
- Geolocation (if permitted)

### Server-Side Logs Include:
- Everything from client-side logs
- Server timestamp (`server_ts`)
- Client IP address (`ip`)

---

## Troubleshooting

### "Unauthorized" Error
- Make sure you're using the correct token
- Token must be at least 10 characters long
- Check `access-logs.php` for the current token value

### "Rate limit exceeded" Error
- Maximum 30 requests per minute per IP
- Wait 1 minute and try again

### No Logs Showing
- Server logs file is created automatically on first entry
- Client logs are created when the page loads
- Make sure the website has been accessed at least once

---

## Security Notes

- **Client logs** are public (stored in browser)
- **Server logs** require authentication (token)
- Rate limiting protects against abuse
- All inputs are sanitized to prevent XSS/injection

