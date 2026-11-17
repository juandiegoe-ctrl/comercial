"""Build the six static category pages from the shared homepage shell.
Run after changing the shared head, header, footer or gallery markup.
"""
from pathlib import Path
import json, re, html
from urllib.parse import quote
ROOT=Path(__file__).resolve().parent.parent
DATA=[{'key': 'pedestal',
  'slug': 'lavamanos-de-pedestal',
  'name': 'Lavamanos de pedestal',
  'heading': 'Lavamanos de pedestal en terrazo y concreto',
  'image': 'pedestal_02.webp',
  'description': 'Lavamanos de pedestal en terrazo y concreto fabricados en Bogotá. Explora '
                 'fotografías, colores y acabados de ESTONA y cotiza para tu proyecto.'},
 {'key': 'sobreponer',
  'slug': 'lavamanos-de-sobreponer',
  'name': 'Lavamanos de sobreponer',
  'heading': 'Lavamanos de sobreponer en terrazo y concreto',
  'image': 'sobreponer_03.webp',
  'description': 'Lavamanos de sobreponer en terrazo y concreto de ESTONA. Fabricación en Bogotá, '
                 'fotografías y selector de acabados para elegir el color de tu lavamanos.'},
 {'key': 'tinas',
  'slug': 'tinas-de-concreto',
  'name': 'Tinas de concreto',
  'heading': 'Tinas de concreto para tu baño',
  'image': 'tinas_01_real_color_08.png',
  'description': 'Tinas de concreto ESTONA fabricadas en Bogotá. Conoce sus formas y colores, '
                 'explora fotografías y consulta la cotización para tu proyecto de baño.'},
 {'key': 'mesas',
  'slug': 'mesas-en-terrazo',
  'name': 'Mesas de terrazo',
  'heading': 'Mesas en terrazo hechas a medida',
  'image': 'mesas_01.webp',
  'description': 'Mesas en terrazo ESTONA: formatos redondos, cuadrados y rectangulares según '
                 'necesidad. Fabricación en Bogotá y opciones de color para tapa y base metálica.'},
 {'key': 'mesones',
  'slug': 'mesones-en-terrazo',
  'name': 'Mesones',
  'heading': 'Mesones en terrazo a medida',
  'image': 'mesones_01.webp',
  'description': 'Mesones y barras en terrazo a medida de ESTONA. Fabricación en Bogotá, carta de '
                 '21 acabados y fotografías para elegir el material de tu proyecto.'},
 {'key': 'rectangulares',
  'slug': 'lavamanos-rectangulares',
  'name': 'Lavamanos rectangulares',
  'heading': 'Lavamanos rectangulares en terrazo y concreto',
  'image': 'rectangulares_01.webp',
  'description': 'Lavamanos rectangulares en terrazo y concreto ESTONA. Diseños sencillos y '
                 'dobles, medidas según proyecto y carta de acabados. Fabricación en Bogotá.'}]
E=html.escape

def links(current=None):
 return '<section class="category-links" aria-label="Categorías de productos"><h2>Explora nuestras piezas</h2><nav>'+''.join(f'<a href="/{d["slug"]}/"'+(' aria-current="page"' if d['key']==current else '')+'>'+E(d['name'])+'</a>' for d in DATA)+'</nav></section>'

home=ROOT/'index.html';source=home.read_text()
# Idempotent homepage directory, rendered as HTML links without JavaScript.
source=re.sub(r'<!-- category-directory -->.*?<!-- /category-directory -->','',source,flags=re.S)
source=source.replace('<section class="breakline"','<!-- category-directory -->'+links()+'<!-- /category-directory --><section class="breakline"',1)
if 'href="assets/category-pages.css"' not in source:
 source=source.replace('</head>','<link rel="stylesheet" href="assets/category-pages.css"/></head>')
