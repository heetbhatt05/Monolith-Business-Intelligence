from PIL import Image, ImageEnhance, ImageFilter
import os

def enhance_favicon(filepath, outpath, glow_color=(0, 255, 255)):
    print(f"Processing Favicon: {filepath}...")
    img = Image.open(filepath).convert("RGBA")
    
    # Crop to bounding box
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        
    w, h = img.size
    
    # 1. Manually stretch the width so it's not simply a "straight line"
    # A monolith is tall, yes, but at 16x16 we need thickness!
    target_width = int(w * 2.5) # Expand width 250%
    img = img.resize((target_width, h), resample=Image.Resampling.LANCZOS)
    
    # 2. Add EXTREME Brightness / Contrast
    enhancer = ImageEnhance.Brightness(img)
    img = enhancer.enhance(2.5) # 150% brighter
    
    enh_c = ImageEnhance.Contrast(img)
    img = enh_c.enhance(1.8)
    
    # 3. Create Massive Glow
    r, g, b, a = img.split()
    w, h = img.size
    pad = int(max(w, h) * 0.4) # Huge padding for huge glow
    
    glow_bg = Image.new("RGBA", img.size, glow_color + (0,))
    glow_bg.putalpha(a)
    
    canvas = Image.new("RGBA", (w + pad*2, h + pad*2), (0,0,0,0))
    glow_layer = Image.new("RGBA", (w + pad*2, h + pad*2), (0,0,0,0))
    
    glow_layer.paste(glow_bg, (pad, pad))
    # Massive blur for a glowing halo
    glow_layer = glow_layer.filter(ImageFilter.GaussianBlur(pad * 0.6))
    
    # Do it twice for intensity
    canvas.paste(glow_layer, (0,0))
    canvas.paste(glow_layer, (0,0), glow_layer)
    canvas.paste(img, (pad, pad), img)
    
    img = canvas

    # 4. Make Square tightly fitting
    w, h = img.size
    size = max(w, h)
    sq_canvas = Image.new("RGBA", (size, size), (0,0,0,0))
    sq_canvas.paste(img, ((size - w) // 2, (size - h) // 2), img)
    img = sq_canvas
        
    img.save(outpath)
    print(f"Saved Favicon: {outpath}")

if __name__ == "__main__":
    base = "E:/BCA_FINAL_YEAR_PROJECT/frontend"
    enhance_favicon(f"{base}/src/assets/Website Browser Logo.png", f"{base}/public/favicon.png", glow_color=(59, 130, 246))
