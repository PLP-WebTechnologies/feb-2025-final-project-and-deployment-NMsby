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

    // Check if we're on the About page
    if (document.querySelector('.about-page')) {
        console.log('About page loaded');
        initializeStoreLocations();
        initializeContactForm();
    }

    // Initialize footer and cross-page components
    initializeFooterNewsletter();
    initializeCookieConsent();
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

// About Page Functionality

// Initialize Map and Store Locations
function initializeStoreLocations() {
    const mapButtons = document.querySelectorAll('.view-map-btn');

    if (mapButtons.length === 0) return;

    // Store location data (in a real app, this might come from a database)
    const locations = {
        downtown: {
            name: 'Downtown',
            address: '123 Main Street, New York, NY 10001',
            mapSrc: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.9663095928044!2d-74.00425872426698!3d40.74076937932795!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259af44f80211%3A0xeaf7b99128acee3d!2sMadison%20Square%20Park!5e0!3m2!1sen!2sus!4v1690418440409!5m2!1sen!2sus'
        },
        westside: {
            name: 'Westside',
            address: '456 Ocean Avenue, Los Angeles, CA 90001',
            mapSrc: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3306.2327593431884!2d-118.2456353242826!3d34.04850788060566!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80c2c75ddc27da13%3A0xe22fdf6f254608f4!2sLos%20Angeles%2C%20CA!5e0!3m2!1sen!2sus!4v1690418524698!5m2!1sen!2sus'
        },
        lakeview: {
            name: 'Lakeview',
            address: '789 Lake Shore Drive, Chicago, IL 60601',
            mapSrc: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2970.4839749614863!2d-87.62985612423078!3d41.878768979224744!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x880e2ca3e2d94695%3A0x4829f3cc9ca2d0de!2sMillennium%20Park!5e0!3m2!1sen!2sus!4v1690418577768!5m2!1sen!2sus'
        }
    };

    // Set default map (downtown)
    const mapContainer = document.getElementById('store-map');
    if (mapContainer) {
        mapContainer.innerHTML = `<iframe src="${locations.downtown.mapSrc}" width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`;
    }

    // Add click event listeners to map buttons
    mapButtons.forEach(button => {
        button.addEventListener('click', function() {
            const locationId = this.getAttribute('data-location');
            const location = locations[locationId];

            if (location && mapContainer) {
                // Update map iframe src
                mapContainer.innerHTML = `<iframe src="${location.mapSrc}" width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`;

                // Scroll to map if on mobile
                if (window.innerWidth < 768) {
                    mapContainer.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
}

// Initialize Contact Form
function initializeContactForm() {
    const contactForm = document.getElementById('contact-form');

    if (!contactForm) return;

    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Validate form
        if (validateContactForm()) {
            // Simulate form submission (in a real app, this would send data to a server)
            submitContactForm();
        }
    });

    // Add blur event listeners for validation
    const formInputs = contactForm.querySelectorAll('input, textarea');
    formInputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateContactInput(this);
        });
    });
}

// Validate contact form
function validateContactForm() {
    const form = document.getElementById('contact-form');
    const inputs = form.querySelectorAll('input, textarea');
    let isValid = true;

    inputs.forEach(input => {
        if (!validateContactInput(input)) {
            isValid = false;
        }
    });

    return isValid;
}

// Validate a single contact form input
function validateContactInput(input) {
    const errorElement = document.getElementById(`${input.id.replace('contact-', '')}-error`);
    let isValid = true;
    let errorMessage = '';

    switch (input.id) {
        case 'contact-name':
            isValid = input.value.trim().length >= 2;
            errorMessage = 'Please enter your name';
            break;

        case 'contact-email':
            isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value);
            errorMessage = 'Please enter a valid email address';
            break;

        case 'contact-subject':
            isValid = input.value.trim().length >= 5;
            errorMessage = 'Please enter a subject';
            break;

        case 'contact-message':
            isValid = input.value.trim().length >= 10;
            errorMessage = 'Please enter a message (at least 10 characters)';
            break;
    }

    if (!isValid && errorElement) {
        input.parentElement.classList.add('error');
        errorElement.textContent = errorMessage;
    } else if (errorElement) {
        input.parentElement.classList.remove('error');
        errorElement.textContent = '';
    }

    return isValid;
}

// Submit contact form (simulation)
function submitContactForm() {
    const form = document.getElementById('contact-form');
    const submitButton = form.querySelector('button[type="submit"]');

    // Disable form and show loading state
    const inputs = form.querySelectorAll('input, textarea, button');
    inputs.forEach(input => {
        input.disabled = true;
    });
    submitButton.textContent = 'Sending...';

    // Simulate server delay
    setTimeout(function() {
        // Show success message
        document.getElementById('form-success').classList.remove('hidden');

        // Reset form
        form.reset();

        // Re-enable form after a delay
        setTimeout(function() {
            inputs.forEach(input => {
                input.disabled = false;
            });
            submitButton.textContent = 'Send Message';
        }, 3000);
    }, 1500);
}

// Footer and Cross-Page Components

// Footer Newsletter Form
function initializeFooterNewsletter() {
    const footerNewsletterForm = document.getElementById('footer-newsletter-form');

    if (!footerNewsletterForm) return;

    footerNewsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const emailInput = document.getElementById('footer-email');
        const messageDiv = footerNewsletterForm.querySelector('.form-message');

        // Simple email validation
        if (!emailInput.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)) {
            messageDiv.textContent = 'Please enter a valid email address.';
            messageDiv.style.color = '#FF5252';
            return;
        }

        // Simulate form submission
        emailInput.disabled = true;
        footerNewsletterForm.querySelector('button').disabled = true;
        messageDiv.textContent = 'Subscribing...';
        messageDiv.style.color = '#ccc';

        setTimeout(function() {
            messageDiv.textContent = 'Thank you for subscribing!';
            messageDiv.style.color = '#4CAF50';

            // Reset form after delay
            setTimeout(function() {
                footerNewsletterForm.reset();
                emailInput.disabled = false;
                footerNewsletterForm.querySelector('button').disabled = false;
            }, 3000);
        }, 1500);
    });
}

// Cookie Consent Banner
function initializeCookieConsent() {
    const cookieConsent = document.getElementById('cookie-consent');
    const acceptButton = document.getElementById('cookie-accept');
    const declineButton = document.getElementById('cookie-decline');

    // Check if user has already made a choice
    const consentStatus = localStorage.getItem('cookieConsent');

    if (!consentStatus && cookieConsent) {
        // Show cookie consent banner after a short delay
        setTimeout(function() {
            cookieConsent.classList.remove('hidden');
        }, 1000);
    }

    // Accept button
    if (acceptButton) {
        acceptButton.addEventListener('click', function() {
            localStorage.setItem('cookieConsent', 'accepted');
            cookieConsent.classList.add('hidden');
        });
    }

    // Decline button
    if (declineButton) {
        declineButton.addEventListener('click', function() {
            localStorage.setItem('cookieConsent', 'declined');
            cookieConsent.classList.add('hidden');
        });
    }
}