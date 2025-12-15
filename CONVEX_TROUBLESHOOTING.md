# Convex Troubleshooting Guide

## Error: "Could not find public function for 'dashboard/products:getAll'"

This error occurs when Convex can't find the function in the deployment. Here's how to fix it:

### Solution 1: Restart Convex Dev Server

1. **Stop the current Convex dev server** (Ctrl+C in the terminal running `npx convex dev`)

2. **Clear Convex cache** (optional but recommended):
   ```bash
   rm -rf .convex
   ```

3. **Restart Convex dev server**:
   ```bash
   npx convex dev
   ```

4. **Wait for sync to complete** - You should see messages like:
   ```
   ✓ Synced functions
   ✓ Generated types
   ```

### Solution 2: Verify Deployment Connection

1. **Check if you're logged in**:
   ```bash
   npx convex whoami
   ```

2. **If not logged in, login**:
   ```bash
   npx convex login
   ```

3. **Verify deployment URL** matches your `.env` file:
   ```bash
   npx convex env
   ```

### Solution 3: Force Redeploy Functions

1. **Stop Convex dev server**

2. **Deploy functions explicitly**:
   ```bash
   npx convex deploy
   ```

3. **Restart dev server**:
   ```bash
   npx convex dev
   ```

### Solution 4: Check Function Exports

Verify that all functions are properly exported in:
- `convex/dashboard/products.ts` - Should export `getAll`, `getById`, `create`, `update`, `remove`
- `convex/dashboard/categories.ts` - Should export `getAll`, `getById`, `create`, `update`, `remove`
- `convex/dashboard/orders.ts` - Should export `getAll`, `getById`, `updateStatus`, `create`

### Solution 5: Verify Generated API

Check that `convex/_generated/api.d.ts` includes:
```typescript
export const api: {
  dashboard: {
    products: {
      getAll: Query<...>;
      getById: Query<...>;
      // etc.
    };
  };
};
```

If the generated API doesn't include your functions, the dev server hasn't synced properly.

### Solution 6: Check for TypeScript Errors

1. **Check for TypeScript errors in Convex functions**:
   ```bash
   npx convex dev --typecheck
   ```

2. **Fix any TypeScript errors** that prevent functions from being deployed

### Solution 7: Verify Environment Variables

Make sure your `.env` or `.env.local` has the correct Convex URL:
```
VITE_CONVEX_URL=https://your-deployment.convex.cloud
```

The URL should match what `npx convex dev` shows when it starts.

---

## Common Issues

### Issue: Functions work locally but not in production

**Solution**: Run `npx convex deploy` to deploy functions to production

### Issue: "Function not found" after adding new functions

**Solution**: 
1. Save the file
2. Wait for Convex dev server to sync (watch the terminal)
3. Check that the function appears in `convex/_generated/api.d.ts`

### Issue: Dashboard functions not accessible

**Note**: Dashboard functions (`api.dashboard.*`) are accessible from the dashboard app. Frontend functions (`api.frontend.*`) are for the public storefront. Make sure you're using the correct API path:
- Dashboard app → Use `api.dashboard.*`
- Storefront app → Use `api.frontend.*`

---

## Verification Steps

After fixing, verify everything works:

1. **Check Convex dashboard**: Visit your Convex dashboard URL and verify functions are listed
2. **Check generated API**: Open `convex/_generated/api.d.ts` and verify your functions are there
3. **Test in app**: The dashboard should load without the error

---

## Still Having Issues?

1. Check Convex logs: `npx convex logs`
2. Verify deployment: `npx convex status`
3. Check for errors in the Convex dev server terminal output
