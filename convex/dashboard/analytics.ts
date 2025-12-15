import { query } from "../_generated/server";

// Dashboard: Get sales analytics
export const getSalesAnalytics = query({
  handler: async (ctx) => {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    
    // Get all sales from last 30 days
    const recentSales = await ctx.db
      .query("sales")
      .withIndex("by_date", (q) => q.gte("createdAt", thirtyDaysAgo))
      .collect();

    // Calculate totals
    const totalRevenue = recentSales.reduce((sum, sale) => sum + sale.total, 0);
    const totalItemsSold = recentSales.reduce((sum, sale) => sum + sale.quantity, 0);
    
    // Get unique order IDs
    const uniqueOrderIds = new Set(recentSales.map(sale => sale.orderId));
    const totalOrders = uniqueOrderIds.size;

    // Group sales by date
    const salesByDateMap = new Map<string, number>();
    recentSales.forEach(sale => {
      const date = new Date(sale.createdAt).toLocaleDateString();
      salesByDateMap.set(date, (salesByDateMap.get(date) || 0) + sale.total);
    });

    const salesByDate = Array.from(salesByDateMap.entries())
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Group sales by product
    const salesByProductMap = new Map<string, { name: string; revenue: number }>();
    
    for (const sale of recentSales) {
      const product = await ctx.db.get(sale.productId);
      if (product) {
        const productName = product.name;
        const current = salesByProductMap.get(productName) || { name: productName, revenue: 0 };
        current.revenue += sale.total;
        salesByProductMap.set(productName, current);
      }
    }

    const salesByProduct = Array.from(salesByProductMap.values())
      .sort((a, b) => b.revenue - a.revenue);

    return {
      totalRevenue,
      totalOrders,
      totalItemsSold,
      salesByDate,
      salesByProduct,
    };
  },
});
