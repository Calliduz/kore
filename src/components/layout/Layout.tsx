import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import PromoBanner from './PromoBanner';
import { BackToTop } from '@/components/common/BackToTop';

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <ScrollToTop />
      <PromoBanner />
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 md:px-6 py-8">
          <Outlet />
        </div>
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}

