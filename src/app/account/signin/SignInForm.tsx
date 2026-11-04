'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

type AuthMode = 'signin' | 'register';

export function SignInForm() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          email,
          password,
          ...(mode === 'register' ? { firstName, lastName } : {}),
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Unable to sign in');
      }

      const returnTo = new URLSearchParams(window.location.search).get('returnTo');
      const destination = returnTo?.startsWith('/') && !returnTo.startsWith('//')
        ? returnTo
        : '/shop';
      router.replace(destination);
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="brand-mark text-3xl" aria-label="Fustana home">Fustana</Link>
          <p className="mt-3 text-sm text-gray-600">Your wardrobe, all in one place.</p>
        </div>

        <section className="border border-gray-200 bg-white p-7 sm:p-9">
          <div className="flex border-b border-gray-200 mb-7" role="tablist" aria-label="Account access">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'signin'}
              onClick={() => { setMode('signin'); setError(''); }}
              className={`flex-1 pb-3 text-sm font-medium ${mode === 'signin' ? 'border-b-2 border-black text-black' : 'text-gray-500'}`}
            >
              Sign in
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'register'}
              onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 pb-3 text-sm font-medium ${mode === 'register' ? 'border-b-2 border-black text-black' : 'text-gray-500'}`}
            >
              Create account
            </button>
          </div>

          <h1 className="font-serif text-2xl font-medium mb-6">
            {mode === 'signin' ? 'Welcome back' : 'Join Fustana'}
          </h1>

          {error && <p className="mb-5 border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'register' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="label">First name</label>
                  <input id="firstName" value={firstName} onChange={(event) => setFirstName(event.target.value)} className="input" autoComplete="given-name" required disabled={isLoading} />
                </div>
                <div>
                  <label htmlFor="lastName" className="label">Last name</label>
                  <input id="lastName" value={lastName} onChange={(event) => setLastName(event.target.value)} className="input" autoComplete="family-name" required disabled={isLoading} />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="label">Email address</label>
              <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="input" autoComplete="email" required disabled={isLoading} />
            </div>

            <div>
              <label htmlFor="password" className="label">Password</label>
              <input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="input" autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} minLength={mode === 'register' ? 8 : 1} required disabled={isLoading} />
              {mode === 'register' && <p className="mt-1 text-xs text-gray-500">Use at least 8 characters.</p>}
            </div>

            <button type="submit" disabled={isLoading} className="btn btn-primary btn-full btn-lg">
              {isLoading ? 'Please wait...' : mode === 'signin' ? 'Sign in' : 'Create account'}
            </button>
          </form>
        </section>

        <p className="mt-6 text-center text-sm text-gray-500">
          <Link href="/shop" className="underline hover:text-black">Continue shopping</Link>
        </p>
      </div>
    </main>
  );
}