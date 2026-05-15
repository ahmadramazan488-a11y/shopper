const extraText = {
  en: { emptyResults: 'No products match this search. Try another word or clear the filters.', addBeforeCheckout: 'Add at least one product before checkout', addedToCart: 'added to cart' },
  ar: { emptyResults: 'لا توجد منتجات مطابقة. جرّب كلمة أخرى أو امسح الفلاتر.', addBeforeCheckout: 'أضف منتجاً واحداً على الأقل قبل الطلب', addedToCart: 'تمت إضافته إلى السلة' }
};

function extraT(key) {
  return storeText[storeLanguage][key] || extraText[storeLanguage][key] || extraText.en[key] || key;
}

renderProducts = function renderLocalizedProducts() {
  const visibleProducts = filteredProducts();

  if (!visibleProducts.length) {
    productGrid.innerHTML = `<div class="empty-results">${extraT('emptyResults')}</div>`;
    return;
  }

  productGrid.innerHTML = visibleProducts.map((product) => `
    <article class="product-card">
      <button class="product-open" type="button" data-open-product="${product.id}" aria-label="Open ${product.name}">
        ${productVisual(product)}
      </button>
      <div class="product-info">
        <div class="product-meta">
          <span class="category">${extraT(product.category)}</span>
          <span class="product-badge">${product.badge}</span>
        </div>
        <div class="product-top">
          <h3>${product.name}</h3>
          <span class="price">${money(product.price)}</span>
        </div>
        <p>${product.description}</p>
        <div class="product-actions">
          <button class="details-button" type="button" data-open-product="${product.id}">${extraT('viewDetails')}</button>
          <button class="add-button" type="button" data-add="${product.id}">${extraT('addToCart')}</button>
        </div>
      </div>
    </article>
  `).join('');
};

renderCart = function renderLocalizedCart() {
  const entries = getCartEntries();
  const itemCount = entries.reduce((sum, entry) => sum + entry.quantity, 0);
  const subtotal = cartSubtotalValue();
  cartCount.textContent = itemCount;
  cartSubtotal.textContent = money(subtotal);
  cartTotal.textContent = money(subtotal);
  modalTotal.textContent = money(subtotal);

  if (!entries.length) {
    cartItems.innerHTML = `<div class="empty-cart">${extraT('emptyCart')}</div>`;
    return;
  }

  cartItems.innerHTML = entries.map(({ product, quantity }) => `
    <div class="cart-item">
      ${productVisual(product, 'thumb')}
      <div>
        <h3>${product.name}</h3>
        <p>${money(product.price)} ${extraT('each')}</p>
        <button class="remove-button" type="button" data-remove="${product.id}">${extraT('remove')}</button>
      </div>
      <div class="qty-controls" aria-label="Quantity controls for ${product.name}">
        <button type="button" data-decrease="${product.id}">-</button>
        <strong>${quantity}</strong>
        <button type="button" data-increase="${product.id}">+</button>
      </div>
    </div>
  `).join('');
};

addToCart = function addLocalizedToCart(id) {
  const product = products.find((item) => item.id === id);
  if (!product) return;
  cart[id] = (cart[id] || 0) + 1;
  saveCart();
  renderCart();
  showToast(`${product.name} ${extraT('addedToCart')}`);
};

openCheckout = function openLocalizedCheckout() {
  if (!getCartEntries().length) {
    openCart();
    showToast(extraT('addBeforeCheckout'));
    return;
  }
  closeCart();
  orderModal.showModal();
};

refreshStore();
