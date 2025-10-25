import { fetchQuery } from 'convex/nextjs';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header/header';
import { api } from '@/convex/_generated/api';
import type { CurrentUser } from '@/convex/types/convex';
import { getToken } from '@/lib/server/auth';

export default async function ProtectedLayout(props: LayoutProps<'/'>) {
  const { children } = props;
  await headers();

  const token = await getToken();
  const user: CurrentUser | null = token
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
