-- Wholesale Products Table
CREATE TABLE IF NOT EXISTS wholesale_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    retail_price DECIMAL(10,2) NOT NULL,
    wholesale_price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    image_url TEXT,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    min_order_quantity INTEGER NOT NULL DEFAULT 1,
    max_order_quantity INTEGER,
    rating DECIMAL(3,2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    tags TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Merchant Stores Table
CREATE TABLE IF NOT EXISTS merchant_stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    store_name VARCHAR(255) NOT NULL,
    store_description TEXT,
    store_logo TEXT,
    store_banner TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    website_url TEXT,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'blocked')),
    store_level INTEGER DEFAULT 1,
    account_balance DECIMAL(12,2) DEFAULT 0.00,
    products JSONB DEFAULT '[]'::jsonb,
    followers JSONB DEFAULT '[]'::jsonb,
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(merchant_id)
);

-- Store Inventory Table (Products added to merchant's store)
CREATE TABLE IF NOT EXISTS store_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES merchant_stores(id) ON DELETE CASCADE,
    wholesale_product_id UUID NOT NULL REFERENCES wholesale_products(id) ON DELETE CASCADE,
    merchant_price DECIMAL(10,2) NOT NULL,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(store_id, wholesale_product_id)
);

-- Wholesale Orders Table
CREATE TABLE IF NOT EXISTS wholesale_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    store_id UUID NOT NULL REFERENCES merchant_stores(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    profit_amount DECIMAL(10,2) DEFAULT 0.00,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    payment_status VARCHAR(50) NOT NULL DEFAULT 'pending',
    shipping_address TEXT,
    billing_address TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wholesale Order Items Table
CREATE TABLE IF NOT EXISTS wholesale_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES wholesale_orders(id) ON DELETE CASCADE,
    wholesale_product_id UUID NOT NULL REFERENCES wholesale_products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Reviews Table
CREATE TABLE IF NOT EXISTS wholesale_product_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wholesale_product_id UUID NOT NULL REFERENCES wholesale_products(id) ON DELETE CASCADE,
    merchant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    is_verified_purchase BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(wholesale_product_id, merchant_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_wholesale_products_category ON wholesale_products(category);
CREATE INDEX IF NOT EXISTS idx_wholesale_products_brand ON wholesale_products(brand);
CREATE INDEX IF NOT EXISTS idx_wholesale_products_active ON wholesale_products(is_active);
CREATE INDEX IF NOT EXISTS idx_store_inventory_store_id ON store_inventory(store_id);
CREATE INDEX IF NOT EXISTS idx_store_inventory_product_id ON store_inventory(wholesale_product_id);
CREATE INDEX IF NOT EXISTS idx_wholesale_orders_merchant_id ON wholesale_orders(merchant_id);
CREATE INDEX IF NOT EXISTS idx_wholesale_orders_status ON wholesale_orders(status);
CREATE INDEX IF NOT EXISTS idx_wholesale_order_items_order_id ON wholesale_order_items(order_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_wholesale_products_updated_at BEFORE UPDATE ON wholesale_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_merchant_stores_updated_at BEFORE UPDATE ON merchant_stores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_store_inventory_updated_at BEFORE UPDATE ON store_inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_wholesale_orders_updated_at BEFORE UPDATE ON wholesale_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_wholesale_product_reviews_updated_at BEFORE UPDATE ON wholesale_product_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample wholesale products
INSERT INTO wholesale_products (name, description, retail_price, wholesale_price, category, brand, image_url, stock_quantity, min_order_quantity, rating, review_count, tags) VALUES
('Premium Wireless Headphones', 'High-quality wireless headphones with noise cancellation', 299.99, 199.99, 'Electronics', 'TechPro', '/images/products/headphones.jpg', 150, 10, 4.5, 128, ARRAY['wireless', 'noise-cancelling', 'bluetooth']),
('Organic Cotton T-Shirt', 'Comfortable organic cotton t-shirt in various colors', 29.99, 15.99, 'Clothing', 'EcoWear', '/images/products/tshirt.jpg', 500, 50, 4.2, 89, ARRAY['organic', 'cotton', 'sustainable']),
('Smart Fitness Watch', 'Advanced fitness tracking with heart rate monitor', 199.99, 129.99, 'Electronics', 'FitTech', '/images/products/watch.jpg', 75, 5, 4.7, 256, ARRAY['fitness', 'smartwatch', 'health']),
('Stainless Steel Water Bottle', 'Insulated water bottle keeps drinks cold for 24 hours', 39.99, 22.99, 'Home & Garden', 'HydroLife', '/images/products/bottle.jpg', 300, 25, 4.4, 167, ARRAY['insulated', 'stainless-steel', 'eco-friendly']),
('Professional Camera Lens', 'High-quality zoom lens for professional photography', 899.99, 599.99, 'Electronics', 'PhotoPro', '/images/products/lens.jpg', 25, 2, 4.8, 89, ARRAY['camera', 'professional', 'zoom']),
('Natural Face Cream', 'Anti-aging face cream with natural ingredients', 49.99, 28.99, 'Beauty', 'NaturalGlow', '/images/products/cream.jpg', 200, 20, 4.3, 145, ARRAY['natural', 'anti-aging', 'skincare']);

-- Insert sample merchant store (assuming merchant user exists)
INSERT INTO merchant_stores (merchant_id, store_name, store_description, status, store_level, account_balance, followers) VALUES
('00000000-0000-0000-0000-000000000001', 'Shopp Like', 'Your one-stop shop for premium products at wholesale prices', 'active', 214, 3220.39, '["user-1", "user-2", "user-3", "user-4", "user-5"]'::jsonb);

-- Insert sample wholesale orders (assuming users exist)
INSERT INTO wholesale_orders (merchant_id, store_id, customer_id, order_number, total_amount, profit_amount, status, payment_status) VALUES
('00000000-0000-0000-0000-000000000001', (SELECT id FROM merchant_stores WHERE merchant_id = '00000000-0000-0000-0000-000000000001'), '00000000-0000-0000-0000-000000000002', 'ORD-001', 1253.00, 452.00, 'delivered', 'paid'),
('00000000-0000-0000-0000-000000000001', (SELECT id FROM merchant_stores WHERE merchant_id = '00000000-0000-0000-0000-000000000001'), '00000000-0000-0000-0000-000000000003', 'ORD-002', 899.99, 300.00, 'delivered', 'paid'),
('00000000-0000-0000-0000-000000000001', (SELECT id FROM merchant_stores WHERE merchant_id = '00000000-0000-0000-0000-000000000001'), '00000000-0000-0000-0000-000000000004', 'ORD-003', 299.99, 100.00, 'processing', 'paid');

-- Enable Row Level Security (RLS)
ALTER TABLE wholesale_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchant_stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE wholesale_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE wholesale_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wholesale_product_reviews ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Wholesale products: anyone can read, only admins can modify
CREATE POLICY "Wholesale products are viewable by everyone" ON wholesale_products FOR SELECT USING (true);
CREATE POLICY "Wholesale products are insertable by admins" ON wholesale_products FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Wholesale products are updatable by admins" ON wholesale_products FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Wholesale products are deletable by admins" ON wholesale_products FOR DELETE USING (auth.jwt() ->> 'role' = 'admin');

-- Merchant stores: merchants can manage their own store, admins can view all
CREATE POLICY "Merchant stores are viewable by owner and admins" ON merchant_stores FOR SELECT USING (
    auth.uid() = merchant_id OR auth.jwt() ->> 'role' = 'admin'
);
CREATE POLICY "Merchant stores are insertable by merchants" ON merchant_stores FOR INSERT WITH CHECK (auth.uid() = merchant_id);
CREATE POLICY "Merchant stores are updatable by owner and admins" ON merchant_stores FOR UPDATE USING (
    auth.uid() = merchant_id OR auth.jwt() ->> 'role' = 'admin'
);
CREATE POLICY "Merchant stores are deletable by admins" ON merchant_stores FOR DELETE USING (auth.jwt() ->> 'role' = 'admin');

-- Store inventory: merchants can manage their own inventory, admins can view all
CREATE POLICY "Store inventory is viewable by store owner and admins" ON store_inventory FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM merchant_stores 
        WHERE id = store_inventory.store_id 
        AND merchant_id = auth.uid()
    ) OR auth.jwt() ->> 'role' = 'admin'
);
CREATE POLICY "Store inventory is insertable by store owner" ON store_inventory FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM merchant_stores 
        WHERE id = store_inventory.store_id 
        AND merchant_id = auth.uid()
    )
);
CREATE POLICY "Store inventory is updatable by store owner and admins" ON store_inventory FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM merchant_stores 
        WHERE id = store_inventory.store_id 
        AND merchant_id = auth.uid()
    ) OR auth.jwt() ->> 'role' = 'admin'
);
CREATE POLICY "Store inventory is deletable by store owner and admins" ON store_inventory FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM merchant_stores 
        WHERE id = store_inventory.store_id 
        AND merchant_id = auth.uid()
    ) OR auth.jwt() ->> 'role' = 'admin'
);

