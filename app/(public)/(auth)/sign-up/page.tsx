'use client';

import SignUp from './SignUp';
import { Link } from '@/components/link';

export default function SignUpPage() {
  return (
    <div className="w-full flex items-center justify-center p-4 py-16">
      <div className="w-full max-w-md">
        <SignUp />
        <p className="text-center mt-4 text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link
            href="/sign-in"
            prefetchStrategy="always"
            className="text-foreground hover:underline font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
