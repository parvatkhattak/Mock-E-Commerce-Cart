import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/ProductCard";
import { CartSidebar } from "@/components/CartSidebar";
import { CheckoutModal, ReceiptModal } from "@/components/CheckoutModal";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Store } from "lucide-react";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  stock: number;
}

interface CartItem {
  id: string;
  quantity: number;
  products: Product;
}

interface Receipt {
  orderId: string;
  timestamp: string;
  customer: { name: string; email: string };
  items: Array<{ name: string; quantity: number; price: number; subtotal: number }>;
  total: string;
  recommendations: string[];
}

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Generate or get session ID
  const getSessionId = () => {
    let sessionId = localStorage.getItem('cart_session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem('cart_session_id', sessionId);
    }
    return sessionId;
  };

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        toast.error('Failed to load products');
        console.error(error);
        return;
      }

      setProducts(data || []);
    };

    fetchProducts();
  }, []);

  // Fetch cart
  const fetchCart = async () => {
    const sessionId = getSessionId();
    const { data, error } = await supabase.functions.invoke('cart-operations', {
      body: { action: 'get', sessionId },
    });

    if (error) {
      console.error('Failed to fetch cart:', error);
      return;
    }

    if (data.success) {
      setCartItems(data.data.items || []);
      setCartTotal(data.data.total || 0);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleAddToCart = async (productId: string) => {
    setIsLoading(true);
    const sessionId = getSessionId();
    
    const { data, error } = await supabase.functions.invoke('cart-operations', {
      body: { action: 'add', sessionId, productId, quantity: 1 },
    });

    if (error) {
      toast.error('Failed to add to cart');
      console.error(error);
      setIsLoading(false);
      return;
    }

    if (data.success) {
      toast.success('Added to cart!');
      await fetchCart();
      setCartOpen(true);
    }
    setIsLoading(false);
  };

  const handleUpdateQuantity = async (cartItemId: string, quantity: number) => {
    setIsLoading(true);
    const sessionId = getSessionId();
    
    const { data, error } = await supabase.functions.invoke('cart-operations', {
      body: { action: 'update', sessionId, cartItemId, quantity },
    });

    if (error) {
      toast.error('Failed to update quantity');
      setIsLoading(false);
      return;
    }

    if (data.success) {
      await fetchCart();
    }
    setIsLoading(false);
  };

  const handleRemoveItem = async (cartItemId: string) => {
    setIsLoading(true);
    const sessionId = getSessionId();
    
    const { data, error } = await supabase.functions.invoke('cart-operations', {
      body: { action: 'remove', sessionId, cartItemId },
    });

    if (error) {
      toast.error('Failed to remove item');
      setIsLoading(false);
      return;
    }

    if (data.success) {
      toast.success('Item removed');
      await fetchCart();
    }
    setIsLoading(false);
  };

  const handleCheckout = () => {
    setCartOpen(false);
    setCheckoutOpen(true);
  };

  const handleCheckoutSubmit = async (customerInfo: { name: string; email: string }) => {
    setIsProcessing(true);
    const sessionId = getSessionId();

    const { data, error } = await supabase.functions.invoke('checkout', {
      body: { sessionId, customerInfo },
    });

    if (error) {
      toast.error('Checkout failed. Please try again.');
      console.error(error);
      setIsProcessing(false);
      return;
    }

    if (data.success) {
      setReceipt(data.receipt);
      setCheckoutOpen(false);
      setReceiptOpen(true);
      
      // Clear cart
      await supabase.functions.invoke('cart-operations', {
        body: { action: 'clear', sessionId },
      });
      
      await fetchCart();
      toast.success('Order placed successfully!');
    }
    setIsProcessing(false);
  };

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Store className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Vibe Commerce</h1>
          </div>
          <Button
            variant="outline"
            size="lg"
            onClick={() => setCartOpen(true)}
            className="relative"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-cart-badge text-white text-xs font-bold flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Our Products</h2>
          <p className="text-muted-foreground">
            Discover our curated collection of quality tech products
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      </main>

      {/* Cart Sidebar */}
      <CartSidebar
        open={cartOpen}
        onOpenChange={setCartOpen}
        items={cartItems}
        total={cartTotal}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleCheckout}
        isLoading={isLoading}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        onSubmit={handleCheckoutSubmit}
        isProcessing={isProcessing}
      />

      {/* Receipt Modal */}
      <ReceiptModal
        open={receiptOpen}
        onOpenChange={setReceiptOpen}
        receipt={receipt}
      />
    </div>
  );
};

export default Index;
