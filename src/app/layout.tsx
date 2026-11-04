import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { CartProvider } from '@/hooks/useCart';
import { ToastProvider } from '@/hooks/useToast';
import '../../src/styles/globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
  fallback: ['Georgia', 'serif'],
});

export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3001'),
  title: {
    default: 'Fustana | Premium Dress Boutique',
    template: '%s | Fustana',
  },
  description: 'Discover elegant dresses for every occasion. Premium quality, timeless designs, and effortless style. Shop the latest collection at Fustana.',
  keywords: ['dresses', 'fashion', 'boutique', 'women\'s clothing', 'elegant dresses', 'evening wear', 'cocktail dresses'],
  authors: [{ name: 'Fustana' }],
  creator: 'Fustana',
  publisher: 'Fustana',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://fustana.com',
    siteName: 'Fustana',
    title: 'Fustana | Premium Dress Boutique',
    description: 'Discover elegant dresses for every occasion. Premium quality, timeless designs.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Fustana - Premium Dress Boutique',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fustana | Premium Dress Boutique',
    description: 'Discover elegant dresses for every occasion.',
    images: ['/og-image.jpg'],
  },
  verification: {
    google: 'google-site-verification-code',
  },
};

export const viewport: Viewport = {
  themeColor: '#1A1A1A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://js.stripe.com" />
      </head>
      <body className="antialiased">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <CartProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </CartProvider>
      </body>
    </html>
  );
}