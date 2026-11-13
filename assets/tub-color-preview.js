/* Color simulation for each bathtub photograph, using an isolated tub mask. */
(() => {
  const palette = document.querySelector('.product-colors-scroll');
  const note = document.querySelector('.tub-preview-note');
  let selected = null;
  let currentSlide = null;
  const sourcePromises = new Map();
  const photos = [
    { name: 'tinas_01', light: 155, clip: 'M134 1002 C130 935 327 875 570 839 C880 785 1137 776 1338 803 C1525 823 1693 854 1660 924 L1513 1384 Q1466 1504 900 1601 Q534 1698 307 1641 Q255 1625 237 1557 Z' },
    { name: 'tinas_ambiente', light: 180, expand: 2, clip: 'M135 928 C230 800 580 696 1124 696 L1600 692 L1600 1592 L260 1592 Z' },
    { name: 'tinas_rosa', light: 165, expand: 1 },
    { name: 'tinas_detalle_borde', light: 155, mask: 'tinas_detalle_borde_mask_v2' },
    { name: 'tinas_verde', light: 145, expand: 1 },
  ];
  let version = 0;

  function loadImage(src) {
    const image = new Image();
    image.src = src;
    return image.decode().then(() => image);
  }

  // Refine only boundary pixels, using the actual photograph to preserve object edges.
  // This runs once per photo; recoloring reuses the cached refined mask.
  function refineMask(photo, mask, expand = 0) {
    const { width, height } = mask;
    const stride = width + 1;
    const integral = new Float64Array(stride * (height + 1));
    const raw = new Float32Array(width * height);
    for (let y = 0; y < height; y++) {
      let rowSum = 0;
      for (let x = 0; x < width; x++) {
        const pixel = y * width + x;
        raw[pixel] = mask.data[pixel * 4] / 255 * mask.data[pixel * 4 + 3] / 255;
        if (expand && raw[pixel] < 1) {
          for (let ny = Math.max(0, y - expand); ny <= Math.min(height - 1, y + expand); ny++) {
            for (let nx = Math.max(0, x - expand); nx <= Math.min(width - 1, x + expand); nx++) {
              const neighbor = (ny * width + nx) * 4;
              raw[pixel] = Math.max(raw[pixel], mask.data[neighbor] / 255 * mask.data[neighbor + 3] / 255);
            }
          }
        }
        rowSum += raw[pixel];
        integral[(y + 1) * stride + x + 1] = integral[y * stride + x + 1] + rowSum;
      }
    }
    const radius = 3;
    for (let y = 0; y < height; y++) {
      const top = Math.max(0, y - radius), bottom = Math.min(height, y + radius + 1);
      for (let x = 0; x < width; x++) {
        const left = Math.max(0, x - radius), right = Math.min(width, x + radius + 1);
        const area = (right - left) * (bottom - top);
        const total = integral[bottom * stride + right] - integral[top * stride + right]
          - integral[bottom * stride + left] + integral[top * stride + left];
        const k = (y * width + x) * 4;
        let alpha = total < .001 ? 0 : total > area - .001 ? 1 : null;
        if (alpha === null) {
          let sum = 0, weights = 0;
          for (let ny = top; ny < bottom; ny++) {
            for (let nx = left; nx < right; nx++) {
              const n = (ny * width + nx) * 4;
              const dr = photo.data[k] - photo.data[n];
              const dg = photo.data[k + 1] - photo.data[n + 1];
              const db = photo.data[k + 2] - photo.data[n + 2];
              const distance = (nx - x) ** 2 + (ny - y) ** 2;
              const weight = Math.exp(-distance / 8 - (dr * dr + dg * dg + db * db) / 800);
              sum += raw[ny * width + nx] * weight;
              weights += weight;
            }
          }
          alpha = sum / weights;
          if (alpha < .02) alpha = 0;
          else if (alpha > .98) alpha = 1;
        }
        mask.data[k] = Math.round(alpha * 255);
        mask.data[k + 3] = 255;
      }
    }
  }

  function sources(photoIndex) {
    const config = photos[photoIndex];
    if (!sourcePromises.has(photoIndex)) {
      const pending = Promise.all([
        loadImage('assets/' + config.name + '.webp'),
        loadImage('assets/' + (config.mask || config.name + '_mask') + '.webp'),
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
        refineMask(original, segmentation, config.expand);
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
    if (active !== 'tinas') {
      currentSlide = null;
      selected = null;
      return;
    }
    const photoIndex = index;
    const slide = track.children[photoIndex];
    if (!slide) return;
    if (slide !== currentSlide) {
      selected = null;
      currentSlide = slide;
      track.querySelectorAll('canvas').forEach(canvas => {
        canvas.getAnimations().forEach(animation => animation.cancel());
        canvas.remove();
      });
      Array.from(track.children).forEach(item => delete item.dataset.previewColor);
    }
    const buttons = palette.querySelectorAll('[data-tub-color]');
    buttons.forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.tubColor) === selected)));
    if (selected === null) {
      note.textContent = 'Foto original · Selecciona un color';
      document.querySelector('#product-quote').href = 'https://wa.me/573113900646?text=' + encodeURIComponent('Hola, quiero cotizar: Tinas de concreto.');
      return;
    }
    const number = String(selected + 1).padStart(2, '0');
    document.querySelector('#product-quote').href = 'https://wa.me/573113900646?text=' + encodeURIComponent('Hola, quiero cotizar: Tinas de concreto. Color ' + number + ', ' + tubColorNames[selected] + '.');
    if ((selected === 7 && photoIndex <= 2) || (selected === 4 && photoIndex === 4) || (selected === 5 && photoIndex === 3)) {
      transitionPreview(slide, null);
      delete slide.dataset.previewColor;
      note.textContent = 'Color ' + number + ' · ' + tubColorNames[selected] + ' · Foto original';
      document.querySelector('#product-quote').href = 'https://wa.me/573113900646?text=' + encodeURIComponent('Hola, quiero cotizar: Tinas de concreto. Color ' + number + ', ' + tubColorNames[selected] + '.');
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
