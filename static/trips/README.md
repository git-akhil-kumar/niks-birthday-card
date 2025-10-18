# Trip Photos Structure

This directory contains photos for the trip timeline section.

## Directory Structure
```
static/
├── trips/                    # Original trip photos
│   ├── goa/
│   │   └── goa-trip-image.HEIC
│   ├── shimla/              # Future trips
│   ├── kerala/
│   ├── rajasthan/
│   ├── bali/
│   └── manali/
└── optimized/
    └── trips/               # Optimized web versions
        ├── goa/
        │   └── goa-trip-image.heic
        └── [other trips...]
```

## Adding New Trip Photos

1. **Add original photos** to `static/trips/[trip-name]/`
2. **Run optimization script**:
   ```bash
   python3 optimize-images.py
   ```
3. **Update HTML** to reference the optimized image:
   ```html
   <img src="static/optimized/trips/[trip-name]/[image-name].jpg" alt="Trip Photo" class="trip-image">
   ```

## Image Optimization

The optimization script:
- Converts HEIC to JPEG
- Resizes to max 800px width
- Compresses with 85% quality
- Maintains aspect ratio

## Supported Formats
- **Input**: HEIC, JPG, JPEG, PNG
- **Output**: JPEG (optimized)

## Responsive Design

Trip images are automatically responsive:
- **Desktop**: 200px height
- **Mobile**: 150px height
- **Hover effects**: Scale and overlay animations
- **Completed trips**: Green border and overlay
- **Planned trips**: Standard styling
