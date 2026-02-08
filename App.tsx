/*import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import OccasionPage from './pages/OccasionPage';
import RelationPage from './pages/RelationPage';
import PrivacyPage from './pages/PrivacyPage';
import ContactPage from './pages/ContactPage';
import TermsPage from './pages/TermsPage';

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/mensajes/:slug" element={<OccasionPage />} />
          <Route path="/mensajes/:slug/:relSlug" element={<RelationPage />} />
          <Route path="/privacidad" element={<PrivacyPage />} />
          <Route path="/contacto" element={<ContactPage />} />
          <Route path="/terminos" element={<TermsPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;*/
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
import { ToastProvider } from "./context/ToastContext";
import { FavoritesProvider } from "./context/FavoritesContext";
import FavoritesPage from "./pages/FavoritesPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

const { BrowserRouter: Router, Routes, Route } = ReactRouterDOM;

const App: React.FC = () => {
  return (
    <Router>
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
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/favoritos" element={<FavoritesPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
                <Route path="*" element={<HomePage />} />
              </Routes>
            </Layout>
          </FavoritesProvider>
        </ToastProvider>
      </UpsellProvider>
    </Router>
  );
};

export default App;
