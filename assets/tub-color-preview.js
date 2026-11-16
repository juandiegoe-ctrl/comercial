/* Photorealistic bathtub variants in the eight existing colors. */
(() => {
  const palette = document.querySelector('.product-colors-scroll');
  const note = document.querySelector('.tub-preview-note');
  const photos = ['tinas_01', 'tinas_ambiente', 'tinas_rosa', 'tinas_detalle_borde', 'tinas_verde'];
  const originalColors = [7, 7, 7, 5, 4];
  const loaded = new Map();
  let selected = null;
  let currentSlide = null;
  let version = 0;

  function clearPreviews(container = track) {
    container.querySelectorAll('.tub-color-photo').forEach(image => {
      image.getAnimations().forEach(animation => animation.cancel());
      image.remove();
    });
    if (container === track) Array.from(track.children).forEach(slide => delete slide.dataset.previewColor);
    else delete container.dataset.previewColor;
  }

  function freeze(image) {
    const opacity = getComputedStyle(image).opacity;
    image.getAnimations().forEach(animation => animation.cancel());
    image.style.opacity = opacity;
  }

  function transitionPreview(slide, next) {
    const previous = Array.from(slide.querySelectorAll('.tub-color-photo'));
    previous.forEach(freeze);
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (next) {
      next.style.opacity = reduced ? '1' : '0';
      slide.append(next);
      if (reduced) { previous.forEach(image => image.remove()); return; }
      const animation = next.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: 450, easing: 'ease-in-out', fill: 'forwards',
      });
      animation.finished.then(() => {
        next.style.opacity = '1';
        animation.cancel();
        previous.forEach(image => image.remove());
      }).catch(() => {});
    } else {
      previous.forEach(image => {
        if (reduced) { image.remove(); return; }
        image.animate([{ opacity: getComputedStyle(image).opacity }, { opacity: 0 }], {
          duration: 450, easing: 'ease-in-out', fill: 'forwards',
        }).finished.then(() => image.remove()).catch(() => {});
      });
    }
  }

  async function sync() {
    const request = ++version;
    if (active !== 'tinas') {
      currentSlide = null;
      selected = null;
      clearPreviews();
      return;
    }
    const photoIndex = index;
    const slide = track.children[photoIndex];
    if (!slide) return;
    if (slide !== currentSlide) {
      selected = null;
      currentSlide = slide;
      clearPreviews(slide);
    }
    palette.querySelectorAll('[data-tub-color]').forEach(button => {
      button.setAttribute('aria-pressed', String(selected !== null && Number(button.dataset.tubColor) === selected));
    });
    if (selected === null) {
      note.textContent = 'Color de la foto · Selecciona un color';
      document.querySelector('#product-quote').href = 'https://wa.me/573113900646?text=' + encodeURIComponent('Hola, quiero cotizar: Tinas de concreto.');
      return;
    }
    const number = String(selected + 1).padStart(2, '0');
    document.querySelector('#product-quote').href = 'https://wa.me/573113900646?text=' + encodeURIComponent(`Hola, quiero cotizar: Tinas de concreto. Color ${number}, ${tubColorNames[selected]}.`);
    const label = `Color ${number} · ${tubColorNames[selected]}`;
    if (selected === originalColors[photoIndex]) {
      transitionPreview(slide, null);
      delete slide.dataset.previewColor;
      note.textContent = label;
      return;
    }
    if (slide.dataset.previewColor === String(selected)) { note.textContent = label; return; }
    note.textContent = `Cargando color ${number}…`;
    const colorIndex = selected;
    const source = `assets/${photos[photoIndex]}_real_color_${number}.png`;
    try {
      if (!loaded.has(source)) {
        const image = new Image();
        image.src = source;
        loaded.set(source, image.decode().catch(error => { loaded.delete(source); throw error; }));
      }
      await loaded.get(source);
      if (request !== version || active !== 'tinas' || index !== photoIndex || !track.contains(slide)) return;
      const image = new Image();
      image.src = source;
      image.className = 'tub-color-photo';
      image.alt = `Tina en color ${number}, ${tubColorNames[colorIndex]}`;
      await image.decode();
      if (request !== version || active !== 'tinas' || index !== photoIndex || !track.contains(slide)) return;
      transitionPreview(slide, image);
      slide.dataset.previewColor = String(colorIndex);
      note.textContent = label;
    } catch {
      if (request === version) note.textContent = 'No se pudo cargar el color. Pulsa la muestra para reintentar.';
    }
  }

  palette.addEventListener('click', event => {
    const button = event.target.closest('[data-tub-color]');
    if (!button || active !== 'tinas') return;
    selected = Number(button.dataset.tubColor);
    render();
  });
  window.tubColorPreview = { sync };
})();
