document.addEventListener("DOMContentLoaded", function () {
  var products = [];
  var currentPage = 1;
  var productsPerPage = 10;
  var loadMoreButton = document.querySelector(".load-more");
  var productsContainer = document.getElementById("products-container");

  function createProductCard(product, productsContainer) {
    var productCard = document.createElement("div");
    productCard.className = "product-card";
    productCard.innerHTML = `
      <div class="img-wrapper">
        <img src="${product.image}" alt="${product.name}" />
      </div>
      <h3 class="product-name-style">${product.name}</h3>
      <p class="desktop-description">${product.description}</p>
      <p>Price: £${product.price}</p>
      <p>Ratings: ${product.ratings} &#9733;</p>
      <button class="add-to-cart-button">Add to Cart</button>
      <div class="notification-popup">
        <div class="notification-content">
          <span class="notification-icon">&#10004;</span>
          <p class="notification-message">Product Added to Cart</p>
        </div>
      </div>
    `;

    productsContainer.appendChild(productCard);

    var addToCartButton = productCard.querySelector(".add-to-cart-button");
    var notificationPopup = productCard.querySelector(".notification-popup");

    addToCartButton.addEventListener("click", function () {
      notificationPopup.style.display = "block";
    });
  }

  function populateProducts(categoryName) {
    currentPage = 1; // Reset the page number
    fetch("sample-data.json")
      .then((response) => response.json())
      .then((data) => {
        var categoriesData = data;
        var category = categoriesData.categories[categoryName];
        products = category.products;

        displayCategoryInfo(category);
        displayProducts();

        window.scrollTo(0, 0);
      })
      .catch((error) => {
        console.error("Error fetching JSON data:", error);
      });
  }

  function populateAllProducts() {
    currentPage = 1; // Reset the page number
    fetch("sample-data.json")
      .then((response) => response.json())
      .then((data) => {
        var categoriesData = data;
        var allProducts = [];

        // Handle the "home" category separately
        var homeCategory = categoriesData.categories["home"];
        displayCategoryInfo(homeCategory);

        // Concatenate products from all other categories
        for (var categoryName in categoriesData.categories) {
          if (categoryName !== "home") {
            var category = categoriesData.categories[categoryName];
            allProducts = allProducts.concat(category.products);
          }
        }

        products = allProducts;
        displayProducts();

        // Scroll to the top of the page
        window.scrollTo(0, 0);
      })
      .catch((error) => {
        console.error("Error fetching JSON data:", error);
      });
  }

  // Initialize and display initial data
  populateAllProducts();
  displayProducts();

  // Function to display category information
  function displayCategoryInfo(category) {
    var categoryDescription = document.querySelector(".category-description");
    var categoryNameElement =
      categoryDescription.querySelector(".category-name");
    var categoryDescElement =
      categoryDescription.querySelector(".category-desc");

    if (category.name === "home") {
      categoryNameElement.textContent = "";
      categoryDescElement.textContent = "";
    } else {
      categoryNameElement.textContent = category.name;
      categoryDescElement.textContent = category.description;
    }
  }

  function displayProducts() {
    productsContainer.innerHTML = ""; // Clear previous content

    var startIndex = (currentPage - 1) * productsPerPage;
    var endIndex = startIndex + productsPerPage;
    var currentProducts = products.slice(startIndex, endIndex);

    currentProducts.forEach(function (product) {
      createProductCard(product, productsContainer);
    });

    var productCountSpan = document.querySelector(".product-count");
    productCountSpan.textContent = `${currentProducts.length} Products`; // Update the count

    // Hide the "Load More" button initially if there are not enough products
    if (products.length <= productsPerPage) {
      loadMoreButton.style.display = "none";
    } else {
      loadMoreButton.style.display = "block";
    }
  }

  // Function to sort products
  function sortProducts(productsToSort, sortBy) {
    switch (sortBy) {
      case "alphabetical-asc":
        productsToSort.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "alphabetical-desc":
        productsToSort.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "price-asc":
        productsToSort.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        productsToSort.sort((a, b) => b.price - a.price);
        break;
      default:
        break;
    }
  }

  // Filter products by category
  var categoryLinks = document.querySelectorAll(".navbar-container ul li a");

  categoryLinks.forEach(function (link) {
    link.addEventListener("click", function (event) {
      event.preventDefault();
      var categoryName = link.textContent.toLowerCase();
      if (categoryName === "home") {
        populateAllProducts();
      } else {
        populateProducts(categoryName);
      }
      clearFilters();
    });
  });
  function displayFilteredProducts(filteredProducts) {
    productsContainer.innerHTML = "";

    filteredProducts.forEach(function (product) {
      createProductCard(product, productsContainer);
    });

    // Update the product count span
    var productCountSpan = document.querySelector(".product-count");
    productCountSpan.textContent = `${filteredProducts.length} products`;

    // Check if there are more filtered products to load
    if (filteredProducts.length <= productsPerPage) {
      loadMoreButton.style.display = "none";
    } else {
      loadMoreButton.style.display = "block";
    }
  }

  function applyFilters(color, priceRange, sortBy) {
    var filteredProducts = products;

    if (color !== "all") {
      filteredProducts = filteredProducts.filter(
        (product) => product.color === color
      );
    }

    var minPrice = 0;
    var maxPrice = Infinity;

    switch (priceRange) {
      case "cheap":
        maxPrice = 50;
        break;
      case "medium":
        minPrice = 50;
        maxPrice = 100;
        break;
      case "expensive":
        minPrice = 100;
        maxPrice = 150;
        break;
      default:
        break;
    }

    filteredProducts = filteredProducts.filter(
      (product) => product.price >= minPrice && product.price <= maxPrice
    );

    // Sort the filtered products
    sortProducts(filteredProducts, sortBy);

    // Update the currentProducts array with the filtered and sorted products
    currentProducts = filteredProducts;

    // Update the product count span
    var productCountSpan = document.querySelector(".product-count");
    productCountSpan.textContent = `${currentProducts.length} products`;

    // Display the filtered and sorted products
    displayFilteredProducts(currentProducts);
  }

  // Update sort and filters event listeners
  var sortSelect = document.getElementById("sort-select");
  sortSelect.addEventListener("change", function () {
    var selectedSortOption = sortSelect.value;
    var selectedColor = getSelectedColor();
    var selectedPriceRange = getSelectedPriceRange();
    applyFilters(selectedColor, selectedPriceRange, selectedSortOption);
  });

  // Update color filter event listeners
  const colorItems = document.querySelectorAll(
    ".color-options .color-filter-item"
  );
  colorItems.forEach((item) => {
    item.addEventListener("click", function (event) {
      event.preventDefault();
      const selectedColor = item
        .querySelector("a")
        .textContent.toLowerCase()
        .trim();
      const selectedPriceRange = getSelectedPriceRange();
      const selectedSortOption = sortSelect.value;
      applyFilters(selectedColor, selectedPriceRange, selectedSortOption);
      updateActiveClass(colorItems, item);
    });
  });

  // Update price filter event listeners
  const priceInputs = document.querySelectorAll('input[name="price"]');
  priceInputs.forEach((input) => {
    input.addEventListener("click", function () {
      const selectedPriceRange = input.value;
      const selectedColor = getSelectedColor();
      const selectedSortOption = sortSelect.value;
      applyFilters(selectedColor, selectedPriceRange, selectedSortOption);
    });
  });
  // Update clear filters button
  const clearFiltersButton = document.getElementById("clear-filters-button");
  clearFiltersButton.addEventListener("click", function () {
    clearFilters();
    displayProducts(); // Reset filters and display all products
  });

  // Function to get selected color
  function getSelectedColor() {
    const activeColorItem = document.querySelector(
      ".color-options .color-filter-item.active"
    );
    if (activeColorItem) {
      return activeColorItem
        .querySelector("a")
        .textContent.toLowerCase()
        .trim();
    }
    return "all";
  }

  // Function to get selected price range
  function getSelectedPriceRange() {
    const checkedPriceInput = document.querySelector(
      'input[name="price"]:checked'
    );
    if (checkedPriceInput) {
      return checkedPriceInput.value;
    }
    return "all";
  }

  // Function to update the active class for filter items
  function updateActiveClass(items, activeItem) {
    items.forEach((item) => {
      item.classList.remove("active");
    });
    activeItem.classList.add("active");
  }

  // Function to clear both color and price filters
  function clearFilters() {
    const colorItems = document.querySelectorAll(
      ".color-options .color-filter-item"
    );
    updateActiveClass(colorItems, colorItems[0]);

    const priceInputs = document.querySelectorAll('input[name="price"]');
    priceInputs.forEach((input) => {
      input.checked = false;
    });
  }

  displayProducts(); // Reset filters and display all products

  // Populate all products and display the first page
  populateAllProducts();
  displayProducts();

  // Add event listener to load more button
  loadMoreButton.addEventListener("click", function () {
    var startIndex = currentPage * productsPerPage;
    var endIndex = startIndex + productsPerPage;
    var newProducts = products.slice(startIndex, endIndex);

    newProducts.forEach(function (product) {
      createProductCard(product, productsContainer);
    });

    currentPage++;

    // Update product count span with the new count
    var productCountSpan = document.querySelector(".product-count");
    productCountSpan.textContent = `Showing ${
      currentPage * productsPerPage
    } products`;

    // Check if there are more products to load
    if (endIndex >= products.length) {
      loadMoreButton.style.display = "none";
    }
  });

  var navbarUl = document.querySelector(".navbar-dropdown");
  var logoImage = document.querySelector(".menu-image");

  // Add event listener for logo image click
  logoImage.addEventListener("click", function (event) {
    event.stopPropagation();
    navbarUl.classList.toggle("show");
  });

  // Add event listener to the document
  document.addEventListener("click", function (event) {
    // Check if the clicked element is not inside the navbar
    if (!navbarUl.contains(event.target)) {
      navbarUl.classList.remove("show");
    }
  });

  // Add event listener to close dropdown when clicked
  navbarUl.addEventListener("click", function (event) {
    event.stopPropagation(); // Prevent the click event from propagating to the document
    navbarUl.classList.remove("show");
  });

  // Mobile ful screen filter menu
  var filterContent = document.querySelector(".filter-content");
  var openFilterButton = document.querySelector(".open-filter");
  var closeFilterButton = document.querySelector(".close-filter");
  var filter = document.querySelector(".filter");
  var clearFiltersBtn = document.querySelector(".clear-filters-btn");

  function openFilter() {
    if (window.innerWidth <= 768) {
      var fullScreenFilter = document.querySelector(".full-screen-filter");
      fullScreenFilter.style.display = "flex";
      filterContent.classList.remove("active");
      clearFiltersBtn.classList.remove("btn-sm");
      closeFilterButton.classList.remove("btn-sm");
    } else {
      filterContent.classList.add("active");
      fullScreenFilter.style.flex = "1";
      filter.style.width = "100%";
      filterContent.style.width = "100%";
    }
  }

  function closeFilter() {
    if (window.innerWidth <= 768) {
      var fullScreenFilter = document.querySelector(".full-screen-filter");
      fullScreenFilter.style.display = "none";
    } else {
      filterContent.classList.remove("active");
    }
  }

  openFilterButton.addEventListener("click", openFilter);
  closeFilterButton.addEventListener("click", closeFilter);

  window.addEventListener("resize", function () {
    var fullScreenFilter = document.querySelector(".full-screen-filter");
    if (window.innerWidth > 768) {
      fullScreenFilter.style.display = "flex";
      fullScreenFilter.style.flex = "1";
      filter.style.width = "100%";
      filterContent.style.width = "100%";
    } else {
      fullScreenFilter.style.display = "none";
    }
  });
});