-- Wholesale orders: merchants can view their own orders, admins can view all
CREATE POLICY "Wholesale orders are viewable by merchant and admins" ON wholesale_orders FOR SELECT USING (
    merchant_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin'
);
CREATE POLICY "Wholesale orders are insertable by merchants" ON wholesale_orders FOR INSERT WITH CHECK (merchant_id = auth.uid());
CREATE POLICY "Wholesale orders are updatable by merchant and admins" ON wholesale_orders FOR UPDATE USING (
    merchant_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin'
);

-- Wholesale order items: merchants can view their own order items, admins can view all
CREATE POLICY "Wholesale order items are viewable by merchant and admins" ON wholesale_order_items FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM wholesale_orders 
        WHERE id = wholesale_order_items.order_id 
        AND merchant_id = auth.uid()
    ) OR auth.jwt() ->> 'role' = 'admin'
);
CREATE POLICY "Wholesale order items are insertable by merchants" ON wholesale_order_items FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM wholesale_orders 
        WHERE id = wholesale_order_items.order_id 
        AND merchant_id = auth.uid()
    )
);

-- Product reviews: anyone can read, merchants can write their own reviews
CREATE POLICY "Product reviews are viewable by everyone" ON wholesale_product_reviews FOR SELECT USING (true);
CREATE POLICY "Product reviews are insertable by merchants" ON wholesale_product_reviews FOR INSERT WITH CHECK (merchant_id = auth.uid());
CREATE POLICY "Product reviews are updatable by author and admins" ON wholesale_product_reviews FOR UPDATE USING (
    merchant_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin'
);
CREATE POLICY "Product reviews are deletable by author and admins" ON wholesale_product_reviews FOR DELETE USING (
    merchant_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin'
); 