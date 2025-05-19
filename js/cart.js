/**
 * PetLuxe Ecommerce - Cart JavaScript
 * Contains functionality for shopping cart and checkout
 */

// Global variables
let subtotal = 0;
let shippingCost = 5.99; // Default shipping cost (standard)

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
        initializeCheckout();
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
        // Hide cart container
        document.querySelector('.cart-container').classList.add('hidden');

        // Show checkout form
        document.getElementById('checkout-form-section').classList.remove('hidden');

        // Initialize checkout form
        setupCheckoutForm();
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

// Initialize checkout when the "Proceed to Checkout" button is clicked
function initializeCheckout() {
    const proceedCheckoutBtn = document.getElementById('proceed-checkout-btn');

    if (proceedCheckoutBtn) {
        proceedCheckoutBtn.addEventListener('click', function() {
            // Hide cart container
            document.querySelector('.cart-container').classList.add('hidden');

            // Show checkout form
            document.getElementById('checkout-form-section').classList.remove('hidden');

            // Initialize checkout form
            setupCheckoutForm();
        });
    }

    // Initialize back to cart button
    const backToCartBtn = document.getElementById('back-to-cart-btn');
    if (backToCartBtn) {
        backToCartBtn.addEventListener('click', function() {
            // Show cart container
            document.querySelector('.cart-container').classList.remove('hidden');

            // Hide checkout form
            document.getElementById('checkout-form-section').classList.add('hidden');
        });
    }
}

// Set up the checkout form
function setupCheckoutForm() {
    // Get cart from localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Calculate subtotal
    subtotal = calculateCartTotal(cart);

    // Update order summary
    updateOrderSummary();

    // Initialize shipping method selection
    initializeShippingSelection();

    // Initialize form validation
    initializeFormValidation();
}

// Update order summary in checkout form
function updateOrderSummary() {
    document.getElementById('checkout-subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('checkout-shipping').textContent = `$${shippingCost.toFixed(2)}`;
    document.getElementById('checkout-total').textContent = `$${(subtotal + shippingCost).toFixed(2)}`;
}

// Initialize shipping method selection
function initializeShippingSelection() {
    const shippingOptions = document.querySelectorAll('input[name="shipping"]');

    shippingOptions.forEach(option => {
        option.addEventListener('change', function() {
            // Update shipping cost based on selection
            switch (this.value) {
                case 'express':
                    shippingCost = 12.99;
                    break;
                case 'overnight':
                    shippingCost = 19.99;
                    break;
                case 'standard':
                default:
                    shippingCost = 5.99;
                    break;
            }

            // Update order summary
            updateOrderSummary();
        });
    });
}

// Initialize form validation
function initializeFormValidation() {
    const checkoutForm = document.getElementById('checkout-form');

    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Validate form
            if (validateCheckoutForm()) {
                // Process order
                processOrder();
            }
        });

        // Initialize input validation on blur
        const inputs = checkoutForm.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateInput(this);
            });

            // Special handling for card fields
            if (input.id === 'card-number') {
                input.addEventListener('input', formatCardNumber);
            } else if (input.id === 'expiry-date') {
                input.addEventListener('input', formatExpiryDate);
            } else if (input.id === 'cvv') {
                input.addEventListener('input', function() {
                    this.value = this.value.replace(/\D/g, '').substring(0, 4);
                });
            }
        });
    }
}

// Validate the entire checkout form
function validateCheckoutForm() {
    const checkoutForm = document.getElementById('checkout-form');
    const inputs = checkoutForm.querySelectorAll('input, select');
    let isValid = true;

    // Validate each input
    inputs.forEach(input => {
        if (!validateInput(input)) {
            isValid = false;
        }
    });

    return isValid;
}

