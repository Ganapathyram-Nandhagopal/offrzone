class AdminPanel {
  constructor() {
    this.products = JSON.parse(localStorage.getItem("products")) || []
    this.init()
  }

  init() {
    this.bindEvents()
    this.renderProductsTable()
    this.updatePreview()
    this.initImageManagement()
  }

  bindEvents() {
    // Form submission
    document.getElementById("addProductForm").addEventListener("submit", (e) => {
      e.preventDefault()
      this.addProduct()
    })

    // Extract product info from Amazon URL
    document
      .getElementById("extractBtn")
      .addEventListener("click", () => {
        this.extractProductInfo()
      })

    // Form inputs for live preview
    ;["productName", "productPrice", "productImage", "productDescription", "productCategory"].forEach((id) => {
      document.getElementById(id).addEventListener("input", () => {
        this.updatePreview()
      })
    })

    // Export/Import functionality
    document.getElementById("exportBtn").addEventListener("click", () => {
      this.exportData()
    })

    document.getElementById("importBtn").addEventListener("click", () => {
      document.getElementById("importFile").click()
    })

    document.getElementById("importFile").addEventListener("change", (e) => {
      this.importData(e.target.files[0])
    })
  }

  extractProductInfo() {
    const url = document.getElementById("amazonUrl").value

    if (!url || !url.includes("amazon.com")) {
      this.showMessage("Please enter a valid Amazon URL", "error")
      return
    }

    // Show loading state
    const extractBtn = document.getElementById("extractBtn")
    const originalText = extractBtn.innerHTML
    extractBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Extracting...'
    extractBtn.disabled = true

    // Simulate extraction (in a real implementation, you'd use a service to scrape Amazon)
    setTimeout(() => {
      this.simulateAmazonExtraction(url)
      extractBtn.innerHTML = originalText
      extractBtn.disabled = false
    }, 2000)
  }

  simulateAmazonExtraction(url) {
    // This is a simulation - in a real implementation, you'd need a backend service
    // to scrape Amazon product data due to CORS restrictions

    const mockData = {
      name: "Premium Product from Amazon",
      price: 99.99,
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&h=500&fit=crop",
      description: "High-quality product with excellent features and customer reviews.",
      category: "electronics",
    }

    // Fill form with extracted data
    document.getElementById("productName").value = mockData.name
    document.getElementById("productPrice").value = mockData.price
    document.getElementById("productImage").value = mockData.image
    document.getElementById("productDescription").value = mockData.description
    document.getElementById("productCategory").value = mockData.category

    this.updatePreview()
    this.showMessage("Product information extracted successfully!", "success")
  }

  addProduct() {
    const formData = {
      id: Date.now().toString(),
      name: document.getElementById("productName").value,
      price: Number.parseFloat(document.getElementById("productPrice").value),
      image: document.getElementById("productImage").value,
      description: document.getElementById("productDescription").value,
      category: document.getElementById("productCategory").value,
      amazonUrl: document.getElementById("amazonUrl").value,
      affiliateId: document.getElementById("affiliateId").value || "your-affiliate-id",
    }

    // Validate required fields
    if (!formData.name || !formData.price || !formData.image || !formData.description || !formData.category) {
      this.showMessage("Please fill in all required fields", "error")
      return
    }

    this.products.push(formData)
    this.saveProducts()
    this.renderProductsTable()
    this.clearForm()
    this.showMessage("Product added successfully!", "success")
  }

  updatePreview() {
    const preview = document.getElementById("productPreview")
    const name = document.getElementById("productName").value
    const price = document.getElementById("productPrice").value
    const image = document.getElementById("productImage").value
    const description = document.getElementById("productDescription").value
    const category = document.getElementById("productCategory").value

    if (!name && !price && !image) {
      preview.innerHTML = `
                <div class="preview-placeholder">
                    <i class="fas fa-image"></i>
                    <p>Product preview will appear here</p>
                </div>
            `
      return
    }

    preview.innerHTML = `
            <div class="product-card" style="max-width: none; margin: 0;">
                <div class="product-image">
                    <img src="${image || "https://via.placeholder.com/300x250?text=No+Image"}" alt="${name}" onerror="this.src='https://via.placeholder.com/300x250?text=Invalid+Image'">
                </div>
                <div class="product-info">
                    <h3 class="product-title">${name || "Product Name"}</h3>
                    <p class="product-price">$${price || "0.00"}</p>
                    <p class="product-category">${category || "Category"}</p>
                    <p style="font-size: 0.9rem; color: #666; margin-top: 0.5rem;">${description || "Product description..."}</p>
                </div>
            </div>
        `
  }

  renderProductsTable() {
    const tbody = document.getElementById("productsTableBody")

    if (this.products.length === 0) {
      tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 2rem; color: #999;">
                        No products added yet
                    </td>
                </tr>
            `
      return
    }

    tbody.innerHTML = this.products
      .map(
        (product) => `
            <tr>
                <td>
                    <img src="${product.image}" alt="${product.name}" class="table-image">
                </td>
                <td>
                    <strong>${product.name}</strong>
                    <br>
                    <small style="color: #666;">${product.description.substring(0, 50)}...</small>
                </td>
                <td>$${product.price}</td>
                <td>${product.category}</td>
                <td>
                    <div class="table-actions">
                        <button onclick="admin.editProduct('${product.id}')" class="btn btn-secondary btn-small">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="admin.deleteProduct('${product.id}')" class="btn-danger">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `,
      )
      .join("")
  }

  editProduct(productId) {
    const product = this.products.find((p) => p.id === productId)
    if (!product) return

    // Fill form with product data
    document.getElementById("amazonUrl").value = product.amazonUrl || ""
    document.getElementById("productName").value = product.name
    document.getElementById("productPrice").value = product.price
    document.getElementById("productImage").value = product.image
    document.getElementById("productDescription").value = product.description
    document.getElementById("productCategory").value = product.category
    document.getElementById("affiliateId").value = product.affiliateId || ""

    // Remove the product (it will be re-added when form is submitted)
    this.deleteProduct(productId)

    this.updatePreview()
    this.showMessage("Product loaded for editing", "success")
  }

  deleteProduct(productId) {
    if (confirm("Are you sure you want to delete this product?")) {
      this.products = this.products.filter((p) => p.id !== productId)
      this.saveProducts()
      this.renderProductsTable()
      this.showMessage("Product deleted successfully", "success")
    }
  }

  exportData() {
    const data = {
      products: this.products,
      exportDate: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `products-export-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)

    this.showMessage("Data exported successfully!", "success")
  }

  importData(file) {
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
        if (data.products && Array.isArray(data.products)) {
          this.products = data.products
          this.saveProducts()
          this.renderProductsTable()
          this.showMessage(`Imported ${data.products.length} products successfully!`, "success")
        } else {
          this.showMessage("Invalid file format", "error")
        }
      } catch (error) {
        this.showMessage("Error reading file", "error")
      }
    }
    reader.readAsText(file)
  }

  clearForm() {
    document.getElementById("addProductForm").reset()
    this.updatePreview()
  }

  saveProducts() {
    localStorage.setItem("products", JSON.stringify(this.products))
  }

  showMessage(text, type) {
    // Remove existing messages
    const existingMessages = document.querySelectorAll(".message")
    existingMessages.forEach((msg) => msg.remove())

    // Create new message
    const message = document.createElement("div")
    message.className = `message ${type}`
    message.textContent = text

    // Insert at the top of the form
    const form = document.getElementById("addProductForm")
    form.parentNode.insertBefore(message, form)

    // Auto-remove after 5 seconds
    setTimeout(() => {
      message.remove()
    }, 5000)
  }

  initImageManagement() {
    // Populate product select dropdown
    this.updateProductSelect()

    // Bind events for image management
    const uploadArea = document.getElementById("uploadArea")
    const imageUpload = document.getElementById("imageUpload")
    const imageUrl = document.getElementById("imageUrl")
    const fetchImageBtn = document.getElementById("fetchImageBtn")
    const saveImageBtn = document.getElementById("saveImageBtn")
    const productSelect = document.getElementById("productSelect")

    // Handle product selection
    productSelect.addEventListener("change", () => {
      const selectedProductId = productSelect.value
      if (selectedProductId) {
        const product = this.products.find((p) => p.id === selectedProductId)
        if (product) {
          this.showImagePreview(product.image)
        }
      } else {
        this.clearImagePreview()
      }
    })

    // Handle upload area click
    uploadArea.addEventListener("click", () => {
      imageUpload.click()
    })

    // Handle drag and drop
    uploadArea.addEventListener("dragover", (e) => {
      e.preventDefault()
      uploadArea.classList.add("active")
    })

    uploadArea.addEventListener("dragleave", () => {
      uploadArea.classList.remove("active")
    })

    uploadArea.addEventListener("drop", (e) => {
      e.preventDefault()
      uploadArea.classList.remove("active")

      if (e.dataTransfer.files.length) {
        const file = e.dataTransfer.files[0]
        if (file.type.startsWith("image/")) {
          this.handleImageFile(file)
        } else {
          this.showMessage("Please upload an image file", "error")
        }
      }
    })

    // Handle file input change
    imageUpload.addEventListener("change", (e) => {
      if (e.target.files.length) {
        const file = e.target.files[0]
        this.handleImageFile(file)
      }
    })

    // Handle image URL fetch
    fetchImageBtn.addEventListener("click", () => {
      const url = imageUrl.value.trim()
      if (url) {
        this.showImagePreview(url)
      } else {
        this.showMessage("Please enter an image URL", "error")
      }
    })

    // Handle save image to product
    saveImageBtn.addEventListener("click", () => {
      const selectedProductId = productSelect.value
      const imagePreview = document.getElementById("imagePreview")
      const img = imagePreview.querySelector("img")

      if (selectedProductId && img) {
        const imageSource = img.src
        this.updateProductImage(selectedProductId, imageSource)
      } else {
        this.showMessage("Please select a product and add an image", "error")
      }
    })
  }

  updateProductSelect() {
    const productSelect = document.getElementById("productSelect")
    productSelect.innerHTML = '<option value="">Choose a product</option>'

    this.products.forEach((product) => {
      const option = document.createElement("option")
      option.value = product.id
      option.textContent = product.name
      productSelect.appendChild(option)
    })
  }

  handleImageFile(file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      this.showImagePreview(e.target.result)
    }
    reader.readAsDataURL(file)
  }

  showImagePreview(src) {
    const imagePreview = document.getElementById("imagePreview")
    imagePreview.innerHTML = `<img src="${src}" alt="Preview" onerror="this.src='https://via.placeholder.com/400x300?text=Invalid+Image'">`
    document.getElementById("saveImageBtn").disabled = false
  }

  clearImagePreview() {
    const imagePreview = document.getElementById("imagePreview")
    imagePreview.innerHTML = `
      <div class="preview-placeholder">
        <i class="fas fa-image"></i>
        <p>Image preview will appear here</p>
      </div>
    `
    document.getElementById("saveImageBtn").disabled = true
  }

  updateProductImage(productId, imageUrl) {
    const product = this.products.find((p) => p.id === productId)
    if (product) {
      product.image = imageUrl
      this.saveProducts()
      this.renderProductsTable()
      this.showMessage("Product image updated successfully!", "success")
    }
  }
}

// Initialize admin panel
const admin = new AdminPanel()
