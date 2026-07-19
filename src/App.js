import React from "react";
import "./App.css";

import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";

import { Toaster } from "sonner";

import {
  CartProvider,
} from "./context/CartContext";

import {
  AuthProvider,
} from "./context/AuthContext";

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
        <CartProvider>
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
        </CartProvider>
      </AuthProvider>
    </div>
  );
}

export default App;