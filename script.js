class AmazonAffiliateStore {
  constructor() {
    this.products = JSON.parse(localStorage.getItem("products")) || []
    this.cart = JSON.parse(localStorage.getItem("cart")) || []
    this.currentCategory = "all"
    this.searchQuery = ""

    this.init()
  }

  init() {
    this.renderProducts()
    this.updateCartCount()
    this.bindEvents()
    this.initChatbot()

    // Load sample products if none exist
    if (this.products.length === 0) {
      this.loadSampleProducts()
    }
  }

  bindEvents() {
    // Search functionality
    document.getElementById("searchInput").addEventListener("input", (e) => {
      this.searchQuery = e.target.value.toLowerCase()
      this.renderProducts()
    })

    // Category tabs
    document.querySelectorAll(".category-tab").forEach((tab) => {
      tab.addEventListener("click", (e) => {
        document.querySelectorAll(".category-tab").forEach((t) => t.classList.remove("active"))
        e.target.classList.add("active")
        this.currentCategory = e.target.dataset.category
        this.renderProducts()
      })
    })

    // Cart functionality
    document.getElementById("cartBtn").addEventListener("click", () => {
      this.openCart()
    })

    document.getElementById("closeCart").addEventListener("click", () => {
      this.closeCart()
    })

    document.getElementById("cartOverlay").addEventListener("click", () => {
      this.closeCart()
    })

    // Modal functionality
    document.getElementById("closeModal").addEventListener("click", () => {
      this.closeModal()
    })

    window.addEventListener("click", (e) => {
      if (e.target === document.getElementById("productModal")) {
        this.closeModal()
      }
    })

    // Checkout button
    document.getElementById("checkoutBtn").addEventListener("click", () => {
      this.checkout()
    })
  }

  loadSampleProducts() {
    const sampleProducts = [
      {
        id: "1",
        name: "Premium Wireless Headphones",
        description: "High-quality wireless headphones with noise cancellation and premium sound quality.",
        price: 199.99,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop",
        category: "electronics",
        amazonUrl: "https://amazon.com/dp/example1",
        affiliateId: "your-affiliate-id",
      },
      {
        id: "2",
        name: "Smart Home Security Camera",
        description: "Advanced security camera with night vision and mobile app integration.",
        price: 149.99,
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop",
        category: "electronics",
        amazonUrl: "https://amazon.com/dp/example2",
        affiliateId: "your-affiliate-id",
      },
      {
        id: "3",
        name: "Ergonomic Office Chair",
        description: "Comfortable ergonomic office chair with lumbar support and adjustable height.",
        price: 299.99,
        image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=500&fit=crop",
        category: "home",
        amazonUrl: "https://amazon.com/dp/example3",
        affiliateId: "your-affiliate-id",
      },
    ]

    this.products = sampleProducts
    this.saveProducts()
    this.renderProducts()
  }

  renderProducts() {
    const grid = document.getElementById("productsGrid")
    const filteredProducts = this.getFilteredProducts()

    if (filteredProducts.length === 0) {
      grid.innerHTML = `
                <div class="no-products">
                    <i class="fas fa-box-open" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
                    <p>No products found</p>
                </div>
            `
      return
    }

    grid.innerHTML = filteredProducts
      .map(
        (product) => `
            <div class="product-card" onclick="store.openProductModal('${product.id}')">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.name}</h3>
                    <p class="product-price">$${product.price}</p>
                    <p class="product-category">${product.category}</p>
                </div>
            </div>
        `,
      )
      .join("")
  }

  getFilteredProducts() {
    return this.products.filter((product) => {
      const matchesCategory = this.currentCategory === "all" || product.category === this.currentCategory
      const matchesSearch =
        product.name.toLowerCase().includes(this.searchQuery) ||
        product.description.toLowerCase().includes(this.searchQuery)
      return matchesCategory && matchesSearch
    })
  }

  openProductModal(productId) {
    const product = this.products.find((p) => p.id === productId)
    if (!product) return

    document.getElementById("modalImage").src = product.image
    document.getElementById("modalTitle").textContent = product.name
    document.getElementById("modalPrice").textContent = `$${product.price}`
    document.getElementById("modalDescription").textContent = product.description

    const amazonUrl = this.buildAmazonUrl(product)
    document.getElementById("viewOnAmazonBtn").href = amazonUrl

    document.getElementById("addToCartBtn").onclick = () => {
      this.addToCart(product)
      this.closeModal()
      this.openCart()
    }

    document.getElementById("productModal").style.display = "block"
  }

  closeModal() {
    document.getElementById("productModal").style.display = "none"
  }

  buildAmazonUrl(product) {
    const baseUrl = product.amazonUrl
    const affiliateId = product.affiliateId || "your-affiliate-id"

    if (baseUrl.includes("amazon.com")) {
      const separator = baseUrl.includes("?") ? "&" : "?"
      return `${baseUrl}${separator}tag=${affiliateId}`
    }

    return baseUrl
  }

  addToCart(product) {
    const existingItem = this.cart.find((item) => item.id === product.id)

    if (existingItem) {
      existingItem.quantity += 1
    } else {
      this.cart.push({ ...product, quantity: 1 })
    }

    this.saveCart()
    this.updateCartCount()
    this.renderCart()
  }

  removeFromCart(productId) {
    this.cart = this.cart.filter((item) => item.id !== productId)
    this.saveCart()
    this.updateCartCount()
    this.renderCart()
  }

  updateCartCount() {
    const count = this.cart.reduce((sum, item) => sum + item.quantity, 0)
    document.getElementById("cartCount").textContent = count
  }

  openCart() {
    this.renderCart()
    document.getElementById("cartSidebar").classList.add("open")
    document.getElementById("cartOverlay").classList.add("show")
  }

  closeCart() {
    document.getElementById("cartSidebar").classList.remove("open")
    document.getElementById("cartOverlay").classList.remove("show")
  }

  renderCart() {
    const cartItems = document.getElementById("cartItems")
    const cartTotal = document.getElementById("cartTotal")

    if (this.cart.length === 0) {
      cartItems.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #999;">
                    <i class="fas fa-shopping-bag" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                    <p>Your cart is empty</p>
                </div>
            `
      cartTotal.textContent = "0.00"
      return
    }

    cartItems.innerHTML = this.cart
      .map(
        (item) => `
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.name}</div>
                    <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
                    <div style="font-size: 0.8rem; color: #666;">Qty: ${item.quantity}</div>
                </div>
                <button onclick="store.removeFromCart('${item.id}')" class="btn-danger">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `,
      )
      .join("")

    const total = this.cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    cartTotal.textContent = total.toFixed(2)
  }

  checkout() {
    if (this.cart.length === 0) {
      alert("Your cart is empty!")
      return
    }

    // Create Amazon cart URLs for each item
    const amazonUrls = this.cart.map((item) => this.buildAmazonUrl(item))

    // Open first Amazon product (in a real implementation, you'd handle multiple items differently)
    if (amazonUrls.length > 0) {
      window.open(amazonUrls[0], "_blank")
    }

    // Clear cart after checkout
    this.cart = []
    this.saveCart()
    this.updateCartCount()
    this.renderCart()
    this.closeCart()

    alert("Redirecting to Amazon for checkout!")
  }

  saveProducts() {
    localStorage.setItem("products", JSON.stringify(this.products))
  }

  saveCart() {
    localStorage.setItem("cart", JSON.stringify(this.cart))
  }

  // Chatbot functionality
  initChatbot() {
    const chatbot = document.getElementById("chatbot")
    const chatbotTrigger = document.getElementById("chatbotTrigger")
    const chatbotToggle = document.getElementById("chatbotToggle")
    const chatbotInput = document.getElementById("chatbotInput")
    const chatbotSend = document.getElementById("chatbotSend")
    const chatbotMessages = document.getElementById("chatbotMessages")

    // Toggle chatbot visibility
    chatbotTrigger.addEventListener("click", () => {
      chatbot.classList.add("open")
    })

    chatbotToggle.addEventListener("click", () => {
      chatbot.classList.remove("open")
    })

    // Send message
    const sendMessage = () => {
      const message = chatbotInput.value.trim()
      if (!message) return

      // Add user message to chat
      this.addChatMessage(message, "user")
      chatbotInput.value = ""

      // Process the message and respond
      this.processChatbotMessage(message)
    }

    chatbotSend.addEventListener("click", sendMessage)
    chatbotInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") sendMessage()
    })
  }

  addChatMessage(message, sender) {
    const chatbotMessages = document.getElementById("chatbotMessages")
    const messageElement = document.createElement("div")
    messageElement.className = `message ${sender}`
    messageElement.innerHTML = `
      <div class="message-content">
        <p>${message}</p>
      </div>
    `
    chatbotMessages.appendChild(messageElement)
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight
  }

  processChatbotMessage(message) {
    // Simple keyword matching for product search
    const keywords = message.toLowerCase().split(" ")
    const matchedProducts = this.products.filter((product) => {
      return keywords.some(
        (keyword) =>
          product.name.toLowerCase().includes(keyword) ||
          product.description.toLowerCase().includes(keyword) ||
          product.category.toLowerCase().includes(keyword),
      )
    })

    setTimeout(() => {
      if (matchedProducts.length > 0) {
        this.addChatMessage("I found these products that might interest you:", "bot")

        // Show up to 3 product suggestions
        const suggestionsToShow = matchedProducts.slice(0, 3)

        suggestionsToShow.forEach((product) => {
          const amazonUrl = this.buildAmazonUrl(product)
          const suggestionElement = document.createElement("div")
          suggestionElement.className = "product-suggestion"
          suggestionElement.innerHTML = `
            <div class="suggestion-image">
              <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="suggestion-info">
              <div class="suggestion-title">${product.name}</div>
              <div class="suggestion-price">$${product.price}</div>
              <a href="${amazonUrl}" target="_blank" class="btn btn-secondary btn-small">View on Amazon</a>
            </div>
          `

          const chatbotMessages = document.getElementById("chatbotMessages")
          chatbotMessages.appendChild(suggestionElement)
          chatbotMessages.scrollTop = chatbotMessages.scrollHeight
        })

        if (matchedProducts.length > 3) {
          this.addChatMessage(
            `Found ${matchedProducts.length - 3} more products. Please refine your search for better results.`,
            "bot",
          )
        }
      } else {
        this.addChatMessage(
          "I couldn't find any products matching your query. Try different keywords or browse our categories.",
          "bot",
        )
      }
    }, 1000)
  }
}

// Initialize the store
const store = new AmazonAffiliateStore()
