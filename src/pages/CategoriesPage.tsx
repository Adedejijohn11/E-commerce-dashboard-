import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import { Plus, Edit2, Trash2, X, Loader2 } from 'lucide-react'

function CategoriesPage() {
  const categories = useQuery(api.dashboard.categories.getAll)
  const createCategory = useMutation(api.dashboard.categories.create)
  const updateCategory = useMutation(api.dashboard.categories.update)
  const deleteCategory = useMutation(api.dashboard.categories.remove)
  // const seedDefaultCategories = useMutation(api.dashboard.categories.seedDefault)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Id<'categories'> | null>(null)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // const [isSeeding, setIsSeeding] = useState(false)
  // const [seedMessage, setSeedMessage] = useState<string | null>(null)

  const handleOpenForm = (categoryId?: Id<'categories'>) => {
    if (categoryId) {
      const category = categories?.find((c) => c._id === categoryId)
      if (category) {
        setEditingCategory(categoryId)
        setName(category.name)
        setSlug(category.slug)
        setDescription(category.description || '')
      }
    } else {
      setEditingCategory(null)
      setName('')
      setSlug('')
      setDescription('')
    }
    setIsFormOpen(true)
    setError(null)
    setIsSubmitting(false) // Reset submitting state when opening form
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingCategory(null)
    setName('')
    setSlug('')
    setDescription('')
    setError(null)
    setIsSubmitting(false) // Reset submitting state when closing form
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleNameChange = (value: string) => {
    setName(value)
    // Always auto-generate slug from name (even when editing, unless user manually overrides)
    setSlug(generateSlug(value))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate that name is not empty
    const trimmedName = name.trim()
    if (!trimmedName) {
      setError('Category name is required. Please enter a category name.')
      return
    }

    setIsSubmitting(true)

    try {
      if (editingCategory) {
        await updateCategory({
          id: editingCategory,
          name: trimmedName,
          slug,
          description: description || undefined,
        })
      } else {
        await createCategory({
          name: trimmedName,
          slug: slug || generateSlug(trimmedName),
          description: description || undefined,
        })
      }
      handleCloseForm()
    } catch (error: any) {
      console.error('Error saving category:', error)
      setError(error?.message || 'Failed to save category. Please try again.')
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (categoryId: Id<'categories'>) => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return
    }

    try {
      await deleteCategory({ id: categoryId })
    } catch (error: any) {
      alert(error?.message || 'Failed to delete category. Make sure no products are using this category.')
    }
  }

  // const handleSeedDefault = async () => {
  //   if (!confirm('This will create default categories (Bakery, Fruits & Vegetables, Meat & Fish, etc.) if they don\'t already exist. Continue?')) {
  //     return
  //   }

  //   setIsSeeding(true)
  //   setSeedMessage(null)
  //   setError(null)

  //   try {
  //     console.log('Attempting to seed default categories...')
  //     console.log('seedDefaultCategories function:', seedDefaultCategories)
      
  //     // Call the seed function
  //     const result = await seedDefaultCategories()
      
  //     console.log('Seed result:', result)
      
  //     if (result && result.message) {
  //       setSeedMessage(result.message)
  //       console.log(`Success: ${result.message}`)
  //       console.log('Created:', result.created)
  //       console.log('Skipped:', result.skipped)
  //       setIsSeeding(false) // Reset loading state on success
  //       // Clear message after 8 seconds
  //       setTimeout(() => setSeedMessage(null), 8000)
  //     } else {
  //       console.error('Unexpected result format:', result)
  //       setError('Unexpected response from server. Please try again.')
  //       setIsSeeding(false)
  //     }
  //   } catch (error: any) {
  //     console.error('Error seeding categories:', error)
  //     console.error('Error details:', {
  //       message: error?.message,
  //       name: error?.name,
  //       stack: error?.stack
  //     })
      
  //     // Provide more helpful error messages
  //     let errorMessage = 'Failed to seed default categories. '
      
  //     if (error?.message?.includes('Could not find public function') || 
  //         error?.message?.includes('not found') ||
  //         error?.message?.includes('dashboard/categories:seedDefault')) {
  //       errorMessage += 'The Convex function has not been synced. Please run `npx convex dev` in the dashboard directory and wait for functions to sync. Then refresh this page.'
  //     } else if (error?.message) {
  //       errorMessage += error.message
  //     } else {
  //       errorMessage += 'Please make sure Convex dev server is running and try again.'
  //     }
      
  //     setError(errorMessage)
  //     setIsSeeding(false)
  //   }
  // }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Categories Management</h1>
        <div className="flex items-center gap-3">
          {/* <button
            onClick={handleSeedDefault}
            disabled={isSeeding}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow-sm hover:bg-blue-700 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSeeding ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Seeding...
              </>
            ) : (
              <>
                <Database size={20} />
                Seed Default Categories
              </>
            )}
          </button> */}
          <button
            onClick={() => handleOpenForm()}
            className="flex items-center gap-2 px-4 py-2 bg-primary-green text-white rounded-lg font-semibold shadow-sm hover:bg-dark-green hover:shadow-md transition-all"
          >
            <Plus size={20} />
            Add Category
          </button>
        </div>
      </div>

      {/* Seed Success Message */}
      {/* {seedMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700">{seedMessage}</p>
        </div>
      )} */}

      {/* Categories List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {categories === undefined ? (
          <div className="text-center py-8 text-gray-600">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="text-center py-16 px-8 text-gray-600">
            <p className="text-lg mb-2">No categories found.</p>
            <p className="text-sm text-gray-500 mb-4">Create your first category to get started.</p>
            <button
              onClick={() => handleOpenForm()}
              className="px-4 py-2 bg-primary-green text-white rounded-lg font-semibold hover:bg-dark-green transition-all"
            >
              Add Category
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Slug</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categories.map((category) => (
                  <tr key={category._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{category.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600 font-mono">{category.slug}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">{category.description || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenForm(category._id)}
                          className="text-blue-600 hover:text-blue-900 p-2 rounded hover:bg-blue-50 transition-all"
                          title="Edit category"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(category._id)}
                          className="text-red-600 hover:text-red-900 p-2 rounded hover:bg-red-50 transition-all"
                          title="Delete category"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Category Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={handleCloseForm}>
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h2>
              <button
                className="bg-transparent border-none cursor-pointer text-gray-600 p-1 rounded hover:bg-gray-100 hover:text-gray-800 transition-all"
                onClick={handleCloseForm}
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

              <div className="mb-6">
                <label htmlFor="name" className="block mb-2 font-semibold text-gray-800 text-sm">Category Name *</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base font-sans bg-transparent transition-all focus:outline-none focus:border-primary-green focus:ring-3 focus:ring-light-green disabled:bg-gray-100"
                />
              </div>

              <div className="mb-6">
                <label htmlFor="slug" className="block mb-2 font-semibold text-gray-800 text-sm">Slug (Auto-generated)</label>
                <input
                  id="slug"
                  type="text"
                  value={slug}
                  readOnly
                  disabled={isSubmitting}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base font-mono bg-gray-50 text-gray-600 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Automatically generated from category name</p>
              </div>

              <div className="mb-6">
                <label htmlFor="description" className="block mb-2 font-semibold text-gray-800 text-sm">Description</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  disabled={isSubmitting}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base font-sans bg-transparent transition-all focus:outline-none focus:border-primary-green focus:ring-3 focus:ring-light-green disabled:bg-gray-100"
                />
              </div>

              <div className="flex gap-4 justify-end mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  className="px-6 py-3 bg-white text-gray-800 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50"
                  onClick={handleCloseForm}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-primary-green text-white rounded-lg font-semibold shadow-sm hover:bg-dark-green hover:shadow-md active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  disabled={isSubmitting || !name.trim()}
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default CategoriesPage
