/**
 * PetLuxe Ecommerce - Cart JavaScript
 * Contains functionality for shopping cart and checkout
 */

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Cart script loaded');

    // Initialize cart if it doesn't exist in localStorage
    if (!localStorage.getItem('cart')) {
        localStorage.setItem('cart', JSON.stringify([]));
    }

    // Update cart count when page loads
    updateCartCount();

    // Check if we're on the cart page
    if (document.querySelector('.cart-page')) {
        console.log('Cart page loaded');
        initializeCartPage();
    }
});

// Function to update cart count in header
function updateCartCount() {
    const cartCountElement = document.querySelector('.cart-count');

    if (cartCountElement) {
        // Get cart from localStorage
        const cart = JSON.parse(localStorage.getItem('cart')) || [];

        // Calculate total items in cart
        // Update cart count
        cartCountElement.textContent = cart.reduce((total, item) => total + item.quantity, 0);
    }
}

// Initialize the cart page
function initializeCartPage() {
    // Get cart from localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Toggle visibility based on cart status
    if (cart.length === 0) {
        // Show empty cart message
        document.getElementById('empty-cart-message').classList.remove('hidden');
        document.getElementById('cart-content').classList.add('hidden');
    } else {
        // Show cart content
        document.getElementById('empty-cart-message').classList.add('hidden');
        document.getElementById('cart-content').classList.remove('hidden');

        // Render cart items
        renderCartItems(cart);

        // Update cart summary
        updateCartSummary(cart);

        // Initialize event listeners
        initializeCartEventListeners();
    }
}

// Render cart items
function renderCartItems(cart) {
    const cartItemsContainer = document.getElementById('cart-items-container');

    // Clear container
    cartItemsContainer.innerHTML = '';

    // Add items to container
    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.setAttribute('data-product-id', item.id);

        // For mobile view
        const mobileView = `
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
        `;

        // For desktop view
        const desktopView = `
            <div class="cart-item-details">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image-desktop">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">$${item.price.toFixed(2)} each</div>
                </div>
            </div>
            <div class="cart-item-price-column">$${item.price.toFixed(2)}</div>
        `;

        // Common elements
        const commonElements = `
            <div class="cart-quantity-controls">
                <button class="cart-quantity-btn decrease-quantity" data-product-id="${item.id}">-</button>
                <input type="number" min="1" max="99" value="${item.quantity}" class="cart-quantity-input" data-product-id="${item.id}">
                <button class="cart-quantity-btn increase-quantity" data-product-id="${item.id}">+</button>
            </div>
            <div class="cart-item-total">$${(item.price * item.quantity).toFixed(2)}</div>
            <button class="cart-item-remove" data-product-id="${item.id}">Remove</button>
        `;

        // Determine layout based on screen width
        if (window.innerWidth < 768) {
            cartItem.innerHTML = `
                ${mobileView}
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">$${item.price.toFixed(2)} each</div>
                </div>
                <div class="cart-item-controls">
                    ${commonElements}
                </div>
            `;
        } else {
            cartItem.innerHTML = `
                ${desktopView}
                ${commonElements}
            `;
        }

        cartItemsContainer.appendChild(cartItem);
    });
}

// Update cart summary
function updateCartSummary(cart) {
    // Calculate subtotal
    const subtotal = calculateCartTotal(cart);

    // Update subtotal in summary
    document.getElementById('subtotal-amount').textContent = `$${subtotal.toFixed(2)}`;

    // Update total in summary (subtotal + shipping, if applicable)
    document.getElementById('total-amount').textContent = `$${subtotal.toFixed(2)}`;
}

// Initialize cart page event listeners
function initializeCartEventListeners() {
    // Quantity decrease buttons
    document.querySelectorAll('.decrease-quantity').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-product-id'));
            updateCartItemQuantityFromUI(productId, -1);
        });
    });

    // Quantity increase buttons
    document.querySelectorAll('.increase-quantity').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-product-id'));
            updateCartItemQuantityFromUI(productId, 1);
        });
    });

    // Quantity input fields
    document.querySelectorAll('.cart-quantity-input').forEach(input => {
        input.addEventListener('change', function() {
            const productId = parseInt(this.getAttribute('data-product-id'));
            const newQuantity = parseInt(this.value);

            if (!isNaN(newQuantity) && newQuantity > 0) {
                updateCartItemQuantityDirect(productId, newQuantity);
            }
        });
    });

    // Remove buttons
    document.querySelectorAll('.cart-item-remove').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-product-id'));
            removeCartItem(productId);
        });
    });

    // Clear cart button
    document.getElementById('clear-cart-btn').addEventListener('click', function() {
        if (confirm('Are you sure you want to clear your cart?')) {
            clearCart();
            refreshCartPage();
        }
    });

    // Proceed to checkout button
    document.getElementById('proceed-checkout-btn').addEventListener('click', function() {
        // This will be implemented in Task 7
        alert('Checkout functionality will be implemented in the next task.');
    });
}

