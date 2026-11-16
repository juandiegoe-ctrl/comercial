/* Photos 01 and 02: separately specified matrix and aggregate colors. */
(() => {
  const definitions = [
    [1, 'Rojo', null],
    [2, 'Menta', null],
    [3, 'Hueso', null],
    [4, 'Gris', null],
    [5, 'Gris oscuro', null],
    [6, 'Blanco', 'blancos, negros y grises'],
    [7, 'Hueso', 'rojos, negros y grises'],
    [8, 'Hueso original', 'todos blancos'],
    [9, 'Blanco', 'blancos, verdes y azules'],
    [10, 'Blanco', 'grises y rosados'],
    [11, 'Negro', 'todos negros'],
    [12, 'Negro', 'todos blancos'],
    [13, 'Gris', 'blancos y negros'],
    [14, 'Gris', 'blancos, amarillos y negros'],
    [15, 'Hueso original', 'rojos y negros'],
    [16, 'Azul claro', 'blancos y negros'],
    [17, 'Amarillo', 'blancos y negros'],
    [18, 'Rosado', 'blancos y negros'],
    [19, 'Terracota', 'amarillos, blancos y rojos'],
    [20, 'Verde', 'blancos, verdes oscuros y rojos'],
    [21, 'Verde de la foto 02', 'blancos y negros'],
  ].map(([id, background, grains]) => ({
    id, background, grains,
    number: String(id).padStart(2, '0'),
    sample: id === 21 ? 'assets/color_21.png' : `assets/color_${String(id).padStart(2, '0')}.webp`,
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
  const photos = [
    { number: '01', original: 7 },
    { number: '02', original: 21 },
  ];

  function imageSource(photoIndex, finishId) {
    const photo = photos[photoIndex];
    return finishId === photo.original
      ? `assets/pedestal_${photo.number}.webp`
      : `assets/pedestal_${photo.number}_acabado_${String(finishId).padStart(2, '0')}.png`;
  }

  function description(finish) {
    return `Fondo ${finish.background} · ` + (finish.grains === null
      ? 'Sin granos · Textura fina de arena'
      : `Granos ${finish.grains}`);
  }

  function quote(finish) {
    document.querySelector('#product-quote').href = 'https://wa.me/573113900646?text=' + encodeURIComponent(
      `Hola, quiero cotizar: Lavamanos de pedestal. Foto ${photos[index].number}. Acabado ${finish.number}. ${description(finish)}.`
    );
  }

  function renderPalette() {
    palette.dataset.palette = 'pedestal';
    document.querySelector('.product-palette-heading>span').textContent = 'Acabados · Fotos 01 y 02';
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
      button.disabled = !photos[index];
      button.setAttribute('aria-pressed', String(!!photos[index] && Number(button.dataset.pedestalFinish) === selected));
    });
  }

  function sync() {
    if (active !== 'pedestal') {
      version++;
      currentImage = null;
      selected = 7;
      note.hidden = true;
      return;
    }
    note.hidden = false;
    if (palette.dataset.palette !== 'pedestal') renderPalette();
    const photo = photos[index];
    document.querySelector('.product-palette-heading>span').textContent = photo
      ? `Acabados · Foto ${photo.number}` : 'Acabados · Fotos 01 y 02';
    const image = photo ? track.children[index]?.querySelector('img') : null;
    if (image !== currentImage) {
      version++;
      currentImage = image;
      selected = photo?.original ?? 7;
      if (image) {
        image.src = imageSource(index, selected);
        image.dataset.finish = selected;
        image.alt = `Lavamanos de pedestal — fotografía ${photo.number}`;
        image.classList.remove('pedestal-photo-preview');
      }
    }
    updateButtons();
    if (!photo) {
      note.textContent = 'Acabados disponibles en las fotos 01 y 02.';
      return;
    }
    const finish = definitions.find(item => item.id === selected);
    quote(finish);
    if (image?.dataset.finish === String(selected)) {
      note.textContent = selected === photo.original ? `Acabado ${finish.number} · Foto original` : `Acabado ${finish.number} · ${description(finish)}`;
    }
  }

  async function select(id) {
    const finish = definitions.find(item => item.id === id);
    if (!finish || active !== 'pedestal' || !photos[index]) return;
    const photoIndex = index;
    const source = imageSource(photoIndex, id);
    const request = ++version;
    const image = track.children[photoIndex]?.querySelector('img');
    note.textContent = `Cargando acabado ${finish.number}…`;
    try {
      if (!loaded.has(source)) {
        const preload = new Image();
        preload.src = source;
        loaded.set(source, preload.decode().catch(error => { loaded.delete(source); throw error; }));
      }
      await loaded.get(source);
      if (request !== version || active !== 'pedestal' || index !== photoIndex || !track.contains(image)) return;
      selected = id;
      image.src = source;
      image.dataset.finish = id;
      image.classList.add('pedestal-photo-preview');
      image.alt = `Lavamanos de pedestal · Foto ${photos[photoIndex].number} · Acabado ${finish.number} · ${description(finish)}`;
      render();
    } catch {
      if (request === version) note.textContent = 'No se pudo cargar el acabado. Pulsa la muestra para reintentar.';
    }
  }

  palette.addEventListener('click', event => {
    const button = event.target.closest('[data-pedestal-finish]');
    if (button) select(Number(button.dataset.pedestalFinish));
  });
  window.pedestalFinishes = { sync, renderPalette };
})();
