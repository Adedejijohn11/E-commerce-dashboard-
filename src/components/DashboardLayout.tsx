import { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { BarChart3, Package, Menu, X, ShoppingCart, FolderTree } from 'lucide-react'
import ConvexSetupMessage from './ConvexSetupMessage'
import ConvexConnectionStatus from './ConvexConnectionStatus'
import logo from '../assets/logo.jpg'

function DashboardLayout() {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigation = [
    {
      name: 'Products',
      href: '/',
      icon: Package,
      active: location.pathname === '/',
    },
    {
      name: 'Categories',
      href: '/categories',
      icon: FolderTree,
      active: location.pathname === '/categories',
    },
    {
      name: 'Orders',
      href: '/orders',
      icon: ShoppingCart,
      active: location.pathname === '/orders',
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
      active: location.pathname === '/analytics',
    },
  ]

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar - Fixed on desktop */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center gap-3">
              <img 
                src={logo} 
                alt="Cactus Logo" 
                className="h-10 w-auto object-contain"
              />
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium
                    ${
                      item.active
                        ? 'bg-primary-green text-white shadow-sm'
                        : 'text-gray-700 hover:bg-light-green hover:text-primary-green'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 flex-shrink-0">
            <p className="text-xs text-gray-500 text-center">
              Dashboard v1.0
            </p>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content - with margin for fixed sidebar on desktop */}
      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <Menu size={24} />
            </button>
            <div className="flex-1" />
            <div className="flex items-center gap-4">
              <div className="hidden sm:block">
                <span className="text-sm text-gray-600">Welcome back!</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <ConvexSetupMessage />
            <ConvexConnectionStatus />
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
