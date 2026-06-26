import { Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { Header } from "./components/Header";
import { CartDrawer } from "./components/CartDrawer";
import { MenuPage } from "./pages/MenuPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { OrderStatusPage } from "./pages/OrderStatusPage";

export function App() {
  return (
    <CartProvider>
      <Header />
      <CartDrawer />
      <Routes>
        <Route path="/" element={<MenuPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order/:orderId" element={<OrderStatusPage />} />
      </Routes>
    </CartProvider>
  );
}
