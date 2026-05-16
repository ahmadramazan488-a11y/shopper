const products = [
  {
    id: 'fish-rizzo',
    name: 'Fish with Rizzo',
    category: 'specials',
    price: 14,
    badge: 'Bayad special',
    visual: 'grill',
    tone: '#ffe1d3',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Yellow_rice_full_of_fish_%2819827184571%29.jpg/960px-Yellow_rice_full_of_fish_%2819827184571%29.jpg',
    imageAlt: 'Fish served with yellow rice',
    description: 'Tender fish served with yellow rizzo, sauce, lemon, and vegetables.',
    detail: 'Bayad Pizza special fish with rizzo: tender fish, yellow rice, warm sauce, lemon, vegetables, and a filling restaurant-style portion.'
  },
  {
    id: 'chicken-shawarma',
    name: 'Chicken Shawarma Wrap',
    category: 'mains',
    price: 6,
    badge: 'Popular',
    visual: 'wrap',
    tone: '#fef3c7',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Shawarma_Sandwich.jpg?width=900',
    imageAlt: 'Shawarma sandwich wrap on a plate',
    description: 'Juicy chicken shawarma wrapped with garlic sauce, pickles, and fries.',
    detail: 'Thin-sliced chicken shawarma rolled in soft bread with garlic sauce, pickles, crispy fries, and a lightly toasted finish.'
  },
  {
    id: 'crispy-burger',
    name: 'Crispy Chicken Burger',
    category: 'mains',
    price: 8,
    badge: 'Crunchy',
    visual: 'burger',
    tone: '#fee2e2',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Fried_chicken_burger_.jpg?width=900',
    imageAlt: 'Fried chicken burger with lettuce and sauce',
    description: 'Crispy chicken fillet, lettuce, cheese, and house burger sauce.',
    detail: 'A golden crispy chicken burger layered with cheese, lettuce, tomato, pickles, and our creamy house sauce.'
  },
  {
    id: 'margherita-pizza',
    name: 'Margherita Pizza',
    category: 'pizza',
    price: 10,
    badge: 'Oven baked',
    visual: 'pizza',
    tone: '#dcfce7',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Pizza_Margherita_01.jpg?width=900',
    imageAlt: 'Margherita pizza with cheese, tomato, and basil',
    description: 'Classic pizza with tomato sauce, mozzarella, basil, and olive oil.',
    detail: 'A simple oven-baked pizza with rich tomato sauce, melted mozzarella, fresh basil, and a crisp golden crust.'
  },
  {
    id: 'pepperoni-pizza',
    name: 'Pepperoni Pizza',
    category: 'pizza',
    price: 12,
    badge: 'Hot favorite',
    visual: 'pizza',
    tone: '#fde68a',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Pepperoni_pizza.jpg?width=900',
    imageAlt: 'Pepperoni pizza with melted cheese',
    description: 'Mozzarella pizza topped with pepperoni and a rich tomato base.',
    detail: 'A warm pepperoni pizza with bubbling mozzarella, savory pepperoni slices, tomato sauce, and a crisp crust.'
  },
  {
    id: 'lemon-mint',
    name: 'Lemon Mint Juice',
    category: 'drinks',
    price: 4,
    badge: 'Fresh',
    visual: 'drink',
    tone: '#dbeafe',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Lemon_%26_Mint.jpg?width=900',
    imageAlt: 'Fresh lemon and mint juice',
    description: 'Fresh lemon, mint, ice, and a bright sweet finish.',
    detail: 'A cold lemon mint drink made fresh with crushed ice, bright citrus, mint leaves, and balanced sweetness.'
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
const heroProductArt = document.getElementById('heroProductArt');
const heroProductName = document.getElementById('heroProductName');
const heroProductPrice = document.getElementById('heroProductPrice');

let searchTerm = '';
let cart = JSON.parse(localStorage.getItem('restaurant-cart') || '{}');

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
  heroProductArt.innerHTML = productVisual(featured, 'hero');
  heroProductName.textContent = featured.name;
  heroProductPrice.textContent = money(featured.price);
}

function renderProducts() {
  const visibleProducts = filteredProducts();

  if (!visibleProducts.length) {
    productGrid.innerHTML = '<div class="empty-results">No dishes match this search. Try another word.</div>';
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
          <button class="details-button" type="button" data-open-product="${product.id}">View details</button>
          <button class="add-button" type="button" data-add="${product.id}">Add to order</button>
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
    cartItems.innerHTML = '<div class="empty-cart">Your order is empty. Add a dish to start.</div>';
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
  showToast(`${product.name} added to order`);
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
    <button class="icon-button modal-close" type="button" data-close-product aria-label="Close dish details">&times;</button>
    <div class="detail-media">
      <span class="hero-pill">${product.badge}</span>
      ${productVisual(product, 'detail')}
    </div>
    <div class="detail-copy">
      <h2>${product.name}</h2>
      <strong class="detail-price">${money(product.price)}</strong>
      <p>${product.detail}</p>
      <ul>
        <li>Freshly prepared</li>
        <li>Available for pickup or delivery</li>
        <li>Easy to replace with Bayad Pizza real photos later</li>
      </ul>
      <div class="detail-actions">
        <button class="add-button" type="button" data-add="${product.id}" data-close-after-add>Add to order</button>
        <button class="secondary-link button-reset" type="button" data-close-product>Keep browsing</button>
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
    showToast('Add at least one dish before checkout');
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
  showToast(`Thanks ${name}! Your Bayad Pizza demo order was placed.`);
});

renderHero();
renderProducts();
renderCart();