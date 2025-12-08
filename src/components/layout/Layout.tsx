import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import PromoBanner from './PromoBanner';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PromoBanner />
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 md:px-6 py-8">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
}
