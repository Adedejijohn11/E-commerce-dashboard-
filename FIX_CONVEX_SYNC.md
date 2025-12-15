# Fix Convex Functions Not Syncing

## The Problem

You're seeing errors like:
```
Could not find public function for 'frontend/promotions:getStats'
Could not find public function for 'frontend/cart:get'
```

This means the Convex dev server hasn't synced these functions to the deployment.

## The Solution (Do This Now)

### Step 1: Stop Everything

1. Stop `npx convex dev` (Ctrl+C)
2. Stop `npm run dev` (Ctrl+C)

### Step 2: Clear Cache and Restart

```bash
# In the dashboard directory
rm -rf .convex
npx convex dev
```

### Step 3: Wait for Complete Sync

Look for these messages in the terminal:
```
✓ Synced 21 functions
✓ Generated types
```

**DO NOT** proceed until you see "✓ Synced functions"

### Step 4: Verify Functions Are Available

Check `convex/_generated/api.d.ts` - it should include:
- `frontend.cart.get`
- `frontend.cart.getTotal`
- `frontend.products.getLocal`
- `frontend.promotions.getStats`
- `frontend.promotions.getProductsOnSale`

---

## Why This Happens

The errors appear because:
1. The Convex dev server is still syncing functions
2. The browser is trying to use functions before they're deployed
3. There might be TypeScript errors preventing sync

---

## If It Still Doesn't Work

### Option 1: Check for TypeScript Errors

```bash
cd convex
npx tsc --noEmit
```

Fix any errors that appear.

### Option 2: Deploy Explicitly

```bash
npx convex deploy
```

This forces all functions to be deployed.

### Option 3: Check Convex Status

```bash
npx convex status
```

Verify you're connected to the correct deployment.

---

## Important Notes

1. **Dashboard codebase** should ONLY use `api.dashboard.*` - never `api.frontend.*`
2. **Storefront codebase** should ONLY use `api.frontend.*` - never `api.dashboard.*`
3. Both codebases connect to the **SAME Convex deployment** but use different API paths
4. The errors you're seeing are likely from the Convex client validating the API - they'll disappear once functions are synced

---

## Quick Fix Command

Run this in your dashboard directory:

```bash
rm -rf .convex && npx convex dev
```

Then wait for "✓ Synced functions" before using the dashboard.
