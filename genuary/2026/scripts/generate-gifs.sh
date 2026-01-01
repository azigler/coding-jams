#!/bin/bash

# Script to generate GIFs from saved frames
# This script assumes you have ImageMagick installed for GIF creation
# Install with: brew install imagemagick (macOS) or apt-get install imagemagick (Linux)

echo "🎬 Generating GIFs for Genuary 2026..."
echo ""

# Directory for outputs
OUTPUT_DIR="./outputs"
mkdir -p "$OUTPUT_DIR"

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "❌ Error: ImageMagick not found. Please install it first:"
    echo "  macOS: brew install imagemagick"
    echo "  Linux: apt-get install imagemagick"
    exit 1
fi

# Find all frame sequences (files matching pattern genuary-2026-day-XX-*.png)
echo "🔍 Looking for frame sequences..."

for day in {01..31}; do
    # Look for frames matching the pattern
    FRAME_PATTERN="genuary-2026-day-${day}-*.png"
    FIRST_FRAME=$(ls $FRAME_PATTERN 2>/dev/null | head -1)
    
    if [ -n "$FIRST_FRAME" ]; then
        echo "📹 Found frames for Day ${day}, creating GIF..."
        convert -delay 3.33 -loop 0 $FRAME_PATTERN "${OUTPUT_DIR}/genuary-2026-day-${day}.gif"
        echo "✅ Created ${OUTPUT_DIR}/genuary-2026-day-${day}.gif"
    fi
done

# Also check for any other frame patterns
OTHER_FRAMES=$(ls genuary-2026-*.png 2>/dev/null | grep -E "genuary-2026-day-[0-9]+-[0-9]+\.png" | head -1)
if [ -z "$OTHER_FRAMES" ] && [ -z "$FIRST_FRAME" ]; then
    echo "⚠️  No frame sequences found."
    echo "💡 Frames are saved to your Downloads folder when you run animations with recording enabled."
    echo "💡 Run this script from the directory containing the frame PNGs, or specify the path."
fi

echo ""
echo "✨ Done! Check the ${OUTPUT_DIR} directory for your GIFs."
