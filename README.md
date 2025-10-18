# 🎉 Birthday Card Website

A beautiful, responsive birthday card website with Bollywood music, animations, and memories.

## Features

- 🎵 **Auto-discovering Bollywood music playlist** (no code changes needed!)
- 🎁 Interactive birthday card prompt
- 📸 Photo gallery with memories
- 🎨 Smooth animations and transitions
- 📱 Fully responsive design
- 🔄 Auto-rotation between sections
- 🎯 Production-ready (no console logs in production)
- ✈️ **Trip timeline** with expandable future adventures

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

- **Songs**: Simply add MP3 files to `static/songs/` - they're automatically discovered!
- **Photos**: Update image paths in `index.html`
- **Text**: Modify content in `index.html`
- **Styling**: Edit `styles.css`
- **Trips**: Use the "Add New Trip" button in the Trip section

## 🎵 Automated Song Discovery

The website now automatically discovers all MP3 files in the `static/songs/` folder! No more manual code updates needed.

### How it works:
1. **Primary method**: Uses `get-songs.php` to scan the songs directory
2. **Fallback method**: Uses a comprehensive hardcoded list if PHP isn't available
3. **Smart formatting**: Automatically formats song titles from filenames
4. **Special cases**: Handles complex song names with custom formatting

### Adding new songs:
1. Simply drop MP3 files into `static/songs/`
2. Refresh the website
3. Songs are automatically included in the playlist!

### Testing:
- Visit `song-test.html` to see the song discovery in action
- Check browser console for discovery logs (in local development)

## Browser Support

- Chrome, Firefox, Safari, Edge
- Mobile browsers (iOS/Android)
- Requires modern browser for audio playback
