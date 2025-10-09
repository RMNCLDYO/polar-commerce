import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header/header';
import { redirect } from 'next/navigation';
import { fetchQuery } from 'convex/nextjs';
import { api } from '@/convex/_generated/api';
import { getToken } from '@/lib/server/auth';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side auth check using Better Auth token
  const token = await getToken();
  const user = token
    ? await fetchQuery(api.auth.auth.getCurrentUser, {}, { token })
    : null;

  if (!user) {
    redirect('/sign-in');
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-mono">
      <Header />
      {children}
      <Footer />
    </div>
  );
}
