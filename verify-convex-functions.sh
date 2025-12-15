#!/bin/bash

echo "🔍 Verifying Convex Functions..."
echo ""

# Check if functions are exported
echo "📦 Checking exported functions:"
echo ""

echo "Frontend Functions:"
echo "  - cart.ts: $(grep -c 'export const' convex/frontend/cart.ts) exports"
echo "  - products.ts: $(grep -c 'export const' convex/frontend/products.ts) exports"
echo "  - promotions.ts: $(grep -c 'export const' convex/frontend/promotions.ts) exports"
echo "  - categories.ts: $(grep -c 'export const' convex/frontend/categories.ts) exports"
echo "  - stores.ts: $(grep -c 'export const' convex/frontend/stores.ts) exports"
echo "  - orders.ts: $(grep -c 'export const' convex/frontend/orders.ts) exports"
echo ""

echo "Dashboard Functions:"
echo "  - products.ts: $(grep -c 'export const' convex/dashboard/products.ts) exports"
echo "  - orders.ts: $(grep -c 'export const' convex/dashboard/orders.ts) exports"
echo "  - categories.ts: $(grep -c 'export const' convex/dashboard/categories.ts) exports"
echo ""

# Check generated API
if [ -f "convex/_generated/api.d.ts" ]; then
    echo "✅ Generated API file exists"
    echo "   Checking for frontend functions..."
    if grep -q "frontend.cart" convex/_generated/api.d.ts; then
        echo "   ✅ frontend.cart found"
    else
        echo "   ❌ frontend.cart NOT found - functions not synced!"
    fi
    if grep -q "frontend.products" convex/_generated/api.d.ts; then
        echo "   ✅ frontend.products found"
    else
        echo "   ❌ frontend.products NOT found - functions not synced!"
    fi
else
    echo "❌ Generated API file missing - run 'npx convex dev'"
fi

echo ""
echo "💡 If functions are missing, run:"
echo "   1. rm -rf .convex"
echo "   2. npx convex dev"
echo "   3. Wait for '✓ Synced functions' message"
