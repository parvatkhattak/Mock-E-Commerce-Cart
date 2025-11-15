-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  category TEXT,
  stock INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cart_items table
CREATE TABLE public.cart_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  session_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Products are viewable by everyone
CREATE POLICY "Products are viewable by everyone" 
ON public.products 
FOR SELECT 
USING (true);

-- Cart items are viewable by session owner
CREATE POLICY "Cart items are viewable by session owner" 
ON public.cart_items 
FOR SELECT 
USING (true);

-- Anyone can insert cart items
CREATE POLICY "Anyone can insert cart items" 
ON public.cart_items 
FOR INSERT 
WITH CHECK (true);

-- Anyone can update their cart items
CREATE POLICY "Anyone can update cart items" 
ON public.cart_items 
FOR UPDATE 
USING (true);

-- Anyone can delete cart items
CREATE POLICY "Anyone can delete cart items" 
ON public.cart_items 
FOR DELETE 
USING (true);

-- Create index for better performance
CREATE INDEX idx_cart_items_session_id ON public.cart_items(session_id);
CREATE INDEX idx_cart_items_product_id ON public.cart_items(product_id);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger for automatic timestamp updates
CREATE TRIGGER update_cart_items_updated_at
BEFORE UPDATE ON public.cart_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample products
INSERT INTO public.products (name, description, price, category, stock, image_url) VALUES
('Wireless Headphones', 'Premium noise-canceling wireless headphones with 30-hour battery life', 149.99, 'Electronics', 50, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop'),
('Smart Watch', 'Fitness tracking smartwatch with heart rate monitor and GPS', 299.99, 'Electronics', 30, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop'),
('Laptop Backpack', 'Water-resistant backpack with padded laptop compartment', 59.99, 'Accessories', 100, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop'),
('Bluetooth Speaker', 'Portable waterproof speaker with 360° sound', 79.99, 'Electronics', 75, 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&h=500&fit=crop'),
('Mechanical Keyboard', 'RGB backlit mechanical keyboard with blue switches', 119.99, 'Electronics', 40, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&h=500&fit=crop'),
('Wireless Mouse', 'Ergonomic wireless mouse with precision tracking', 39.99, 'Electronics', 120, 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&h=500&fit=crop'),
('USB-C Hub', 'Multi-port USB-C hub with HDMI and card readers', 49.99, 'Accessories', 85, 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=500&h=500&fit=crop'),
('Phone Stand', 'Adjustable aluminum phone and tablet stand', 24.99, 'Accessories', 150, 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=500&h=500&fit=crop')