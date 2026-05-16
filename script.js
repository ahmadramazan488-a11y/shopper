const products = Array.isArray(window.BAYAD_PRODUCTS)
  ? window.BAYAD_PRODUCTS.map((product) => ({ ...product }))
  : [];
const translations = window.BAYAD_TRANSLATIONS || {};
const language = document.documentElement.lang || 'en';

const productGrid = document.getElementById('productGrid');
const cartCount = document.getElementById('cartCount');
const cartDrawer = document.getElementById('cartDrawer');
const cartItems = document.getElementById('cartItems');
const cartSubtotal = document.getElementById('cartSubtotal');
const cartTotal = document.getElementById('cartTotal');
const modalTotal = document.getElementById('modalTotal');
const orderModal = document.getElementById('orderModal');
const orderForm = document.getElementById('orderForm');
const productModal = document.getElementById('productModal');
const productDetail = document.getElementById('productDetail');
const searchInput = document.getElementById('searchInput');
const toast = document.getElementById('toast');
const heroProductArt = document.getElementById('heroProductArt');
const heroProductName = document.getElementById('heroProductName');
const heroProductPrice = document.getElementById('heroProductPrice');

let searchTerm = '';
let cart = JSON.parse(localStorage.getItem('restaurant-cart') || '{}');

function t(key) {
  return translations[language]?.[key] || translations.en?.[key] || key;
}

function money(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

function saveCart() {
  localStorage.setItem('restaurant-cart', JSON.stringify(cart));
}

function getProduct(id) {
  return products.find((item) => item.id === id);
}

function getCartEntries() {
  return Object.entries(cart)
    .map(([id, quantity]) => ({ product: getProduct(id), quantity }))
    .filter((entry) => entry.product && entry.quantity > 0);
}

function cartSubtotalValue() {
  return getCartEntries().reduce((sum, entry) => sum + entry.product.price * entry.quantity, 0);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 2200);
}

function productVisual(product, size = 'card') {
  if (product.image) {
    return `
      <div class="product-visual product-visual-${size}" style="--tone:${product.tone}">
        <img src="${product.image}" alt="${product.imageAlt}" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;" />
      </div>
    `;
  }

  return `
    <div class="product-visual product-visual-${size}" style="--tone:${product.tone}">
      <span class="visual-shape visual-${product.visual}"></span>
    </div>
  `;
}

function filteredProducts() {
  return products.filter((product) => {
    return !searchTerm || `${product.name} ${product.description}`.toLowerCase().includes(searchTerm);
  });
}

function renderHero() {
  const featured = products[0];
  if (!featured) return;
  heroProductArt.innerHTML = productVisual(featured, 'hero');
  heroProductName.textContent = featured.name;
  heroProductPrice.textContent = money(featured.price);
}

function renderProducts() {
  const visibleProducts = filteredProducts();

  if (!visibleProducts.length) {
    productGrid.innerHTML = `<div class="empty-results">${t('emptyResults')}</div>`;
    return;
  }

  productGrid.innerHTML = visibleProducts.map((product) => `
    <article class="product-card">
      <button class="product-open" type="button" data-open-product="${product.id}" aria-label="Open ${product.name}">
        ${productVisual(product)}
      </button>
      <div class="product-info">
        <div class="product-meta">
          <span class="product-badge">${product.badge}</span>
        </div>
        <div class="product-top">
          <h3>${product.name}</h3>
          <span class="price">${money(product.price)}</span>
        </div>
        <p>${product.description}</p>
        <div class="product-actions">
          <button class="details-button" type="button" data-open-product="${product.id}">${t('viewDetails')}</button>
          <button class="add-button" type="button" data-add="${product.id}">${t('addToOrder')}</button>
        </div>
      </div>
    </article>
  `).join('');
}

