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
        initializeProductDetailPage()
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
    // Show loading indicator
    showLoading('Loading products...');

    fetch('data/products.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch products data');
            }
            return response.json();
        })
        .then(data => {
            // Hide loading indicator
            hideLoading();

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
            // Hide loading indicator
            hideLoading();

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

// Initialize the product detail page
function initializeProductDetailPage() {
    // Get product ID from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));

    if (!productId) {
        showErrorMessage('No product ID found in URL.');
        return;
    }

    // Fetch product data
    fetchProductData(productId);
}

// Fetch product data from JSON file
function fetchProductData(productId) {
    // Show loading spinner (already in the HTML)
    document.getElementById('loading-spinner').classList.remove('hidden');

    fetch('data/products.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch product data');
            }
            return response.json();
        })
        .then(data => {
            // Find the product with the matching ID
            const product = data.products.find(p => p.id === productId);
            const categories = data.categories;

            if (!product) {
                showErrorMessage('Product not found.');
                return;
            }

            // Render product details
            renderProductDetails(product, categories);

            // Load related products
            loadRelatedProducts(product, data.products);
        })
        .catch(error => {
            console.error('Error fetching product data:', error);
            showErrorMessage('Failed to load product data. Please try again later.');
        });
}

// Show error message
function showErrorMessage(message) {
    const loadingSpinner = document.getElementById('loading-spinner');
    const errorMessage = document.getElementById('error-message');
    const productDetailContainer = document.getElementById('product-detail-container');

    // Hide loading spinner and product container
    loadingSpinner.classList.add('hidden');
    productDetailContainer.classList.add('hidden');

    // Show error message
    errorMessage.classList.remove('hidden');
    errorMessage.querySelector('p').textContent = message;
}

// Render product details
function renderProductDetails(product, categories) {
    // Hide loading spinner and error message
    document.getElementById('loading-spinner').classList.add('hidden');
    document.getElementById('error-message').classList.add('hidden');

    // Show product detail container
    document.getElementById('product-detail-container').classList.remove('hidden');

    // Update page title
    document.title = `${product.name} - PetLuxe`;

    // Update breadcrumb
    const category = categories.find(c => c.id === product.category);
    if (category) {
        const categoryLink = document.getElementById('category-link');
        categoryLink.textContent = category.name;
        categoryLink.href = `products.html?category=${product.category}`;
    }
    document.getElementById('product-name').textContent = product.name;

    // Update product information
    document.getElementById('detail-product-name').textContent = product.name;
    document.getElementById('detail-product-category').textContent = product.category;
    document.getElementById('detail-short-description').textContent = product.description;
    document.getElementById('detail-long-description').textContent = product.details;

    // Update product price
    const priceContainer = document.getElementById('detail-price-container');
    if (product.onSale && product.salePrice) {
        priceContainer.innerHTML = `
            <span class="product-price">$${product.salePrice.toFixed(2)}</span>
            <span class="original-price">$${product.price.toFixed(2)}</span>
            <span class="sale-badge">SALE</span>
        `;
    } else {
        priceContainer.innerHTML = `
            <span class="product-price">$${product.price.toFixed(2)}</span>
        `;
    }

    // Update product stock status
    const stockElement = document.getElementById('detail-product-stock');
    if (product.stock > 10) {
        stockElement.innerHTML = `<span class="in-stock">In Stock</span>`;
    } else if (product.stock > 0) {
        stockElement.innerHTML = `<span class="low-stock">Low Stock — Only ${product.stock} left</span>`;
    } else {
        stockElement.innerHTML = `<span class="out-of-stock">Out of Stock</span>`;
    }

    // Update product rating
    const ratingElement = document.getElementById('detail-product-rating');

    // Generate rating stars
    const fullStars = Math.floor(product.rating);
    const halfStar = product.rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    let starsHTML = '';
    for (let i = 0; i < fullStars; i++) {
        starsHTML += '★';
    }
    if (halfStar) {
        starsHTML += '★';
    }
    for (let i = 0; i < emptyStars; i++) {
        starsHTML += '☆';
    }

    ratingElement.innerHTML = `
        <div class="stars">${starsHTML}</div>
        <span class="reviews-count">(${product.reviews} reviews)</span>
    `;

    // Update product images
    renderProductImages(product.images, product.name);

    // Update product features
    renderProductFeatures(product.features);

    // Update product specifications
    renderProductSpecifications(product.specifications);

    // Initialize tabs
    initializeTabs();

    // Initialize quantity selector
    initializeQuantitySelector(product.stock);

    // Initialize add to cart button
    initializeAddToCartButton(product);

    // Add product to recently viewed
    addToRecentlyViewed(product);

    // Display recently viewed products
    displayRecentlyViewed(product.id);
}

