import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header/header';

export default function UnauthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground font-mono">
      <Header />
      {children}
      <Footer />
    </div>
  );
}