home.write_text(source)
head=source[:source.index('</head>')]
header=source[source.index('<body>')+6:source.index('<main')]
footer=source[source.index('<footer>'):source.index('<div aria-label="Ficha del producto"')]
runtime=source[source.index('<div aria-label="Ficha del producto"'):]
basegraph=json.loads(re.search(r'<script type="application/ld\+json">(.*?)</script>',head,re.S)[1])
for d in DATA:
 url='https://estona.co/'+d['slug']+'/'
 title=d['heading']+' en Bogotá | ESTONA' if d['key']!='mesas' else 'Mesas en terrazo a medida en Bogotá | ESTONA'
 h=re.sub(r'<title>.*?</title>','<title>'+E(title)+'</title>',head)
 h=re.sub(r'<meta content="[^"]*" name="description"/>','<meta content="'+E(d['description'],quote=True)+'" name="description"/>',h)
 for attr,key,value in [('property','og:title',title),('property','og:description',d['description']),('property','og:url',url),('property','og:image','https://estona.co/assets/'+d['image']),('property','og:image:alt',d['heading']+' ESTONA'),('name','twitter:title',title),('name','twitter:description',d['description']),('name','twitter:image','https://estona.co/assets/'+d['image'])]:
  h=re.sub(r'<meta '+attr+'="'+re.escape(key)+r'" content="[^"]*"/>','<meta '+attr+'="'+key+'" content="'+E(value,quote=True)+'"/>',h)
 h=re.sub(r'<link rel="canonical" href="[^"]*"/>','<link rel="canonical" href="'+url+'"/>',h)
 graph={'@context':'https://schema.org','@graph':basegraph['@graph'][:2]+[
 {'@type':'CollectionPage','@id':url+'#webpage','url':url,'name':title,'description':d['description'],'inLanguage':'es-CO','isPartOf':{'@id':'https://estona.co/#website'},'about':{'@id':'https://estona.co/#organization'},'primaryImageOfPage':{'@type':'ImageObject','url':'https://estona.co/assets/'+d['image']},'breadcrumb':{'@id':url+'#breadcrumb'}},
 {'@type':'BreadcrumbList','@id':url+'#breadcrumb','itemListElement':[{'@type':'ListItem','position':1,'name':'ESTONA','item':'https://estona.co/'},{'@type':'ListItem','position':2,'name':d['name'],'item':url}]}]}
 h=re.sub(r'<script type="application/ld\+json">.*?</script>','<script type="application/ld+json">'+json.dumps(graph,ensure_ascii=False,separators=(',',':'))+'</script>',h,flags=re.S)
 # Existing gallery controllers use paths relative to the site root.
 h=h.replace('<head>','<head><base href="/"/>',1)
 # Render the existing product sheet as the actual category page, including
 # the initial photo and technical text in the HTML before JavaScript runs.
 app=(ROOT/'assets/catalog.js').read_text()
 specs=json.loads(re.search(r';const specs=(.*?);\nlet active',app,re.S)[1])
 galleries=json.loads(re.search(r'const galleries=(.*?);const specs=',app,re.S)[1])
 gallery=galleries[d['key']]
 sheet=runtime
 sheet=sheet.replace('<div aria-label="Ficha del producto" aria-modal="true" class="lightbox" id="lightbox" role="dialog" tabindex="-1">','<main aria-label="'+E(d['name'])+'" class="lightbox open" id="lightbox" tabindex="-1">',1)
 sheet=sheet.replace('</div><script src="assets/catalog.js">','</main><script src="assets/catalog.js">',1)
 sheet=sheet.replace('<h2 id="gallery-label"></h2>','<h1 id="gallery-label">'+E(d['name'])+'</h1>',1)
 rows=''.join('<div class="tech-row"><span>'+E(k)+'</span><strong>'+E(v)+'</strong></div>' for k,v in specs[d['key']])
 sheet=sheet.replace('<div id="tech-rows"></div>','<div id="tech-rows">'+rows+'</div>',1)
 sheet=sheet.replace('<span id="gallery-count"></span>','<span id="gallery-count">01 / '+str(len(gallery['images'])).zfill(2)+'</span>',1)
 first=gallery['images'][0]
 sheet=sheet.replace('id="gallery-track" aria-label="Fotografías del producto" tabindex="0"></div>','id="gallery-track" aria-label="Fotografías del producto" tabindex="0"><div class="gallery-slide"><img src="'+first+'" alt="'+E(d['name'])+' ESTONA — fotografía 1" fetchpriority="high" decoding="async"/></div></div>',1)
 sheet=sheet.replace('id="product-quote" rel=', 'id="product-quote" href="https://wa.me/573113900646?text='+quote('Hola, quiero cotizar: '+d['name']+'.')+'" rel=',1)
 sheet=sheet.replace('</body>','<noscript><style>.lightbox{position:relative;min-height:100dvh}.photo-stage .gallery-track{position:absolute}.product-panel{max-height:none}.product-palette,.prev,.next,.close{display:none}</style><p><a href="/">Volver a ESTONA</a></p></noscript><script src="assets/category-page.js"></script></body>',1)
 out=ROOT/d['slug'];out.mkdir(exist_ok=True)
 (out/'index.html').write_text(h+'</head><body data-category="'+d['key']+'">'+sheet)
urls=['https://estona.co/']+['https://estona.co/'+d['slug']+'/' for d in DATA]
(ROOT/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+''.join('  <url><loc>'+u+'</loc></url>\n' for u in urls)+'</urlset>\n')
print('Built six category pages and seven sitemap URLs')
