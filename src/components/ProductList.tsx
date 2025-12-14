import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import { Edit, Trash2, Package } from 'lucide-react'

interface Product {
  _id: Id<'products'>
  name: string
  description: string
  price: number
  category: string
  imageUrl?: string
  stock: number
  isActive: boolean
}

interface ProductListProps {
  products: Product[]
  onEdit: (id: Id<'products'>) => void
}

function ProductList({ products, onEdit }: ProductListProps) {
  const deleteProduct = useMutation(api.dashboard.products.remove)

  const handleDelete = async (id: Id<'products'>, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await deleteProduct({ id })
      } catch (error) {
        console.error('Error deleting product:', error)
        alert('Failed to delete product. Please try again.')
      }
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <div key={product._id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
          <div className="relative w-full h-48 bg-gray-50 overflow-hidden">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-light-green to-white">
                <Package size={48} />
              </div>
            )}
            {!product.isActive && (
              <div className="absolute top-2 right-2 bg-red-500 bg-opacity-90 text-white px-3 py-1 rounded text-xs font-semibold">
                Inactive
              </div>
            )}
          </div>
          <div className="p-6 flex-1 flex flex-col">
            <h3 className="text-xl font-bold text-gray-800 mb-2">{product.name}</h3>
            <p className="text-gray-600 text-sm mb-4 flex-1 line-clamp-2">{product.description}</p>
            <div className="flex gap-4 mb-4 text-sm">
              <span className="bg-light-green text-primary-green px-3 py-1 rounded font-semibold">
                {product.category}
              </span>
              <span className="text-gray-600">Stock: {product.stock}</span>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <span className="text-2xl font-bold text-primary-green">€{product.price.toFixed(2)}</span>
              <div className="flex gap-2">
                <button
                  className="bg-transparent border border-gray-300 rounded-md p-2 cursor-pointer text-gray-600 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-800 transition-all"
                  onClick={() => onEdit(product._id)}
                  title="Edit"
                >
                  <Edit size={18} />
                </button>
                <button
                  className="bg-transparent border border-gray-300 rounded-md p-2 cursor-pointer text-gray-600 hover:bg-red-50 hover:border-red-400 hover:text-red-500 transition-all"
                  onClick={() => handleDelete(product._id, product.name)}
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default ProductList
