import React from "react";
import "./App.css";
import "./qeh-partner.css";

import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  Navigate,
} from "react-router-dom";

import { Toaster } from "sonner";

import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { AuthProvider } from "./context/AuthContext";
import { CustomerAuthProvider } from "./context/CustomerAuthContext";

import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminCentralLayout from "./components/AdminCentralLayout";
import QEHPartnerLayout from "./components/QEHPartnerLayout";
import QEHEnergiesLayout from "./components/QEHEnergiesLayout";
import SiteAnalyticsTracker from "./components/SiteAnalyticsTracker";
import MaintenanceGate from "./components/MaintenanceGate";

import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import Contact from "./pages/Contact";
import SupabaseTest from "./pages/SupabaseTest";
import Wishlist from "./pages/Wishlist";
import Tracking from "./pages/Tracking";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";

import QEHEnergiesCarte from "./pages/QEHEnergiesCarte";
import QEHEnergiesFonctionnement from "./pages/QEHEnergiesFonctionnement";
import QEHEnergiesParticiper from "./pages/QEHEnergiesParticiper";

import QEHPartner from "./pages/QEHPartner";
import QEHPartnerProduction from "./pages/QEHPartnerProduction";
import QEHPartnerMaterielPro from "./pages/QEHPartnerMaterielPro";
import QEHPartnerFranchise from "./pages/QEHPartnerFranchise";

import CustomerOrderDetail from "./pages/CustomerOrderDetail";
import CustomerOrders from "./pages/CustomerOrders";
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
import AdminCustomers from "./pages/AdminCustomers";
import AdminCustomerDetail from "./pages/AdminCustomerDetail";
import AdminMessages from "./pages/AdminMessages";
import AdminSettings from "./pages/AdminSettingsPremium";

import AdminEnergiesDemandes from "./pages/AdminEnergiesDemandes";
import AdminEnergiesProducteurs from "./pages/AdminEnergiesProducteurs";
import AdminEnergiesCarte from "./pages/AdminEnergiesCarte";

import AdminPartnerFranchises from "./pages/AdminPartnerFranchises";
import AdminPartnerProduction from "./pages/AdminPartnerProduction";
import AdminPartnerProduits from "./pages/AdminPartnerProduits";
import AdminPartnerCommandes from "./pages/AdminPartnerCommandes";

function StoreLayout() {
  return (
    <MaintenanceGate>
      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-1">
          <Outlet />
        </main>

        <Footer />
      </div>
    </MaintenanceGate>
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
                <SiteAnalyticsTracker />

                <Toaster
                  position="top-center"
                  richColors
                />

                <Routes>
                  {/* ===================================================== */}
                  {/* BOUTIQUE QEH OUTLET                                   */}
                  {/* ===================================================== */}

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

                    <Route
                      path="/politique-de-confidentialite"
                      element={<PrivacyPolicy />}
                    />

                    <Route
                      path="/conditions-generales"
                      element={<Terms />}
                    />
                  </Route>

                  {/* ===================================================== */}
                  {/* QEH ÉNERGIES                                         */}
                  {/* ===================================================== */}

                  <Route
                    path="/qeh-energies"
                    element={
                      <MaintenanceGate>
                        <QEHEnergiesLayout />
                      </MaintenanceGate>
                    }
                  >
                    <Route
                      index
                      element={
                        <Navigate
                          to="/qeh-energies/carte-solaire"
                          replace
                        />
                      }
                    />

                    <Route
                      path="carte-solaire"
                      element={<QEHEnergiesCarte />}
                    />

                    <Route
                      path="comment-ca-marche"
                      element={<QEHEnergiesFonctionnement />}
                    />

                    <Route
                      path="participer"
                      element={<QEHEnergiesParticiper />}
                    />
                  </Route>

                  {/* ===================================================== */}
                  {/* QEH PARTNER                                          */}
                  {/* ===================================================== */}

                  <Route
                    path="/qeh-partner"
                    element={
                      <MaintenanceGate>
                        <QEHPartnerLayout />
                      </MaintenanceGate>
                    }
                  >
                    <Route
                      index
                      element={<QEHPartner />}
                    />

                    <Route
                      path="production"
                      element={<QEHPartnerProduction />}
                    />

                    <Route
                      path="materiel-pro"
                      element={<QEHPartnerMaterielPro />}
                    />

                    <Route
                      path="franchise"
                      element={<QEHPartnerFranchise />}
                    />
                  </Route>

                  {/* ===================================================== */}
                  {/* CONNEXION ADMINISTRATEUR                              */}
                  {/* ===================================================== */}

                  <Route
                    path="/admin/login"
                    element={<AdminLogin />}
                  />

                  {/* ===================================================== */}
                  {/* ADMINISTRATION PROTÉGÉE                               */}
                  {/* ===================================================== */}

                  <Route element={<ProtectedRoute />}>
                    <Route element={<AdminCentralLayout />}>
                      <Route
                        path="/admin"
                        element={<AdminDashboard />}
                      />

                      {/* QEH OUTLET */}

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

                      <Route
                        path="/admin/clients"
                        element={<AdminCustomers />}
                      />

                      <Route
                        path="/admin/clients/:id"
                        element={<AdminCustomerDetail />}
                      />

                      {/* QEH ÉNERGIES */}

                      <Route
                        path="/admin/energies/demandes"
                        element={<AdminEnergiesDemandes />}
                      />

                      <Route
                        path="/admin/energies/producteurs"
                        element={<AdminEnergiesProducteurs />}
                      />

                      <Route
                        path="/admin/energies/carte"
                        element={<AdminEnergiesCarte />}
                      />

                      {/* QEH PARTNER */}

                      <Route
                        path="/admin/partner/franchises"
                        element={<AdminPartnerFranchises />}
                      />

                      <Route
                        path="/admin/partner/production"
                        element={<AdminPartnerProduction />}
                      />

                      <Route
                        path="/admin/partner/produits"
                        element={<AdminPartnerProduits />}
                      />

                      <Route
                        path="/admin/partner/commandes"
                        element={<AdminPartnerCommandes />}
                      />

                      {/* OUTILS CENTRAUX */}

                      <Route
                        path="/admin/messages"
                        element={<AdminMessages />}
                      />

                      <Route
                        path="/admin/parametres"
                        element={<AdminSettings />}
                      />
                    </Route>
                  </Route>

                  {/* PAGE INTROUVABLE */}

                  <Route
                    path="*"
                    element={
                      <Navigate
                        to="/"
                        replace
                      />
                    }
                  />
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