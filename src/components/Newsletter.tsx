'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/useToast';

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        showToast({
          type: 'success',
          title: 'Welcome to Fustana!',
          message: 'Check your inbox for 10% off your first order.',
        });
        setEmail('');
      } else {
        const data = await res.json();
        showToast({
          type: 'error',
          title: 'Something went wrong',
          message: data.error || 'Please try again later.',
        });
      }
    } catch {
      showToast({
        type: 'error',
        title: 'Connection error',
        message: 'Please check your connection and try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="section bg-black text-white" aria-labelledby="newsletter-heading">
      <div className="container">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 id="newsletter-heading" className="font-serif text-4xl md:text-5xl font-medium mb-4">
              Join the Fustana Circle
            </h2>
            <p className="text-white/70 text-lg mb-8 max-w-md mx-auto">
              Be the first to access new collections, private sales, and styling inspiration. Plus, enjoy 10% off your first order.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <label htmlFor="newsletter-email" className="visually-hidden">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="input bg-white/5 border-white/20 text-white placeholder-white/40 focus:border-gold focus:ring-gold/30 flex-1"
                required
                disabled={isSubmitting}
                autoComplete="email"
              />
              <button
                type="submit"
                disabled={isSubmitting || !email}
                className="btn btn-gold whitespace-nowrap"
              >
                {isSubmitting ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>

            <p className="mt-4 text-xs text-white/40">
              By subscribing, you agree to our <a href="/privacy" className="underline hover:text-white">Privacy Policy</a>. Unsubscribe anytime.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}