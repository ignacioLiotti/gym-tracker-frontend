import Footer from './components/Footer';
import Header from './components/Header';
import './globals.css';
import { ReactNode } from 'react';
import { Toaster } from "@/components/ui/toaster"

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
        {/* <Footer /> */}
        <Toaster />
      </body>
    </html>
  );
}
