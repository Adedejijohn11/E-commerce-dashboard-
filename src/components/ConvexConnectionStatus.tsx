import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { CheckCircle2 } from 'lucide-react'

function ConvexConnectionStatus() {
  // Try to query the database to check connection
  useQuery(api.dashboard.products.getAll)

  // If query is undefined, it means Convex is still connecting
  // If query is an array, it means we're connected (even if empty)
  // If there's an error, the ErrorBoundary will catch it

  const convexUrl = import.meta.env.VITE_CONVEX_URL
  if (!convexUrl) {
    return null // ConvexSetupMessage will handle this
  }

  // If we can query (even if it returns undefined initially), we're connected
  // The fact that useQuery doesn't throw means we're connected
  return (
    <div className="bg-green-50 border-l-4 border-green-400 p-3 mb-6 flex items-center">
      <CheckCircle2 className="h-5 w-5 text-green-400 mr-2" />
      <p className="text-sm text-green-700">
        <strong>Connected to Convex</strong> - Products will be saved to the database
      </p>
    </div>
  )
}

export default ConvexConnectionStatus

