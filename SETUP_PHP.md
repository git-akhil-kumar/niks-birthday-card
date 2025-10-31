# PHP Server Setup

## The Issue

The Python HTTP server (`python3 -m http.server`) **cannot execute PHP files**. When you try to access `access-logs.php`, it returns a **501 Unsupported method** error.

## Solution: Use PHP's Built-in Server

To use the access logs feature, you need to run a PHP server instead of Python's HTTP server.

---

## Install PHP (if not installed)

### macOS (using Homebrew)
```bash
brew install php
```

### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install php
```

### Linux (Fedora/CentOS)
```bash
sudo dnf install php
```

### Windows
Download from: https://windows.php.net/download/

---

## Start PHP Server

### Option 1: Use the provided script
```bash
./START_SERVER.sh
```

### Option 2: Manual command
```bash
php -S localhost:8080
```

The server will start and serve both:
- ✅ Static files (HTML, CSS, JS)
- ✅ PHP files (access-logs.php)

---

## Current Status

- **Python server**: Running (but PHP won't work)
- **PHP server**: Not running (PHP not installed)

---

## Quick Test

Once PHP server is running, test with:

```bash
curl -X POST "http://localhost:8080/access-logs.php?action=add" \
  -H "Content-Type: application/json" \
  -d '{"test":"data"}'
```

You should get: `{"ok":true,"count":1}` instead of a 501 error.

---

## Fallback

If PHP is not available, the app will still work:
- ✅ Client-side logging (localStorage) works
- ✅ All games work
- ✅ All features except server-side logging work
- ⚠️ Server-side logging will silently fail (no console errors)

The error is already handled gracefully - you just won't see logs on the server, but client-side logs will still work.

