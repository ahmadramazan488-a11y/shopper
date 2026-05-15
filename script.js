const products = [
  {
    id: 'pulse-headphones',
    name: 'Pulse Wireless Headphones',
    category: 'tech',
    price: 79,
    badge: 'Best seller',
    visual: 'headphones',
    tone: '#ffe1d3',
    description: 'Soft ear cushions, clean audio, and all-day battery for studying, gaming, or music.',
    detail: 'A dependable everyday headset with easy controls, a fold-flat shape, and a balanced sound profile for work, travel, and entertainment.'
  },
  {
    id: 'daily-backpack',
    name: 'Daily Carry Backpack',
    category: 'style',
    price: 52,
    badge: 'Everyday',
    visual: 'backpack',
    tone: '#dcfce7',
    description: 'A simple everyday bag with laptop space, side pockets, and a clean streetwear look.',
    detail: 'Built for school, work, and short trips with a padded laptop pocket, two outer bottle pockets, and a low-profile design.'
  },
  {
    id: 'desk-lamp',
    name: 'Glow Desk Lamp',
    category: 'home',
    price: 34,
    badge: 'Warm light',
    visual: 'lamp',
    tone: '#fef3c7',
    description: 'Warm light, small footprint, and three brightness modes for work or late-night browsing.',
    detail: 'A compact desk light with soft diffusion, tap controls, and enough brightness range for reading, calls, and focused work.'
  },
  {
    id: 'smart-bottle',
    name: 'Hydro Smart Bottle',
    category: 'home',
    price: 28,
    badge: 'Daily use',
    visual: 'bottle',
    tone: '#dbeafe',
    description: 'A clean stainless bottle made for daily water goals, gym sessions, and travel.',
    detail: 'Double-wall insulation keeps drinks cold, while the slim shape fits most bags, desks, and car cup holders.'
  },
  {
    id: 'mini-keyboard',
    name: 'Mini Mechanical Keyboard',
    category: 'tech',
    price: 96,
    badge: 'Premium',
    visual: 'keyboard',
    tone: '#ede9fe',
    description: 'Compact keys, satisfying clicks, and a desk-friendly layout for coding or gaming.',
    detail: 'A tidy mechanical board with responsive switches, a compact footprint, and a clean layout for focused desk setups.'
  },
  {
    id: 'canvas-hoodie',
    name: 'Canvas Comfort Hoodie',
    category: 'style',
    price: 44,
    badge: 'Soft feel',
    visual: 'hoodie',
    tone: '#fee2e2',
    description: 'A soft neutral hoodie for everyday outfits, relaxed weekends, and cozy evenings.',
    detail: 'A mid-weight pullover with a relaxed fit, soft inner fleece, and easy styling for everyday wear.'
  }
];

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

let activeFilter = 'all';
let searchTerm = '';
let cart = JSON.parse(localStorage.getItem('shopper-cart') || '{}');

function money(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

function saveCart() {
  localStorage.setItem('shopper-cart', JSON.stringify(cart));
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
  return `
    <div class="product-visual product-visual-${size}" style="--tone:${product.tone}">
      <span class="visual-shape visual-${product.visual}"></span>
    </div>
  `;
}

function filteredProducts() {
  return products.filter((product) => {
    const matchesCategory = activeFilter === 'all' || product.category === activeFilter;
    const matchesSearch = !searchTerm || `${product.name} ${product.category} ${product.description}`.toLowerCase().includes(searchTerm);
    return matchesCategory && matchesSearch;
  });
}

function setActiveFilter(filter) {
  activeFilter = filter;
  document.querySelectorAll('[data-filter]').forEach((button) => {
    button.classList.toggle('active', button.dataset.filter === filter);
  });
  renderProducts();
  document.getElementById('products').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderProducts() {
  const visibleProducts = filteredProducts();

  if (!visibleProducts.length) {
    productGrid.innerHTML = '<div class="empty-results">No products match this search. Try another word or clear the filters.</div>';
    return;
  }

  productGrid.innerHTML = visibleProducts.map((product) => `
    <article class="product-card">
      <button class="product-open" type="button" data-open-product="${product.id}" aria-label="Open ${product.name}">
        ${productVisual(product)}
      </button>
      <div class="product-info">
        <div class="product-meta">
          <span class="category">${product.category}</span>
          <span class="product-badge">${product.badge}</span>
        </div>
        <div class="product-top">
          <h3>${product.name}</h3>
          <span class="price">${money(product.price)}</span>
        </div>
        <p>${product.description}</p>
        <div class="product-actions">
          <button class="details-button" type="button" data-open-product="${product.id}">View details</button>
          <button class="add-button" type="button" data-add="${product.id}">Add to cart</button>
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
    cartItems.innerHTML = '<div class="empty-cart">Your cart is empty. Add a product to start a demo order.</div>';
    return;
  }

  cartItems.innerHTML = entries.map(({ product, quantity }) => `
    <div class="cart-item">
      ${productVisual(product, 'thumb')}
      <div>
        <h3>${product.name}</h3>
        <p>${money(product.price)} each</p>
        <button class="remove-button" type="button" data-remove="${product.id}">Remove</button>
      </div>
      <div class="qty-controls" aria-label="Quantity controls for ${product.name}">
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
  showToast(`${product.name} added to cart`);
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
    <button class="icon-button modal-close" type="button" data-close-product aria-label="Close product details">&times;</button>
    <div class="detail-media">
      <span class="hero-pill">${product.badge}</span>
      ${productVisual(product, 'detail')}
    </div>
    <div class="detail-copy">
      <span class="category">${product.category}</span>
      <h2>${product.name}</h2>
      <strong class="detail-price">${money(product.price)}</strong>
      <p>${product.detail}</p>
      <ul>
        <li>Ready for demo ordering</li>
        <li>Free test shipping</li>
        <li>Easy to replace with real product photos</li>
      </ul>
      <div class="detail-actions">
        <button class="add-button" type="button" data-add="${product.id}" data-close-after-add>Add to cart</button>
        <button class="secondary-link button-reset" type="button" data-close-product>Keep shopping</button>
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
    showToast('Add at least one product before checkout');
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

document.querySelectorAll('.filter').forEach((button) => {
  button.addEventListener('click', () => setActiveFilter(button.dataset.filter));
});

document.querySelectorAll('.collection-card').forEach((button) => {
  button.addEventListener('click', () => setActiveFilter(button.dataset.filter));
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
  showToast(`Thanks ${name}! Your demo order was placed.`);
});

renderProducts();
renderCart();