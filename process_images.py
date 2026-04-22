from PIL import Image, ImageEnhance, ImageFilter
import os

def enhance_and_crop(filepath, outpath, make_square=False, glow_color=(59, 130, 246)):
    print(f"Processing {filepath}...")
    img = Image.open(filepath).convert("RGBA")
    
    # 1. Crop to bounding box
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        
    # 2. Add Brightness
    enhancer = ImageEnhance.Brightness(img)
    img = enhancer.enhance(1.8) # 80% brighter
    
    # Increase Contrast
    enh_c = ImageEnhance.Contrast(img)
    img = enh_c.enhance(1.5)
    
    # 3. Create Glow (Drop Shadow effect)
    # Extract alpha channel, apply blur, colorize, and put behind
    r, g, b, a = img.split()
    glow_bg = Image.new("RGBA", img.size, glow_color + (0,))
    glow_bg.putalpha(a)
    
    # Expand canvas slightly so glow doesn't get cut off
    w, h = img.size
    pad = int(max(w, h) * 0.2)
    
    canvas = Image.new("RGBA", (w + pad*2, h + pad*2), (0,0,0,0))
    glow_layer = Image.new("RGBA", (w + pad*2, h + pad*2), (0,0,0,0))
    
    # Paste for glow
    glow_layer.paste(glow_bg, (pad, pad))
    # Blur it heavily
    glow_layer = glow_layer.filter(ImageFilter.GaussianBlur(pad * 0.5))
    
    # Paste actual image over glow
    canvas.paste(glow_layer, (0, 0))
    canvas.paste(img, (pad, pad), img)
    
    img = canvas

    # 4. Make Square (for Favicon)
    if make_square:
        w, h = img.size
        size = max(w, h)
        # Pad symmetrically to square
        sq_canvas = Image.new("RGBA", (size, size), (0,0,0,0))
        sq_canvas.paste(img, ((size - w) // 2, (size - h) // 2), img)
        img = sq_canvas
        
    img.save(outpath)
    print(f"Saved {outpath}")

if __name__ == "__main__":
    base = "E:/BCA_FINAL_YEAR_PROJECT/frontend"
    enhance_and_crop(f"{base}/src/assets/Website Browser Logo.png", f"{base}/public/favicon.png", make_square=True, glow_color=(0, 255, 255))
    enhance_and_crop(f"{base}/src/assets/Website Logo.png", f"{base}/src/assets/Processed_Logo.png", make_square=False, glow_color=(59, 130, 246))
    enhance_and_crop(f"{base}/src/assets/Website Name.png", f"{base}/src/assets/Processed_Name.png", make_square=False, glow_color=(255, 255, 255))
