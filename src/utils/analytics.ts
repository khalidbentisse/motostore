import { Order, Product, Category } from '../types';

export interface RevenueData {
    date: string;
    revenue: number;
    orders: number;
}

export interface CategorySales {
    category: string;
    value: number;
    percentage: number;
}

export interface TopProduct {
    id: string;
    name: string;
    revenue: number;
    quantity: number;
}

export interface DashboardMetrics {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    productsInStock: number;
    lowStockCount: number;
    pendingOrders: number;
    revenueGrowth: number;
    ordersGrowth: number;
}

/**
 * Calculate total revenue from orders
 */
export const calculateTotalRevenue = (orders: Order[]): number => {
    return orders.reduce((sum, order) => sum + order.total, 0);
};

/**
 * Calculate revenue for a specific date range
 */
export const getRevenueByDateRange = (
    orders: Order[],
    startDate: number,
    endDate: number
): number => {
    return orders
        .filter(order => order.date >= startDate && order.date <= endDate)
        .reduce((sum, order) => sum + order.total, 0);
};

/**
 * Get revenue trend data for the last N days
 */
export const getRevenueTrend = (orders: Order[], days: number = 30): RevenueData[] => {
    const now = Date.now();
    const msPerDay = 24 * 60 * 60 * 1000;
    const trend: RevenueData[] = [];

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now - i * msPerDay);
        const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
        const dayEnd = dayStart + msPerDay;

        const dayOrders = orders.filter(o => o.date >= dayStart && o.date < dayEnd);
        const revenue = dayOrders.reduce((sum, o) => sum + o.total, 0);

        trend.push({
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            revenue,
            orders: dayOrders.length
        });
    }

    return trend;
};

/**
 * Calculate sales by category
 */
export const getSalesByCategory = (orders: Order[], products: Product[]): CategorySales[] => {
    const categoryRevenue: Record<string, number> = {};

    orders.forEach(order => {
        order.items.forEach(item => {
            const product = products.find(p => p.id === item.id);
            if (product) {
                const category = product.category || Category.ACCESSORIES;
                categoryRevenue[category] = (categoryRevenue[category] || 0) + (item.price * item.quantity);
            }
        });
    });

    const total = Object.values(categoryRevenue).reduce((sum, val) => sum + val, 0);

    return Object.entries(categoryRevenue).map(([category, value]) => ({
        category,
        value,
        percentage: total > 0 ? (value / total) * 100 : 0
    }));
};

/**
 * Get top selling products
 */
export const getTopProducts = (orders: Order[], limit: number = 5): TopProduct[] => {
    const productStats: Record<string, { name: string; revenue: number; quantity: number }> = {};

    orders.forEach(order => {
        order.items.forEach(item => {
            if (!productStats[item.id]) {
                productStats[item.id] = {
                    name: item.name,
                    revenue: 0,
                    quantity: 0
                };
            }
            productStats[item.id].revenue += item.price * item.quantity;
            productStats[item.id].quantity += item.quantity;
        });
    });

    return Object.entries(productStats)
        .map(([id, stats]) => ({ id, ...stats }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, limit);
};

/**
 * Calculate growth percentage
 */
export const calculateGrowth = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
};

/**
 * Get comprehensive dashboard metrics
 */
export const getDashboardMetrics = (
    orders: Order[],
    products: Product[]
): DashboardMetrics => {
    const now = Date.now();
    const msPerDay = 24 * 60 * 60 * 1000;
    const last30Days = now - 30 * msPerDay;
    const last60Days = now - 60 * msPerDay;

    // Current period (last 30 days)
    const currentOrders = orders.filter(o => o.date >= last30Days);
    const currentRevenue = calculateTotalRevenue(currentOrders);

    // Previous period (30-60 days ago)
    const previousOrders = orders.filter(o => o.date >= last60Days && o.date < last30Days);
    const previousRevenue = calculateTotalRevenue(previousOrders);

    // Calculate metrics
    const totalRevenue = calculateTotalRevenue(orders);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const productsInStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);
    const lowStockCount = products.filter(p => (p.stock || 0) < 5 && (p.stock || 0) > 0).length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;

    const revenueGrowth = calculateGrowth(currentRevenue, previousRevenue);
    const ordersGrowth = calculateGrowth(currentOrders.length, previousOrders.length);

    return {
        totalRevenue,
        totalOrders,
        averageOrderValue,
        productsInStock,
        lowStockCount,
        pendingOrders,
        revenueGrowth,
        ordersGrowth
    };
};

/**
 * Get revenue split by order type
 */
export const getRevenueSplit = (orders: Order[]): { online: number; instore: number } => {
    // Since 'type' field is removed, we assume all orders are online for now
    const online = orders.reduce((sum, o) => sum + o.total, 0);
    const instore = 0;

    return { online, instore };
};
