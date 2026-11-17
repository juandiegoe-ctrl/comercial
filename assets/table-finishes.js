/* Independent tabletop finishes and powder-coated metal base, photo 01 only. */
(() => {
  const original = 'assets/mesas_01_acabado_06.webp';
  const { definitions, description } = window.pedestalFinishes;
  const palette = document.querySelector('.product-colors-scroll');
  const panel = document.querySelector('.product-panel');
  const note = document.createElement('p');
  note.className = 'table-preview-note';
  note.setAttribute('role', 'status');
  note.hidden = true;
  palette.after(note);
  const baseColors = [
    { id: 'blanco', name: 'Blanco', hex: '#fafafa' },
    { id: 'negro', name: 'Negro', hex: '#202221' },
    { id: 'almendra', name: 'Almendra', hex: '#eeebe4' },
    { id: 'vinotinto', name: 'Vinotinto', hex: '#6b2438' },
    { id: 'verde-militar', name: 'Verde militar', hex: '#505c3f' },
    { id: 'azul-rey', name: 'Azul rey', hex: '#2049b4' },
    { id: 'rojo', name: 'Rojo', hex: '#bb3030' },
    { id: 'amarillo', name: 'Amarillo', hex: '#e5bb27' },
  ];
  const controls = document.createElement('section');
  controls.className = 'table-base-controls';
  controls.hidden = true;
  controls.setAttribute('aria-label', 'Color de la base metálica');
  const heading = document.createElement('h3');
  heading.className = 'table-base-heading';
  heading.textContent = 'Color de la base';
  const basePalette = document.createElement('div');
  basePalette.className = 'table-base-colors';
  const baseNote = document.createElement('p');
  baseNote.className = 'table-base-note';
  baseNote.setAttribute('role', 'status');
  controls.append(heading, basePalette, baseNote);
  document.querySelector('.product-palette').after(controls);
  basePalette.replaceChildren(...baseColors.map(color => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'table-base-button';
    button.dataset.tableBase = color.id;
    button.setAttribute('aria-label', `Base ${color.name.toLowerCase()}`);
    const sample = document.createElement('span');
    sample.className = 'base-sample';
    sample.style.backgroundColor = color.hex;
    const label = document.createElement('span');
    label.textContent = color.name;
    button.append(sample, label);
    return button;
  }));
  const technical = [
    ['Material', 'Tapa de terrazo'],
    ['Base', 'Metálica con pintura electrostática'],
    ['Formatos', 'Cuadrados, redondos y rectangulares'],
    ['Medidas', 'A medida, según necesidad'],
    ['Colores', 'Todos los acabados de la carta'],
  ];
  let currentSlide = null;
  let selected = 6;
  let baseId = null;
  let version = 0;
  let baseVersion = 0;
  const loaded = new Map();
  const supported = () => active === 'mesas' && index === 0;
  const source = id => id === 6 ? original : `assets/mesas_01_acabado_${String(id).padStart(2, '0')}.webp`;

  function updateQuote() {
    const finish = definitions.find(item => item.id === selected);
    const base = baseColors.find(item => item.id === baseId);
    document.querySelector('#product-quote').href = 'https://wa.me/573113900646?text=' + encodeURIComponent(
      `Hola, quiero cotizar: Mesa de terrazo. Foto 01. Acabado ${finish.number}. ${description(finish)}. Base metálica con pintura electrostática${base ? ` color ${base.name.toLowerCase()}` : ''}. Formato cuadrado, redondo o rectangular y medidas según necesidad.`
    );
  }

  function updateControls() {
    palette.querySelectorAll('[data-table-finish]').forEach(button => {
      button.setAttribute('aria-pressed', String(Number(button.dataset.tableFinish) === selected));
    });
    basePalette.querySelectorAll('[data-table-base]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.tableBase === baseId));
    });
    note.textContent = description(definitions.find(item => item.id === selected));
    const base = baseColors.find(item => item.id === baseId);
    baseNote.textContent = base ? `Base: ${base.name.toLowerCase()}` : 'Base verde';
    updateQuote();
  }

  function renderPalette() {
    palette.dataset.palette = 'mesas';
    document.querySelector('.product-palette-heading>span').textContent = 'Acabado de la tapa';
    palette.replaceChildren(...definitions.map(finish => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'swatch table-finish-button';
      button.dataset.tableFinish = finish.id;
      button.setAttribute('aria-label', `Acabado ${finish.number} · ${description(finish)}`);
      button.title = button.getAttribute('aria-label');
      const sample = document.createElement('img');
      sample.src = finish.sample;
      sample.alt = '';
      sample.loading = 'lazy';
      const meta = document.createElement('span');
      meta.className = 'swatch-meta';
      meta.textContent = finish.number;
      button.append(sample, meta);
      return button;
    }));
    palette.scrollLeft = 0;
  }

  function setupScene(slide) {
    let scene = slide.querySelector('.table-scene');
    if (scene) return scene;
    scene = document.createElement('div');
    scene.className = 'table-scene';
    scene.setAttribute('aria-hidden', 'true');
    slide.append(scene);
    return scene;
  }

  function clearScene() {
    version++;
    baseVersion++;
    track.querySelectorAll('.table-scene').forEach(scene => {
      scene.getAnimations({ subtree: true }).forEach(animation => animation.cancel());
      scene.remove();
    });
  }

  function sync() {
    const enabled = supported();
    panel.dataset.tableConfigurator = String(enabled);
    panel.dataset.tableGallery = String(active === 'mesas');
    controls.hidden = !enabled;
    note.hidden = !enabled;
    // Other table photos keep their own specifications and no interactive palette.
    if (active === 'mesas') document.querySelector('.product-palette').hidden = !enabled;
    else document.querySelector('.product-palette').hidden = false;
    if (!enabled) {
      clearScene();
      currentSlide = null;
      if (active === 'mesas') {
        document.querySelector('#tech-rows').replaceChildren(...specs.mesas.map(([key, value]) => technicalRow(key, value)));
        document.querySelector('#product-quote').href = 'https://wa.me/573113900646?text=' + encodeURIComponent(`Hola, quiero cotizar: Mesa de terrazo. Foto ${String(index + 1).padStart(2, '0')}.`);
      }
      return;
    }
    const slide = track.children[0];
    if (currentSlide !== slide) {
      clearScene();
      currentSlide = slide;
      selected = 6;
      baseId = null;
      slide.dataset.tablePreviewFinish = '6';
      slide.dataset.tablePreviewBase = '';
      setupScene(slide);
    }
    if (palette.dataset.palette !== 'mesas') renderPalette();
    document.querySelector('#tech-rows').replaceChildren(...technical.map(([key, value]) => technicalRow(key, value)));
    updateControls();
  }

  function technicalRow(key, value) {
    const row = document.createElement('div');
    row.className = 'tech-row';
    const label = document.createElement('span');
    label.textContent = key;
    const text = document.createElement('strong');
    text.textContent = value;
    row.append(label, text);
    return row;
  }

  async function selectFinish(id) {
    if (!supported() || !definitions.some(finish => finish.id === id)) return;
    const slide = currentSlide;
    const request = ++version;
    const url = source(id);
    try {
      if (!loaded.has(url)) {
        const preload = new Image();
        preload.src = url;
        loaded.set(url, preload.decode().catch(error => { loaded.delete(url); throw error; }));
      }
      await loaded.get(url);
      if (request !== version || !supported() || currentSlide !== slide) return;
      const scene = setupScene(slide);
      const next = new Image();
      next.src = url;
      next.className = 'table-top-photo';
      next.alt = '';
      await next.decode();
      if (request !== version || !supported() || currentSlide !== slide) return;
      const previous = Array.from(scene.querySelectorAll('.table-top-photo'));
      previous.forEach(image => {
        const opacity = getComputedStyle(image).opacity;
        image.getAnimations().forEach(animation => animation.cancel());
        image.style.opacity = opacity;
      });
      selected = id;
      updateControls();
      scene.append(next);
      next.style.opacity = '0';
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
        await next.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 450, easing: 'ease-in-out', fill: 'forwards' }).finished;
      }
      if (request !== version || !supported() || currentSlide !== slide) return;
      next.style.opacity = '1';
      next.getAnimations().forEach(animation => animation.cancel());
      previous.forEach(image => image.remove());
      slide.dataset.tablePreviewFinish = String(id);
    } catch {
      if (request === version && supported()) note.textContent = 'No se pudo cargar el acabado. Pulsa la muestra para reintentar.';
    }
  }

  function roundedBaseCap(image) {
    // Sample the photographed cylinder so the small rounded join matches each paint.
    const canvas = document.createElement('canvas');
    canvas.width = 6;
    canvas.height = 1;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    const stops = [868, 890, 915, 940, 963, 980].map((x, i) => {
      context.drawImage(image, Math.round(x / 1800 * image.naturalWidth), Math.round(1000 / 1671 * image.naturalHeight), 1, 1, i, 0, 1, 1);
      const pixel = context.getImageData(i, 0, 1, 1).data;
      return `<stop offset="${i / 5}" stop-color="rgb(${pixel[0]},${pixel[1]},${pixel[2]})"/>`;
    }).join('');
    const shape = 'M866 1044V958C896 978 954 978 984 958V1044Z';
    const contact = 'M866 953H984V958C954 978 896 978 866 958Z';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1800" height="1671" viewBox="0 0 1800 1671"><defs><linearGradient id="paint" x1="860" x2="988" y1="0" y2="0" gradientUnits="userSpaceOnUse">${stops}</linearGradient><linearGradient id="shadow" x1="0" x2="0" y1="951" y2="1004" gradientUnits="userSpaceOnUse"><stop stop-color="#10100e" stop-opacity=".48"/><stop offset=".35" stop-color="#10100e" stop-opacity=".24"/><stop offset=".7" stop-color="#10100e" stop-opacity=".06"/><stop offset="1" stop-color="#10100e" stop-opacity="0"/></linearGradient><linearGradient id="contact" x1="0" x2="0" y1="953" y2="976" gradientUnits="userSpaceOnUse"><stop stop-color="#10100e" stop-opacity=".72"/><stop offset="1" stop-color="#10100e" stop-opacity=".48"/></linearGradient><linearGradient id="fade" x1="0" x2="0" y1="994" y2="1036" gradientUnits="userSpaceOnUse"><stop stop-color="white"/><stop offset="1" stop-color="white" stop-opacity="0"/></linearGradient><mask id="blend"><path d="M850 940H1000V1050H850Z" fill="url(#fade)"/></mask></defs><g mask="url(#blend)"><path d="${contact}" fill="url(#paint)"/><path d="${contact}" fill="url(#contact)"/><path d="${shape}" fill="url(#paint)"/><path d="${shape}" fill="url(#shadow)"/></g></svg>`;
    const cap = document.createElement('span');
    cap.className = 'table-base-cap';
    cap.style.backgroundImage = `url('data:image/svg+xml,${encodeURIComponent(svg)}')`;
    return cap;
  }

  async function selectBase(id) {
    const color = baseColors.find(item => item.id === id);
    if (!supported() || !color) return;
    const request = ++baseVersion;
    const slide = currentSlide;
    const scene = setupScene(slide);
    const image = new Image();
    image.src = `assets/mesas_01_base_${id}.webp`;
    image.alt = '';
    image.className = 'table-base-photo';
    // Photographic variants retain the column's volume, metal rim and contact shadow.
    try {
      await image.decode();
      if (request !== baseVersion || !supported() || slide !== currentSlide) return;
      const previous = Array.from(scene.querySelectorAll('.table-base-layer'));
      previous.forEach(previousImage => {
        const opacity = getComputedStyle(previousImage).opacity;
        previousImage.getAnimations().forEach(animation => animation.cancel());
        previousImage.style.opacity = opacity;
      });
      baseId = id;
      updateControls();
      const layer = document.createElement('div');
      layer.className = 'table-base-layer';
      layer.append(image, roundedBaseCap(image));
      layer.style.opacity = '0';
      scene.append(layer);
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
        await layer.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 450, easing: 'ease-in-out', fill: 'forwards' }).finished;
      }
      if (request !== baseVersion || !supported() || slide !== currentSlide) return;
      layer.style.opacity = '1';
      layer.getAnimations().forEach(animation => animation.cancel());
      previous.forEach(previousImage => previousImage.remove());
      slide.dataset.tablePreviewBase = id;
    } catch {
      if (request === baseVersion && supported()) baseNote.textContent = 'No se pudo cargar el color. Pulsa la muestra para reintentar.';
    }
  }

  palette.addEventListener('click', event => {
    const button = event.target.closest('[data-table-finish]');
    if (button) selectFinish(Number(button.dataset.tableFinish));
  });
  basePalette.addEventListener('click', event => {
    const button = event.target.closest('[data-table-base]');
    if (button) selectBase(button.dataset.tableBase);
  });
  window.tableFinishes = { sync, renderPalette };
})();
