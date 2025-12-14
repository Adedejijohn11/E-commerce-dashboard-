# E-commerce Dashboard

A modern e-commerce dashboard built with React, TypeScript, and Convex. This dashboard allows you to manage products and view sales analytics, following the Cactus grocery delivery design aesthetic.

## Features

- **Product Management**
  - Upload new products
  - Edit existing products
  - View all products in a grid layout
  - Delete products
  - Toggle product active/inactive status

- **Sales Analytics**
  - Total revenue, orders, and items sold
  - Revenue over time (last 30 days)
  - Top products by revenue

- **Shared Database**
  - Uses Convex backend that can be shared with your frontend e-commerce site
  - Separate methods for dashboard (`convex/dashboard/`) and frontend (`convex/frontend/`)
  - Dashboard methods have full access to all products
  - Frontend methods only expose active products

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Backend**: Convex
- **Routing**: React Router
- **Charts**: Recharts
- **Icons**: Lucide React

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set up Convex**
   ```bash
   npx convex dev
   ```
   This will:
   - Create a new Convex project (or connect to existing)
   - Generate TypeScript types
   - Start the Convex development server

3. **Configure Environment Variables**
   - After running `npx convex dev`, you'll get a `VITE_CONVEX_URL`
   - Create a `.env` file and add:
     ```
     VITE_CONVEX_URL=your_convex_url_here
     ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## Project Structure

```
├── convex/
│   ├── dashboard/          # Dashboard-specific methods
│   │   ├── products.ts     # Product CRUD operations
│   │   └── analytics.ts    # Sales analytics queries
│   ├── frontend/           # Frontend-specific methods
│   │   ├── products.ts     # Public product queries
│   │   └── orders.ts       # Order creation
│   └── schema.ts           # Database schema
├── src/
│   ├── components/         # Reusable components
│   ├── pages/              # Page components
│   └── main.tsx            # App entry point
└── package.json
```

## Database Schema

### Products
- `name`: string
- `description`: string
- `price`: number
- `category`: string
- `imageUrl`: optional string
- `stock`: number
- `isActive`: boolean
- `createdAt`: number (timestamp)
- `updatedAt`: number (timestamp)

### Sales
- `productId`: reference to products
- `quantity`: number
- `price`: number
- `total`: number
- `customerEmail`: optional string
- `orderId`: string
- `createdAt`: number (timestamp)

## Using the Shared Database

The Convex backend is structured to support both the dashboard and your frontend e-commerce site:

- **Dashboard methods** (`convex/dashboard/`): Full access to all products, can create/update/delete
- **Frontend methods** (`convex/frontend/`): Only exposes active products, handles customer orders

You can use the same Convex deployment for both applications by importing the appropriate methods:

```typescript
// In dashboard
import { api } from '../convex/_generated/api'
const products = useQuery(api.dashboard.products.getAll)

// In frontend
import { api } from '../convex/_generated/api'
const products = useQuery(api.frontend.products.getActive)
```

## Color Scheme

Following the Cactus design:
- **Primary Green**: #22c55e
- **Dark Green**: #16a34a
- **Light Green**: #dcfce7
- **Text Dark**: #1f2937
- **Text Gray**: #6b7280
- **Background**: #ffffff / #f9fafb

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## License

MIT