function renderCart() {
  const entries = getCartEntries();
  const itemCount = entries.reduce((sum, entry) => sum + entry.quantity, 0);
  const subtotal = cartSubtotalValue();
  cartCount.textContent = itemCount;
  cartSubtotal.textContent = money(subtotal);
  cartTotal.textContent = money(subtotal);
  modalTotal.textContent = money(subtotal);

  if (!entries.length) {
    cartItems.innerHTML = `<div class="empty-cart">${t('emptyCart')}</div>`;
    return;
  }

  cartItems.innerHTML = entries.map(({ product, quantity }) => `
    <div class="cart-item">
      ${productVisual(product, 'thumb')}
      <div>
        <h3>${product.name}</h3>
        <p>${money(product.price)} ${t('each')}</p>
        <button class="remove-button" type="button" data-remove="${product.id}">${t('remove')}</button>
      </div>
      <div class="qty-controls" aria-label="${t('quantityControlsFor')} ${product.name}">
        <button type="button" data-decrease="${product.id}">-</button>
        <strong>${quantity}</strong>
        <button type="button" data-increase="${product.id}">+</button>
      </div>
    </div>
  `).join('');
}

function addToCart(id) {
  const product = getProduct(id);
  if (!product) return;
  cart[id] = (cart[id] || 0) + 1;
  saveCart();
  renderCart();
  showToast(`${product.name} ${t('addedToOrder')}`);
}

function changeQuantity(id, amount) {
  cart[id] = (cart[id] || 0) + amount;
  if (cart[id] <= 0) delete cart[id];
  saveCart();
  renderCart();
}

function openCart() {
  cartDrawer.classList.add('open');
  cartDrawer.setAttribute('aria-hidden', 'false');
}

function closeCart() {
  cartDrawer.classList.remove('open');
  cartDrawer.setAttribute('aria-hidden', 'true');
}

function openProduct(id) {
  const product = getProduct(id);
  if (!product) return;

  productDetail.innerHTML = `
    <button class="icon-button modal-close" type="button" data-close-product aria-label="${t('closeDishDetails')}">&times;</button>
    <div class="detail-media">
      <span class="hero-pill">${product.badge}</span>
      ${productVisual(product, 'detail')}
    </div>
    <div class="detail-copy">
      <h2>${product.name}</h2>
      <strong class="detail-price">${money(product.price)}</strong>
      <p>${product.detail}</p>
      <ul>
        <li>${t('freshlyPrepared')}</li>
        <li>${t('pickupOrDelivery')}</li>
        <li>${t('replacePhotos')}</li>
      </ul>
      <div class="detail-actions">
        <button class="add-button" type="button" data-add="${product.id}" data-close-after-add>${t('addToOrder')}</button>
        <button class="secondary-link button-reset" type="button" data-close-product>${t('keepBrowsing')}</button>
      </div>
    </div>
  `;
  productModal.showModal();
}

function closeProduct() {
  if (productModal.open) productModal.close();
}

function openCheckout() {
  if (!getCartEntries().length) {
    openCart();
    showToast(t('addBeforeCheckout'));
    return;
  }
  closeCart();
  orderModal.showModal();
}

document.getElementById('openCart').addEventListener('click', openCart);
document.getElementById('closeCart').addEventListener('click', closeCart);
document.getElementById('checkoutButton').addEventListener('click', openCheckout);
document.getElementById('drawerCheckout').addEventListener('click', openCheckout);
document.getElementById('heroCheckout').addEventListener('click', openCheckout);

cartDrawer.addEventListener('click', (event) => {
  if (event.target === cartDrawer) closeCart();
});

productModal.addEventListener('click', (event) => {
  if (event.target === productModal) closeProduct();
});

searchInput.addEventListener('input', (event) => {
  searchTerm = event.target.value.trim().toLowerCase();
  renderProducts();
});

document.addEventListener('click', (event) => {
  const addId = event.target.dataset.add;
  const increaseId = event.target.dataset.increase;
  const decreaseId = event.target.dataset.decrease;
  const removeId = event.target.dataset.remove;
  const openProductId = event.target.dataset.openProduct;

  if (openProductId) openProduct(openProductId);
  if (addId) {
    addToCart(addId);
    if (event.target.dataset.closeAfterAdd !== undefined) closeProduct();
  }
  if (increaseId) changeQuantity(increaseId, 1);
  if (decreaseId) changeQuantity(decreaseId, -1);
  if (removeId) {
    delete cart[removeId];
    saveCart();
    renderCart();
  }
  if (event.target.dataset.closeProduct !== undefined) closeProduct();
});

orderForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(orderForm);
  const name = formData.get('name');
  cart = {};
  saveCart();
  renderCart();
  orderForm.reset();
  orderModal.close();
  showToast(`${t('thanks')} ${name}! ${t('orderPlaced')}`);
});

renderHero();
renderProducts();
renderCart();
