import { query } from "../_generated/server";

// Dashboard: Get sales analytics
export const getSalesAnalytics = query({
  handler: async (ctx) => {
    const sales = await ctx.db.query("sales").order("desc").collect();
    
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
    const totalOrders = new Set(sales.map(s => s.orderId)).size;
    const totalItemsSold = sales.reduce((sum, sale) => sum + sale.quantity, 0);
    
    // Sales by product
    const salesByProduct = new Map();
    for (const sale of sales) {
      const product = await ctx.db.get(sale.productId);
      if (product) {
        const existing = salesByProduct.get(product.name) || { quantity: 0, revenue: 0 };
        salesByProduct.set(product.name, {
          quantity: existing.quantity + sale.quantity,
          revenue: existing.revenue + sale.total,
        });
      }
    }
    
    // Sales by date (last 30 days)
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const recentSales = sales.filter(s => s.createdAt >= thirtyDaysAgo);
    const salesByDate = new Map();
    for (const sale of recentSales) {
      const date = new Date(sale.createdAt).toISOString().split('T')[0];
      const existing = salesByDate.get(date) || { revenue: 0, orders: 0 };
      salesByDate.set(date, {
        revenue: existing.revenue + sale.total,
        orders: existing.orders + 1,
      });
    }
    
    return {
      totalRevenue,
      totalOrders,
      totalItemsSold,
      salesByProduct: Array.from(salesByProduct.entries()).map(([name, data]) => ({
        name,
        ...data,
      })),
      salesByDate: Array.from(salesByDate.entries())
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date)),
    };
  },
});

