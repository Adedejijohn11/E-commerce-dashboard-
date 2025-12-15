# Deploy Dashboard Convex Functions

## Problem
Dashboard functions are not getting updated/synced to the Convex deployment.

## Solution: Deploy Functions from Dashboard

### Important: Both Dashboard and Store-front Use the Same Deployment

Both projects should connect to: **`https://different-leopard-911.convex.cloud`**

However, they use **different API paths**:
- **Dashboard** uses: `api.dashboard.*` (functions in `convex/dashboard/`)
- **Store-front** uses: `api.frontend.*` (functions in `convex/frontend/`)

## Step-by-Step Deployment

### Step 1: Navigate to Dashboard Directory
```bash
cd /Users/sundayochuko/Desktop/Ecomms/dashboard
```

### Step 2: Verify Environment Configuration
Check `.env.local` has:
```env
VITE_CONVEX_URL=https://different-leopard-911.convex.cloud
CONVEX_DEPLOYMENT=dev:different-leopard-911
```

### Step 3: Sync Functions (Generate Types)
```bash
npx convex dev --once
```

**Expected output:**
```
✓ Synced functions
✓ Generated types
```

This syncs:
- `convex/dashboard/*` functions → `api.dashboard.*`
- `convex/frontend/*` functions → `api.frontend.*`

### Step 4: Deploy Functions to Production
```bash
npx convex deploy
```

**Expected output:**
```
✓ Deployed successfully
```

This deploys **ALL** functions (both dashboard and frontend) to your Convex deployment.

### Step 5: Verify Deployment
1. Go to https://dashboard.convex.dev
2. Select deployment: `dev:different-leopard-911`
3. Go to **Functions** tab
4. You should see:
   - `dashboard/products:*`
   - `dashboard/orders:*`
   - `dashboard/categories:*`
   - `dashboard/analytics:*`
   - `dashboard/promotions:*`
   - `frontend/orders:*`
   - `frontend/products:*`
   - `frontend/cart:*`
   - etc.

## Why Both Projects Need to Deploy

### Dashboard Deployment
- Deploys `convex/dashboard/*` functions → `api.dashboard.*`
- Deploys `convex/frontend/*` functions → `api.frontend.*`
- Updates schema if changed

### Store-front Deployment
- Deploys `convex/frontend/*` functions → `api.frontend.*`
- Updates schema if changed
- **Note:** Store-front doesn't have `convex/dashboard/*` functions

## Recommended Deployment Workflow

### When You Update Dashboard Functions:
```bash
cd dashboard
npx convex dev --once
npx convex deploy
```

### When You Update Store-front Functions:
```bash
cd store-front
npx convex dev --once
npx convex deploy
```

### When You Update Schema:
Deploy from **both** projects (schema should be identical):
```bash
# From dashboard
cd dashboard
npx convex deploy

# From store-front
cd store-front
npx convex deploy
```

## Troubleshooting

### Functions Still Not Updating?

1. **Clear Convex Cache:**
   ```bash
   cd dashboard
   rm -rf .convex
   npx convex dev --once
   npx convex deploy
   ```

2. **Check Deployment URL:**
   - Verify `.env.local` has correct URL
   - Verify you're deploying to the right deployment
   - Run: `npx convex env` to check current deployment

3. **Check for TypeScript Errors:**
   ```bash
   cd dashboard/convex
   npx tsc --noEmit
   ```
   Fix any errors before deploying.

4. **Verify Functions Are Exported:**
   ```bash
   # Check dashboard functions
   grep -r "export const" dashboard/convex/dashboard/
   
   # Check frontend functions
   grep -r "export const" dashboard/convex/frontend/
   ```

5. **Check Generated API:**
   Open `dashboard/convex/_generated/api.d.ts` and verify your functions are listed.

## Quick Reference

```bash
# Dashboard deployment
cd dashboard
npx convex dev --once    # Sync and generate types
npx convex deploy        # Deploy to production

# Store-front deployment
cd store-front
npx convex dev --once    # Sync and generate types
npx convex deploy        # Deploy to production
```

## Important Notes

- **Both projects deploy to the same Convex deployment** (`different-leopard-911`)
- **Dashboard has both** `dashboard/*` and `frontend/*` functions
- **Store-front only has** `frontend/*` functions
- **Always deploy from the project directory** where you made changes
- **Wait 10-30 seconds** after deployment for functions to propagate
- **Redeploy your frontend apps** (Vite/Next.js) after deploying Convex functions

