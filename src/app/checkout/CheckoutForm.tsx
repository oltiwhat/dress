'use client';

import { useState } from 'react';
import { ExpressCheckoutElement, PaymentElement } from '@stripe/react-stripe-js';
import { motion } from 'framer-motion';
import { formatPrice } from '@/lib/utils';

interface CheckoutFormProps {
  onSubmit: (data: any) => void;
  isProcessing: boolean;
  total: number;
}

export function CheckoutForm({ onSubmit, isProcessing, total }: CheckoutFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    country: 'US',
    city: '',
    address: '',
    postalCode: '',
    saveInfo: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: type === 'checkbox' ? (event.target as HTMLInputElement).checked : value,
    }));
    if (errors[name]) setErrors((current) => ({ ...current, [name]: '' }));
  };

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) nextErrors.email = 'Enter a valid email';
    if (!formData.firstName) nextErrors.firstName = 'First name is required';
    if (!formData.lastName) nextErrors.lastName = 'Last name is required';
    if (!formData.country) nextErrors.country = 'Country is required';
    if (!formData.city) nextErrors.city = 'City is required';
    if (!formData.address) nextErrors.address = 'Address is required';
    if (!formData.postalCode) nextErrors.postalCode = 'Postal code is required';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (validateForm()) onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8" noValidate>
      <section>
        <h2 className="font-serif text-xl font-medium mb-6">Contact Information</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Email" name="email" type="email" value={formData.email} onChange={handleChange} error={errors.email} autoComplete="email" />
          <Field label="Phone (Optional)" name="phone" type="tel" value={formData.phone} onChange={handleChange} autoComplete="tel" />
        </div>
      </section>

      <section>
        <h2 className="font-serif text-xl font-medium mb-6">Shipping Address</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} error={errors.firstName} autoComplete="given-name" />
          <Field label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} error={errors.lastName} autoComplete="family-name" />
        </div>
        <div className="mt-4">
          <Field label="Address" name="address" value={formData.address} onChange={handleChange} error={errors.address} autoComplete="street-address" />
        </div>
        <div className="grid sm:grid-cols-3 gap-4 mt-4">
          <Field label="City" name="city" value={formData.city} onChange={handleChange} error={errors.city} autoComplete="address-level2" />
          <div>
            <label htmlFor="country" className="label">Country</label>
            <select id="country" name="country" value={formData.country} onChange={handleChange} className={`select ${errors.country ? 'input-error' : ''}`} autoComplete="country">
              <option value="US">United States</option>
              <option value="CA">Canada</option>
              <option value="GB">United Kingdom</option>
              <option value="AU">Australia</option>
              <option value="DE">Germany</option>
              <option value="FR">France</option>
              <option value="IT">Italy</option>
              <option value="ES">Spain</option>
            </select>
            {errors.country && <p className="error-message">{errors.country}</p>}
          </div>
          <Field label="Postal Code" name="postalCode" value={formData.postalCode} onChange={handleChange} error={errors.postalCode} autoComplete="postal-code" />
        </div>
        <label className="checkbox mt-4">
          <input type="checkbox" name="saveInfo" checked={formData.saveInfo} onChange={handleChange} />
          <span className="checkbox-mark" />
          <span>Save this information for next time</span>
        </label>
      </section>

      <section>
        <h2 className="font-serif text-xl font-medium mb-4">Payment</h2>
        <div className="p-4 bg-gray-50">
          <ExpressCheckoutElement
            onConfirm={() => {
              if (validateForm()) onSubmit(formData);
            }}
          />
          <p className="my-4 text-center text-xs uppercase text-gray-500">Or pay another way</p>
          <PaymentElement options={{ layout: 'tabs' }} />
          <p className="text-xs text-gray-500 mt-3">
            Apple Pay appears on supported devices. Bank account payment availability depends on your location and Stripe account settings.
          </p>
        </div>
      </section>

      <motion.button
        type="submit"
        disabled={isProcessing}
        className="btn btn-primary btn-lg btn-full"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        {isProcessing ? 'Processing...' : `Pay ${formatPrice(total)}`}
      </motion.button>

      <p className="text-xs text-gray-500 text-center">
        By placing your order, you agree to our <a href="/terms" className="underline hover:text-black">Terms of Service</a> and <a href="/privacy" className="underline hover:text-black">Privacy Policy</a>.
      </p>
    </form>
  );
}

function Field({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="label">{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        className={`input ${error ? 'input-error' : ''}`}
        autoComplete={autoComplete}
        required={name !== 'phone'}
      />
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}