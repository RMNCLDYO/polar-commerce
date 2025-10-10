'use client';

import { Link } from '@/components/link';
import SignIn from './SignIn';

export default function SignInPage() {
  return (
    <div className="w-full flex items-center justify-center p-4 py-16">
      <div className="w-full max-w-md">
        <SignIn />
        <p className="text-center mt-4 text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link
            href="/sign-up"
            prefetchStrategy="always"
            className="text-foreground hover:underline font-medium"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
