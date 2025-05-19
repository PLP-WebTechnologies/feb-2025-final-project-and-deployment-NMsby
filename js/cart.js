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

    // Cart functionality will be added in Tasks 6 & 7
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

// Function to calculate cart total
function calculateCartTotal(cart) {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}