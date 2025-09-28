# 🎉 Birthday Card Website

A beautiful, responsive birthday card website with Bollywood music, animations, and memories.

## Features

- 🎵 Auto-playing Bollywood music playlist (10-second previews)
- 🎁 Interactive birthday card prompt
- 📸 Photo gallery with memories
- 🎨 Smooth animations and transitions
- 📱 Fully responsive design
- 🔄 Auto-rotation between sections
- 🎯 Production-ready (no console logs in production)

## File Structure

```
/
├── index.html          # Main HTML file
├── styles.css          # CSS styles and animations
├── script.js           # JavaScript functionality
├── favicon.ico         # Website icon
├── static/
│   ├── songs/          # MP3 music files
│   ├── her-images/     # Birthday girl photos
│   └── our-images/     # Memory photos
└── README.md           # This file
```

## Local Development

1. Place all files in a directory
2. Add MP3 files to `static/songs/`
3. Add photos to `static/her-images/` and `static/our-images/`
4. Run: `python3 -m http.server 8000`
5. Visit: `http://localhost:8000`

## Deployment

### Netlify (Recommended)
- Drag and drop the entire folder to Netlify
- Or connect to GitHub repository
- Automatic HTTPS and CDN

### Hostinger
- Upload all files via File Manager or FTP
- Ensure `index.html` is in the root directory
- Access via your domain name

## Customization

- **Songs**: Add MP3 files to `static/songs/` (auto-discovered)
- **Photos**: Update image paths in `index.html`
- **Text**: Modify content in `index.html`
- **Styling**: Edit `styles.css`

## Browser Support

- Chrome, Firefox, Safari, Edge
- Mobile browsers (iOS/Android)
- Requires modern browser for audio playback
