/* Color simulation for each bathtub photograph, using an isolated tub mask. */
(() => {
  const palette = document.querySelector('.product-colors-scroll');
  const note = document.querySelector('.tub-preview-note');
  let selected = 12;
  const sourcePromises = new Map();
  const photos = [
    { name: 'tinas_01', light: 155, clip: 'M134 1002 C130 935 327 875 570 839 C880 785 1137 776 1338 803 C1525 823 1693 854 1660 924 L1513 1384 Q1466 1504 900 1601 Q534 1698 307 1641 Q255 1625 237 1557 Z' },
    { name: 'tinas_ambiente', light: 180, clip: 'M135 948 C230 820 580 716 1124 716 L1600 712 L1600 1592 L260 1592 Z' },
    { name: 'tinas_rosa', light: 165 },
    { name: 'tinas_detalle_borde', light: 155 },
    { name: 'tinas_verde', light: 145 },
  ];
  let version = 0;

  function loadImage(src) {
    const image = new Image();
    image.src = src;
    return image.decode().then(() => image);
  }

  function sources(photoIndex) {
    const config = photos[photoIndex];
    if (!sourcePromises.has(photoIndex)) {
      const pending = Promise.all([
        loadImage('assets/' + config.name + '.webp'),
        loadImage('assets/' + config.name + '_mask.webp'),
      ]).then(([photo, mask]) => {
        const canvas = document.createElement('canvas');
        const scale = Math.min(1, 1280 / Math.max(photo.naturalWidth, photo.naturalHeight));
        canvas.width = Math.round(photo.naturalWidth * scale);
        canvas.height = Math.round(photo.naturalHeight * scale);
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(photo, 0, 0, canvas.width, canvas.height);
        const original = ctx.getImageData(0, 0, canvas.width, canvas.height);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        if (config.clip) {
          ctx.scale(canvas.width / photo.naturalWidth, canvas.height / photo.naturalHeight);
          ctx.clip(new Path2D(config.clip));
          ctx.drawImage(mask, 0, 0, photo.naturalWidth, photo.naturalHeight);
        } else {
          ctx.drawImage(mask, 0, 0, canvas.width, canvas.height);
        }
        ctx.restore();
        const segmentation = ctx.getImageData(0, 0, canvas.width, canvas.height);
        return { original, segmentation, width: canvas.width, height: canvas.height, light: config.light };
      }).catch(error => {
        sourcePromises.delete(photoIndex);
        throw error;
      });
      sourcePromises.set(photoIndex, pending);
    }
    return sourcePromises.get(photoIndex);
  }

  function freeze(canvas) {
    const opacity = getComputedStyle(canvas).opacity;
    canvas.getAnimations().forEach(animation => animation.cancel());
    canvas.style.opacity = opacity;
  }

  function transitionPreview(slide, next) {
    const previous = Array.from(slide.querySelectorAll('canvas'));
    previous.forEach(freeze);
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (next) {
      next.style.opacity = reduced ? '1' : '0';
      slide.append(next);
      if (reduced) {
        previous.forEach(canvas => canvas.remove());
        return;
      }
      const animation = next.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: 450, easing: 'ease-in-out', fill: 'forwards',
      });
      animation.finished.then(() => {
        next.style.opacity = '1';
        animation.cancel();
        previous.forEach(canvas => canvas.remove());
      }).catch(() => {});
    } else {
      previous.forEach(canvas => {
        if (reduced) { canvas.remove(); return; }
        canvas.animate([{ opacity: getComputedStyle(canvas).opacity }, { opacity: 0 }], {
          duration: 450, easing: 'ease-in-out', fill: 'forwards',
        }).finished.then(() => canvas.remove()).catch(() => {});
      });
    }
  }

  async function sync() {
    const request = ++version;
    if (active !== 'tinas') return;
    const buttons = palette.querySelectorAll('[data-tub-color]');
    buttons.forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.tubColor) === selected)));
    if (selected === null) return;
    const number = String(selected + 1).padStart(2, '0');
    document.querySelector('#product-quote').href = 'https://wa.me/573113900646?text=' + encodeURIComponent('Hola, quiero cotizar: Tinas de concreto. Color ' + number + '.');
    const photoIndex = index;
    const slide = track.children[photoIndex];
    if (!slide) return;
    if (selected === 12 && photoIndex === 0) {
      transitionPreview(slide, null);
      delete slide.dataset.previewColor;
      note.textContent = 'Color 13 · Rosado original';
      document.querySelector('#product-quote').href = 'https://wa.me/573113900646?text=' + encodeURIComponent('Hola, quiero cotizar: Tinas de concreto. Color 13, rosado original.');
      return;
    }
    if (slide.dataset.previewColor === String(selected)) {
      note.textContent = 'Color ' + number + ' · Vista aproximada';
      return;
    }
    note.textContent = 'Preparando color ' + number + '…';
    try {
      const { original, segmentation, width, height, light: baseLight } = await sources(photoIndex);
      if (request !== version || active !== 'tinas' || index !== photoIndex || !track.contains(slide)) return;
      const hex = tubColors[selected];
      const target = [1, 3, 5].map(offset => parseInt(hex.slice(offset, offset + 2), 16));
      const output = new ImageData(new Uint8ClampedArray(original.data), width, height);
      for (let i = 0; i < output.data.length; i += 4) {
        const weight = segmentation.data[i] / 255 * segmentation.data[i + 3] / 255;
        if (!weight) continue;
        const light = original.data[i] * .2126 + original.data[i + 1] * .7152 + original.data[i + 2] * .0722;
        // Retain measured texture and shadows, while replacing the pink base color.
        const shade = Math.max(.18, Math.min(1.3, light / baseLight));
        for (let c = 0; c < 3; c++) {
          const value = Math.min(255, target[c] * shade);
          output.data[i + c] = original.data[i + c] * (1 - weight) + value * weight;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.className = 'tub-color-canvas';
      canvas.setAttribute('role', 'img');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').putImageData(output, 0, 0);
      canvas.setAttribute('aria-label', 'Tina en color ' + number + '. Simulación aproximada.');
      transitionPreview(slide, canvas);
      slide.dataset.previewColor = String(selected);
      note.textContent = 'Color ' + number + ' · Vista aproximada';
    } catch {
      note.textContent = 'No se pudo cargar el color. Pulsa la muestra para reintentar.';
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
