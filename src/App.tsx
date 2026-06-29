import { useState, useEffect } from 'react';
import Navbar from './components/layout/Navbar';
import EconomicTicker from './components/layout/EconomicTicker';
import HomePage from './pages/HomePage';
import BusinessDirectory from './pages/BusinessDirectory';
import NewsCenter from './pages/NewsCenter';
import RegistrationWizard from './pages/RegistrationWizard';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [showTicker, setShowTicker] = useState(true);

  // Parse URL on mount and handle navigation
  useEffect(() => {
    const path = window.location.hash.replace('#', '') || 'home';
    setCurrentPage(path.split('?')[0]);
  }, []);

  // Update URL hash on navigation
  const navigateTo = (page: string) => {
    window.location.hash = page;
    setCurrentPage(page.split('?')[0]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Determine current page (handle query params)
  const activePage = currentPage.split('?')[0];

  // Pages that should not show the ticker
  const noTickerPages = ['register', 'admin'];
  const shouldShowTicker = !noTickerPages.includes(activePage);

  // Calculate header height based on navbar
  const getHeaderHeight = () => {
    if (noTickerPages.includes(activePage)) return 'pt-[140px]';
    return 'pt-[180px]';
  };

  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return <HomePage onNavigate={navigateTo} />;
      case 'directory':
        return <BusinessDirectory />;
      case 'news':
        return <NewsCenter />;
      case 'register':
        return <RegistrationWizard />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <HomePage onNavigate={navigateTo} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-[Tajawal]">
      {/* Fixed header */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar currentPage={activePage} onNavigate={navigateTo} />
        {shouldShowTicker && <EconomicTicker />}
      </div>

      {/* Main content with dynamic padding */}
      <main className={getHeaderHeight()}>
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
