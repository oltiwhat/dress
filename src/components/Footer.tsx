import Link from 'next/link';

const footerLinks = {
  shop: [
    { name: 'New Arrivals', href: '/shop?filter=new' },
    { name: 'Dresses', href: '/dresses' },
    { name: 'Occasion Wear', href: '/occasion-wear' },
    { name: 'Evening Wear', href: '/shop?category=evening' },
    { name: 'Day Dresses', href: '/shop?category=day' },
    { name: 'Work Essentials', href: '/shop?category=work' },
    { name: 'Sale', href: '/sale' },
  ],
  support: [
    { name: 'Contact Us', href: '/contact' },
    { name: 'Shipping & Delivery', href: '/shipping' },
    { name: 'Returns & Exchanges', href: '/returns' },
    { name: 'Size Guide', href: '/size-guide' },
    { name: 'FAQs', href: '/faq' },
    { name: 'Track Order', href: '/track-order' },
  ],
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Sustainability', href: '/sustainability' },
    { name: 'Careers', href: '/careers' },
    { name: 'Press', href: '/press' },
    { name: 'Affiliate Program', href: '/affiliate' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Cookie Policy', href: '/cookies' },
    { name: 'Accessibility', href: '/accessibility' },
  ],
};

const socialLinks = [
  { name: 'Instagram', href: 'https://instagram.com/fustana', icon: 'instagram' },
  { name: 'Facebook', href: 'https://facebook.com/fustana', icon: 'facebook' },
  { name: 'Pinterest', href: 'https://pinterest.com/fustana', icon: 'pinterest' },
  { name: 'TikTok', href: 'https://tiktok.com/@fustana', icon: 'tiktok' },
];

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200" role="contentinfo">
      <div className="container py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
          <div className="md:col-span-2">
            <Link href="/" className="font-serif text-2xl font-medium block mb-4">
              Fustana
            </Link>
            <p className="text-gray-600 max-w-sm mb-6 leading-relaxed">
              Premium dresses for the moments that matter. Crafted with care, designed for life.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-black hover:text-white hover:border-black transition-all"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    {social.icon === 'instagram' && (
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    )}
                    {social.icon === 'facebook' && (
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                    )}
                    {social.icon === 'pinterest' && (
                      <path d="M12 0c-6.627 0-12 5.372-12 12 0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
                    )}
                    {social.icon === 'tiktok' && (
                      <path d="M12.548.497c-1.823 0-3.588.216-5.02.622A19.72 19.72 0 002.294 3.55a19.632 19.632 0 00-.618 5.033c0 1.84.215 3.607.62 5.02.513 1.794 1.52 3.394 3.01 4.552 1.506 1.163 3.46 1.936 5.59 2.22.097.012.196.012.293 0 2.17-.294 4.156-1.104 5.675-2.29 1.524-1.193 2.572-2.846 3.113-4.683.387-1.297.574-2.63.586-4.007.018-1.83-.204-3.596-.61-5.018-.536-1.815-1.59-3.405-3.15-4.608-1.57-1.2-3.485-2.005-5.645-2.322a.3.3 0 01-.293 0zM8.53 15.53c-.644-.03-1.217-.278-1.68-.71-.54-.486-.864-1.09-.88-1.76-.02-.83.16-1.59.53-2.2.42-.65 1.07-1.12 1.87-1.33.47-.12.94-.15 1.4-.03.96.22 1.84.56 2.6.89a4.872 4.872 0 01-.37 2.5c-.2.59-.52 1.14-.98 1.64-.47.5-1.02.9-1.7.9zm7.04 1.33c-1.2 0-2.35-.17-3.4-.53-.67-.21-1.28-.52-1.78-.91a4.576 4.576 0 00-1.5-1.42c-.4-.33-.77-.69-1.04-1.04a8.46 8.46 0 00-.74-1.24 6.5 6.5 0 00-.43-1.17c-.12-.4-.18-.83-.16-1.25.03-.6.23-1.16.55-1.63.3-.45.71-.8 1.23-1.04.53-.25 1.1-.41 1.7-.41 1.15 0 2.17.3 3.06.92.42.29.75.64.99 1.04.33.5.5.94.54 1.42a10.84 10.84 0 01-.02 1.47 8.93 8.93 0 01-.4 1.48 7.75 7.75 0 01-.69 1.21 6.35 6.35 0 01-1.04 1.03c-.56.47-1.19.8-1.92.8zm0 0" />
                    )}
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <nav aria-label="Shop">
            <h4 className="font-medium tracking-wider uppercase text-xs mb-4">Shop</h4>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-600 hover:text-black transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Support">
            <h4 className="font-medium tracking-wider uppercase text-xs mb-4">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-600 hover:text-black transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Company">
            <h4 className="font-medium tracking-wider uppercase text-xs mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-600 hover:text-black transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} Fustana. All rights reserved.
            </p>
            <nav aria-label="Legal" className="flex flex-wrap justify-center gap-6">
              {footerLinks.legal.map((link) => (
                <Link key={link.href} href={link.href} className="text-xs text-gray-500 hover:text-black transition-colors">
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}