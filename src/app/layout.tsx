import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";
import { Providers } from "./providers";
import { ThemeProvider } from "next-themes";
import Ai from "@/components/ai/Ai";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "My blog",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <ThemeProvider attribute="class">
            <Navbar />
            {children}
            {/* <Ai /> */}
            <Footer />
          </ThemeProvider>
        </Providers>
      </body>

    </html>
  );
}
