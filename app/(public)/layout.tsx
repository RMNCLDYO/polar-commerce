import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header/header';

export default function UnauthLayout(props: LayoutProps<'/'>) {
  const { children } = props;
  return (
    <div className="min-h-screen bg-background text-foreground font-mono">
      <Header />
      {children}
      <Footer />
    </div>
  );
}
