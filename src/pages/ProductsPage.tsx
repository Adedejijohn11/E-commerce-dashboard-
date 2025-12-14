import { useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import ProductForm from '../components/ProductForm'
import ProductList from '../components/ProductList'
import { Plus } from 'lucide-react'

function ProductsPage() {
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Id<'products'> | null>(null)
  const products = useQuery(api.dashboard.products.getAll)

  const handleEdit = (id: Id<'products'>) => {
    setEditingProduct(id)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingProduct(null)
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Products Management</h1>
        <button 
          className="flex items-center gap-2 px-6 py-3 bg-primary-green text-white rounded-lg font-semibold shadow-sm hover:bg-dark-green hover:shadow-md active:scale-98 transition-all"
          onClick={() => setShowForm(true)}
        >
          <Plus size={20} />
          Add Product
        </button>
      </div>

      {showForm && (
        <ProductForm
          productId={editingProduct}
          onClose={handleFormClose}
        />
      )}

      <div className="w-full">
        {products === undefined ? (
          <div className="text-center py-8 text-gray-600">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 px-8 text-gray-600">
            <p className="text-lg">No products yet. Add your first product to get started!</p>
          </div>
        ) : (
          <ProductList products={products} onEdit={handleEdit} />
        )}
      </div>
    </div>
  )
}

export default ProductsPage