// Render product images (main image and thumbnails)
function renderProductImages(images, productName) {
    const mainImage = document.getElementById('main-image');
    const thumbnailContainer = document.getElementById('thumbnail-container');

    // Set main image
    mainImage.src = images[0];
    mainImage.alt = productName;

    // Clear thumbnails container
    thumbnailContainer.innerHTML = '';

    // Add thumbnails
    images.forEach((image, index) => {
        const thumbnail = document.createElement('img');
        thumbnail.src = image;
        thumbnail.alt = `${productName} - Image ${index + 1}`;
        thumbnail.className = index === 0 ? 'thumbnail active' : 'thumbnail';
        thumbnail.dataset.index = index;

        thumbnail.addEventListener('click', function() {
            // Update main image
            mainImage.src = image;

            // Update active thumbnail
            document.querySelectorAll('.thumbnail').forEach(thumb => {
                thumb.classList.remove('active');
            });
            this.classList.add('active');
        });

        thumbnailContainer.appendChild(thumbnail);
    });
}

// Render product features
function renderProductFeatures(features) {
    const featuresList = document.getElementById('detail-features-list');

    // Clear features list
    featuresList.innerHTML = '';

    // Add features
    features.forEach(feature => {
        const listItem = document.createElement('li');
        listItem.textContent = feature;
        featuresList.appendChild(listItem);
    });
}

// Render product specifications
function renderProductSpecifications(specifications) {
    const specsTable = document.getElementById('detail-specs-table');

    // Clear specifications table
    specsTable.innerHTML = '';

    // Add specifications
    for (const [key, value] of Object.entries(specifications)) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <th>${key}</th>
            <td>${value}</td>
        `;
        specsTable.appendChild(row);
    }
}

// Initialize tabs
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active tab button
            tabButtons.forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');

            // Update active tab pane
            const tabId = this.getAttribute('data-tab');
            tabPanes.forEach(pane => {
                pane.classList.remove('active');
            });
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
}

// Initialize quantity selector
function initializeQuantitySelector(stockAmount) {
    const minusBtn = document.getElementById('minus-btn');
    const plusBtn = document.getElementById('plus-btn');
    const quantityInput = document.getElementById('quantity-input');

    // Set max quantity based on stock
    const maxQuantity = Math.min(stockAmount, 99);
    quantityInput.max = maxQuantity;

    // Disable add to cart if out of stock
    if (stockAmount <= 0) {
        quantityInput.disabled = true;
        minusBtn.disabled = true;
        plusBtn.disabled = true;
        document.getElementById('add-to-cart-btn').disabled = true;
        document.getElementById('add-to-cart-btn').textContent = 'Out of Stock';
    }

    minusBtn.addEventListener('click', function() {
        const currentValue = parseInt(quantityInput.value);
        if (currentValue > 1) {
            quantityInput.value = currentValue - 1;
        }
    });

    plusBtn.addEventListener('click', function() {
        const currentValue = parseInt(quantityInput.value);
        if (currentValue < maxQuantity) {
            quantityInput.value = currentValue + 1;
        }
    });

    quantityInput.addEventListener('change', function() {
        let value = parseInt(this.value);

        // Validate input value
        if (isNaN(value) || value < 1) {
            value = 1;
        } else if (value > maxQuantity) {
            value = maxQuantity;
        }

        this.value = value;
    });
}

// Initialize add to cart button
function initializeAddToCartButton(product) {
    const addToCartBtn = document.getElementById('add-to-cart-btn');

    addToCartBtn.addEventListener('click', function() {
        if (product.stock <= 0) return;

        const quantity = parseInt(document.getElementById('quantity-input').value);

        // Add product to cart
        addToCartWithQuantity(product, quantity);
    });
}

// Add product to cart with specified quantity
function addToCartWithQuantity(product, quantity) {
    // Show loading on add to cart button
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    buttonLoading(addToCartBtn, true);

    // Simulate network delay (in a real app, this would be an API call)
    setTimeout(() => {
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

        // Provide user feedback
        alert(`${quantity} ${quantity === 1 ? 'unit' : 'units'} of "${product.name}" ${quantity === 1 ? 'has' : 'have'} been added to your cart.`);
    }, 800);
}

// Load related products
function loadRelatedProducts(product, allProducts) {
    const relatedProductsContainer = document.getElementById('related-products-container');

    // Clear container
    relatedProductsContainer.innerHTML = '';

    // Find products in the same category
    const relatedProducts = allProducts
        .filter(p => p.category === product.category && p.id !== product.id)
        .slice(0, 4); // Limit to 4 related products

    if (relatedProducts.length === 0) {
        // If no related products in the same category, show random products
        const randomProducts = allProducts
            .filter(p => p.id !== product.id)
            .sort(() => 0.5 - Math.random())
            .slice(0, 4);

        renderRelatedProducts(randomProducts, relatedProductsContainer);
    } else {
        renderRelatedProducts(relatedProducts, relatedProductsContainer);
    }
}

// Render related products
function renderRelatedProducts(products, container) {
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';

        // Calculate product price display (regular or sale)
        let priceHTML;
        if (product.onSale && product.salePrice) {
            priceHTML = `
                <div class="product-price-container">
                    <span class="product-price">$${product.salePrice.toFixed(2)}</span>
                    <span class="original-price">$${product.price.toFixed(2)}</span>
                </div>
            `;
        } else {
            priceHTML = `
                <div class="product-price-container">
                    <span class="product-price">$${product.price.toFixed(2)}</span>
                </div>
            `;
        }

        // Create the product card HTML
        productCard.innerHTML = `
            <a href="product-detail.html?id=${product.id}">
                <img src="${product.images[0]}" alt="${product.name}">
                <div class="product-card-content">
                    <h3>${product.name}</h3>
                    ${priceHTML}
                    <button class="btn btn-primary btn-add-cart" data-product-id="${product.id}">Add to Cart</button>
                </div>
            </a>
        `;

        container.appendChild(productCard);
    });

    // Add event listeners for "Add to Cart" buttons
    container.querySelectorAll('.btn-add-cart').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent navigation
            const productId = parseInt(this.getAttribute('data-product-id'));
            const product = products.find(p => p.id === productId);

            if (product) {
                addToCartWithQuantity(product, 1);
            }
        });
    });
}

// Recently Viewed Products Functionality

// Add current product to recently viewed
function addToRecentlyViewed(product) {
    // Get existing recently viewed products from localStorage
    let recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed')) || [];

    // Check if product already exists in recently viewed
    const existingIndex = recentlyViewed.findIndex(item => item.id === product.id);

    if (existingIndex !== -1) {
        // If product exists, remove it (will be added back at the beginning)
        recentlyViewed.splice(existingIndex, 1);
    }

    // Add current product to the beginning of the array
    recentlyViewed.unshift({
        id: product.id,
        name: product.name,
        price: product.onSale && product.salePrice ? product.salePrice : product.price,
        image: product.images[0],
        category: product.category
    });

    // Limit to 10 products
    if (recentlyViewed.length > 10) {
        recentlyViewed = recentlyViewed.slice(0, 10);
    }

    // Save updated recently viewed to localStorage
    localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed));
}

// Display recently viewed products
function displayRecentlyViewed(currentProductId) {
    const recentlyViewedSection = document.getElementById('recently-viewed-section');
    const recentlyViewedContainer = document.getElementById('recently-viewed-container');

    if (!recentlyViewedSection || !recentlyViewedContainer) return;

    // Get recently viewed products from localStorage
    const recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed')) || [];

    // Filter out current product
    const filteredRecentlyViewed = recentlyViewed.filter(product => product.id !== currentProductId);

    // If there are no other recently viewed products, don't show the section
    if (filteredRecentlyViewed.length === 0) {
        recentlyViewedSection.classList.add('hidden');
        return;
    }

    // Show the section
    recentlyViewedSection.classList.remove('hidden');

    // Build HTML for recently viewed products
    let recentlyViewedHTML = '';

    filteredRecentlyViewed.forEach(product => {
        recentlyViewedHTML += `
            <a href="product-detail.html?id=${product.id}" class="recently-viewed-card">
                <img src="${product.image}" alt="${product.name}">
                <div class="recently-viewed-card-content">
                    <h3>${product.name}</h3>
                    <div class="recently-viewed-price">$${product.price.toFixed(2)}</div>
                </div>
            </a>
        `;
    });

    recentlyViewedContainer.innerHTML = recentlyViewedHTML;
}