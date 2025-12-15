import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import { X, Loader2, Upload, Image as ImageIcon } from 'lucide-react'

interface ProductFormProps {
  productId: Id<'products'> | null
  onClose: () => void
}

function ProductForm({ productId, onClose }: ProductFormProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [originalPrice, setOriginalPrice] = useState('')
  const [category, setCategory] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [stock, setStock] = useState('')
  const [unit, setUnit] = useState('')
  const [isLocal, setIsLocal] = useState(false)
  const [tags, setTags] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isOnSale, setIsOnSale] = useState(false)
  const [discountPercentage, setDiscountPercentage] = useState('')
  const [saleStartDate, setSaleStartDate] = useState('')
  const [saleEndDate, setSaleEndDate] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Get categories for dropdown
  const categories = useQuery(api.dashboard.categories.getAll)
  const createPromotion = useMutation(api.frontend.promotions.create)

  const product = useQuery(
    api.dashboard.products.getById,
    productId ? { id: productId } : 'skip'
  )
  const createProduct = useMutation(api.dashboard.products.create)
  const updateProduct = useMutation(api.dashboard.products.update)
  const generateUploadUrl = useMutation(api.dashboard.products.generateUploadUrl)
  const getStorageUrl = useMutation(api.dashboard.products.getStorageUrl)

  useEffect(() => {
    if (product) {
      setName(product.name)
      setDescription(product.description)
      setPrice(product.price.toString())
      setOriginalPrice(product.originalPrice?.toString() || '')
      setCategory(product.category)
      setImageUrl(product.imageUrl || '')
      setImagePreview(product.imageUrl || null)
      setStock(product.stock.toString())
      setUnit(product.unit || '')
      setIsLocal(product.isLocal || false)
      setTags(product.tags?.join(', ') || '')
      setIsActive(product.isActive)
      // Check if product is on sale (has originalPrice)
      setIsOnSale(!!product.originalPrice)
    }
  }, [product])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file')
        return
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB')
        return
      }
      setImageFile(file)
      setError(null)
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setImageUrl('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setIsSubmitting(true)
    setIsUploading(true)
    
    let finalImageUrl = imageUrl

    // Upload image if a new file is selected
    if (imageFile) {
      try {
        // Generate upload URL
        const uploadUrl = await generateUploadUrl()
        
        // Upload file to Convex storage
        const result = await fetch(uploadUrl, {
          method: 'POST',
          headers: { 'Content-Type': imageFile.type },
          body: imageFile,
        })
        
        if (!result.ok) {
          throw new Error('Failed to upload image')
        }
        
        // Get storage ID from response
        const { storageId } = await result.json()
        
        // Get URL from storage ID
        const url = await getStorageUrl({ storageId })
        
        if (!url) {
          throw new Error('Failed to get image URL')
        }
        
        finalImageUrl = url
      } catch (uploadError: any) {
        console.error('Error uploading image:', uploadError)
        setError(uploadError?.message || 'Failed to upload image. Please try again.')
        setIsSubmitting(false)
        setIsUploading(false)
        return
      }
    }
    
    setIsUploading(false)
    
    const productData = {
      name,
      description,
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
      category,
      imageUrl: finalImageUrl || undefined,
      stock: parseInt(stock),
      unit: unit || undefined,
      isLocal: isLocal,
      tags: tags ? tags.split(',').map(t => t.trim()).filter(t => t) : undefined,
      inStock: parseInt(stock) > 0,
    }

    try {
      let savedProductId: Id<'products'>
      
      if (productId) {
        await updateProduct({ id: productId, ...productData, isActive })
        savedProductId = productId
      } else {
        savedProductId = await createProduct(productData)
      }

      // Handle promotion
      if (isOnSale && discountPercentage && saleStartDate && saleEndDate) {
        const startDate = new Date(saleStartDate).getTime()
        const endDate = new Date(saleEndDate).getTime()
        const discount = parseFloat(discountPercentage)
        
        if (discount > 0 && discount <= 100 && endDate > startDate) {
          try {
            await createPromotion({
              productId: savedProductId,
              discountPercentage: discount,
              startDate,
              endDate,
            })
          } catch (promoError: any) {
            console.error('Error creating promotion:', promoError)
            // Don't fail the whole operation if promotion fails
            setError(`Product saved but promotion failed: ${promoError?.message || 'Unknown error'}`)
          }
        }
      }

      setSuccess(true)
      setTimeout(() => {
        onClose()
      }, 500)
    } catch (error: any) {
      console.error('Error saving product:', error)
      setError(error?.message || 'Failed to save product. Please check your Convex connection and try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">{productId ? 'Edit Product' : 'Add New Product'}</h2>
          <button 
            className="bg-transparent border-none cursor-pointer text-gray-600 p-1 rounded hover:bg-gray-100 hover:text-gray-800 transition-all"
            onClick={onClose}
            disabled={isSubmitting}
          >
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700">
                {productId ? 'Product updated successfully!' : 'Product created successfully!'}
              </p>
            </div>
          )}

          <div className="mb-6">
            <label htmlFor="name" className="block mb-2 font-semibold text-gray-800 text-sm">Product Name *</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isSubmitting}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base font-sans bg-transparent transition-all focus:outline-none focus:border-primary-green focus:ring-3 focus:ring-light-green disabled:bg-gray-100"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="description" className="block mb-2 font-semibold text-gray-800 text-sm">Description *</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              disabled={isSubmitting}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base font-sans bg-transparent transition-all focus:outline-none focus:border-primary-green focus:ring-3 focus:ring-light-green disabled:bg-gray-100"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label htmlFor="price" className="block mb-2 font-semibold text-gray-800 text-sm">Price (€) *</label>
              <input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                disabled={isSubmitting}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base font-sans bg-transparent transition-all focus:outline-none focus:border-primary-green focus:ring-3 focus:ring-light-green disabled:bg-gray-100"
              />
            </div>

            <div>
              <label htmlFor="originalPrice" className="block mb-2 font-semibold text-gray-800 text-sm">Original Price (€)</label>
              <input
                id="originalPrice"
                type="number"
                step="0.01"
                min="0"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                placeholder="For discounted items"
                disabled={isSubmitting}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base font-sans bg-transparent transition-all focus:outline-none focus:border-primary-green focus:ring-3 focus:ring-light-green disabled:bg-gray-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label htmlFor="stock" className="block mb-2 font-semibold text-gray-800 text-sm">Stock *</label>
              <input
                id="stock"
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                required
                disabled={isSubmitting}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base font-sans bg-transparent transition-all focus:outline-none focus:border-primary-green focus:ring-3 focus:ring-light-green disabled:bg-gray-100"
              />
            </div>

            <div>
              <label htmlFor="unit" className="block mb-2 font-semibold text-gray-800 text-sm">Unit</label>
              <select
                id="unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base font-sans bg-transparent transition-all focus:outline-none focus:border-primary-green focus:ring-3 focus:ring-light-green disabled:bg-gray-100"
              >
                <option value="">Select unit</option>
                <option value="piece">Piece</option>
                <option value="kg">Kilogram (kg)</option>
                <option value="g">Gram (g)</option>
                <option value="liter">Liter</option>
                <option value="ml">Milliliter (ml)</option>
                <option value="pack">Pack</option>
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="category" className="block mb-2 font-semibold text-gray-800 text-sm">Category *</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              disabled={isSubmitting}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base font-sans bg-transparent transition-all focus:outline-none focus:border-primary-green focus:ring-3 focus:ring-light-green disabled:bg-gray-100"
            >
              <option value="">Select a category</option>
              {categories?.map((cat) => (
                <option key={cat._id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
            {categories && categories.length === 0 && (
              <p className="text-sm text-gray-500 mt-2">No categories found. Please create categories first.</p>
            )}
          </div>

          <div className="mb-6">
            <label htmlFor="tags" className="block mb-2 font-semibold text-gray-800 text-sm">Tags</label>
            <input
              id="tags"
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Comma-separated tags (e.g., organic, fresh, local)"
              disabled={isSubmitting}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base font-sans bg-transparent transition-all focus:outline-none focus:border-primary-green focus:ring-3 focus:ring-light-green disabled:bg-gray-100"
            />
            <p className="text-xs text-gray-500 mt-1">Separate multiple tags with commas</p>
          </div>

          <div className="mb-6">
            <label className="flex items-center gap-2 cursor-pointer font-normal">
              <input
                type="checkbox"
                checked={isLocal}
                onChange={(e) => setIsLocal(e.target.checked)}
                disabled={isSubmitting}
                className="cursor-pointer"
              />
              Local Product (appears in local products section)
            </label>
          </div>

          {/* Promotion Section */}
          <div className="mb-6 p-4 border-2 border-gray-200 rounded-lg bg-gray-50">
            <label className="flex items-center gap-2 cursor-pointer font-semibold mb-4">
              <input
                type="checkbox"
                checked={isOnSale}
                onChange={(e) => {
                  setIsOnSale(e.target.checked)
                  if (e.target.checked) {
                    // Set default dates: start today, end in 7 days
                    const today = new Date()
                    const nextWeek = new Date(today)
                    nextWeek.setDate(today.getDate() + 7)
                    setSaleStartDate(today.toISOString().split('T')[0])
                    setSaleEndDate(nextWeek.toISOString().split('T')[0])
                    if (!discountPercentage) {
                      setDiscountPercentage('10')
                    }
                  }
                }}
                disabled={isSubmitting}
                className="cursor-pointer"
              />
              Add to Weekly Promotions
            </label>
            
            {isOnSale && (
              <div className="mt-4 space-y-4">
                <div>
                  <label htmlFor="discountPercentage" className="block mb-2 font-semibold text-gray-800 text-sm">
                    Discount Percentage (%)
                  </label>
                  <input
                    id="discountPercentage"
                    type="number"
                    min="1"
                    max="100"
                    step="1"
                    value={discountPercentage}
                    onChange={(e) => setDiscountPercentage(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base font-sans bg-white transition-all focus:outline-none focus:border-primary-green focus:ring-3 focus:ring-light-green disabled:bg-gray-100"
                    placeholder="e.g., 20"
                  />
                  {discountPercentage && (
                    <p className="text-xs text-gray-500 mt-1">
                      Product will be discounted by {discountPercentage}%
                    </p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="saleStartDate" className="block mb-2 font-semibold text-gray-800 text-sm">
                      Sale Start Date *
                    </label>
                    <input
                      id="saleStartDate"
                      type="date"
                      value={saleStartDate}
                      onChange={(e) => setSaleStartDate(e.target.value)}
                      required={isOnSale}
                      disabled={isSubmitting}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base font-sans bg-white transition-all focus:outline-none focus:border-primary-green focus:ring-3 focus:ring-light-green disabled:bg-gray-100"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="saleEndDate" className="block mb-2 font-semibold text-gray-800 text-sm">
                      Sale End Date *
                    </label>
                    <input
                      id="saleEndDate"
                      type="date"
                      value={saleEndDate}
                      onChange={(e) => setSaleEndDate(e.target.value)}
                      required={isOnSale}
                      disabled={isSubmitting}
                      min={saleStartDate || new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base font-sans bg-white transition-all focus:outline-none focus:border-primary-green focus:ring-3 focus:ring-light-green disabled:bg-gray-100"
                    />
                  </div>
                </div>
                
                <p className="text-xs text-gray-500 mt-2">
                  This product will appear on the Weekly Promotions page during the sale period.
                </p>
              </div>
            )}
          </div>

          <div className="mb-6">
            <label htmlFor="image" className="block mb-2 font-semibold text-gray-800 text-sm">Product Image</label>
            
            {imagePreview ? (
              <div className="relative mb-4">
                <img
                  src={imagePreview}
                  alt="Product preview"
                  className="w-full h-64 object-cover rounded-lg border border-gray-300"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  disabled={isSubmitting}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-all disabled:opacity-50"
                  title="Remove image"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="mb-4 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-green transition-colors">
                <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-sm text-gray-600 mb-2">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
              </div>
            )}
            
            <input
              ref={fileInputRef}
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={isSubmitting}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSubmitting}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-base font-semibold text-gray-700 hover:bg-gray-100 hover:border-primary-green transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Upload size={18} />
              {imagePreview ? 'Change Image' : 'Select Image'}
            </button>
          </div>

          {productId && (
            <div className="mb-6">
              <label className="flex items-center gap-2 cursor-pointer font-normal">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  disabled={isSubmitting}
                  className="cursor-pointer"
                />
                Active (visible to customers)
              </label>
            </div>
          )}

          <div className="flex gap-4 justify-end mt-8 pt-6 border-t border-gray-200">
            <button 
              type="button" 
              className="px-6 py-3 bg-white text-gray-800 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-6 py-3 bg-primary-green text-white rounded-lg font-semibold shadow-sm hover:bg-dark-green hover:shadow-md active:scale-98 transition-all disabled:opacity-50 flex items-center gap-2"
              disabled={isSubmitting}
            >
              {(isSubmitting || isUploading) && <Loader2 className="w-4 h-4 animate-spin" />}
              {isUploading ? 'Uploading Image...' : productId ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProductForm
