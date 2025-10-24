#!/usr/bin/env python3
"""
Simple image optimization script for trip photos
Converts HEIC to JPEG and optimizes for web use
"""

import os
import sys
from pathlib import Path


def optimize_image(input_path, output_path, max_width=800, quality=85):
    """Optimize image for web use"""
    try:
        # Try to use PIL if available
        from PIL import Image

        with Image.open(input_path) as img:
            # Convert to RGB if needed
            if img.mode != "RGB":
                img = img.convert("RGB")

            # Resize if too large
            if img.width > max_width:
                ratio = max_width / img.width
                new_height = int(img.height * ratio)
                img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)

            # Save as optimized JPEG
            img.save(output_path, "JPEG", quality=quality, optimize=True)

            print(f"Optimized: {output_path}")
            return True

    except ImportError:
        print("PIL not available, trying sips (macOS)...")
        try:
            import subprocess

            result = subprocess.run(
                [
                    "sips",
                    "-s",
                    "format",
                    "jpeg",
                    "-Z",
                    str(max_width),
                    str(input_path),
                    "--out",
                    str(output_path),
                ],
                capture_output=True,
                text=True,
            )

            if result.returncode == 0:
                print(f"Converted with sips: {output_path}")
                return True
            else:
                print(f"sips failed: {result.stderr}")
                return False
        except FileNotFoundError:
            print("sips not available, copying file as-is")
            import shutil

            shutil.copy2(input_path, output_path)
            return True
    except Exception as e:
        print(f"Error optimizing {input_path}: {e}")
        return False


def main():
    """Main optimization function"""
    trips_dir = Path("static/trips")
    optimized_dir = Path("static/optimized/trips")

    if not trips_dir.exists():
        print("static/trips directory not found")
        return

    # Create optimized directory structure
    optimized_dir.mkdir(parents=True, exist_ok=True)

    # Process all trip directories
    for trip_dir in trips_dir.iterdir():
        if trip_dir.is_dir():
            trip_name = trip_dir.name
            optimized_trip_dir = optimized_dir / trip_name
            optimized_trip_dir.mkdir(exist_ok=True)

            print(f"\nProcessing {trip_name}...")

            # Process all images in the trip directory
            for image_file in trip_dir.iterdir():
                if image_file.suffix.lower() in [".heic", ".jpg", ".jpeg", ".png"]:
                    # Determine output format
                    if image_file.suffix.lower() == ".heic":
                        output_file = optimized_trip_dir / f"{image_file.stem}.jpg"
                    else:
                        output_file = optimized_trip_dir / image_file.name

                    optimize_image(image_file, output_file)


if __name__ == "__main__":
    main()
