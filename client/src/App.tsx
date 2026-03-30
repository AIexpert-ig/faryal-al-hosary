import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Rentals from './pages/Rentals';
import Customers from './pages/Customers';
import Reports from './pages/Reports';

function AppInner() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const isRtl = i18n.language === 'ar';
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/inventory" element={<Inventory />} />
      <Route path="/rentals" element={<Rentals />} />
      <Route path="/customers" element={<Customers />} />
      <Route path="/reports" element={<Reports />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  );
}
