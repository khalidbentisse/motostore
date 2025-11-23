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
        // Ensure specs is a plain object for JSONB or stringified for text
        const productToSave = {
            ...product,
            specs: product.specs // Supabase handles JSONB automatically usually
        };

        // Remove id if it's a placeholder (optional, depending on if DB generates IDs)
        // For now, we'll keep the ID generation client-side or let Supabase handle it if we omit it.
        // Let's try to upsert or insert.

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
        return data as Order[];
    },

    async addOrder(order: Order): Promise<Order | null> {
        const { data, error } = await supabase
            .from('orders')
            .insert([order])
            .select()
            .single();

        if (error) {
            console.error('Error adding order:', error);
            return null;
        }
        return data as Order;
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
