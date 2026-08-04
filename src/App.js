import React from "react";
import "./App.css";

import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";

import { Toaster } from "sonner";

import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { AuthProvider } from "./context/AuthContext";
import { CustomerAuthProvider } from "./context/CustomerAuthContext";

import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import Contact from "./pages/Contact";
import SupabaseTest from "./pages/SupabaseTest";
import Wishlist from "./pages/Wishlist";
import Tracking from "./pages/Tracking";

import CustomerOrderDetail from "./pages/CustomerOrderDetail";
import CustomerLogin from "./pages/CustomerLogin";
import CustomerRegister from "./pages/CustomerRegister";
import CustomerAccount from "./pages/CustomerAccount";

import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProducts from "./pages/AdminProducts";
import AdminProductNew from "./pages/AdminProductNew";
import AdminProductEdit from "./pages/AdminProductEdit";
import AdminCategories from "./pages/AdminCategories";
import AdminOrders from "./pages/AdminOrders";

function StoreLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

function App() {
  return (
    <div className="App">

      <AuthProvider>

        <CustomerAuthProvider>

          <CartProvider>

            <WishlistProvider>

              <BrowserRouter>

                <Toaster
                  position="top-center"
                  richColors
                />

                <Routes>

                  <Route element={<StoreLayout />}>

                    <Route
                      path="/"
                      element={<Home />}
                    />

                    <Route
                      path="/produits"
                      element={<Products />}
                    />

                    <Route
                      path="/produits/:slug"
                      element={<ProductDetail />}
                    />

                    <Route
                      path="/favoris"
                      element={<Wishlist />}
                    />

                    <Route
                      path="/suivi-commande"
                      element={<Tracking />}
                    />

                    <Route
                      path="/panier"
                      element={<Cart />}
                    />

                    <Route
                      path="/commande/succes"
                      element={<CheckoutSuccess />}
                    />

                    <Route
                      path="/contact"
                      element={<Contact />}
                    />

                    <Route
                      path="/connexion"
                      element={<CustomerLogin />}
                    />

                    <Route
                      path="/inscription"
                      element={<CustomerRegister />}
                    />

                    <Route
                      path="/mon-compte"
                      element={<CustomerAccount />}
                    />
                  <Route
                    path="/mes-commandes"
                    element={<CustomerOrders />}
                  />
                  <Route
                    path="/compte/commandes/:id"
                      element={<CustomerOrderDetail />}
/>
                    <Route
                      path="/test-supabase"
                      element={<SupabaseTest />}
                    />

                  </Route>

                  <Route
                    path="/admin/login"
                    element={<AdminLogin />}
                  />

                  <Route element={<ProtectedRoute />}>

                    <Route
                      path="/admin"
                      element={<AdminDashboard />}
                    />
<Route
  path="/politique-de-confidentialite"
  element={<PrivacyPolicy />}
/>

<Route
  path="/conditions-generales"
  element={<Terms />}
/>
                    <Route
                      path="/admin/produits"
                      element={<AdminProducts />}
                    />

                    <Route
                      path="/admin/produits/nouveau"
                      element={<AdminProductNew />}
                    />

                    <Route
                      path="/admin/produits/:productId/modifier"
                      element={<AdminProductEdit />}
                    />

                    <Route
                      path="/admin/categories"
                      element={<AdminCategories />}
                    />

                    <Route
                      path="/admin/commandes"
                      element={<AdminOrders />}
                    />

                  </Route>

                </Routes>

              </BrowserRouter>

            </WishlistProvider>

          </CartProvider>

        </CustomerAuthProvider>

      </AuthProvider>

    </div>
  );
}

export default App;
import CustomerOrders from "./pages/CustomerOrders";