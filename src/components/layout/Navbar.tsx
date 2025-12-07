import { Link } from 'react-router-dom';
import { ShoppingCart, Menu, X, Search } from 'lucide-react';
import { useState } from 'react';

import { useCartStore } from '@/store/cartStore';
import { useAuth } from '@/hooks/useAuth';
import { ModeToggle } from '@/components/mode-toggle';
import { CartSheet } from '@/components/features/CartSheet';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const items = useCartStore((state: { items: any[] }) => state.items);
  const cartItemCount = items.reduce((acc: number, item: { quantity: number }) => acc + item.quantity, 0); 

  const navLinks = [
    { name: 'Shop', href: '/shop' },
    { name: 'Collections', href: '/collections' },
    { name: 'About', href: '/about' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-md shadow-sm">
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
            <ModeToggle />
            <button className="text-foreground/60 hover:text-foreground transition-colors">
                <Search className="h-5 w-5" />
                <span className="sr-only">Search</span>
            </button>
            <CartSheet />
            {user ? (
              <div className="relative group">
                <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                        {user.name?.[0].toUpperCase() || 'U'}
                    </div>
                </button>
                {/* Simple Dropdown - In a real app use Radix UI DropdownMenu */}
                <div className="absolute right-0 top-full mt-2 w-48 rounded-md border bg-popover p-1 shadow-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <div className="px-2 py-1.5 text-sm font-semibold">{user.name}</div>
                    <div className="h-px bg-muted my-1" />
                    <Link to="/account" className="block px-2 py-1.5 text-sm hover:bg-muted rounded-sm">My Account</Link>
                    <button 
                        onClick={() => logout()}
                        className="w-full text-left px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10 rounded-sm"
                    >
                        Sign Out
                    </button>
                </div>
              </div>
            ) : (
                <Link to="/login" className="text-foreground/60 hover:text-foreground transition-colors">
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
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-sm font-medium text-foreground/60 hover:text-foreground"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