// Update cart item quantity by adding/subtracting increment
function updateCartItemQuantityFromUI(productId, increment) {
    // Get current quantity from input
    const input = document.querySelector(`.cart-quantity-input[data-product-id="${productId}"]`);
    const currentQuantity = parseInt(input.value);
    const newQuantity = currentQuantity + increment;

    // Update quantity if valid
    if (newQuantity > 0) {
        updateCartItemQuantityDirect(productId, newQuantity);
    }
}

// Update cart item quantity directly to a specific value
function updateCartItemQuantityDirect(productId, newQuantity) {
    // Get cart from localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Find product in cart
    const productIndex = cart.findIndex(item => item.id === productId);

    if (productIndex !== -1) {
        // Update quantity
        cart[productIndex].quantity = newQuantity;

        // Save updated cart to localStorage
        localStorage.setItem('cart', JSON.stringify(cart));

        // Update UI
        updateCartUI(cart);
    }
}

// Remove item from cart
function removeCartItem(productId) {
    // Get cart from localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Remove product from cart
    cart = cart.filter(item => item.id !== productId);

    // Save updated cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));

    // Update UI
    refreshCartPage();
}

// Function to add a product to cart
function addToCart(productId, product) {
    // Get existing cart from localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Check if product already exists in cart
    const existingProductIndex = cart.findIndex(item => item.id === productId);

    if (existingProductIndex !== -1) {
        // If product exists, increase quantity
        cart[existingProductIndex].quantity += 1;
    } else {
        // If product doesn't exist, add it with quantity 1
        cart.push({
            id: productId,
            name: product.name,
            price: product.onSale && product.salePrice ? product.salePrice : product.price,
            image: product.images[0],
            quantity: 1
        });
    }

    // Save updated cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));

    // Update cart count
    updateCartCount();
}

// Function to add product to cart with specified quantity (used from product detail page)
function addToCartWithQuantity(product, quantity) {
    // Get existing cart from localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Calculate price (sale price or regular price)
    const price = product.onSale && product.salePrice ? product.salePrice : product.price;

    // Check if product already exists in cart
    const existingProductIndex = cart.findIndex(item => item.id === product.id);

    if (existingProductIndex !== -1) {
        // If product exists, update quantity
        cart[existingProductIndex].quantity += quantity;
    } else {
        // If product doesn't exist, add it
        cart.push({
            id: product.id,
            name: product.name,
            price: price,
            image: product.images[0],
            quantity: quantity
        });
    }

    // Save updated cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));

    // Update cart count
    updateCartCount();
}

// Function to remove a product from cart
function removeFromCart(productId) {
    // Get existing cart from localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Remove product from cart
    cart = cart.filter(item => item.id !== productId);

    // Save updated cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));

    // Update cart count
    updateCartCount();

    // Return updated cart
    return cart;
}

// Function to update product quantity in cart
function updateCartItemQuantity(productId, newQuantity) {
    // Get existing cart from localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Find product in cart
    const productIndex = cart.findIndex(item => item.id === productId);

    if (productIndex !== -1) {
        // If product exists, update quantity
        cart[productIndex].quantity = newQuantity;

        // If quantity is 0 or less, remove product from cart
        if (newQuantity <= 0) {
            cart = removeFromCart(productId);
        } else {
            // Save updated cart to localStorage
            localStorage.setItem('cart', JSON.stringify(cart));

            // Update cart count
            updateCartCount();
        }
    }

    // Return updated cart
    return cart;
}

// Function to clear cart
function clearCart() {
    // Clear cart in localStorage
    localStorage.setItem('cart', JSON.stringify([]));

    // Update cart count
    updateCartCount();
}

// Refresh the entire cart page
function refreshCartPage() {
    // Get updated cart from localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Update cart count
    updateCartCount();

    // Check if cart is empty
    if (cart.length === 0) {
        // Show empty cart message
        document.getElementById('empty-cart-message').classList.remove('hidden');
        document.getElementById('cart-content').classList.add('hidden');
    } else {
        // Update UI
        updateCartUI(cart);
    }
}

// Update cart UI without full page refresh
function updateCartUI(cart) {
    // Update cart items display
    renderCartItems(cart);

    // Update cart summary
    updateCartSummary(cart);

    // Reinitialize event listeners
    initializeCartEventListeners();

    // Update cart count in header
    updateCartCount();
}

// Function to calculate cart total
function calculateCartTotal(cart) {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}