/* Color simulation for the first bathtub photo. Other photographs stay original. */
(() => {
  const palette = document.querySelector('.product-colors-scroll');
  const note = document.querySelector('.tub-preview-note');
  let selected = null;
  let sourcePromise;
  let version = 0;

  function loadImage(src) {
    const image = new Image();
    image.src = src;
    return image.decode().then(() => image);
  }

  function sources() {
    if (!sourcePromise) {
      sourcePromise = Promise.all([
        loadImage('assets/tinas_01.webp'),
        loadImage('assets/tinas_01_mask.webp'),
      ]).then(([photo, mask]) => {
        const canvas = document.createElement('canvas');
        canvas.width = photo.naturalWidth;
        canvas.height = photo.naturalHeight;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(photo, 0, 0);
        const original = ctx.getImageData(0, 0, canvas.width, canvas.height);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Clip the generated segmentation to the tub silhouette, excluding the tap.
        ctx.save();
        ctx.clip(new Path2D('M134 1002 C130 935 327 875 570 839 C880 785 1137 776 1338 803 C1525 823 1693 854 1660 924 L1513 1384 Q1466 1504 900 1601 Q534 1698 307 1641 Q255 1625 237 1557 Z'));
        ctx.drawImage(mask, 0, 0, canvas.width, canvas.height);
        ctx.restore();
        const segmentation = ctx.getImageData(0, 0, canvas.width, canvas.height);
        return { original, segmentation, width: canvas.width, height: canvas.height };
      }).catch(error => {
        sourcePromise = null;
        throw error;
      });
    }
    return sourcePromise;
  }

  async function sync() {
    const request = ++version;
    if (active !== 'tinas') return;
    const buttons = palette.querySelectorAll('[data-tub-color]');
    buttons.forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.tubColor) === selected)));
    if (selected === null) return;
    const number = String(selected + 1).padStart(2, '0');
    document.querySelector('#product-quote').href = 'https://wa.me/573113900646?text=' + encodeURIComponent('Hola, quiero cotizar: Tinas de concreto. Color ' + number + '.');
    const slide = track.firstElementChild;
    if (!slide || slide.dataset.previewColor === String(selected)) return;
    note.textContent = 'Preparando color ' + number + '…';
    try {
      const { original, segmentation, width, height } = await sources();
      if (request !== version || active !== 'tinas' || !track.contains(slide)) return;
      const hex = tubColors[selected];
      const target = [1, 3, 5].map(offset => parseInt(hex.slice(offset, offset + 2), 16));
      const output = new ImageData(new Uint8ClampedArray(original.data), width, height);
      for (let i = 0; i < output.data.length; i += 4) {
        const weight = segmentation.data[i] / 255 * segmentation.data[i + 3] / 255;
        if (!weight) continue;
        const light = original.data[i] * .2126 + original.data[i + 1] * .7152 + original.data[i + 2] * .0722;
        // Retain measured texture and shadows, while replacing the pink base color.
        const shade = Math.max(.18, Math.min(1.3, light / 155));
        for (let c = 0; c < 3; c++) {
          const value = Math.min(255, target[c] * shade);
          output.data[i + c] = original.data[i + c] * (1 - weight) + value * weight;
        }
      }
      let canvas = slide.querySelector('canvas');
      if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.className = 'tub-color-canvas';
        canvas.setAttribute('role', 'img');
        slide.append(canvas);
      }
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').putImageData(output, 0, 0);
      canvas.setAttribute('aria-label', 'Tina en color ' + number + '. Simulación aproximada.');
      slide.dataset.previewColor = String(selected);
      note.textContent = 'Color ' + number + ' · Vista aproximada · Foto 01';
    } catch {
      note.textContent = 'No se pudo cargar el color. Pulsa la muestra para reintentar.';
    }
  }

  palette.addEventListener('click', event => {
    const button = event.target.closest('[data-tub-color]');
    if (!button || active !== 'tinas') return;
    selected = Number(button.dataset.tubColor);
    index = 0;
    render();
  });
  window.tubColorPreview = { sync };
})();
