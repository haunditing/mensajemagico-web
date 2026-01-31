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
import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import OccasionPage from './pages/OccasionPage';
import RelationPage from './pages/RelationPage';
import PrivacyPage from './pages/PrivacyPage';
import ContactPage from './pages/ContactPage';
import TermsPage from './pages/TermsPage';

const { BrowserRouter: Router, Routes, Route } = ReactRouterDOM;

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

export default App;