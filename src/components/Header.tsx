'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useCart } from '@/hooks/useCart';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'New In', href: '/shop?filter=new' },
  { name: 'Dresses', href: '/dresses' },
  { name: 'Occasion Wear', href: '/occasion-wear' },
  { name: 'Sale', href: '/sale' },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { itemCount, openCart } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'relative z-50 transition-all duration-300',
        isScrolled
          ? 'header-shell header-shell-scrolled'
          : 'header-shell'
      )}
    >
      <div className="announcement-bar">Complimentary delivery on orders over $200</div>
      <nav className="container header-nav" aria-label="Main navigation">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-10">
            <button
              className="md:hidden p-2 header-menu-button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
            >
              <span className="block w-6 h-0.5 bg-black transition-all" style={{ transform: isMenuOpen ? 'rotate(45deg) translate(4px, 4px)' : 'translateY(-6px)' }} />
              <span className="block w-6 h-0.5 bg-black transition-all mt-1.5" style={{ opacity: isMenuOpen ? 0 : 1 }} />
              <span className="block w-6 h-0.5 bg-black transition-all mt-1.5" style={{ transform: isMenuOpen ? 'rotate(-45deg) translate(4px, -4px)' : 'translateY(6px)' }} />
            </button>

            <Link href="/" className="brand-mark" aria-label="Fustana Home">
              Fustana
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="nav-link"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-5">
            <Link href="/shop" className="header-shop-link hidden sm:inline-flex">Shop all</Link>
            <Link href="/account/signin" className="header-shop-link hidden sm:inline-flex">Sign in</Link>
            <button
              onClick={openCart}
              className="header-icon relative"
              aria-label={`Shopping cart${itemCount > 0 ? ` with ${itemCount} items` : ''}`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              {itemCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-5 h-5 text-[10px] font-bold text-white rounded-full flex items-center justify-center"
                  style={{ background: 'var(--color-gold)' }}
                  aria-label={`${itemCount} items in cart`}
                >
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </button>

          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-6 border-t border-black/10 animate-slideDown mobile-menu-panel">
            <div className="flex flex-col gap-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-base font-medium py-2 text-black/80 hover:text-black"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <Link
                href="/account/signin"
                className="text-base font-medium py-2 text-black/80 hover:text-black"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign in
              </Link>
            </div>
          </div>
        )}
      </nav>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.2s ease forwards;
        }
      `}</style>
    </header>
  );
}