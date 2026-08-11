import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "HACKERA | Discover 300+ Global Hackathons in Real-Time",
  description:
    "We scrape the web to find the best hackathons, so you don't have to. Every event, every prize, one dashboard.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body>
        <header className="navbar">
          <div className="nav-container">
            <Link href="/" className="brand-logo">
              HACKERA
            </Link>

            <nav className="nav-links">
              <Link href="/" className="nav-item active">
                Explore
              </Link>

              <a
                href="https://t.me/Hackeraoffical"
                className="nav-item"
              >
                Community
              </a>
              <Link href="/terms" className="nav-item">
                Help
              </Link>
            </nav>


          </div>
        </header>
        <main className="main-content">{children}</main>

        <footer className="footer">
          <div className="footer-container">
            <div className="footer-brand">
              <Link href="/" className="footer-logo">HACKERA</Link>
            </div>

            <nav className="footer-nav">
              <Link href="/terms">TERMS</Link>
              <span style={{ fontWeight: 700, opacity: 0.6 }}>&amp;</span>
              <Link href="/privacy">PRIVACY</Link>
            </nav>

            <div className="footer-copyright">
              © 2026 HACKERA. ALL RIGHTS RESERVED.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
