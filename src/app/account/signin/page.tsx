import type { Metadata } from 'next';
import { SignInForm } from './SignInForm';

export const metadata: Metadata = {
  title: 'Sign In',
  robots: 'noindex, nofollow',
};

export default function SignInPage() {
  return <SignInForm />;
}