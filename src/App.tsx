import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CartProvider } from "@/store/cartStore";
import { AuthProvider } from "@/lib/auth";
import Index from "./pages/Index";
import Designer from "./pages/Designer";
import Cart from "./pages/Cart";
import NotFound from "./pages/NotFound";
import Collection from "./pages/Collection";
import Account from "./pages/Account";

const queryClient = new QueryClient();

const basename = import.meta.env.BASE_URL.replace(/\/$/, "");

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <CartProvider>
          <BrowserRouter basename={basename}>
            <Navbar />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/designer" element={<Designer />} />
              <Route path="/collection" element={<Collection />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/account" element={<Account />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Footer />
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
