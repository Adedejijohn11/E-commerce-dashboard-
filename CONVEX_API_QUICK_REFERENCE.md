# Convex API Quick Reference

## 🚀 Essential APIs to Create First

### Products (Priority 1)
- ✅ `products.list` - Get all products
- ✅ `products.getById` - Get single product
- ✅ `products.getByCategory` - Filter by category
- ✅ `products.getLocal` - Get local products
- ✅ `products.search` - Search products

### Cart (Priority 1)
- ✅ `cart.get` - Get user's cart
- ✅ `cart.add` - Add item to cart
- ✅ `cart.updateQuantity` - Update item quantity
- ✅ `cart.remove` - Remove item from cart
- ✅ `cart.getTotal` - Calculate totals
- ✅ `cart.clear` - Clear cart
- ✅ `cart.checkout` - Process checkout

### Promotions (Priority 2)
- ✅ `promotions.getWeekly` - Get weekly deals
- ✅ `promotions.getProductsOnSale` - Get products on sale
- ✅ `promotions.getStats` - Get promo statistics

### Categories (Priority 2)
- ✅ `categories.list` - Get all categories
- ✅ `categories.getBySlug` - Get category by slug

### Store Locations (Priority 3)
- ✅ `stores.list` - Get all stores

---

## 📝 Category Slugs Reference

Use these exact slugs for category filtering:
- `bakery`
- `cheese-&-coldcuts`
- `drinks-&-beverages`
- `fruits-&-vegetables`
- `localproducts`
- `meat-&-fish`
- `pet-supplies`
- `snacks-&-sweets`
- `weekly-promotions`

---

## 🎯 Page-to-API Mapping

| Page | Required APIs |
|------|--------------|
| Homepage (`/`) | `products.getLocal`, `promotions.getWeekly`, `categories.list` |
| Category Pages | `products.getByCategory` |
| Product Detail (`/product/[id]`) | `products.getById`, `cart.add` |
| Cart Modal | `cart.get`, `cart.updateQuantity`, `cart.remove`, `cart.getTotal` |
| Search | `products.search` |
| Weekly Promotions | `promotions.getWeekly`, `promotions.getProductsOnSale` |

---

## 📦 Minimum Product Schema

```typescript
{
  _id: Id<"products">;
  name: string;
  description: string;
  price: number;
  originalPrice?: number; // for discounts
  image: string;
  category: string;
  isLocal: boolean;
  inStock: boolean;
}
```

---

## 🛒 Minimum Cart Schema

```typescript
{
  _id: Id<"cartItems">;
  productId: Id<"products">;
  quantity: number;
  // Optional: userId if you have auth
}
```

---

**Full details in `CONVEX_API_REQUIREMENTS.md`**

