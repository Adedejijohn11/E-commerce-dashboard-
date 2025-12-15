# Convex API Requirements for Cactus E-commerce

This document lists all the queries and mutations you need to create in your Convex dashboard for the e-commerce application.

## 📦 Products

### Queries

#### 1. `products.list`
Get all products (with optional pagination and filtering)
```typescript
// Returns: Product[]
// Optional params: { limit?: number, offset?: number, category?: string }
```

#### 2. `products.getById`
Get a single product by ID
```typescript
// Params: { productId: Id<"products"> }
// Returns: Product | null
```

#### 3. `products.getByCategory`
Get products filtered by category
```typescript
// Params: { category: string }
// Returns: Product[]
// Categories: "bakery", "cheese-&-coldcuts", "drinks-&-beverages", 
//            "fruits-&-vegetables", "localproducts", "meat-&-fish", 
//            "pet-supplies", "snacks-&-sweets"
```

#### 4. `products.getLocal`
Get all local products (products marked as local)
```typescript
// Returns: Product[]
```

#### 5. `products.search`
Search products by name or description
```typescript
// Params: { query: string }
// Returns: Product[]
```

#### 6. `products.getFeatured`
Get featured products for homepage
```typescript
// Returns: Product[]
// Optional params: { limit?: number }
```

### Mutations

#### 7. `products.create`
Create a new product (admin only)
```typescript
// Params: {
//   name: string;
//   description: string;
//   price: number;
//   originalPrice?: number; // for discounted items
//   image: string;
//   category: string;
//   isLocal?: boolean;
//   unit?: string; // e.g., "kg", "piece"
//   inStock?: boolean;
// }
// Returns: Id<"products">
```

#### 8. `products.update`
Update an existing product (admin only)
```typescript
// Params: {
//   productId: Id<"products">;
//   updates: Partial<Product>;
// }
// Returns: void
```

#### 9. `products.delete`
Delete a product (admin only)
```typescript
// Params: { productId: Id<"products"> }
// Returns: void
```

---

## 🛒 Shopping Cart

### Queries

#### 10. `cart.get`
Get current user's cart
```typescript
// Returns: CartItem[]
// Note: You may need to pass userId or use auth token
```

#### 11. `cart.getTotal`
Calculate cart totals (subtotal, fees, total)
```typescript
// Returns: {
//   subtotal: number;
//   pickupFee: number;
//   total: number;
// }
```

### Mutations

#### 12. `cart.add`
Add item to cart
```typescript
// Params: {
//   productId: Id<"products">;
//   quantity: number;
// }
// Returns: void
```

#### 13. `cart.remove`
Remove item from cart
```typescript
// Params: { cartItemId: Id<"cartItems"> }
// Returns: void
```

#### 14. `cart.updateQuantity`
Update quantity of item in cart
```typescript
// Params: {
//   cartItemId: Id<"cartItems">;
//   quantity: number; // new quantity
// }
// Returns: void
```

#### 15. `cart.clear`
Clear entire cart
```typescript
// Returns: void
```

#### 16. `cart.checkout`
Process checkout (create order from cart)
```typescript
// Params: {
//   storeLocationId?: string; // selected pickup location
//   paymentMethod?: string;
// }
// Returns: { orderId: Id<"orders"> }
```

---

## 🏷️ Promotions & Deals

### Queries

#### 17. `promotions.getWeekly`
Get all active weekly promotions
```typescript
// Returns: Promotion[]
```

#### 18. `promotions.getProductsOnSale`
Get products currently on sale
```typescript
// Returns: Product[]
// Optional params: { limit?: number }
```

#### 19. `promotions.getStats`
Get promotion statistics (for promo section)
```typescript
// Returns: {
//   totalProductsOnSale: number;
//   maxDiscount: number; // percentage
//   daysRemaining: number;
// }
```

### Mutations

#### 20. `promotions.create`
Create a new promotion (admin only)
```typescript
// Params: {
//   productId: Id<"products">;
//   discountPercentage: number;
//   startDate: number; // timestamp
//   endDate: number; // timestamp
// }
// Returns: Id<"promotions">
```

---

## 📂 Categories

### Queries

#### 21. `categories.list`
Get all categories
```typescript
// Returns: Category[]
// Should include: name, slug, icon, image, description
```

#### 22. `categories.getBySlug`
Get category by slug
```typescript
// Params: { slug: string }
// Returns: Category | null
```

---

## 🏪 Store Locations

### Queries

#### 23. `stores.list`
Get all store locations
```typescript
// Returns: StoreLocation[]
// Should include: name, address, openingHours, etc.
```

#### 24. `stores.getById`
Get store by ID
```typescript
// Params: { storeId: string }
// Returns: StoreLocation | null
```

---

## 👤 User/Auth (Optional - if you plan to add authentication)

### Queries

#### 25. `users.getCurrent`
Get current authenticated user
```typescript
// Returns: User | null
```

### Mutations