// Validate a single input field
function validateInput(input) {
    // Skip optional fields
    if (!input.required && input.value === '') {
        return true;
    }

    const errorElement = document.getElementById(`${input.id}-error`);
    let isValid;
    let errorMessage;

    // Validation rules based on input type
    switch (input.id) {
        case 'email':
            isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value);
            errorMessage = 'Please enter a valid email address';
            break;

        case 'phone':
            isValid = /^\d{10,15}$/.test(input.value.replace(/\D/g, ''));
            errorMessage = 'Please enter a valid phone number';
            break;

        case 'first-name':
        case 'last-name':
        case 'city':
        case 'name-on-card':
            isValid = input.value.trim().length > 1;
            errorMessage = 'This field is required';
            break;

        case 'address':
            isValid = input.value.trim().length > 5;
            errorMessage = 'Please enter a valid address';
            break;

        case 'zip':
            isValid = /^\d{5}(-\d{4})?$/.test(input.value) || /^[A-Za-z]\d[A-Za-z] \d[A-Za-z]\d$/.test(input.value);
            errorMessage = 'Please enter a valid ZIP/Postal code';
            break;

        case 'state':
        case 'country':
            isValid = input.value !== '';
            errorMessage = 'Please select an option';
            break;

        case 'card-number':
            isValid = /^\d{4} \d{4} \d{4} \d{4}$/.test(input.value) || /^\d{4} \d{4} \d{4} \d{3}$/.test(input.value);
            errorMessage = 'Please enter a valid card number';
            break;

        case 'expiry-date':
            isValid = /^(0[1-9]|1[0-2])\/\d{2}$/.test(input.value);
            errorMessage = 'Please enter a valid expiry date (MM/YY)';
            if (isValid) {
                // Check that the date is in the future
                const [month, year] = input.value.split('/');
                const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
                const currentDate = new Date();
                isValid = expiryDate > currentDate;
                if (!isValid) {
                    errorMessage = 'Card has expired';
                }
            }
            break;

        case 'cvv':
            isValid = /^\d{3,4}$/.test(input.value);
            errorMessage = 'Please enter a valid CVV';
            break;

        default:
            isValid = input.value.trim() !== '';
            errorMessage = 'This field is required';
            break;
    }

    // Update UI based on validation
    if (!isValid && errorElement) {
        input.parentElement.classList.add('error');
        errorElement.textContent = errorMessage;
    } else if (errorElement) {
        input.parentElement.classList.remove('error');
        errorElement.textContent = '';
    }

    return isValid;
}

// Format card number as user types
function formatCardNumber(e) {
    const target = e.target;
    let value = target.value.replace(/\D/g, '');

    if (value.length > 16) {
        value = value.substring(0, 16);
    }

    // Format with spaces every 4 characters
    let formattedValue = '';
    for (let i = 0; i < value.length; i++) {
        if (i > 0 && i % 4 === 0) {
            formattedValue += ' ';
        }
        formattedValue += value[i];
    }

    target.value = formattedValue;
}

// Format expiry date as user types
function formatExpiryDate(e) {
    const target = e.target;
    let value = target.value.replace(/\D/g, '');

    if (value.length > 4) {
        value = value.substring(0, 4);
    }

    // Format as MM/YY
    if (value.length > 2) {
        value = value.substring(0, 2) + '/' + value.substring(2);
    }

    target.value = value;
}

// Process the order
function processOrder() {
    // In a real application, this would send data to a server
    // For this example, we'll simulate order processing

    // Show loading state
    const submitButton = document.querySelector('.form-actions .btn-primary');
    submitButton.textContent = 'Processing...';
    submitButton.disabled = true;

    // Simulate server processing
    setTimeout(function() {
        // Generate order number
        const orderNumber = 'ORD-' + Date.now().toString().substring(5);

        // Get current date
        const orderDate = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Get customer email
        const customerEmail = document.getElementById('email').value;

        // Update order confirmation details
        document.getElementById('order-number').textContent = orderNumber;
        document.getElementById('order-date').textContent = orderDate;
        document.getElementById('confirmation-email').textContent = customerEmail;

        // Hide checkout form
        document.getElementById('checkout-form-section').classList.add('hidden');

        // Show order confirmation
        document.getElementById('order-confirmation').classList.remove('hidden');

        // Clear cart
        clearCart();
    }, 2000);
}