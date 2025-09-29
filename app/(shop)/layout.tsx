import { Toaster } from "sonner";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <Toaster position="bottom-right" />
    </>
  );
}
