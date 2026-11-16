/* Photo 01: each finish has separately specified matrix and aggregate colors. */
(() => {
  const definitions = [
    [1, 'Rojo', null],
    [2, 'Menta', null],
    [3, 'Hueso', null],
    [4, 'Gris', null],
    [5, 'Gris oscuro', null],
    [6, 'Blanco', 'blancos, negros y grises'],
    [7, 'Original', 'los de la foto original'],
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
    image: id === 7 ? 'assets/pedestal_01.webp' : `assets/pedestal_01_acabado_${String(id).padStart(2, '0')}.png`,
    sample: id === 21 ? 'assets/pedestal_02.webp' : `assets/color_${String(id).padStart(2, '0')}.webp`,
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

  function description(finish) {
    return `Fondo ${finish.background} · ` + (finish.grains === null
      ? 'Sin granos · Textura fina de arena'
      : `Granos ${finish.grains}`);
  }

  function quote(finish) {
    document.querySelector('#product-quote').href = 'https://wa.me/573113900646?text=' + encodeURIComponent(
      `Hola, quiero cotizar: Lavamanos de pedestal. Acabado ${finish.number}. ${description(finish)}.`
    );
  }

  function renderPalette() {
    palette.dataset.palette = 'pedestal';
    document.querySelector('.product-palette-heading>span').textContent = 'Acabados · Foto 01';
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
      button.setAttribute('aria-pressed', String(index === 0 && Number(button.dataset.pedestalFinish) === selected));
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
    const image = track.children[0]?.querySelector('img');
    if (image !== currentImage) {
      version++;
      currentImage = image;
      selected = 7;
      if (image) {
        image.src = 'assets/pedestal_01.webp';
        image.dataset.finish = '7';
        image.alt = 'Lavamanos de pedestal — fotografía 1';
        image.classList.remove('pedestal-photo-preview');
      }
    }
    updateButtons();
    if (index !== 0) {
      note.textContent = 'Selecciona un acabado para verlo en la foto 01.';
      return;
    }
    const finish = definitions.find(item => item.id === selected);
    quote(finish);
    if (image?.dataset.finish === String(selected) || selected === 7) {
      note.textContent = selected === 7 ? 'Acabado 07 · Foto original' : `Acabado ${finish.number} · ${description(finish)}`;
    }
  }

  async function select(id) {
    const finish = definitions.find(item => item.id === id);
    if (!finish || active !== 'pedestal') return;
    const request = ++version;
    const image = track.children[0]?.querySelector('img');
    note.textContent = `Cargando acabado ${finish.number}…`;
    try {
      if (!loaded.has(id)) {
        const preload = new Image();
        preload.src = finish.image;
        loaded.set(id, preload.decode().catch(error => { loaded.delete(id); throw error; }));
      }
      await loaded.get(id);
      if (request !== version || active !== 'pedestal' || !track.contains(image)) return;
      selected = id;
      image.src = finish.image;
      image.dataset.finish = id;
      image.classList.add('pedestal-photo-preview');
      image.alt = `Lavamanos de pedestal · Acabado ${finish.number} · ${description(finish)}`;
      index = 0;
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
