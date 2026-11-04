'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

export function BrandStory() {
  return (
    <section className="section" aria-labelledby="brand-story-heading">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative aspect-[4/5]"
          >
            <Image
              src="https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=1200&q=85"
              alt="Fustana atelier"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-white p-5 md:-bottom-12 md:-right-12 md:left-auto md:p-12 md:max-w-md">
              <p className="font-serif text-2xl md:text-3xl font-medium leading-tight">
                "Every dress tells a story. We just help you write yours."
              </p>
              <p className="mt-4 text-gray-600 text-sm">— Founder, Elena V.</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <span className="text-xs font-medium tracking-widest uppercase text-gray-500">Our Story</span>
            <h2 id="brand-story-heading" className="font-serif text-4xl md:text-5xl font-medium mt-4 mb-6 leading-tight">
              Crafted for the Moments That Matter
            </h2>
            <div className="prose max-w-none text-gray-600 space-y-4">
              <p className="text-lg leading-relaxed">
                Founded in 2018, Fustana was born from a simple belief: every woman deserves a dress that makes her feel extraordinary. Not just for special occasions, but for the everyday moments that become memories.
              </p>
              <p className="leading-relaxed">
                We work with ateliers in Italy, France, and Portugal to create dresses that balance timeless elegance with modern sensibility. Each piece is designed in our London studio and produced in limited runs, ensuring quality over quantity.
              </p>
              <p className="leading-relaxed">
                From the boardroom to the ballroom, from sunrise brunches to midnight celebrations — we're here for every chapter.
              </p>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="font-serif text-3xl font-medium text-black">12+</div>
                <div className="text-sm text-gray-500 mt-1">Countries Shipped</div>
              </div>
              <div>
                <div className="font-serif text-3xl font-medium text-black">50K+</div>
                <div className="text-sm text-gray-500 mt-1">Happy Customers</div>
              </div>
              <div>
                <div className="font-serif text-3xl font-medium text-black">4.9</div>
                <div className="text-sm text-gray-500 mt-1">Average Rating</div>
              </div>
            </div>
            <div className="mt-10">
              <a href="/about" className="btn btn-outline">
                Discover Our Journey
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}