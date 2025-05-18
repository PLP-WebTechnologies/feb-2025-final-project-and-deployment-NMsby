/**
 * PetLuxe Ecommerce - Products JavaScript
 * Contains functionality for products listing and detail pages
 */

// Global variables
let allProducts = [];
let filteredProducts = [];
let categories = [];
let currentCategory = 'all';
let minPrice = 0;
let maxPrice = 100;
let onSaleOnly = false;
let currentSort = 'featured';

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the products page
    if (document.querySelector('.product-grid')) {
        console.log('Products page loaded');
        initializeProductsPage();
    }

    // Check if we're on the product detail page
    if (document.querySelector('.product-detail-container')) {
        console.log('Product detail page loaded');
        // Product detail functionality will be added in Task 5
    }
});

// Initialize the products page
function initializeProductsPage() {
    // Fetch products data
    fetchProducts();

    // Set up event listeners
    setupEventListeners();

    // Check URL parameters for filtering
    checkURLParameters();
}

// Fetch products data from JSON file
function fetchProducts() {
    fetch('data/products.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch products data');
            }
            return response.json();
        })
        .then(data => {
            allProducts = data.products;
            categories = data.categories;

            // Initialize price range based on actual product prices
            initializePriceRange();

            // Populate category filters
            populateCategoryFilters();

            // Apply initial filtering and sorting
            applyFiltersAndSort();
        })
        .catch(error => {
            console.error('Error fetching products:', error);
            document.querySelector('.product-grid').innerHTML = `
                <div class="error-message">
                    <p>Sorry, we couldn't load the products at this time. Please try again later.</p>
                </div>
            `;
        });
}

// Initialize price range inputs based on actual product prices
function initializePriceRange() {
    if (allProducts.length === 0) return;

    // Find min and max prices
    const prices = allProducts.map(product => {
        return product.onSale && product.salePrice ? product.salePrice : product.price;
    });

    const minProductPrice = Math.floor(Math.min(...prices));
    const maxProductPrice = Math.ceil(Math.max(...prices));

    // Update input values and attributes
    const minPriceInput = document.getElementById('min-price');
    const maxPriceInput = document.getElementById('max-price');

    minPriceInput.min = minProductPrice;
    minPriceInput.max = maxProductPrice;
    minPriceInput.value = minProductPrice;

    maxPriceInput.min = minProductPrice;
    maxPriceInput.max = maxProductPrice;
    maxPriceInput.value = maxProductPrice;

    // Set global price variables
    minPrice = minProductPrice;
    maxPrice = maxProductPrice;
}

// Populate category filters
function populateCategoryFilters() {
    const categoryFiltersContainer = document.querySelector('.category-filters');

    // Skip if there are no categories or if the container doesn't exist
    if (!categories.length || !categoryFiltersContainer) return;

    // Clear existing category buttons (except "All Products")
    const allProductsButton = categoryFiltersContainer.querySelector('.category-btn');
    categoryFiltersContainer.innerHTML = '';
    categoryFiltersContainer.appendChild(allProductsButton);

    // Add category buttons
    categories.forEach(category => {
        const categoryButton = document.createElement('li');
        categoryButton.innerHTML = `
            <button class="filter-btn category-btn" data-category="${category.id}">${category.name}</button>
        `;
        categoryFiltersContainer.appendChild(categoryButton);
    });
}

// Set up event listeners
function setupEventListeners() {
    // Category filter buttons
    document.querySelector('.category-filters').addEventListener('click', function(e) {
        if (e.target.classList.contains('category-btn')) {
            // Update active category button
            document.querySelectorAll('.category-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            e.target.classList.add('active');

            // Update current category
            currentCategory = e.target.getAttribute('data-category');

            // Apply filters
            applyFiltersAndSort();

            // Update page title based on category
            updatePageTitle();
        }
    });

    // Price filter
    document.getElementById('apply-price-filter').addEventListener('click', function() {
        // Get values from inputs
        minPrice = parseFloat(document.getElementById('min-price').value);
        maxPrice = parseFloat(document.getElementById('max-price').value);

        // Make sure min is not greater than max
        if (minPrice > maxPrice) {
            const temp = minPrice;
            minPrice = maxPrice;
            maxPrice = temp;

            // Update input values
            document.getElementById('min-price').value = minPrice;
            document.getElementById('max-price').value = maxPrice;
        }

        // Apply filters
        applyFiltersAndSort();
    });

    // On Sale filter
    document.getElementById('sale-filter').addEventListener('change', function() {
        onSaleOnly = this.checked;
        applyFiltersAndSort();
    });

    // Sort select
    document.getElementById('sort-select').addEventListener('change', function() {
        currentSort = this.value;
        applyFiltersAndSort();
    });

    // Clear filters button
    const clearFiltersBtn = document.getElementById('clear-filters');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', resetFilters);
    }

    // Reset filters button in no products message
    const resetFiltersBtn = document.getElementById('reset-filters');
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', resetFilters);
    }
}

// Reset all filters to default
function resetFilters() {
    // Reset category
    currentCategory = 'all';
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-category') === 'all') {
            btn.classList.add('active');
        }
    });

    // Reset price range
    initializePriceRange();

    // Reset sale filter
    document.getElementById('sale-filter').checked = false;
    onSaleOnly = false;

    // Reset sort
    document.getElementById('sort-select').value = 'featured';
    currentSort = 'featured';

    // Apply filters
    applyFiltersAndSort();

    // Update page title
    updatePageTitle();
}

