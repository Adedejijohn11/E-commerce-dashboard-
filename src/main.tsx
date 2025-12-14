import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ErrorBoundary from './components/ErrorBoundary'
import './index.css'
import App from './App.tsx'

const convexUrl = import.meta.env.VITE_CONVEX_URL || ''
const convex = new ConvexReactClient(convexUrl)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
})

// Check if Convex URL is configured
if (!convexUrl) {
  console.warn('⚠️ VITE_CONVEX_URL is not set. Please run "npx convex dev" to get your Convex URL and add it to .env file')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ConvexProvider client={convex}>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </ConvexProvider>
    </ErrorBoundary>
  </StrictMode>,
)
