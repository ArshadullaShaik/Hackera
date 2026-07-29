import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
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
  title: "HACKERA // The Hackathon Index",
  description:
    "We scrape the web to find the best hackathons, so you don't have to. Every event, every prize, one dashboard.",
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
            <a href="#" className="brand-logo">
              HACKERA
            </a>

            <nav className="nav-links">
              <a href="#" className="nav-item active">
                Explore
              </a>

              <a
                href="https://www.reddit.com/r/Hackera/s/ufHNalBCJd"
                target="_blank"
                rel="noopener noreferrer"
                className="nav-item"
              >
                Community
              </a>
              <a href="#help" className="nav-item">
                Help
              </a>
            </nav>

            <div className="nav-actions">
              <button className="btn btn-outline">SIGN IN</button>
              <button className="btn btn-dark">JOIN NOW</button>
            </div>
          </div>
        </header>

        <main className="main-content">{children}</main>

        <footer className="footer">
          <div className="footer-container">
            <div className="footer-brand">
              <span className="footer-logo">HACKERA</span>
            </div>

            <nav className="footer-nav">
              <a href="#">TERMS</a>
              <a href="#">PRIVACY</a>
              <a href="#">LANGUAGE</a>
              <a href="#">REGION</a>
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
