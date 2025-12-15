# Testing Seed Default Categories

## Prerequisites

1. **Start Convex Dev Server** (REQUIRED):
   ```bash
   cd /Users/sundayochuko/Desktop/Ecomms/dashboard
   npx convex dev
   ```

2. **Wait for sync** - You should see:
   ```
   ✓ Synced functions
   ✓ Generated types
   ```

3. **Verify function is available**:
   - Open `convex/_generated/api.d.ts`
   - Search for `seedDefault`
   - It should appear under `dashboard.categories.seedDefault`

## Testing Steps

1. **Start the dashboard**:
   ```bash
   cd /Users/sundayochuko/Desktop/Ecomms/dashboard
   npm run dev
   ```

2. **Navigate to Categories page** in the dashboard

3. **Click "Seed Default Categories" button**

4. **Expected behavior**:
   - Confirmation dialog appears
   - After confirming, button shows "Seeding..." with spinner
   - Success message appears: "Seeded X categories. Y already existed."
   - Categories list updates to show new categories

5. **Test idempotency**:
   - Click "Seed Default Categories" again
   - Should show: "Seeded 0 categories. 7 already existed."

## Expected Categories

The following 7 categories should be created:

1. **Bakery** (slug: `bakery`)
2. **Fruits & Vegetables** (slug: `fruits-&-vegetables`)
3. **Meat & Fish** (slug: `meat-&-fish`)
4. **Cheese & Cold Cuts** (slug: `cheese-&-coldcuts`)
5. **Drinks & Beverages** (slug: `drinks-&-beverages`)
6. **Snacks & Sweets** (slug: `snacks-&-sweets`)
7. **Pet Supplies** (slug: `pet-supplies`)

## Troubleshooting

### Error: "Could not find public function"

**Solution**: Run `npx convex dev` in the dashboard directory and wait for sync to complete.

### Error: "Seed function not available"

**Solution**: 
1. Check that `convex/dashboard/categories.ts` exports `seedDefault`
2. Restart Convex dev server
3. Refresh the dashboard page

### Button does nothing

**Solution**:
1. Open browser console (F12)
2. Check for JavaScript errors
3. Verify Convex connection is active

### Categories not appearing

**Solution**:
1. Check browser console for errors
2. Verify the function returned successfully
3. Refresh the categories list
4. Check Convex dashboard to see if categories were created

## Manual Test via Convex Dashboard

1. Go to your Convex Dashboard (https://dashboard.convex.dev)
2. Navigate to **Functions**
3. Find `dashboard/categories:seedDefault`
4. Click **Run**
5. Check the response - should show created/skipped categories

