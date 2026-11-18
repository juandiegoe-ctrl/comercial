/* Shared material previews for sinks and countertops. */
(() => {
  const definitions = [
    [1, 'Rojo', null],
    [2, 'Menta', null],
    [3, 'Hueso', null],
    [4, 'Gris', null],
    [5, 'Gris oscuro', null],
    [6, 'Blanco', 'blancos, negros y grises'],
    [7, 'Hueso', 'rojos, negros y grises'],
    [8, 'Hueso', 'todos blancos'],
    [9, 'Blanco', 'blancos, verdes y azules'],
    [10, 'Blanco', 'grises y rosados'],
    [11, 'Negro', 'todos negros'],
    [12, 'Negro', 'todos blancos'],
    [13, 'Gris', 'blancos y negros'],
    [14, 'Gris', 'blancos, amarillos y negros'],
    [15, 'Hueso', 'rojos y negros'],
    [16, 'Azul claro', 'blancos y negros'],
    [17, 'Amarillo', 'blancos y negros'],
    [18, 'Rosado', 'blancos y negros'],
    [19, 'Terracota', 'amarillos, blancos y rojos'],
    [20, 'Verde', 'blancos, verdes oscuros y rojos'],
    [21, 'Verde', 'blancos y negros'],
  ].map(([id, background, grains]) => ({
    id, background, grains,
    number: String(id).padStart(2, '0'),
    sample: id === 21 ? 'assets/color_21.webp' : `assets/color_${String(id).padStart(2, '0')}.webp`,
  }));
  const palette = document.querySelector('.product-colors-scroll');
  const note = document.createElement('p');
  note.className = 'pedestal-preview-note';
  note.setAttribute('role', 'status');
  palette.after(note);
  let selected = 7;
  let version = 0;
  let currentImage = null;
  const loaded = new Map();
  const products = {
    mesones: {
      name: 'Mesones',
      photos: [
        { number: '01', original: 15, extension: 'webp' },
        { number: '02', original: 13, extension: 'webp' },
        { number: '03', original: 15, extension: 'webp' },
      ],
    },
    pedestal: {
      name: 'Lavamanos de pedestal',
      photos: [
        { number: '01', original: 7 },
        { number: '02', original: 21 },
        { number: '03', original: 2 },
        { number: '04', original: 4, source: 'assets/pedestal_ambiente_04.webp', counter: true },
      ],
    },
    sobreponer: {
      name: 'Lavamanos de sobreponer',
      photos: [
        { number: '01', original: 16 },
        { number: '02', original: 20 },
        { number: '03', original: 2 },
        { number: '04', original: null, source: 'assets/sobreponer_amarillo.webp', extension: 'webp' },
        { number: '05', original: 11, source: 'assets/sobreponer_ambiente.webp', extension: 'webp' },
        { number: '06', original: 3, source: 'assets/sobreponer_hueso.webp', extension: 'webp' },
        { number: '07', original: 4, source: 'assets/sobreponer_terrazo_claro.webp', extension: 'webp' },
        { number: '08', original: 10, source: 'assets/sobreponer_ambiente_calido_01.webp', extension: 'webp' },
      ],
    },
    rectangulares: {
      name: 'Lavamanos rectangulares',
      photos: [
        { number: '01', original: 21, extension: 'webp' },
        { number: '02', original: 4, extension: 'webp' },
        { number: '03', original: 4, extension: 'webp' },
        { number: '04', original: 7, extension: 'webp' },
        { number: '05', original: 21, extension: 'webp' },
        { number: '06', original: null, extension: 'webp' },
        { number: '07', original: null, extension: 'webp' },
      ],
    },
  };

  function clearTransitions() {
    track.querySelectorAll('.pedestal-finish-overlay').forEach(overlay => {
      overlay.getAnimations().forEach(animation => animation.cancel());
      overlay.remove();
    });
  }

  async function transitionFinish(image, source, request) {
    const slide = image.parentElement;
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const overlay = new Image();
      overlay.className = 'pedestal-finish-overlay';
      overlay.alt = '';
      overlay.setAttribute('aria-hidden', 'true');
      overlay.src = source;
      await overlay.decode();
      if (request !== version || !track.contains(image)) return false;
      // Keep an interrupted fade visible while the next image fades over it.
      slide.querySelectorAll('.pedestal-finish-overlay').forEach(previous => {
        const opacity = getComputedStyle(previous).opacity;
        previous.getAnimations().forEach(animation => animation.cancel());
        previous.style.opacity = opacity;
      });
      overlay.style.opacity = '0';
      slide.append(overlay);
      await overlay.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: 450, easing: 'ease-in-out', fill: 'forwards',
      }).finished;
      if (request !== version || !track.contains(image)) return false;
    }
    image.src = source;
    await image.decode();
    if (request !== version || !track.contains(image)) return false;
    slide.querySelectorAll('.pedestal-finish-overlay').forEach(overlay => {
      overlay.getAnimations().forEach(animation => animation.cancel());
      overlay.remove();
    });
    return true;
  }

  function imageSource(photoIndex, finishId) {
    const photo = products[active].photos[photoIndex];
    return catalogImageURL(finishId === photo.original
      ? photo.source || `assets/${active}_${photo.number}.webp`
      : `assets/${active}_${photo.number}_acabado_${String(finishId).padStart(2, '0')}.${photo.extension || 'webp'}`);
  }

  function description(finish) {
    return `Fondo ${finish.background.toLowerCase()}` + (finish.grains === null
      ? ''
      : ` con granos ${finish.grains.replace(/^todos /, '')}`);
  }

  function quote(finish) {
    const product = products[active];
    const photo = product.photos[index];
    document.querySelector('#product-quote').href = 'https://wa.me/573113900646?text=' + encodeURIComponent(
      `Hola, quiero cotizar: ${product.name}. Foto ${photo.number}. Acabado ${finish.number}. ${description(finish)}.${photo.counter ? ' Con mini mesón del mismo material.' : ''}`
    );
  }

  function renderPalette() {
    palette.dataset.palette = active;
    document.querySelector('.product-palette-heading>span').textContent = 'Acabados';
    palette.replaceChildren(...definitions.map(finish => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'swatch pedestal-finish-button';
      button.dataset.pedestalFinish = finish.id;
      button.title = `Acabado ${finish.number} · ${description(finish)}`;
      button.setAttribute('aria-label', button.title);
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

  function updateButtons() {
    palette.querySelectorAll('[data-pedestal-finish]').forEach(button => {
      button.disabled = !products[active]?.photos[index];
      button.setAttribute('aria-pressed', String(!!products[active]?.photos[index] && Number(button.dataset.pedestalFinish) === selected));
    });
  }

  function sync() {
    if (!products[active]) {
      version++;
      clearTransitions();
      currentImage = null;
      selected = 7;
      note.hidden = true;
      return;
    }
    note.hidden = false;
    if (palette.dataset.palette !== active) renderPalette();
    const photo = products[active].photos[index];
    document.querySelector('.product-palette-heading>span').textContent = 'Acabados';
    const image = photo ? track.children[index]?.querySelector('img') : null;
    if (image !== currentImage) {
      version++;
      clearTransitions();
      currentImage = image;
      selected = photo ? photo.original : null;
      if (image) {
        image.src = imageSource(index, selected);
        image.dataset.finish = selected === null ? '' : selected;
        image.alt = `${products[active].name} — fotografía ${photo.number}`;
        image.classList.remove('pedestal-photo-preview');
      }
    }
    updateButtons();
    if (!photo) {
      note.textContent = '';
      note.hidden = true;
      return;
    }
    if (selected === null) {
      note.textContent = '';
      note.hidden = false;
      document.querySelector('#product-quote').href = 'https://wa.me/573113900646?text=' + encodeURIComponent(
        `Hola, quiero cotizar: ${products[active].name}. Foto ${photo.number}.`
      );
      return;
    }
    const finish = definitions.find(item => item.id === selected);
    quote(finish);
    if (image?.dataset.finish === String(selected)) {
      note.textContent = description(finish);
    }
  }

  async function select(id) {
    const finish = definitions.find(item => item.id === id);
    if (!finish || !products[active]?.photos[index]) return;
    const productKey = active;
    const product = products[productKey];
    const photoIndex = index;
    const source = imageSource(photoIndex, id);
    const request = ++version;
    const image = track.children[photoIndex]?.querySelector('img');
    try {
      if (!loaded.has(source)) {
        const preload = new Image();
        preload.src = source;
        loaded.set(source, preload.decode().catch(error => { loaded.delete(source); throw error; }));
      }
      await loaded.get(source);
      if (request !== version || active !== productKey || index !== photoIndex || !track.contains(image)) return;
      selected = id;
      note.hidden = false;
      updateButtons();
      quote(finish);
      note.textContent = description(finish);
      if (!await transitionFinish(image, source, request)) return;
      image.dataset.finish = id;
      image.classList.add('pedestal-photo-preview');
      image.alt = `${product.name} · Foto ${product.photos[photoIndex].number} · Acabado ${finish.number} · ${description(finish)}`;
      render();
    } catch {
      if (request === version) note.textContent = 'No se pudo cargar el acabado. Pulsa la muestra para reintentar.';
    }
  }

  palette.addEventListener('click', event => {
    const button = event.target.closest('[data-pedestal-finish]');
    if (button) select(Number(button.dataset.pedestalFinish));
  });
  window.pedestalFinishes = { sync, renderPalette, definitions, description };
})();
