import React from "react";
import * as ReactRouterDOM from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import OccasionPage from "./pages/OccasionPage";
import RelationPage from "./pages/RelationPage";
import PrivacyPage from "./pages/PrivacyPage";
import ContactPage from "./pages/ContactPage";
import TermsPage from "./pages/TermsPage";
import SuccessPage from "./pages/SuccessPage";
import PricingPage from "./pages/PricingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import { UpsellProvider } from "./context/UpsellContext";
import UpsellModal from "./components/UpsellModal";
import ToastNotification from "./components/ToastNotification";
import { ThemeProvider } from "./context/ThemeContext";
import { OnboardingProvider } from "./context/OnboardingContext";
import { ToastProvider } from "./context/ToastContext";
import { FavoritesProvider } from "./context/FavoritesContext";
import FavoritesPage from "./pages/FavoritesPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ProfilePage from "./pages/ProfilePage";
import RemindersPage from "./pages/RemindersPage";
import SettingsPage from "./pages/SettingsPage";
import ContactsPage from "./pages/ContactsPage";
import FaqPage from "./pages/FaqPage";
import PaymentErrorPage from "./pages/PaymentErrorPage";

const { BrowserRouter: Router, Routes, Route } = ReactRouterDOM;

const App: React.FC = () => {
  return (
    <Router>
      <ThemeProvider>
        <OnboardingProvider>
        <UpsellProvider>
          <ToastProvider>
            <FavoritesProvider>
              <Layout>
                <UpsellModal />
                <ToastNotification />
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/mensajes/:slug" element={<OccasionPage />} />
                  <Route
                    path="/mensajes/:slug/:relSlug"
                    element={<RelationPage />}
                  />
                  <Route path="/privacidad" element={<PrivacyPage />} />
                  <Route path="/contacto" element={<ContactPage />} />
                  <Route path="/terminos" element={<TermsPage />} />
                  <Route path="/success" element={<SuccessPage />} />
                  <Route path="/payment-error" element={<PaymentErrorPage />} />
                  <Route path="/pricing" element={<PricingPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="/favoritos" element={<FavoritesPage />} />
                  <Route
                    path="/forgot-password"
                    element={<ForgotPasswordPage />}
                  />
                  <Route
                    path="/reset-password/:token"
                    element={<ResetPasswordPage />}
                  />
                  <Route path="/perfil" element={<ProfilePage />} />
                  <Route path="/recordatorios" element={<RemindersPage />} />
                  <Route path="/configuracion" element={<SettingsPage />} />
                  <Route path="/contactos" element={<ContactsPage />} />
                  <Route path="/faq" element={<FaqPage />} />
                  <Route path="*" element={<HomePage />} />
                </Routes>
              </Layout>
            </FavoritesProvider>
          </ToastProvider>
        </UpsellProvider>
        </OnboardingProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;
