import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { ShoppingCart, Package, CheckCircle2, Hand, XCircle, Plus } from 'lucide-react'

type OrderStatus = 'pending' | 'processing' | 'ready' | 'picked_up' | 'cancelled'

function OrdersPage() {
  const orders = useQuery(api.dashboard.orders.getAll)
  const updateStatus = useMutation(api.dashboard.orders.updateStatus)
  const generateDummyOrders = useMutation(api.dashboard.seedOrders.generateDummyOrders)
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateStatus({ orderId, status: newStatus })
    } catch (error) {
      console.error('Error updating order status:', error)
      alert('Failed to update order status. Please try again.')
    }
  }

  const handleGenerateDummyOrders = async () => {
    if (!confirm('This will create 5 dummy orders. Continue?')) {
      return
    }

    setIsGenerating(true)
    try {
      const result = await generateDummyOrders({ count: 5 })
      alert(result.message)
    } catch (error: any) {
      console.error('Error generating dummy orders:', error)
      alert(error?.message || 'Failed to generate dummy orders. Make sure you have products created first.')
    } finally {
      setIsGenerating(false)
    }
  }

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'ready':
        return 'bg-purple-100 text-purple-800'
      case 'picked_up':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return <Package className="w-4 h-4" />
      case 'processing':
        return <CheckCircle2 className="w-4 h-4" />
      case 'ready':
        return <Hand className="w-4 h-4" />
      case 'picked_up':
        return <CheckCircle2 className="w-4 h-4" />
      case 'cancelled':
        return <XCircle className="w-4 h-4" />
      default:
        return <Package className="w-4 h-4" />
    }
  }

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 'Pending'
      case 'processing':
        return 'Processing'
      case 'ready':
        return 'Ready for Pickup'
      case 'picked_up':
        return 'Picked Up'
      case 'cancelled':
        return 'Cancelled'
      default:
        return status
    }
  }

  const filteredOrders = orders?.filter((order) => 
    filterStatus === 'all' ? true : order.status === filterStatus
  ) || []

  const statusCounts = {
    all: orders?.length || 0,
    pending: orders?.filter((o) => o.status === 'pending').length || 0,
    processing: orders?.filter((o) => o.status === 'processing').length || 0,
    ready: orders?.filter((o) => o.status === 'ready').length || 0,
    picked_up: orders?.filter((o) => o.status === 'picked_up').length || 0,
    cancelled: orders?.filter((o) => o.status === 'cancelled').length || 0,
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Orders Management</h1>
        <button
          onClick={handleGenerateDummyOrders}
          disabled={isGenerating}
          className="flex items-center gap-2 px-4 py-2 bg-primary-green text-white rounded-lg font-semibold shadow-sm hover:bg-dark-green hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={20} />
          {isGenerating ? 'Generating...' : 'Generate Test Orders'}
        </button>
      </div>

      {/* Status Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        {(['all', 'pending', 'processing', 'ready', 'picked_up', 'cancelled'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`
              px-4 py-2 rounded-lg font-medium transition-all capitalize
              ${
                filterStatus === status
                  ? 'bg-primary-green text-white shadow-sm'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }
            `}
          >
            {status === 'picked_up' ? 'Picked Up' : status === 'ready' ? 'Ready for Pickup' : status} ({statusCounts[status]})
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders === undefined ? (
          <div className="text-center py-8 text-gray-600">Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16 px-8 text-gray-600 bg-white rounded-lg">
            <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg mb-2">No orders found.</p>
            <p className="text-sm text-gray-500 mb-4">
              {filterStatus !== 'all' 
                ? `No orders with status "${filterStatus}"` 
                : 'Click "Generate Test Orders" to create sample orders for testing.'}
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">Order #{order.orderId}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(order.status as OrderStatus)}`}>
                        {getStatusIcon(order.status as OrderStatus)}
                        {getStatusLabel(order.status as OrderStatus)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {order.customerEmail && (
                        <span className="mr-4">Email: {order.customerEmail}</span>
                      )}
                      {order.customerName && (
                        <span className="mr-4">Name: {order.customerName}</span>
                      )}
                    </p>
                    <p className="text-sm text-gray-600">
                      Date: {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString()}
                    </p>
                    {order.shippingAddress && (
                      <p className="text-sm text-gray-600 mt-1">
                        Pickup Location: {order.shippingAddress}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary-green">€{order.total.toFixed(2)}</p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Order Items:</h4>
                  <div className="space-y-2">
                    {order.items?.map((item, index) => (
                      <div key={index} className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                          {item.productImage && (
                            <img
                              src={item.productImage}
                              alt={item.productName}
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                          <div>
                            <p className="font-medium text-gray-800">{item.productName}</p>
                            <p className="text-sm text-gray-600">Qty: {item.quantity} × €{item.price.toFixed(2)}</p>
                          </div>
                        </div>
                        <p className="font-semibold text-gray-800">€{item.total.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Actions */}
                <div className="border-t border-gray-200 pt-4 mt-4 flex flex-wrap gap-2">
                  {order.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(order.orderId, 'processing')}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                      >
                        Mark as Processing
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(order.orderId, 'cancelled')}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                      >
                        Cancel Order
                      </button>
                    </>
                  )}
                  {order.status === 'processing' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(order.orderId, 'ready')}
                        className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium"
                      >
                        Mark as Ready for Pickup
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(order.orderId, 'cancelled')}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                      >
                        Cancel Order
                      </button>
                    </>
                  )}
                  {order.status === 'ready' && (
                    <button
                      onClick={() => handleStatusUpdate(order.orderId, 'picked_up')}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                    >
                      Mark as Picked Up
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default OrdersPage
