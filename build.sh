#!/bin/bash

# Production Build Script for Birthday Card
echo "🚀 Building Birthday Card for Production..."

# Create production directory
mkdir -p dist

# Copy essential files
cp index.html dist/
cp styles.css dist/
cp script.js dist/
cp songs-list.js dist/
cp favicon.ico dist/
cp netlify.toml dist/
cp _redirects dist/

# Copy static assets
cp -r static dist/

# Minify CSS (if cssnano is available)
if command -v cssnano &> /dev/null; then
    echo "📦 Minifying CSS..."
    cssnano dist/styles.css dist/styles.min.css
    mv dist/styles.min.css dist/styles.css
else
    echo "⚠️  cssnano not found, skipping CSS minification"
fi

# Minify JS (if terser is available)
if command -v terser &> /dev/null; then
    echo "📦 Minifying JavaScript..."
    terser dist/script.js -o dist/script.min.js -c -m
    terser dist/songs-list.js -o dist/songs-list.min.js -c -m
    
    # Update HTML to use minified files
    sed -i '' 's/script\.js/script.min.js/g' dist/index.html
    sed -i '' 's/songs-list\.js/songs-list.min.js/g' dist/index.html
    mv dist/script.min.js dist/script.js
    mv dist/songs-list.min.js dist/songs-list.js
else
    echo "⚠️  terser not found, skipping JS minification"
fi

# Remove cache-busting meta tags for production
sed -i '' '/Cache-Control/d' dist/index.html
sed -i '' '/Pragma/d' dist/index.html
sed -i '' '/Expires/d' dist/index.html

echo "✅ Production build complete!"
echo "📁 Files ready in ./dist directory"
echo "🌐 Ready for deployment to Netlify"

# Show build stats
echo ""
echo "📊 Build Statistics:"
echo "Total files: $(find dist -type f | wc -l)"
echo "Total size: $(du -sh dist | cut -f1)"
echo "JavaScript files: $(find dist -name "*.js" | wc -l)"
echo "CSS files: $(find dist -name "*.css" | wc -l)"
echo "Image files: $(find dist -name "*.jpg" -o -name "*.png" -o -name "*.gif" | wc -l)"
echo "Audio files: $(find dist -name "*.mp3" | wc -l)"
