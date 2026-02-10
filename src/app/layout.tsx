import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import "./globals.css";

const quicksand = Quicksand({
  subsets: ["latin"],
  variable: "--font-quicksand",
});

export const metadata: Metadata = {
  title: "Dunia Hewan Ceria",
  description: "Aplikasi edukasi anak interaktif",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${quicksand.variable} font-sans antialiased overflow-hidden`}
      >
        {children}
      </body>
    </html>
  );
}
