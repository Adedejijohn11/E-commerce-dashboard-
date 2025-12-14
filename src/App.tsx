import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import DashboardLayout from './components/DashboardLayout'

// Lazy load pages for code splitting
const ProductsPage = lazy(() => import('./pages/ProductsPage'))
const OrdersPage = lazy(() => import('./pages/OrdersPage'))
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'))

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-green mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
)

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route 
            index 
            element={
              <Suspense fallback={<PageLoader />}>
                <ProductsPage />
              </Suspense>
            } 
          />
          <Route 
            path="orders" 
            element={
              <Suspense fallback={<PageLoader />}>
                <OrdersPage />
              </Suspense>
            } 
          />
          <Route 
            path="analytics" 
            element={
              <Suspense fallback={<PageLoader />}>
                <AnalyticsPage />
              </Suspense>
            } 
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
