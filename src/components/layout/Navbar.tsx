import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Search } from 'lucide-react';
import { useState } from 'react';

import { useCartStore } from '@/store/cartStore';
import { useAuth } from '@/hooks/useAuth';
import { ModeToggle } from '@/components/mode-toggle';
import { CartSheet } from '@/components/features/CartSheet';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  useCartStore((state: { items: any[] }) => state.items); 

  const navLinks = [
    { name: 'Shop', href: '/shop' },
    { name: 'Collections', href: '/collections' },
    { name: 'About', href: '/about' },
  ];

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const query = e.currentTarget.value.trim();
      if (query) {
        navigate(`/shop?search=${encodeURIComponent(query)}`);
        setIsSearchOpen(false);
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-md shadow-sm transition-all">
      <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-6 w-6 bg-primary rounded-sm" />
            <span className="font-bold text-lg tracking-tight">KORE</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className="text-foreground/60 transition-colors hover:text-foreground"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
             {/* Search Bar */}
            <div className={`hidden md:flex items-center transition-all overflow-hidden ${isSearchOpen ? 'w-64 opacity-100' : 'w-0 opacity-0'}`}>
                 <input 
                    type="text" 
                    placeholder="Search products..." 
                    className="w-full bg-muted/50 border-none rounded-full px-4 py-1.5 text-sm focus:ring-1 focus:ring-primary outline-none"
                    autoFocus={isSearchOpen}
                    onBlur={(e) => {
                        if (!e.target.value) setIsSearchOpen(false);
                    }}
                    onKeyDown={handleSearch}
                 />
            </div>
            
            <button 
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="text-foreground/60 hover:text-foreground transition-colors"
            >
                <Search className="h-5 w-5" />
                <span className="sr-only">Search</span>
            </button>

            <CartSheet />
            
            <ModeToggle />

            {user ? (
              <div className="relative group hidden md:block">
                <button className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
                  {user.email}
                </button>
                <div className="absolute right-0 top-full pt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right z-50">
                    <div className="bg-popover border rounded-md shadow-md p-1 flex flex-col">
                        <Link to="/account" className="px-3 py-2 text-sm hover:bg-muted rounded-sm text-left">My Account</Link>
                        <Link to="/wishlist" className="px-3 py-2 text-sm hover:bg-muted rounded-sm text-left">Wishlist</Link>
                        <button 
                            onClick={logout}
                            className="px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-sm text-left"
                        >
                            Log Out
                        </button>
                    </div>
                </div>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-4">
                <Link to="/login" className="text-sm font-medium hover:text-primary transition-colors">
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-full text-sm font-medium transition-colors"
                >
                  Sign up
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 -mr-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 z-50 bg-background border-t p-4 overflow-y-auto animate-in slide-in-from-top-2">
           <form 
             onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const input = form.elements.namedItem('mobile-search') as HTMLInputElement;
                if (input.value) {
                    navigate(`/shop?search=${encodeURIComponent(input.value)}`);
                    setIsMenuOpen(false);
                }
             }}
             className="mb-4"
           >
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input 
                        name="mobile-search"
                        type="text" 
                        placeholder="Search..." 
                        className="w-full bg-muted rounded-full pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                </div>
           </form>
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-lg font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <hr className="my-2 border-border" />
            {user ? (
              <>
                 <Link to="/account" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium">My Account</Link>
                 <Link to="/wishlist" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium">Wishlist</Link>
                 <button onClick={logout} className="text-lg font-medium text-destructive text-left">Log Out</button>
              </>
            ) : (
              <div className="flex flex-col gap-4 mt-2">
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium">Log in</Link>
                <Link to="/register" onClick={() => setIsMenuOpen(false)} className="bg-primary text-primary-foreground px-4 py-3 rounded-full text-center font-medium">Sign up</Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
