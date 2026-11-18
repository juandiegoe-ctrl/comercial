"""Create delivery copies. Keep original photos and their framing untouched."""
from pathlib import Path
from PIL import Image,ImageOps
import re,json
ROOT=Path(__file__).resolve().parent.parent
catalog=(ROOT/'assets/catalog.js').read_text();g=json.loads(re.search(r'const galleries=(.*?);const specs=',catalog)[1])
tubs=[*list((ROOT/'assets').glob('tinas*_real_color_*.png')), *list((ROOT/'assets').glob('pedestal_*_acabado_*.png')), *list((ROOT/'assets').glob('sobreponer_*_acabado_*.png'))]
old=new=0
for p in tubs:
 with Image.open(p) as original:
  im=ImageOps.exif_transpose(original);opts={'quality':94,'method':6}
  if original.info.get('icc_profile'):opts['icc_profile']=original.info['icc_profile']
  dest=p.with_suffix('.webp');im.save(dest,**opts);old+=p.stat().st_size;new+=dest.stat().st_size
print('PNG delivery copies:',len(tubs),'files;',old,'->',new,'bytes',flush=True)
paths={v for entry in g.values() for v in entry['images']}
paths.update(['assets/pedestal_02.webp','assets/sobreponer_03.webp','assets/mesas_01.webp','assets/sobreponer_01.webp','assets/mesones_01.webp','assets/rectangulares_01.webp'])
paths={re.sub(r'(tinas.*_real_color_\d+)\.png$',r'\1.webp',p) for p in paths}
for p in sorted(paths):
 with Image.open(ROOT/p) as im:
  im=ImageOps.exif_transpose(im);im.thumbnail((1200,1200));dest=ROOT/'assets/mobile'/Path(p).name
  opts={'quality':90,'method':6}
  if im.info.get('icc_profile'):opts['icc_profile']=im.info['icc_profile']
  im.save(dest,**opts)
  if dest.stat().st_size >= (ROOT/p).stat().st_size:
   import shutil;shutil.copyfile(ROOT/p,dest)
with Image.open(ROOT/'assets/color_21.png') as im:
 im.thumbnail((240,240));im.save(ROOT/'assets/color_21.webp',quality=94,method=6)
manifest=sorted(paths)
(ROOT/'assets/image-sources.js').write_text('/* Delivery copies preserve each original photograph and crop. */\nconst mobilePhotoSources = new Set('+json.dumps(manifest,separators=(',',':'))+');\nfunction catalogImageURL(source) {\n  return matchMedia(\'(max-width: 600px)\').matches && mobilePhotoSources.has(source)\n    ? source.replace(\'assets/\', \'assets/mobile/\') : source;\n}\n')
print('Mobile copies:',len(paths),flush=True)

# The background SVG embeds a PNG; WebP lossless preserves its rendered pixels.
from io import BytesIO
import base64
svg=(ROOT/'assets/textura-fondo.svg').read_text()
data=base64.b64decode(re.search(r'data:image/png;base64,([^\"]+)',svg)[1])
with Image.open(BytesIO(data)) as texture:
 texture.save(ROOT/'assets/textura-fondo.webp',lossless=True,method=6)
