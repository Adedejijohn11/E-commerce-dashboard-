# Frontend API Integration Guide

Complete list of all Convex queries and mutations for the e-commerce storefront and how to integrate them in your Next.js application.

## 📋 Table of Contents

1. [Setup](#setup)
2. [Products API](#products-api)
3. [Cart API](#cart-api)
4. [Promotions API](#promotions-api)
5. [Categories API](#categories-api)
6. [Stores API](#stores-api)
7. [Orders API](#orders-api)
8. [Complete Integration Examples](#complete-integration-examples)

---

## Setup

### 1. Install Convex in your Next.js project

```bash
npm install convex
```

### 2. Initialize Convex

```bash
npx convex init
```

### 3. Set up Convex Provider

In your `app/layout.tsx` or `pages/_app.tsx`:

```tsx
import { ConvexProvider, ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default function RootLayout({ children }) {
  return (
    <ConvexProvider client={convex}>
      {children}
    </ConvexProvider>
  );
}
```

### 4. Environment Variables

Add to your `.env.local`:

```
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
```

---

## Products API

### Queries

#### 1. `api.frontend.products.list` - Get all products

```tsx
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

function ProductsPage() {
  // Get all products
  const products = useQuery(api.frontend.products.list);
  
  // With pagination
  const products = useQuery(api.frontend.products.list, {
    limit: 20,
    offset: 0,
  });
  
  // Filter by category
  const products = useQuery(api.frontend.products.list, {
    category: "fruits-&-vegetables",
  });
  
  if (products === undefined) return <div>Loading...</div>;
  
  return (
    <div>
      {products.map((product) => (
        <div key={product._id}>{product.name}</div>
      ))}
    </div>
  );
}
```

**Parameters:**
- `limit?: number` - Number of products to return
- `offset?: number` - Number of products to skip
- `category?: string` - Filter by category slug

**Returns:** `Product[]`

---

#### 2. `api.frontend.products.getById` - Get single product

```tsx
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

function ProductDetailPage({ productId }: { productId: Id<"products"> }) {
  const product = useQuery(api.frontend.products.getById, { productId });
  
  if (product === undefined) return <div>Loading...</div>;
  if (product === null) return <div>Product not found</div>;
  
  return (
    <div>
      <h1>{product.name}</h1>
      <p>€{product.price}</p>
      <p>{product.description}</p>
    </div>
  );
}
```

**Parameters:**
- `productId: Id<"products">` - Product ID

**Returns:** `Product | null`

---

#### 3. `api.frontend.products.getByCategory` - Get products by category

```tsx
function CategoryPage({ categorySlug }: { categorySlug: string }) {
  const products = useQuery(api.frontend.products.getByCategory, {
    category: categorySlug,
  });
  
  if (products === undefined) return <div>Loading...</div>;
  
  return (
    <div>
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}
```

**Parameters:**
- `category: string` - Category slug (e.g., "fruits-&-vegetables")

**Returns:** `Product[]`

---

#### 4. `api.frontend.products.getLocal` - Get local products

```tsx
function LocalProductsSection() {
  const localProducts = useQuery(api.frontend.products.getLocal);
  
  if (localProducts === undefined) return <div>Loading...</div>;
  
  return (
    <section>
      <h2>Local Products</h2>
      {localProducts.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </section>
  );
}
```

**Returns:** `Product[]`

---

#### 5. `api.frontend.products.search` - Search products

```tsx
function SearchResults({ searchQuery }: { searchQuery: string }) {
  const results = useQuery(api.frontend.products.search, {
    query: searchQuery,
  });
  
  if (results === undefined) return <div>Loading...</div>;
  
  return (
    <div>
      {results.length === 0 ? (
        <p>No products found</p>
      ) : (
        results.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))
      )}
    </div>
  );
}
```

**Parameters:**
- `query: string` - Search term

**Returns:** `Product[]`

---

#### 6. `api.frontend.products.getFeatured` - Get featured products

```tsx
function HomePage() {
  const featuredProducts = useQuery(api.frontend.products.getFeatured, {
    limit: 8,
  });
  
  if (featuredProducts === undefined) return <div>Loading...</div>;
  
  return (
    <section>
      <h2>Featured Products</h2>
      {featuredProducts.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </section>
  );
}
```

**Parameters:**
- `limit?: number` - Number of products (default: 10)

**Returns:** `Product[]`

---

## Cart API

### Queries

#### 7. `api.frontend.cart.get` - Get user's cart

```tsx
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

function Cart() {
  // For session-based cart (no auth)
  const sessionId = useSessionId(); // You'll need to create this
  const cartItems = useQuery(api.frontend.cart.get, {
    sessionId: sessionId,
  });
  
  // For authenticated users
  // const cartItems = useQuery(api.frontend.cart.get, {
  //   userId: userId,
  // });
  
  if (cartItems === undefined) return <div>Loading cart...</div>;
  
  return (
    <div>
      {cartItems.map((item) => (
        <CartItem key={item._id} item={item} />
      ))}
    </div>
  );
}

// Helper hook for session ID
function useSessionId() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  useEffect(() => {
    let id = localStorage.getItem("sessionId");
    if (!id) {
      id = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("sessionId", id);
    }
    setSessionId(id);
  }, []);
  
  return sessionId;
}
```

**Parameters:**
- `userId?: string` - User ID (if authenticated)
- `sessionId?: string` - Session ID (for guest users)

**Returns:** `CartItem[]` (with product data included)

---

#### 8. `api.frontend.cart.getTotal` - Get cart totals

```tsx
function CartSummary() {
  const sessionId = useSessionId();
  const totals = useQuery(api.frontend.cart.getTotal, {
    sessionId: sessionId,
  });
  
  if (totals === undefined) return <div>Calculating...</div>;
  
  return (
    <div>
      <p>Subtotal: €{totals.subtotal.toFixed(2)}</p>
      <p>Pickup Fee: €{totals.pickupFee.toFixed(2)}</p>
      <p className="font-bold">Total: €{totals.total.toFixed(2)}</p>
    </div>
  );
}
```

**Returns:**
```typescript
{
  subtotal: number;
  pickupFee: number;
  total: number;
}
```

---

### Mutations

#### 9. `api.frontend.cart.add` - Add item to cart

```tsx
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

function AddToCartButton({ productId }: { productId: Id<"products"> }) {
  const addToCart = useMutation(api.frontend.cart.add);
  const sessionId = useSessionId();
  const [isAdding, setIsAdding] = useState(false);
  
  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      await addToCart({
        productId,
        quantity: 1,
        sessionId: sessionId || undefined,
      });
      // Show success message
    } catch (error) {
      console.error("Failed to add to cart:", error);
    } finally {
      setIsAdding(false);
    }
  };
  
  return (
    <button onClick={handleAddToCart} disabled={isAdding}>
      {isAdding ? "Adding..." : "Add to Cart"}
    </button>
  );
}
```

**Parameters:**
- `productId: Id<"products">` - Product ID
- `quantity: number` - Quantity to add
- `userId?: string` - User ID (if authenticated)
- `sessionId?: string` - Session ID (for guest users)

---

#### 10. `api.frontend.cart.updateQuantity` - Update item quantity

```tsx
function CartItemQuantity({ cartItemId, currentQuantity }: { 
  cartItemId: Id<"cartItems">, 
  currentQuantity: number 
}) {
  const updateQuantity = useMutation(api.frontend.cart.updateQuantity);
  
  const handleQuantityChange = async (newQuantity: number) => {
    await updateQuantity({
      cartItemId,
      quantity: newQuantity,
    });
  };
  
  return (
    <div>
      <button onClick={() => handleQuantityChange(currentQuantity - 1)}>-</button>
      <span>{currentQuantity}</span>
      <button onClick={() => handleQuantityChange(currentQuantity + 1)}>+</button>
    </div>
  );
}
```

**Parameters:**
- `cartItemId: Id<"cartItems">` - Cart item ID
- `quantity: number` - New quantity (if 0, item is removed)

---

#### 11. `api.frontend.cart.remove` - Remove item from cart

```tsx
function RemoveFromCartButton({ cartItemId }: { cartItemId: Id<"cartItems"> }) {
  const removeFromCart = useMutation(api.frontend.cart.remove);
  
  const handleRemove = async () => {
    await removeFromCart({ cartItemId });
  };
  
  return <button onClick={handleRemove}>Remove</button>;
}
```

**Parameters:**
- `cartItemId: Id<"cartItems">` - Cart item ID

---

#### 12. `api.frontend.cart.clear` - Clear entire cart

```tsx
function ClearCartButton() {
  const clearCart = useMutation(api.frontend.cart.clear);
  const sessionId = useSessionId();
  
  const handleClear = async () => {
    if (confirm("Clear all items from cart?")) {
      await clearCart({
        sessionId: sessionId || undefined,
      });
    }
  };
  
  return <button onClick={handleClear}>Clear Cart</button>;
}
```

**Parameters:**
- `userId?: string` - User ID (if authenticated)
- `sessionId?: string` - Session ID (for guest users)

---

#### 13. `api.frontend.cart.checkout` - Process checkout

```tsx
function CheckoutForm() {
  const checkout = useMutation(api.frontend.cart.checkout);
  const sessionId = useSessionId();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleCheckout = async (formData: {
    customerEmail: string;
    customerName: string;
    storeLocationId?: string;
    paymentMethod?: string;
  }) => {
    setIsProcessing(true);
    try {
      const result = await checkout({
        sessionId: sessionId || undefined,
        customerEmail: formData.customerEmail,
        customerName: formData.customerName,
        storeLocationId: formData.storeLocationId,
        paymentMethod: formData.paymentMethod,
      });
      
      // Redirect to order confirmation
      router.push(`/order-confirmation/${result.orderId}`);
    } catch (error) {
      console.error("Checkout failed:", error);
      alert("Checkout failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      handleCheckout({
        customerEmail: formData.get("email") as string,
        customerName: formData.get("name") as string,
      });
    }}>
      {/* Form fields */}
      <button type="submit" disabled={isProcessing}>
        {isProcessing ? "Processing..." : "Place Order"}
      </button>
    </form>
  );
}
```

**Parameters:**
- `userId?: string` - User ID (if authenticated)
- `sessionId?: string` - Session ID (for guest users)
- `storeLocationId?: string` - Selected pickup location
- `paymentMethod?: string` - Payment method
- `customerEmail?: string` - Customer email
- `customerName?: string` - Customer name

**Returns:**
```typescript
{ orderId: string }
```

---

## Promotions API

### Queries

#### 14. `api.frontend.promotions.getWeekly` - Get weekly promotions

```tsx
function WeeklyPromotionsSection() {
  const promotions = useQuery(api.frontend.promotions.getWeekly);
  
  if (promotions === undefined) return <div>Loading...</div>;
  
  return (
    <section>
      <h2>Weekly Promotions</h2>
      {promotions.map((promotion) => (
        <PromotionCard key={promotion._id} promotion={promotion} />
      ))}
    </section>
  );
}
```

**Returns:** `Promotion[]`

---

#### 15. `api.frontend.promotions.getProductsOnSale` - Get products on sale

```tsx
function SaleProductsSection() {
  const saleProducts = useQuery(api.frontend.promotions.getProductsOnSale, {
    limit: 12,
  });
  
  if (saleProducts === undefined) return <div>Loading...</div>;
  
  return (
    <section>
      <h2>On Sale</h2>
      {saleProducts.map((product) => (
        <ProductCard 
          key={product._id} 
          product={product}
          discount={product.promotion?.discountPercentage}
        />
      ))}
    </section>
  );
}
```

**Parameters:**
- `limit?: number` - Number of products

**Returns:** `Product[]` (with promotion data)

---

#### 16. `api.frontend.promotions.getStats` - Get promotion statistics

```tsx
function PromoBanner() {
  const stats = useQuery(api.frontend.promotions.getStats);
  
  if (stats === undefined) return null;
  
  return (
    <div className="promo-banner">
      <p>{stats.totalProductsOnSale} products on sale</p>
      <p>Up to {stats.maxDiscount}% off</p>
      <p>{stats.daysRemaining} days remaining</p>
    </div>
  );
}
```

**Returns:**
```typescript
{
  totalProductsOnSale: number;
  maxDiscount: number;
  daysRemaining: number;
}
```

---

## Categories API

### Queries

#### 17. `api.frontend.categories.list` - Get all categories

```tsx
function CategoryNavigation() {
  const categories = useQuery(api.frontend.categories.list);
  
  if (categories === undefined) return <div>Loading...</div>;
  
  return (
    <nav>
      {categories.map((category) => (
        <Link key={category._id} href={`/category/${category.slug}`}>
          {category.name}
        </Link>
      ))}
    </nav>
  );
}
```

**Returns:** `Category[]`

---

#### 18. `api.frontend.categories.getBySlug` - Get category by slug

```tsx
function CategoryPage({ slug }: { slug: string }) {
  const category = useQuery(api.frontend.categories.getBySlug, { slug });
  const products = useQuery(api.frontend.products.getByCategory, {
    category: slug,
  });
  
  if (category === undefined) return <div>Loading...</div>;
  if (category === null) return <div>Category not found</div>;
  
  return (
    <div>
      <h1>{category.name}</h1>
      {category.description && <p>{category.description}</p>}
      <div>
        {products?.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
}
```

**Parameters:**
- `slug: string` - Category slug

**Returns:** `Category | null`

---

## Stores API

### Queries

#### 19. `api.frontend.stores.list` - Get all stores

```tsx
function StoreLocations() {
  const stores = useQuery(api.frontend.stores.list);
  
  if (stores === undefined) return <div>Loading...</div>;
  
  return (
    <div>
      {stores.map((store) => (
        <div key={store._id}>
          <h3>{store.name}</h3>
          <p>{store.address}</p>
          {store.phone && <p>Phone: {store.phone}</p>}
        </div>
      ))}
    </div>
  );
}
```

**Returns:** `StoreLocation[]`

---

#### 20. `api.frontend.stores.getById` - Get store by ID

```tsx
function StoreDetail({ storeId }: { storeId: Id<"stores"> }) {
  const store = useQuery(api.frontend.stores.getById, { storeId });
  
  if (store === undefined) return <div>Loading...</div>;
  if (store === null) return <div>Store not found</div>;
  
  return (
    <div>
      <h1>{store.name}</h1>
      <p>{store.address}</p>
    </div>
  );
}
```

**Parameters:**
- `storeId: Id<"stores">` - Store ID

**Returns:** `StoreLocation | null`

---

## Orders API

### Mutations

#### 21. `api.frontend.orders.createOrder` - Create order (alternative to cart.checkout)

```tsx
function DirectOrderForm({ items }: { items: CartItem[] }) {
  const createOrder = useMutation(api.frontend.orders.createOrder);
  
  const handleOrder = async () => {
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    await createOrder({
      orderId,
      items: items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      })),
      customerEmail: "customer@example.com",
      customerName: "John Doe",
    });
  };
  
  return <button onClick={handleOrder}>Place Order</button>;
}
```

**Parameters:**
- `orderId: string` - Unique order ID
- `items: Array<{ productId, quantity, price }>` - Order items
- `customerEmail?: string` - Customer email
- `customerName?: string` - Customer name
- `shippingAddress?: string` - Shipping address (not used for pickup)

**Returns:**
```typescript
{ orderId: string, sales: Id<"sales">[] }
```

---

## Complete Integration Examples

### Homepage Component

```tsx
"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function HomePage() {
  const localProducts = useQuery(api.frontend.products.getLocal);
  const featuredProducts = useQuery(api.frontend.products.getFeatured, { limit: 8 });
  const saleProducts = useQuery(api.frontend.promotions.getProductsOnSale, { limit: 6 });
  const promoStats = useQuery(api.frontend.promotions.getStats);
  const categories = useQuery(api.frontend.categories.list);
  
  return (
    <div>
      {/* Promo Banner */}
      {promoStats && (
        <div className="promo-banner">
          {promoStats.totalProductsOnSale} products on sale!
          Up to {promoStats.maxDiscount}% off
        </div>
      )}
      
      {/* Featured Products */}
      <section>
        <h2>Featured Products</h2>
        {featuredProducts?.map(product => (
          <ProductCard key={product._id} product={product} />
        ))}
      </section>
      
      {/* Local Products */}
      <section>
        <h2>Local Products</h2>
        {localProducts?.map(product => (
          <ProductCard key={product._id} product={product} />
        ))}
      </section>
      
      {/* Sale Products */}
      <section>
        <h2>On Sale</h2>
        {saleProducts?.map(product => (
          <ProductCard 
            key={product._id} 
            product={product}
            discount={product.promotion?.discountPercentage}
          />
        ))}
      </section>
      
      {/* Categories */}
      <section>
        <h2>Shop by Category</h2>
        {categories?.map(category => (
          <CategoryCard key={category._id} category={category} />
        ))}
      </section>
    </div>
  );
}
```

### Product Detail Page

```tsx
"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export default function ProductPage({ productId }: { productId: Id<"products"> }) {
  const product = useQuery(api.frontend.products.getById, { productId });
  const addToCart = useMutation(api.frontend.cart.add);
  const sessionId = useSessionId();
  
  const handleAddToCart = async () => {
    await addToCart({
      productId,
      quantity: 1,
      sessionId: sessionId || undefined,
    });
  };
  
  if (product === undefined) return <div>Loading...</div>;
  if (product === null) return <div>Product not found</div>;
  
  return (
    <div>
      <img src={product.imageUrl} alt={product.name} />
      <h1>{product.name}</h1>
      <p>€{product.price}</p>
      {product.originalPrice && (
        <p className="line-through">€{product.originalPrice}</p>
      )}
      <p>{product.description}</p>
      <button onClick={handleAddToCart}>Add to Cart</button>
    </div>
  );
}
```

### Shopping Cart Page

```tsx
"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function CartPage() {
  const sessionId = useSessionId();
  const cartItems = useQuery(api.frontend.cart.get, { sessionId });
  const totals = useQuery(api.frontend.cart.getTotal, { sessionId });
  const updateQuantity = useMutation(api.frontend.cart.updateQuantity);
  const removeFromCart = useMutation(api.frontend.cart.remove);
  const checkout = useMutation(api.frontend.cart.checkout);
  
  if (cartItems === undefined) return <div>Loading cart...</div>;
  
  return (
    <div>
      <h1>Shopping Cart</h1>
      
      {cartItems.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <>
          {cartItems.map(item => (
            <div key={item._id}>
              <img src={item.product?.imageUrl} alt={item.product?.name} />
              <h3>{item.product?.name}</h3>
              <p>€{item.product?.price} × {item.quantity}</p>
              <button onClick={() => updateQuantity({ 
                cartItemId: item._id, 
                quantity: item.quantity - 1 
              })}>-</button>
              <span>{item.quantity}</span>
              <button onClick={() => updateQuantity({ 
                cartItemId: item._id, 
                quantity: item.quantity + 1 
              })}>+</button>
              <button onClick={() => removeFromCart({ cartItemId: item._id })}>
                Remove
              </button>
            </div>
          ))}
          
          <div className="cart-summary">
            <p>Subtotal: €{totals?.subtotal.toFixed(2)}</p>
            <p>Pickup Fee: €{totals?.pickupFee.toFixed(2)}</p>
            <p className="font-bold">Total: €{totals?.total.toFixed(2)}</p>
            <button onClick={async () => {
              const result = await checkout({
                sessionId: sessionId || undefined,
                customerEmail: "customer@example.com",
                customerName: "John Doe",
              });
              router.push(`/order-confirmation/${result.orderId}`);
            }}>
              Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
}
```

---

## Summary

### All Available APIs

**Products (6 queries):**
1. `api.frontend.products.list`
2. `api.frontend.products.getById`
3. `api.frontend.products.getByCategory`
4. `api.frontend.products.getLocal`
5. `api.frontend.products.search`
6. `api.frontend.products.getFeatured`

**Cart (2 queries, 5 mutations):**
7. `api.frontend.cart.get`
8. `api.frontend.cart.getTotal`
9. `api.frontend.cart.add`
10. `api.frontend.cart.updateQuantity`
11. `api.frontend.cart.remove`
12. `api.frontend.cart.clear`
13. `api.frontend.cart.checkout`

**Promotions (3 queries):**
14. `api.frontend.promotions.getWeekly`
15. `api.frontend.promotions.getProductsOnSale`
16. `api.frontend.promotions.getStats`

**Categories (2 queries):**
17. `api.frontend.categories.list`
18. `api.frontend.categories.getBySlug`

**Stores (2 queries):**
19. `api.frontend.stores.list`
20. `api.frontend.stores.getById`

**Orders (1 mutation):**
21. `api.frontend.orders.createOrder`

**Total: 15 Queries + 6 Mutations = 21 APIs**

---

## Important Notes

1. **Session Management**: For guest users, generate and store a session ID in localStorage
2. **Error Handling**: Always handle `undefined` states when using `useQuery`
3. **Loading States**: Check for `undefined` to show loading indicators
4. **Type Safety**: Import types from `@/convex/_generated/dataModel`
5. **Cart Persistence**: Use sessionId for guest carts, userId for authenticated users
