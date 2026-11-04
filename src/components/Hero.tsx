'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

export function Hero() {
  return (
    <section className="hero-section relative flex items-center overflow-hidden" aria-label="New season collection">
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=2200&q=85"
          alt="Model wearing a flowing seasonal dress"
          fill
          priority
          className="object-cover hero-image"
          sizes="100vw"
        />
        <div className="absolute inset-0 hero-shade" />
      </div>

      <div className="container relative z-10 hero-content">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="max-w-2xl hero-copy"
        >
          <span className="hero-label">The new season edit</span>
          <h1 className="hero-heading">Dresses for every kind of day.</h1>
          <p className="hero-text">
            Considered silhouettes, beautiful fabrics, and the pieces you will reach for again and again.
          </p>
          <div className="hero-cta-row">
            <Link href="/shop" className="btn btn-primary btn-lg">Shop dresses</Link>
            <Link href="/shop?filter=new" className="btn btn-secondary-light btn-lg">Explore new in</Link>
          </div>

          <div className="hero-meta-row">
            <div>
              <strong>Free delivery</strong>
              <span>On orders over $200</span>
            </div>
            <div>
              <strong>30 days</strong>
              <span>Easy returns</span>
            </div>
            <div>
              <strong>Secure</strong>
              <span>Checkout</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}