#### 26. `users.create`
Create new user account
```typescript
// Params: {
//   email: string;
//   name: string;
//   // other user fields
// }
// Returns: Id<"users">
```

---

## 📋 Orders (For checkout functionality)

### Queries

#### 27. `orders.getByUser`
Get orders for current user
```typescript
// Returns: Order[]
```

#### 28. `orders.getById`
Get order by ID
```typescript
// Params: { orderId: Id<"orders"> }
// Returns: Order | null
```

### Mutations

#### 29. `orders.create`
Create a new order
```typescript
// Params: {
//   items: CartItem[];
//   storeLocationId: string;
//   total: number;
//   userId?: string;
// }
// Returns: Id<"orders">
```

---

## 📊 Data Types Reference

### Product
```typescript
{
  _id: Id<"products">;
  _creationTime: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[]; // multiple images
  category: string;
  isLocal: boolean;
  unit?: string; // "kg", "piece", "liter", etc.
  inStock: boolean;
  stockQuantity?: number;
  tags?: string[];
}
```

### CartItem
```typescript
{
  _id: Id<"cartItems">;
  _creationTime: number;
  productId: Id<"products">;
  quantity: number;
  userId?: string; // if you have auth
  // You might want to denormalize product data here for faster access
  product?: Product;
}
```

### Category
```typescript
{
  _id: Id<"categories">;
  _creationTime: number;
  name: string;
  slug: string;
  icon?: string;
  image?: string;
  description?: string;
}
```

### Promotion
```typescript
{
  _id: Id<"promotions">;
  _creationTime: number;
  productId: Id<"products">;
  discountPercentage: number;
  startDate: number;
  endDate: number;
  isActive: boolean;
}
```

### StoreLocation
```typescript
{
  _id: Id<"stores">;
  _creationTime: number;
  name: string;
  address: string;
  openingHours?: {
    [day: string]: { open: string; close: string };
  };
  phone?: string;
  email?: string;
}
```

### Order
```typescript
{
  _id: Id<"orders">;
  _creationTime: number;
  userId?: string;
  items: {
    productId: Id<"products">;
    quantity: number;
    price: number;
  }[];
  storeLocationId: string;
  subtotal: number;
  pickupFee: number;
  total: number;
  status: "pending" | "confirmed" | "ready" | "completed" | "cancelled";
  paymentMethod?: string;
}
```

---

## 🎯 Priority Implementation Order

### Phase 1: Core Functionality (Essential)
1. `products.list` - Display products on category pages
2. `products.getById` - Product detail page
3. `products.getByCategory` - Category filtering
4. `cart.add` - Add to cart functionality
5. `cart.get` - Display cart items
6. `cart.updateQuantity` - Update cart quantities
7. `cart.remove` - Remove from cart

### Phase 2: Homepage Features
8. `products.getLocal` - Local products section
9. `promotions.getWeekly` - Weekly promotions section
10. `promotions.getProductsOnSale` - Featured deals
11. `categories.list` - Category navigation

### Phase 3: Enhanced Features
12. `products.search` - Search functionality
13. `cart.checkout` - Checkout process
14. `orders.create` - Order creation
15. `stores.list` - Store locations (if not hardcoded)

### Phase 4: Admin & Management
16. `products.create` - Admin product management
17. `products.update` - Admin product management
18. `promotions.create` - Admin promotion management

---

## 💡 Implementation Notes

1. **Cart Management**: Since you don't have authentication yet, you might want to:
   - Store cart in localStorage temporarily, OR
   - Use session-based cart with a temporary user ID, OR
   - Add authentication first

2. **Product Images**: Consider storing image URLs or using a CDN. The current setup uses local images in `/public/images/`.

3. **Pricing**: Store prices in cents (integer) to avoid floating-point issues, or use a decimal library.

4. **Categories**: The category slugs match your route structure:
   - `bakery`
   - `cheese-&-coldcuts`
   - `drinks-&-beverages`
   - `fruits-&-vegetables`
   - `localproducts`
   - `meat-&-fish`
   - `pet-supplies`
   - `snacks-&-sweets`
   - `weekly-promotions`

5. **Local Products**: Products should have an `isLocal: true` flag to appear in the local products section.

6. **Promotions**: Products on promotion should have `originalPrice` set, and the discount percentage should be calculated: `((originalPrice - price) / originalPrice) * 100`

---

## 🔗 Integration Points

### Homepage (`/`)
- Uses: `products.getLocal`, `promotions.getWeekly`, `categories.list`

### Category Pages (`/bakery`, `/fruits-&-vegetables`, etc.)
- Uses: `products.getByCategory`

### Product Detail (`/product/[id]`)
- Uses: `products.getById`, `cart.add`

### Cart Modal
- Uses: `cart.get`, `cart.updateQuantity`, `cart.remove`, `cart.getTotal`, `cart.checkout`

### Search (Navbar)
- Uses: `products.search`

---

This list covers all the functionality needed for your e-commerce application. Start with Phase 1 queries and mutations, then expand to the other phases as needed.

