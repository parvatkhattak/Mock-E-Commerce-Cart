import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Sparkles } from "lucide-react";
import { useState } from "react";

interface CheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (customerInfo: { name: string; email: string }) => void;
  isProcessing?: boolean;
}

export const CheckoutModal = ({ open, onOpenChange, onSubmit, isProcessing = false }: CheckoutModalProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email) {
      onSubmit({ name, email });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-accent" />
            Complete Your Order
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isProcessing}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isProcessing}
            />
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={isProcessing}>
            {isProcessing ? 'Processing...' : 'Complete Order'}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            This is a mock checkout - no actual payment will be processed
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};

interface ReceiptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receipt: {
    orderId: string;
    timestamp: string;
    customer: { name: string; email: string };
    items: Array<{ name: string; quantity: number; price: number; subtotal: number }>;
    total: string;
    recommendations: string[];
  } | null;
}

export const ReceiptModal = ({ open, onOpenChange, receipt }: ReceiptModalProps) => {
  if (!receipt) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-accent" />
            Order Confirmed!
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 pt-4">
          <div className="bg-accent/10 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">Order ID</p>
            <p className="font-mono text-sm">{receipt.orderId}</p>
            <p className="text-sm text-muted-foreground mt-2">Date</p>
            <p className="text-sm">{new Date(receipt.timestamp).toLocaleString()}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Customer Information</h3>
            <p className="text-sm">{receipt.customer.name}</p>
            <p className="text-sm text-muted-foreground">{receipt.customer.email}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Order Items</h3>
            <div className="space-y-2">
              {receipt.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b">
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      ${item.price.toFixed(2)} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold">${item.subtotal.toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center pt-4 text-lg">
              <span className="font-bold">Total</span>
              <span className="text-2xl font-bold text-price">${receipt.total}</span>
            </div>
          </div>

          {receipt.recommendations.length > 0 && (
            <div className="bg-gradient-to-br from-accent/10 to-primary/10 p-4 rounded-lg">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-accent" />
                AI Recommendations
              </h3>
              <ul className="space-y-1 text-sm">
                {receipt.recommendations.map((rec, index) => (
                  <li key={index} className="text-muted-foreground">• {rec}</li>
                ))}
              </ul>
            </div>
          )}

          <Button onClick={() => onOpenChange(false)} className="w-full" size="lg">
            Continue Shopping
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
