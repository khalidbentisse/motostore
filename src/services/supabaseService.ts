import { supabase } from '../supabase';
import { Product, Order } from '../types';

export const supabaseService = {
    // --- Products ---
    async getProducts(): Promise<Product[]> {
        const { data, error } = await supabase
            .from('products')
            .select('*');

        if (error) {
            console.error('Error fetching products:', error);
            return [];
        }

        // Parse specs if stored as JSON string, or ensure it matches type if stored as JSONB
        return data.map((p: any) => ({
            ...p,
            specs: typeof p.specs === 'string' ? JSON.parse(p.specs) : p.specs
        })) as Product[];
    },

    async addProduct(product: Product): Promise<Product | null> {
        const productToSave = {
            ...product,
            specs: product.specs
        };

        const { data, error } = await supabase
            .from('products')
            .insert([productToSave])
            .select()
            .single();

        if (error) {
            console.error('Error adding product:', error);
            return null;
        }
        return data as Product;
    },

    async updateProduct(product: Product): Promise<Product | null> {
        const { data, error } = await supabase
            .from('products')
            .update(product)
            .eq('id', product.id)
            .select()
            .single();

        if (error) {
            console.error('Error updating product:', error);
            return null;
        }
        return data as Product;
    },

    async deleteProduct(id: string): Promise<boolean> {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting product:', error);
            return false;
        }
        return true;
    },

    async updateStock(productId: string, quantity: number): Promise<boolean> {
        const { data: product, error: fetchError } = await supabase
            .from('products')
            .select('stock')
            .eq('id', productId)
            .single();

        if (fetchError || !product) {
            console.error('Error fetching product for stock update:', fetchError);
            return false;
        }

        const newStock = Math.max(0, (product.stock || 0) - quantity);

        const { error: updateError } = await supabase
            .from('products')
            .update({ stock: newStock })
            .eq('id', productId);

        if (updateError) {
            console.error('Error updating stock:', updateError);
            return false;
        }
        return true;
    },

    // --- Orders ---
    async getOrders(): Promise<Order[]> {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('date', { ascending: false });

        if (error) {
            console.error('Error fetching orders:', error);
            return [];
        }

        // Map snake_case from DB to camelCase for App
        return data.map((o: any) => ({
            id: o.id,
            customerName: o.customer_name,
            customerPhone: o.customer_phone,
            customerAddress: o.customer_address,
            items: o.items,
            total: o.total,
            date: o.date,
            status: o.status,


        })) as Order[];
    },

    async addOrder(order: Order): Promise<{ data: Order | null, error: string | null }> {
        // Map camelCase to snake_case for DB
        const dbOrder = {
            id: order.id,
            customer_name: order.customerName,
            customer_phone: order.customerPhone,
            customer_address: order.customerAddress,
            items: order.items,
            total: order.total,
            date: order.date,
            status: order.status,


        };

        const { data, error } = await supabase
            .from('orders')
            .insert([dbOrder])
            .select()
            .single();

        if (error) {
            console.error('Error adding order:', error);
            return { data: null, error: error.message };
        }

        // Map back to camelCase for app usage
        const appOrder: Order = {
            id: data.id,
            customerName: data.customer_name,
            customerPhone: data.customer_phone,
            customerAddress: data.customer_address,
            items: data.items,
            total: data.total,
            date: data.date,
            status: data.status,


        };

        return { data: appOrder, error: null };
    },

    async updateOrderStatus(orderId: string, status: 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled'): Promise<boolean> {
        const { error } = await supabase
            .from('orders')
            .update({ status })
            .eq('id', orderId);

        if (error) {
            console.error('Error updating order status:', error);
            return false;
        }
        return true;
    },

    async deleteOrder(orderId: string): Promise<boolean> {
        const { error } = await supabase
            .from('orders')
            .delete()
            .eq('id', orderId);

        if (error) {
            console.error('Error deleting order:', error);
            return false;
        }
        return true;
    },

    // --- Storage ---
    async uploadImage(file: File): Promise<{ url: string | null, error: string | null }> {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('images')
            .upload(filePath, file);

        if (uploadError) {
            console.error('Error uploading image:', uploadError);
            return { url: null, error: uploadError.message };
        }

        const { data } = supabase.storage.from('images').getPublicUrl(filePath);
        return { url: data.publicUrl, error: null };
    },

    async testStorageConnection(): Promise<boolean> {
        const { data, error } = await supabase.storage.listBuckets();
        if (error) {
            console.error("Storage Connection Test Failed:", error);
            return false;
        }
        console.log("Storage Buckets:", data);
        return true;
    },

    async runDiagnostics(): Promise<string> {
        let report = "Diagnostics Report:\n";

        // 1. Check Auth
        const { data: { session } } = await supabase.auth.getSession();
        report += `1. Auth: ${session ? "Logged In (" + session.user.email + ")" : "NOT Logged In"}\n`;

        // 2. Check DB Read
        const { error: readError } = await supabase.from('products').select('count', { count: 'exact', head: true });
        report += `2. DB Read: ${readError ? "FAILED (" + readError.message + ")" : "Success"}\n`;

        // 3. Check DB Write (Try to insert dummy and delete)
        if (session) {
            const dummyId = crypto.randomUUID();
            const { error: writeError } = await supabase.from('products').insert({
                id: dummyId,
                name: 'Diag Test',
                price: 0,
                image: 'test',
                description: 'test'
            });
            report += `3. DB Write: ${writeError ? "FAILED (" + writeError.message + ")" : "Success"}\n`;
            if (!writeError) await supabase.from('products').delete().eq('id', dummyId);
        } else {
            report += "3. DB Write: Skipped (Not Logged In)\n";
        }

        // 4. Check Storage
        const { error: storageError } = await supabase.storage.listBuckets();
        report += `4. Storage: ${storageError ? "FAILED (" + storageError.message + ")" : "Success"}\n`;

        console.log(report);
        return report;
    }
};
