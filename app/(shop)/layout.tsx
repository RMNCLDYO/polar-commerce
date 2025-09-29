import { Toaster } from 'sonner';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground font-mono">
      <Header />
      {children}
      <Footer />
      <Toaster position="bottom-right" />
    </div>
  );
}
