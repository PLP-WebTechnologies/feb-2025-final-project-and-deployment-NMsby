/**
 * PetLuxe Ecommerce - Main JavaScript
 * Contains global functionality for the PetLuxe website
 */

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('PetLuxe website loaded');

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

    // Initialize homepage components
    initHeroCarousel();
    loadFeaturedProducts();
    initNewsletterForm();
    createProductImagePlaceholders();
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

// Hero Carousel Functionality
function initHeroCarousel() {
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.hero-carousel .prev');
    const nextBtn = document.querySelector('.hero-carousel .next');

    if (!slides.length) return;

    let currentSlide = 0;
    let slideInterval = setInterval(nextSlide, 5000);

    function nextSlide() {
        goToSlide((currentSlide + 1) % slides.length);
    }

    function prevSlide() {
        goToSlide((currentSlide - 1 + slides.length) % slides.length);
    }

    function goToSlide(n) {
        slides[currentSlide].classList.remove('active');
        dots[currentSlide].classList.remove('active');

        currentSlide = n;

        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
    }

    // Event listeners
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            clearInterval(slideInterval);
            prevSlide();
            slideInterval = setInterval(nextSlide, 5000);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            clearInterval(slideInterval);
            nextSlide();
            slideInterval = setInterval(nextSlide, 5000);
        });
    }

    dots.forEach((dot, index) => {
        dot.addEventListener('click', function() {
            clearInterval(slideInterval);
            goToSlide(index);
            slideInterval = setInterval(nextSlide, 5000);
        });
    });
}

// Featured Products Carousel
function loadFeaturedProducts() {
    const container = document.querySelector('.product-carousel-container');
    const prevBtn = document.querySelector('.product-carousel .prev');
    const nextBtn = document.querySelector('.product-carousel .next');

    if (!container) return;

    // In a real site, this would come from a database or API
    // For now, we'll create some sample products
    const featuredProducts = [
        {
            id: 1,
            name: "Premium Dog Food",
            price: 29.99,
            image: "assets/images/product-dog-food.jpg",
            category: "dogs"
        },
        {
            id: 2,
            name: "Cat Scratching Post",
            price: 49.99,
            image: "assets/images/product-cat-post.jpg",
            category: "cats"
        },
        {
            id: 3,
            name: "Bird Cage Deluxe",
            price: 89.99,
            image: "assets/images/product-bird-cage.jpg",
            category: "birds"
        },
        {
            id: 4,
            name: "Hamster Exercise Wheel",
            price: 19.99,
            image: "assets/images/product-hamster-wheel.jpg",
            category: "small-pets"
        },
        {
            id: 5,
            name: "Dog Chew Toy Bundle",
            price: 24.99,
            image: "assets/images/product-dog-toys.jpg",
            category: "dogs"
        },
        {
            id: 6,
            name: "Cat Food Premium Mix",
            price: 34.99,
            image: "assets/images/product-cat-food.jpg",
            category: "cats"
        }
    ];

    // Create product cards
    featuredProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';

        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <div class="product-card-content">
                <h3>${product.name}</h3>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <button class="btn btn-primary add-to-cart" data-product-id="${product.id}">Add to Cart</button>
            </div>
        `;

        container.appendChild(productCard);
    });

    // Add event listeners for carousel navigation
    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            container.scrollBy({ left: -500, behavior: 'smooth' });
        });

        nextBtn.addEventListener('click', () => {
            container.scrollBy({ left: 500, behavior: 'smooth' });
        });
    }

    // Add event listeners for "Add to Cart" buttons
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-product-id'));
            addToCart(
                productId,
                featuredProducts.find(p => p.id === productId)
            );
        });
    });
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
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }

    // Save updated cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));

    // Update cart count
    updateCartCount();

    // Provide user feedback
    alert(`"${product.name}" has been added to your cart.`);
}

// Newsletter Form Handling
function initNewsletterForm() {
    const form = document.getElementById('newsletter-form');
    const messageDiv = document.querySelector('.form-message');

    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const email = document.getElementById('email').value;

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            messageDiv.textContent = 'Please enter a valid email address.';
            messageDiv.classList.add('error');
            return;
        }

        // Simulate form submission (in a real app, this would send data to a server)
        messageDiv.textContent = 'Thank you for subscribing!';
        messageDiv.classList.remove('error');
        form.reset();

        // In a real application, you would send the data to your server here
    });
}

// Add product image placeholders
function createProductImagePlaceholders() {
    // This function would typically not be needed in a real app with actual images
    // It's included here to create references for image files that don't exist yet
    const productImages = [
        'product-dog-food.jpg',
        'product-cat-post.jpg',
        'product-bird-cage.jpg',
        'product-hamster-wheel.jpg',
        'product-dog-toys.jpg',
        'product-cat-food.jpg'
    ];

    // You can use this list to create placeholders if needed
    console.log('Product images needed:', productImages);
}

// Global site functionality will be added as needed