# Mock E-Commerce Cart

A modern, full-stack e-commerce shopping cart application built for the Vibe Commerce coding assignment.

## 🚀 Live Demo

**URL**:https://mock-e-commerce-cart.vercel.app/

## 📋 Assignment Requirements

This project fulfills all required and bonus features:

### ✅ Backend APIs (All Implemented)
- ✅ `GET /api/products` - Fetch 8 mock products with id, name, price, description, image, category, and stock
- ✅ `POST /api/cart` - Add items with productId and quantity
- ✅ `DELETE /api/cart/:id` - Remove items from cart
- ✅ `GET /api/cart` - Get cart items with calculated total
- ✅ `POST /api/checkout` - Process checkout and generate receipt with timestamp

### ✅ Frontend Features
- ✅ Responsive product grid with "Add to Cart" buttons
- ✅ Shopping cart sidebar with:
  - Real-time item display
  - Quantity update controls (+ / -)
  - Remove item functionality
  - Live total calculation
- ✅ Checkout form with name and email validation
- ✅ Order confirmation modal with receipt details
- ✅ Fully responsive design (mobile, tablet, desktop)

### ✅ Bonus Features
- ✅ **Database Persistence** - PostgreSQL
- ✅ **Session Management** - Cart persists across page refreshes using localStorage session IDs
- ✅ **Error Handling** - Comprehensive error handling with user-friendly toast notifications
- ✅ **AI Integration** - Gemini AI powers product recommendations after checkout
- ✅ **Real-time Updates** - Cart updates instantly with smooth animations
- ✅ **Stock Management** - Visual indicators for low stock and out-of-stock items

## 🛠 Tech Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling with custom design system
- **shadcn/ui** - Beautiful, accessible component library
- **React Router** - Client-side routing
- **TanStack Query** - Server state management
- **Sonner** - Toast notifications

### Backend
- **(Supabase)** - Backend-as-a-Service
- **PostgreSQL** - Relational database
- **Edge Functions** - Serverless API endpoints
- **Row Level Security (RLS)** - Database security policies

### AI Integration
- **Gemini AI** (google/gemini-2.5-flash) - Product recommendations 

## 📁 Project Structure

```
/
├── src/
│   ├── components/
│   │   ├── ui/              # Reusable UI components (shadcn)
│   │   ├── ProductCard.tsx  # Product display component
│   │   ├── CartSidebar.tsx  # Shopping cart interface
│   │   └── CheckoutModal.tsx # Checkout & receipt modals
│   ├── pages/
│   │   ├── Index.tsx        # Main shopping page
│   │   └── NotFound.tsx     # 404 page
│   ├── integrations/
│   │   └── supabase/        # Auto-generated Supabase client & types
│   └── index.css            # Design system & global styles
├── supabase/
│   └── functions/
│       ├── cart-operations/ # Cart CRUD operations
│       └── checkout/        # Checkout processing with AI
└── README.md
```

## 🎨 Design System

The application features a professional e-commerce design with:
- **Color Palette**: Modern blue-gray base with teal accent
- **Typography**: Clean, readable font hierarchy
- **Animations**: Smooth transitions and hover effects
- **Components**: Card-based layouts with subtle shadows
- **Dark Mode**: Full dark mode support (auto-detected)

## 🔧 Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <YOUR_GIT_URL>
   cd <PROJECT_NAME>
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:8080
   ```

## 🎯 Key Features Explained

### 1. Cart Operations
The `cart-operations` edge function handles all cart CRUD operations:
- **Add**: Increments quantity if item exists, otherwise creates new entry
- **Update**: Modifies quantity of existing items
- **Remove**: Deletes items from cart
- **Get**: Fetches cart with product details and calculates total
- **Clear**: Empties cart after successful checkout

### 2. Session Management
- Generates unique session ID on first visit
- Stores in localStorage for persistence
- All cart operations tied to session ID
- Works without user authentication

### 3. AI-Powered Recommendations
After checkout, Gemini AI analyzes purchased products and suggests complementary items:
```typescript
// Example: If user bought "Wireless Headphones"
// AI suggests: "Headphone case, Audio cable adapter, Cleaning kit"
```

### 4. Error Handling
- Network failures → User-friendly toast notifications
- Empty cart checkout → Validation prevents submission
- Stock validation → Visual indicators and disabled add buttons
- Form validation → Email and name required fields

### 5. Database Schema
```sql
-- Products table with sample data
products (id, name, description, price, image_url, category, stock)

-- Cart items with foreign key to products
cart_items (id, product_id, quantity, session_id, created_at, updated_at)
```


### Cart Operations
**Endpoint**: `/functions/v1/cart-operations`

```typescript
// Add to cart
POST { action: 'add', sessionId, productId, quantity }

// Update quantity
POST { action: 'update', sessionId, cartItemId, quantity }

// Remove item
POST { action: 'remove', sessionId, cartItemId }

// Get cart
POST { action: 'get', sessionId }

// Clear cart
POST { action: 'clear', sessionId }
```

### Checkout
**Endpoint**: `/functions/v1/checkout`

```typescript
POST {
  sessionId: string,
  customerInfo: { name: string, email: string }
}

// Returns receipt with AI recommendations
```

