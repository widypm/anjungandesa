// app/layout.tsx
import "./globals.css"; // contoh global CSS import
import FloatingAdminToggle from "./components/FloatingAdminToggle";

export const metadata = {
  title: "Solusi Apps",
  description: "Website solusi apps",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>
        {/* Global header / footer bisa disini */}
        {children}
        <FloatingAdminToggle />
      </body>
    </html>
  );
}
