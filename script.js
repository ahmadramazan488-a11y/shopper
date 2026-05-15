const products = [
  {
    id: 'pulse-headphones',
    name: 'Pulse Wireless Headphones',
    category: 'tech',
    price: 79,
    emoji: '🎧',
    tone: '#ffe1d3',
    description: 'Soft ear cushions, clean audio, and all-day battery for studying, gaming, or music.'
  },
  {
    id: 'daily-backpack',
    name: 'Daily Carry Backpack',
    category: 'style',
    price: 52,
    emoji: '🎒',
    tone: '#dcfce7',
    description: 'A simple everyday bag with laptop space, side pockets, and a clean streetwear look.'
  },
  {
    id: 'desk-lamp',
    name: 'Glow Desk Lamp',
    category: 'home',
    price: 34,
    emoji: '💡',
    tone: '#fef3c7',
    description: 'Warm light, small footprint, and three brightness modes for work or late-night browsing.'
  },
  {
    id: 'smart-bottle',
    name: 'Hydro Smart Bottle',
    category: 'home',
    price: 28,
    emoji: '💧',
    tone: '#dbeafe',
    description: 'A clean stainless bottle made for daily water goals, gym sessions, and travel.'
  },
  {
    id: 'mini-keyboard',
    name: 'Mini Mechanical Keyboard',
    category: 'tech',
    price: 96,
    emoji: '⌨️',
    tone: '#ede9fe',
    description: 'Compact keys, satisfying clicks, and a desk-friendly layout for coding or gaming.'
  },
  {
    id: 'canvas-hoodie',
    name: 'Canvas Comfort Hoodie',
    category: 'style',
    price: 44,
    emoji: '🧥',
    tone: '#fee2e2',
    description: 'A soft neutral hoodie for everyday outfits, relaxed weekends, and cozy evenings.'
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
const toast = document.getElementById('toast');
let cart = JSON.parse(localStorage.getItem('shopper-cart') || '{}');

function money(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

function saveCart() {
  localStorage.setItem('shopper-cart', JSON.stringify(cart));
}

function getCartEntries() {
  return Object.entries(cart)
    .map(([id, quantity]) => ({ product: products.find((item) => item.id === id), quantity }))
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

function renderProducts(filter = 'all') {
  const visibleProducts = filter === 'all' ? products : products.filter((product) => product.category === filter);
  productGrid.innerHTML = visibleProducts.map((product) => `
    <article class="product-card">
      <div class="product-art" style="--tone:${product.tone}">${product.emoji}</div>
      <div class="product-info">
        <span class="category">${product.category}</span>
        <div class="product-top">
          <h3>${product.name}</h3>
          <span class="price">${money(product.price)}</span>
        </div>
        <p>${product.description}</p>
        <button class="add-button" type="button" data-add="${product.id}">Add to cart</button>
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
      <div class="cart-thumb">${product.emoji}</div>
      <div>
        <h3>${product.name}</h3>
        <p>${money(product.price)} each</p>
        <button class="remove-button" type="button" data-remove="${product.id}">Remove</button>
      </div>
      <div class="qty-controls" aria-label="Quantity controls for ${product.name}">
        <button type="button" data-decrease="${product.id}">−</button>
        <strong>${quantity}</strong>
        <button type="button" data-increase="${product.id}">+</button>
      </div>
    </div>
  `).join('');
}

function addToCart(id) {
  cart[id] = (cart[id] || 0) + 1;
  saveCart();
  renderCart();
  const product = products.find((item) => item.id === id);
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

cartDrawer.addEventListener('click', (event) => {
  if (event.target === cartDrawer) closeCart();
});

document.addEventListener('click', (event) => {
  const addId = event.target.dataset.add;
  const increaseId = event.target.dataset.increase;
  const decreaseId = event.target.dataset.decrease;
  const removeId = event.target.dataset.remove;
  if (addId) addToCart(addId);
  if (increaseId) changeQuantity(increaseId, 1);
  if (decreaseId) changeQuantity(decreaseId, -1);
  if (removeId) {
    delete cart[removeId];
    saveCart();
    renderCart();
  }
});

document.querySelectorAll('.filter').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.filter').forEach((filter) => filter.classList.remove('active'));
    button.classList.add('active');
    renderProducts(button.dataset.filter);
  });
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
