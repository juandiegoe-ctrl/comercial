"""Build the six static category pages from the shared homepage shell.
Run after changing the shared head, header, footer or gallery markup.
"""
from pathlib import Path
import json, re, html
from urllib.parse import quote
ROOT=Path(__file__).resolve().parent.parent
DATA=[
 dict(key='pedestal',slug='lavamanos-de-pedestal',name='Lavamanos de pedestal',heading='Lavamanos de pedestal en terrazo y concreto',image='pedestal_02.webp',
 description='Lavamanos de pedestal en terrazo y concreto fabricados en Bogotá. Explora fotografías, colores y acabados de ESTONA y cotiza para tu proyecto.',
 intro='Una pieza de piso que reúne el lavamanos y su pedestal en un solo volumen. En ESTONA diseñamos y fabricamos lavamanos de pedestal en Bogotá, con opciones en concreto y terrazo para dar protagonismo al material en el baño.',
 section='Una pieza que define el baño',body='El formato de pedestal deja visible el cuerpo del lavamanos desde el borde hasta el piso. El color del fondo y la combinación de piedras del terrazo forman parte del diseño de toda la pieza, tanto en el exterior como en la zona de lavado.',
 details=['Formato de pedestal apoyado en piso.','Opciones de grifería de piso o pared, según el diseño del baño.','Carta de 21 colores y acabados para explorar en las fotografías compatibles.'],
 finish='Colores para el cuerpo y la poza',finishbody='Explora fondos claros, grises, negros y tonos de color, con acabados lisos y mezclas de terrazo. Las fotografías permiten comparar cómo se ve el material sobre el volumen del lavamanos.',
 faqs=[('¿Cómo elegir la grifería?','Comparte el diseño de tu baño y la ubicación prevista de las conexiones. La elección entre grifería de piso o de pared debe coordinarse con el lavamanos y su instalación.'),('¿Qué necesito para cotizar un lavamanos de pedestal?','Indica la cantidad de piezas, el acabado que te interesa y la ciudad del proyecto. Si tienes planos o una referencia del baño, inclúyelos en tu consulta.')]),
 dict(key='sobreponer',slug='lavamanos-de-sobreponer',name='Lavamanos de sobreponer',heading='Lavamanos de sobreponer en terrazo y concreto',image='sobreponer_03.webp',
 description='Lavamanos de sobreponer en terrazo y concreto de ESTONA. Fabricación en Bogotá, fotografías y selector de acabados para elegir el color de tu lavamanos.',
 intro='Lavamanos que se apoyan sobre el mesón y dejan a la vista la forma de la pieza. Fabricamos en Bogotá opciones en concreto y terrazo para combinar con el diseño del mueble, el mesón y la grifería del baño.',
 section='El lavamanos sobre el mesón',body='El formato de sobreponer permite que el recipiente tenga presencia propia sobre la superficie. Al definir el conjunto conviene revisar la altura del mueble, el espacio disponible alrededor de la pieza y la posición de la grifería.',
 details=['Instalación sobre mesón.','Grifería de mesón o de pared, según el diseño.','Opciones de color y de terrazo en la carta de acabados.'],
 finish='Elige el material del conjunto',finishbody='La galería reúne lavamanos en distintos ambientes. Puedes comparar colores de fondo y combinaciones de piedras antes de solicitar la cotización. En la fotografía que muestra lavamanos y mesón del mismo material, ambos cambian juntos.',
 faqs=[('¿Se puede combinar el lavamanos con un mesón del mismo material?','Sí, puedes consultar por un conjunto de lavamanos y mesón en el mismo acabado. Comparte las medidas y la distribución que necesitas para revisar el proyecto.'),('¿Qué información debo enviar para cotizar?','Indica la cantidad, el acabado y las medidas del espacio donde irá el lavamanos. También ayuda conocer si la grifería se instalará sobre el mesón o en la pared.')]),
 dict(key='tinas',slug='tinas-de-concreto',name='Tinas de concreto',heading='Tinas de concreto para tu baño',image='tinas_01_real_color_08.png',
 description='Tinas de concreto ESTONA fabricadas en Bogotá. Conoce sus formas y colores, explora fotografías y consulta la cotización para tu proyecto de baño.',
 intro='Tinas de concreto de base cementicia, diseñadas y fabricadas en Bogotá. Su volumen y sus colores permiten convertir la tina en una de las piezas principales del baño.',
 section='Planear el espacio de la tina',body='La ubicación de la tina se define junto con el espacio de circulación, el desagüe y la grifería. Antes de elegir una referencia conviene revisar el plano del baño y cómo se llevará la pieza hasta su lugar de instalación.',
 details=['Tinas para instalación sobre piso.','Grifería de piso o pared, según el proyecto.','Galería con ocho opciones de color plano.'],
 finish='Concreto y color',finishbody='Explora la tina en blanco, beige, gris, negro, tonos verdes, terracota y rosado. El selector permite comparar los colores sobre las fotografías del producto y conservar una referencia para la cotización.',
 faqs=[('¿Las tinas usan la misma carta de terrazo de los lavamanos?','En esta galería las tinas tienen su propio selector de ocho colores planos. Puedes consultar las opciones del producto al abrir las fotografías.'),('¿Qué se revisa antes de cotizar una tina?','Comparte las dimensiones del baño, la ubicación de la grifería y el desagüe, y la ciudad del proyecto. Incluye información de acceso al lugar para revisar el traslado y la instalación.')]),
 dict(key='mesas',slug='mesas-en-terrazo',name='Mesas de terrazo',heading='Mesas en terrazo hechas a medida',image='mesas_01.webp',
 description='Mesas en terrazo ESTONA: formatos redondos, cuadrados y rectangulares según necesidad. Fabricación en Bogotá y opciones de color para tapa y base metálica.',
 intro='Mesas de terrazo para proyectos que buscan definir el formato y el color del material. Diseñamos y fabricamos en Bogotá, con medidas según la necesidad de cada espacio.',
 section='Formato y medidas para tu espacio',body='La mesa con base metálica permite definir medidas y formatos cuadrados, redondos o rectangulares según la necesidad del proyecto. Para cotizarla, revisamos el espacio disponible y el tamaño de la tapa que buscas.',
 details=['Tapa de terrazo con opciones de la carta de acabados.','En la primera foto de la galería: base metálica con pintura electrostática.','Formatos y medidas de esa mesa según necesidad.'],
 finish='La tapa y la base se eligen por separado',finishbody='En la primera mesa de la galería puedes combinar el acabado de la tapa con el color de la base metálica. La base está disponible en blanco, negro, almendra, vinotinto, verde militar, azul rey, rojo y amarillo. Las opciones de base corresponden a esa referencia.',
 faqs=[('¿Todas las mesas tienen el mismo tipo de base?','No. La galería muestra distintas referencias. El selector de pintura electrostática corresponde a la mesa con base metálica de la primera fotografía.'),('¿Cómo cotizar una mesa de terrazo?','Comparte el formato, las medidas, la cantidad de mesas y el acabado de la tapa. Si eliges la referencia con base metálica, incluye también el color de la base.')]),
 dict(key='mesones',slug='mesones-en-terrazo',name='Mesones',heading='Mesones en terrazo a medida',image='mesones_01.webp',
 description='Mesones y barras en terrazo a medida de ESTONA. Fabricación en Bogotá, carta de 21 acabados y fotografías para elegir el material de tu proyecto.',
 intro='Superficies en terrazo para mesones y barras a medida. En ESTONA diseñamos y fabricamos en Bogotá, tomando las dimensiones y la distribución de cada proyecto como punto de partida.',
 section='Una superficie para cada proyecto',body='Las fotografías muestran barras y mesones donde el terrazo se combina con muebles, grifería y equipos. Para definir una superficie a medida necesitamos conocer el largo, el ancho, el espesor previsto y los espacios destinados a lavaplatos u otros elementos.',
 details=['Medidas y distribución según proyecto.','Opciones de fondo y colores de las piedras según la carta de acabados.','Galería con tres fotografías y selector de 21 acabados.'],
 finish='Compara el terrazo en una superficie amplia',finishbody='En una barra o mesón se aprecia la distribución de las piedras y su relación con el fondo. El selector permite comparar las mezclas sobre las fotografías; cuando aparecen dos mesones del mismo material, cambian al mismo acabado.',
 faqs=[('¿Puedo cotizar una barra y un mesón con el mismo acabado?','Sí. Comparte las medidas de cada superficie e indica que quieres el mismo material para ambas. Revisaremos el conjunto con la información de tu proyecto.'),('¿Qué debo enviar para cotizar un mesón?','Envía un plano o esquema con medidas, los espacios para lavaplatos y grifería, la cantidad de superficies y el acabado elegido. Incluye también la ciudad de instalación.')]),
 dict(key='rectangulares',slug='lavamanos-rectangulares',name='Lavamanos rectangulares',heading='Lavamanos rectangulares en terrazo y concreto',image='rectangulares_01.webp',
 description='Lavamanos rectangulares en terrazo y concreto ESTONA. Diseños sencillos y dobles, medidas según proyecto y carta de acabados. Fabricación en Bogotá.',
 intro='Lavamanos rectangulares en concreto y terrazo, con medidas según proyecto. Diseñamos y fabricamos en Bogotá piezas para baños que requieren integrar la zona de lavado y la superficie de apoyo.',
 section='Lavamanos sencillos y dobles',body='La galería reúne piezas con una o dos zonas de lavado y distintas distribuciones de mesón. Para definir el diseño se revisan el ancho disponible, el número de usuarios y la ubicación de las conexiones de agua y desagüe.',
 details=['Formato rectangular con medidas según proyecto.','Referencias sencillas y dobles en la galería.','Opciones de concreto y terrazo para el lavamanos y su superficie integrada.'],
 finish='Un mismo acabado en toda la pieza',finishbody='Explora el color en la superficie de apoyo, los bordes, el frente y el interior del lavamanos. El selector ofrece los 21 acabados de la carta sobre las fotografías de la galería para comparar el material en diferentes ambientes.',
 faqs=[('¿Se puede cotizar un lavamanos rectangular doble?','Sí. La galería incluye diseños dobles. Comparte las dimensiones del espacio y la ubicación de las griferías para revisar la distribución de las dos zonas de lavado.'),('¿Cómo elegir las medidas?','Parte del espacio disponible y del diseño del mueble o soporte. Envíanos un plano o esquema y el acabado que te interesa para revisar la pieza y preparar la cotización.')])
]
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
 whatsapp='https://wa.me/573113900646?text='+quote('Hola, quiero cotizar: '+d['name']+'.')
 content=f'''<main id="inicio" class="category-page"><section class="category-intro"><nav class="breadcrumbs" aria-label="Ruta de navegación"><a href="/">Inicio</a><span aria-hidden="true">/</span><span aria-current="page">{E(d['name'])}</span></nav><div class="eyebrow">ESTONA / FABRICACIÓN EN BOGOTÁ, COLOMBIA</div><h1>{E(d['heading'])}</h1><p>{E(d['intro'])}</p><div class="category-actions"><button type="button" data-gallery="{d['key']}">Ver fotos y acabados ↗</button><a href="{whatsapp}" target="_blank" rel="noopener">Cotizar {E(d['name'].lower())}</a></div></section><button type="button" class="category-photo" data-gallery="{d['key']}" aria-label="Ver fotografías y acabados de {E(d['name'].lower())}"><img src="assets/{d['image']}" alt="{E(d['heading'])} ESTONA" fetchpriority="high" decoding="async"/><span>Explorar fotos y colores ↗</span></button><section class="category-copy" aria-label="Información de {E(d['name'].lower())}"><div><h2>{E(d['section'])}</h2><p>{E(d['body'])}</p><ul>{''.join('<li>'+E(v)+'</li>' for v in d['details'])}</ul></div><div><h2>{E(d['finish'])}</h2><p>{E(d['finishbody'])}</p></div><div class="category-faq"><h2>Antes de cotizar</h2>{''.join('<h3>'+E(q)+'</h3><p>'+E(a)+'</p>' for q,a in d['faqs'])}</div></section>{links(d['key'])}<section class="contact" id="contacto"><div><div class="eyebrow">Hablemos de tu proyecto</div><h2>Hagámoslo<br/>realidad.</h2><p>Bogotá, Colombia</p></div><a class="quote" href="{whatsapp}" rel="noopener" target="_blank">COTIZAR ↗</a></section></main>'''
 # Reserve image space before it loads without changing the crop.
 from PIL import Image
 with Image.open(ROOT/'assets'/d['image']) as im:
  content=content.replace('fetchpriority="high"',f'width="{im.width}" height="{im.height}" fetchpriority="high"')
 out=ROOT/d['slug'];out.mkdir(exist_ok=True);(out/'index.html').write_text(h+'</head><body>'+header+content+footer+runtime)
urls=['https://estona.co/']+['https://estona.co/'+d['slug']+'/' for d in DATA]
(ROOT/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+''.join('  <url><loc>'+u+'</loc></url>\n' for u in urls)+'</urlset>\n')
print('Built six category pages and seven sitemap URLs')
