/**
 * FurryFriendsKE Ecommerce - Main JavaScript
 * Contains global functionality for the FurryFriendsKE website
 */

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('FurryFriendsKE website loaded');

    // Mobile Navigation Toggle
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
    }

    // Dropdown Menu Toggle
    const dropdowns = document.querySelectorAll('.dropdown');

    dropdowns.forEach(dropdown => {
        // On mobile, show dropdown on click
        dropdown.addEventListener('click', function(e) {
            if (window.innerWidth < 768) {
                const dropdownMenu = this.querySelector('.dropdown-menu');
                dropdownMenu.classList.toggle('show');
                e.preventDefault();
            }
        });

        // On desktop, show dropdown on hover
        dropdown.addEventListener('mouseenter', function() {
            if (window.innerWidth >= 768) {
                const dropdownMenu = this.querySelector('.dropdown-menu');
                dropdownMenu.classList.add('show');
            }
        });

        dropdown.addEventListener('mouseleave', function() {
            if (window.innerWidth >= 768) {
                const dropdownMenu = this.querySelector('.dropdown-menu');
                dropdownMenu.classList.remove('show');
            }
        });
    });

    // Set active nav link based on current page
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks2 = document.querySelectorAll('.nav-link');

    navLinks2.forEach(link => {
        const linkHref = link.getAttribute('href');
        if (linkHref === currentPage || (currentPage === '' && linkHref === 'index.html')) {
            link.classList.add('active');
        }
    });

    // Update cart count from localStorage
    updateCartCount();

    // Newsletter form functionality will be added in Task 3
});

// Function to update cart count
function updateCartCount() {
    const cartCountElement = document.querySelector('.cart-count');

    if (cartCountElement) {
        // Get cart from localStorage
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        // Update cart count
        cartCountElement.textContent = cart.length;
    }
}

// Global site functionality will be added as needed