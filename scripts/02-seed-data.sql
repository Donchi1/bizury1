-- Insert sample categories
INSERT INTO public.categories (name, slug, description, image_url, is_active, sort_order) VALUES
('Electronics', 'electronics', 'Latest gadgets and electronic devices', '/placeholder.svg?height=200&width=200', true, 1),
('Fashion', 'fashion', 'Trendy clothing and accessories', '/placeholder.svg?height=200&width=200', true, 2),
('Home & Garden', 'home-garden', 'Everything for your home and garden', '/placeholder.svg?height=200&width=200', true, 3),
('Sports & Outdoors', 'sports-outdoors', 'Sports equipment and outdoor gear', '/placeholder.svg?height=200&width=200', true, 4),
('Books & Media', 'books-media', 'Books, movies, music and more', '/placeholder.svg?height=200&width=200', true, 5),
('Health & Beauty', 'health-beauty', 'Health and beauty products', '/placeholder.svg?height=200&width=200', true, 6),
('Toys & Games', 'toys-games', 'Fun toys and games for all ages', '/placeholder.svg?height=200&width=200', true, 7),
('Automotive', 'automotive', 'Car parts and automotive accessories', '/placeholder.svg?height=200&width=200', true, 8)
ON CONFLICT (slug) DO NOTHING;

-- Insert subcategories
INSERT INTO public.categories (name, slug, description, parent_id, is_active, sort_order) VALUES
('Smartphones', 'smartphones', 'Latest smartphones and accessories', (SELECT id FROM public.categories WHERE slug = 'electronics'), true, 1),
('Laptops', 'laptops', 'Laptops and computer accessories', (SELECT id FROM public.categories WHERE slug = 'electronics'), true, 2),
('Headphones', 'headphones', 'Audio equipment and headphones', (SELECT id FROM public.categories WHERE slug = 'electronics'), true, 3),
('Men''s Clothing', 'mens-clothing', 'Fashion for men', (SELECT id FROM public.categories WHERE slug = 'fashion'), true, 1),
('Women''s Clothing', 'womens-clothing', 'Fashion for women', (SELECT id FROM public.categories WHERE slug = 'fashion'), true, 2),
('Shoes', 'shoes', 'Footwear for all occasions', (SELECT id FROM public.categories WHERE slug = 'fashion'), true, 3)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample banners
INSERT INTO banners (title, description, image_url, link_url, position, is_active, sort_order) VALUES
('Flash Sale - Up to 70% Off', 'Limited time offer on electronics', '/images/banners/flash-sale.jpg', '/flash-sale', 'hero', true, 1),
('New Arrivals', 'Check out our latest products', '/images/banners/new-arrivals.jpg', '/new-arrivals', 'hero', true, 2),
('Free Shipping', 'Free shipping on orders over $50', '/images/banners/free-shipping.jpg', '/shipping', 'secondary', true, 1);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON stores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Note: We'll create a sample store and products, but you'll need to have a user first
-- You can run this after you have users in your system, or modify the owner_id to match your user ID

-- Insert sample store (replace the owner_id with your actual user ID)
-- INSERT INTO public.stores (owner_id, name, slug, description, logo_url, banner_url, is_verified, is_active, rating) VALUES
-- ('your-user-id-here', 'TechMart Store', 'techmart-store', 'Your one-stop shop for all tech needs', '/placeholder.svg?height=100&width=100', '/placeholder.svg?height=400&width=800', true, true, 4.5);

-- Sample products (uncomment and modify after creating a store)
-- INSERT INTO public.products (store_id, category_id, name, slug, description, short_description, price, compare_price, stock_quantity, images, is_active, is_featured, rating, review_count) VALUES
-- ((SELECT id FROM public.stores WHERE slug = 'techmart-store'), (SELECT id FROM public.categories WHERE slug = 'smartphones'), 'iPhone 15 Pro', 'iphone-15-pro', 'Latest iPhone with advanced features', 'Premium smartphone with Pro camera system', 999.00, 1099.00, 50, ARRAY['/placeholder.svg?height=400&width=400'], true, true, 4.8, 124),
-- ((SELECT id FROM public.stores WHERE slug = 'techmart-store'), (SELECT id FROM public.categories WHERE slug = 'laptops'), 'MacBook Air M2', 'macbook-air-m2', 'Powerful and lightweight laptop', 'Ultra-thin laptop with M2 chip', 1199.00, 1299.00, 25, ARRAY['/placeholder.svg?height=400&width=400'], true, true, 4.7, 89);

-- Insert sample notifications for existing users (you can modify this after you have users)
-- INSERT INTO public.notifications (user_id, type, title, message) VALUES
-- ('your-user-id-here', 'welcome', 'Welcome to our platform!', 'Thank you for joining our e-commerce platform. Start exploring amazing products!'),
-- ('your-user-id-here', 'promotion', 'Special Offer', 'Get 20% off on your first purchase. Use code WELCOME20');

-- The rest of the data will be created as users interact with the platform