// Apply filters and sort products
function applyFiltersAndSort() {
    // Filter products
    filteredProducts = allProducts.filter(product => {
        // Check category
        if (currentCategory !== 'all' && product.category !== currentCategory) {
            return false;
        }

        // Check price range
        const productPrice = product.onSale && product.salePrice ? product.salePrice : product.price;
        if (productPrice < minPrice || productPrice > maxPrice) {
            return false;
        }

        // Check sale filter
        return !(onSaleOnly && !product.onSale);


    });

    // Sort products
    sortProducts();

    // Render products
    renderProducts();

    // Update product count
    document.getElementById('product-count').textContent = filteredProducts.length;

    // Show/hide no products message
    if (filteredProducts.length === 0) {
        document.querySelector('.product-grid').classList.add('hidden');
        document.getElementById('no-products-message').classList.remove('hidden');
    } else {
        document.querySelector('.product-grid').classList.remove('hidden');
        document.getElementById('no-products-message').classList.add('hidden');
    }
}

// Sort products based on current sort option
function sortProducts() {
    switch (currentSort) {
        case 'price-asc':
            filteredProducts.sort((a, b) => {
                const aPrice = a.onSale && a.salePrice ? a.salePrice : a.price;
                const bPrice = b.onSale && b.salePrice ? b.salePrice : b.price;
                return aPrice - bPrice;
            });
            break;

        case 'price-desc':
            filteredProducts.sort((a, b) => {
                const aPrice = a.onSale && a.salePrice ? a.salePrice : a.price;
                const bPrice = b.onSale && b.salePrice ? b.salePrice : b.price;
                return bPrice - aPrice;
            });
            break;

        case 'name-asc':
            filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;

        case 'name-desc':
            filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
            break;

        case 'rating-desc':
            filteredProducts.sort((a, b) => b.rating - a.rating);
            break;

        case 'featured':
        default:
            // For featured, show featured products first, then sort by ID
            filteredProducts.sort((a, b) => {
                if (a.featured && !b.featured) return -1;
                if (!a.featured && b.featured) return 1;
                return a.id - b.id;
            });
            break;
    }
}

// Render products to the grid
function renderProducts() {
    const productGrid = document.querySelector('.product-grid');

    // Clear existing products
    productGrid.innerHTML = '';

    // Add products to grid
    filteredProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';

        // Calculate product price display (regular or sale)
        let priceHTML;
        if (product.onSale && product.salePrice) {
            priceHTML = `
                <div class="product-price-container">
                    <span class="product-price">$${product.salePrice.toFixed(2)}</span>
                    <span class="original-price">$${product.price.toFixed(2)}</span>
                    <span class="sale-badge">SALE</span>
                </div>
            `;
        } else {
            priceHTML = `
                <div class="product-price-container">
                    <span class="product-price">$${product.price.toFixed(2)}</span>
                </div>
            `;
        }

        // Generate rating stars
        const fullStars = Math.floor(product.rating);
        const halfStar = product.rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

        let starsHTML = '';
        for (let i = 0; i < fullStars; i++) {
            starsHTML += '<span class="star">★</span>';
        }
        if (halfStar) {
            starsHTML += '<span class="star">★</span>';
        }
        for (let i = 0; i < emptyStars; i++) {
            starsHTML += '<span class="star empty">☆</span>';
        }

        // Create the product card HTML
        productCard.innerHTML = `
            <img src="${product.images[0]}" alt="${product.name}">
            <div class="product-card-content">
                <a href="product-detail.html?id=${product.id}">
                    <h3>${product.name}</h3>
                </a>
                <div class="product-category">${product.category}</div>
                ${priceHTML}
                <div class="product-rating">
                    <div class="stars">${starsHTML}</div>
                    <span>(${product.reviews})</span>
                </div>
                <div class="product-actions">
                    <button class="btn btn-primary btn-add-cart" data-product-id="${product.id}">Add to Cart</button>
                    <a href="product-detail.html?id=${product.id}" class="btn btn-view">View</a>
                </div>
            </div>
        `;

        productGrid.appendChild(productCard);
    });

    // Add event listeners for "Add to Cart" buttons
    document.querySelectorAll('.btn-add-cart').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-product-id'));
            const product = allProducts.find(p => p.id === productId);

            if (product) {
                addToCart(productId, product);
            }
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
            price: product.onSale && product.salePrice ? product.salePrice : product.price,
            image: product.images[0],
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

// Update cart count in header
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

// Check URL parameters for initial filtering
function checkURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);

    // Check for category parameter
    const categoryParam = urlParams.get('category');
    if (categoryParam) {
        const categoryButton = document.querySelector(`.category-btn[data-category="${categoryParam}"]`);
        if (categoryButton) {
            // Update active category button
            document.querySelectorAll('.category-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            categoryButton.classList.add('active');

            // Update current category
            currentCategory = categoryParam;
        }
    }

    // Check for sale parameter
    if (urlParams.get('sale') === 'true') {
        document.getElementById('sale-filter').checked = true;
        onSaleOnly = true;
    }

    // Other parameters can be added as needed
}

// Update page title based on selected category
function updatePageTitle() {
    const titleElement = document.getElementById('products-title');
    const descriptionElement = document.getElementById('products-description');

    if (!titleElement || !descriptionElement) return;

    if (currentCategory === 'all') {
        titleElement.textContent = 'All Pet Products';
        descriptionElement.textContent = 'Quality products for all your pet needs';
    } else {
        const category = categories.find(cat => cat.id === currentCategory);
        if (category) {
            titleElement.textContent = `${category.name} Products`;
            descriptionElement.textContent = category.description;
        }
    }
}