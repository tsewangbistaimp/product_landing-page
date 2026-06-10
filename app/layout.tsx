import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TsewangBista Shoes",
  description: "Comfortable, durable, and stylish shoes for everyday wear with Cash on Delivery."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
