#!/bin/bash
# Start server script - supports both PHP and Python fallback

cd "$(dirname "$0")"

PORT=8080

# Check if PHP is available
if command -v php &> /dev/null; then
    echo "Starting PHP server on port $PORT..."
    echo "Server will be available at: http://localhost:$PORT/"
    echo ""
    echo "PHP server supports both static files and PHP endpoints."
    echo "Press Ctrl+C to stop the server."
    echo ""
    php -S localhost:$PORT
else
    echo "PHP not found. Using Python HTTP server (PHP endpoints won't work)..."
    echo "Server will be available at: http://localhost:$PORT/"
    echo ""
    echo "Note: PHP endpoints (like access-logs.php) won't work with Python server."
    echo "Install PHP to use all features: brew install php (on Mac)"
    echo ""
    python3 -m http.server $PORT
fi

