# Complete Setup Instructions for Dashboard and Storefront

## 🎯 Understanding the Architecture

You have **TWO separate codebases**:
1. **Dashboard** (this codebase) - Admin panel for managing products, orders, etc.
2. **Storefront** (separate Next.js codebase) - Customer-facing e-commerce site

Both connect to the **SAME Convex backend** but use different API paths:
- Dashboard uses: `api.dashboard.*`
- Storefront uses: `api.frontend.*`

---

## 📦 Dashboard Setup (This Codebase)

### Step 1: Ensure Convex is Running

```bash
# In the dashboard directory
npx convex dev
```

**Wait for these messages:**
```
✓ Synced functions
✓ Generated types
```

### Step 2: Verify Environment Variable

Check `.env.local` or `.env`:
```
VITE_CONVEX_URL=https://your-deployment.convex.cloud
```

### Step 3: Dashboard Should ONLY Use Dashboard APIs

The dashboard code should **NEVER** call `api.frontend.*` functions. It should only use:
- ✅ `api.dashboard.products.*`
- ✅ `api.dashboard.orders.*`
- ✅ `api.dashboard.categories.*`
- ✅ `api.dashboard.analytics.*`

---

## 🛍️ Storefront Setup (Separate Next.js Codebase)

### Step 1: Share the Convex Backend

The storefront needs to connect to the **SAME Convex deployment**:

1. **Copy the Convex URL** from your dashboard `.env.local`:
   ```
   VITE_CONVEX_URL=https://your-deployment.convex.cloud
   ```

2. **In your storefront codebase**, create `.env.local`:
   ```
   NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
   ```

### Step 2: Copy Convex Functions (Two Options)

#### Option A: Shared Convex Directory (Recommended)

1. **Copy the entire `convex/` folder** from dashboard to storefront:
   ```bash
   # From storefront directory
   cp -r "../E-commerce dashboard/convex" ./convex
   ```

2. **Initialize Convex in storefront**:
   ```bash
   cd your-storefront-directory
   npx convex dev
   ```

3. **Link to same deployment** when prompted, choose "Use existing deployment"

#### Option B: Separate Deployments (Not Recommended)

If you want separate deployments, you'll need to:
- Copy all `convex/frontend/*` files to storefront
- Copy `convex/schema.ts` to storefront
- Run `npx convex init` in storefront (creates new deployment)
- Update schema in both places (not ideal)

### Step 3: Storefront Should ONLY Use Frontend APIs

The storefront should **ONLY** use:
- ✅ `api.frontend.products.*`
- ✅ `api.frontend.cart.*`
- ✅ `api.frontend.promotions.*`
- ✅ `api.frontend.categories.*`
- ✅ `api.frontend.stores.*`
- ✅ `api.frontend.orders.*`

**NEVER** use `api.dashboard.*` in the storefront.

---

## 🔧 Fixing the Current Error

The error "Could not find public function" means the functions haven't been synced to Convex yet.

### Solution 1: Force Sync All Functions

1. **Stop Convex dev server** (Ctrl+C)

2. **Clear cache and restart**:
   ```bash
   rm -rf .convex
   npx convex dev
   ```

3. **Wait for complete sync** - Look for:
   ```
   ✓ Synced 21 functions
   ✓ Generated types
   ```

### Solution 2: Verify Functions Are Exported

Check that all functions are properly exported:

```bash
# Check if functions exist
grep -r "export const" convex/frontend/
grep -r "export const" convex/dashboard/
```

### Solution 3: Deploy to Production

If dev sync isn't working, try deploying:

```bash
npx convex deploy
```

This will deploy all functions to your production deployment.

---

## ✅ Verification Checklist

### Dashboard Verification

- [ ] `npx convex dev` shows "✓ Synced functions"
- [ ] Dashboard loads without errors
- [ ] Can create/edit products
- [ ] Can view orders
- [ ] No `api.frontend.*` calls in dashboard code

### Storefront Verification

- [ ] Storefront has `convex/` folder with all functions
- [ ] `.env.local` has `NEXT_PUBLIC_CONVEX_URL` pointing to same deployment
- [ ] `npx convex dev` runs successfully in storefront
- [ ] Storefront can query products
- [ ] Cart functionality works
- [ ] No `api.dashboard.*` calls in storefront code

---

## 🚨 Common Issues & Solutions

### Issue: "Could not find public function"

**Cause**: Functions not synced to Convex deployment

**Solution**:
1. Ensure `npx convex dev` is running
2. Wait for "✓ Synced functions" message
3. Check terminal for any TypeScript errors
4. Restart Convex dev server

### Issue: Functions work in dashboard but not storefront

**Cause**: Storefront connecting to different deployment or missing functions

**Solution**:
1. Verify both use same `VITE_CONVEX_URL` / `NEXT_PUBLIC_CONVEX_URL`
2. Copy `convex/` folder to storefront
3. Run `npx convex dev` in storefront directory

### Issue: TypeScript errors in Convex functions

**Cause**: Type errors prevent functions from syncing

**Solution**:
1. Fix all TypeScript errors in `convex/` folder
2. Restart `npx convex dev`
3. Check terminal for error messages

---

## 📝 Quick Reference

### Dashboard APIs (Admin Only)
```
api.dashboard.products.getAll
api.dashboard.products.getById
api.dashboard.products.create
api.dashboard.products.update
api.dashboard.products.remove
api.dashboard.orders.getAll
api.dashboard.orders.updateStatus
api.dashboard.categories.getAll
api.dashboard.categories.create
api.dashboard.analytics.getSalesAnalytics
```

### Frontend APIs (Public Storefront)
```
api.frontend.products.list
api.frontend.products.getById
api.frontend.products.getByCategory
api.frontend.products.getLocal
api.frontend.products.search
api.frontend.products.getFeatured
api.frontend.cart.get
api.frontend.cart.getTotal
api.frontend.cart.add
api.frontend.cart.updateQuantity
api.frontend.cart.remove
api.frontend.cart.clear
api.frontend.cart.checkout
api.frontend.promotions.getWeekly
api.frontend.promotions.getProductsOnSale
api.frontend.promotions.getStats
api.frontend.categories.list
api.frontend.categories.getBySlug
api.frontend.stores.list
api.frontend.stores.getById
api.frontend.orders.createOrder
```

---

## 🎯 Next Steps

1. **Dashboard**: Ensure `npx convex dev` is running and all functions are synced
2. **Storefront**: Copy `convex/` folder and connect to same deployment
3. **Test**: Verify both codebases can access their respective APIs

If errors persist after following these steps, check the Convex dev server terminal for specific error messages.
