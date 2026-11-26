#!/usr/bin/env python3
"""Generate BYTE PHANTOM platform icons from its embedded approved logo."""
from __future__ import annotations
import argparse,base64,io,re
from pathlib import Path
from PIL import Image,ImageOps
ROOT=Path(__file__).resolve().parents[1]
BRAND=ROOT/"web"/"assets"/"brand"/"brand-art.svg"
def main():
    parser=argparse.ArgumentParser();parser.add_argument("--android",action="store_true");args=parser.parse_args()
    text=BRAND.read_text(encoding="utf-8");match=re.search(r'data:image/jpeg;base64,([^"]+)',text)
    if not match: raise RuntimeError("Embedded logo data was not found.")
    source=Image.open(io.BytesIO(base64.b64decode(match.group(1)))).convert("RGB")
    w,h=source.size;crop=source.crop((round(w*.1042),0,round(w*.8958),round(h*.5625)))
    mark=ImageOps.fit(crop,(512,512),method=Image.Resampling.LANCZOS)
    brand_dir=ROOT/"web"/"assets"/"brand";brand_dir.mkdir(parents=True,exist_ok=True)
    mark.resize((192,192),Image.Resampling.LANCZOS).save(brand_dir/"icon-192.png",optimize=True)
    mark.save(brand_dir/"icon-512.png",optimize=True)
    mark.resize((180,180),Image.Resampling.LANCZOS).save(ROOT/"web"/"apple-touch-icon.png",optimize=True)
    mark.save(ROOT/"web"/"favicon.ico",format="ICO",sizes=[(16,16),(32,32),(48,48),(64,64)])
    win=ROOT/"assets"/"byte-phantom.ico";win.parent.mkdir(parents=True,exist_ok=True)
    mark.save(win,format="ICO",sizes=[(16,16),(24,24),(32,32),(48,48),(64,64),(128,128),(256,256)])
    if args.android:
        res=ROOT/"android"/"app"/"src"/"main"/"res"
        if not res.exists(): raise RuntimeError("Run npx cap sync android before icon generation.")
        for density,size in {"mdpi":48,"hdpi":72,"xhdpi":96,"xxhdpi":144,"xxxhdpi":192}.items():
            folder=res/("mipmap-"+density);folder.mkdir(parents=True,exist_ok=True)
            small=mark.resize((size,size),Image.Resampling.LANCZOS)
            small.save(folder/"ic_launcher.png",optimize=True);small.save(folder/"ic_launcher_round.png",optimize=True)
            foreground=Image.new("RGBA",(size,size),(0,0,0,0));fg=mark.resize((round(size*.72),round(size*.72)),Image.Resampling.LANCZOS).convert("RGBA")
            foreground.alpha_composite(fg,((size-fg.width)//2,(size-fg.height)//2));foreground.save(folder/"ic_launcher_foreground.png",optimize=True)
    print("BYTE PHANTOM platform icons generated.")
if __name__=="__main__":main()
