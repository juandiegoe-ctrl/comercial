// Category URLs open the same configurator used on the homepage.
const category = document.body.dataset.category;
if (category && galleries[category]) openGallery(category);
