/* Measure product interest and quote clicks, not completed conversations. */
(() => {
  function send(name, parameters) {
    if (typeof window.gtag === 'function') window.gtag('event', name, parameters);
  }

  window.estonaAnalytics = {
    viewProduct(key, name) {
      send('view_item', {
        items: [{ item_id: key, item_name: name, item_category: key }],
        product_category: key,
        entry_point: document.body.dataset.category ? 'category_page' : 'homepage_gallery',
      });
    },
  };

  function quoteClick(event) {
    if (event.defaultPrevented || (event.type === 'click' ? event.button !== 0 : event.button !== 1)) return;
    const link = event.target.closest('a[href]');
    if (!link || new URL(link.href).hostname !== 'wa.me') return;
    const key = typeof active !== 'undefined' && active ? active : 'general';
    const data = {
      product_category: key,
      link_placement: link.id === 'product-quote' ? 'product_sheet' : 'homepage_contact',
    };
    if (key !== 'general') {
      data.photo_number = String(index + 1).padStart(2, '0');
      const finish = document.querySelector('[data-pedestal-finish][aria-pressed="true"], [data-table-finish][aria-pressed="true"]');
      const tub = document.querySelector('[data-tub-color][aria-pressed="true"]');
      const base = document.querySelector('[data-table-base][aria-pressed="true"]');
      if (finish) data.finish_number = String(finish.dataset.pedestalFinish || finish.dataset.tableFinish).padStart(2, '0');
      if (tub) data.color_number = String(Number(tub.dataset.tubColor) + 1).padStart(2, '0');
      if (base) data.base_color = base.dataset.tableBase;
    }
    // Never include the WhatsApp URL, phone number or message text in this event.
    send('whatsapp_quote_click', data);
  }
  document.addEventListener('click', quoteClick);
  document.addEventListener('auxclick', quoteClick);
})();
