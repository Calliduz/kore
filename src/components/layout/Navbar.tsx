import { Link } from 'react-router-dom';
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
  useCartStore((state: { items: any[] }) => state.items); 

  const navLinks = [
    { name: 'Shop', href: '/shop' },
    { name: 'Collections', href: '/collections' },
    { name: 'About', href: '/about' },
  ];

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
                 />
            </div>

            <button 
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="text-foreground/60 hover:text-foreground transition-colors"
            >
                {isSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
                <span className="sr-only">Search</span>
            </button>

            <ModeToggle />
            
            <CartSheet />
            
            {user ? (
              <div className="relative group">
                <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium border-2 border-background ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                        {user.name?.[0].toUpperCase() || 'U'}
                    </div>
                </button>
                {/* Dropdown */}
                <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border bg-popover p-1 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right scale-95 group-hover:scale-100 duration-200">
                    <div className="px-3 py-2 text-sm">
                        <p className="font-semibold">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <div className="h-px bg-muted my-1" />
                    {user.role === 'admin' && (
                      <Link to="/admin" className="block px-2 py-2 text-sm hover:bg-muted rounded-md text-primary font-medium transition-colors">
                        Admin Dashboard
                      </Link>
                    )}
                    <Link to="/account" className="block px-2 py-2 text-sm hover:bg-muted rounded-md transition-colors">My Account</Link>
                    <button 
                        onClick={() => logout()}
                        className="w-full text-left px-2 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                    >
                        Sign Out
                    </button>
                </div>
              </div>
            ) : (
                <Link to="/login" className="text-foreground/60 hover:text-foreground transition-colors hidden sm:block">
                    <div className="h-9 px-4 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground flex items-center justify-center text-sm font-medium transition-colors">
                        Sign In
                    </div>
                </Link>
            )}
            
            <button title="mobile-menu"
                className="md:hidden text-foreground/60 hover:text-foreground"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
        </div>
      </div>

        {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t">
          <div className="container py-4 flex flex-col gap-4">
             {/* Mobile Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input 
                    type="text" 
                    placeholder="Search..." 
                    className="w-full bg-muted border-none rounded-md pl-9 pr-4 py-2 text-sm"
                />
            </div>
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-sm font-medium text-foreground/60 hover:text-foreground py-2 border-b border-muted/50 last:border-0"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
             {!user && (
                 <Link to="/login" className="text-sm font-medium text-primary py-2" onClick={() => setIsMenuOpen(false)}>
                     Sign In
                 </Link>
             )}
          </div>
        </div>
      )}
    </header>
  );
}
