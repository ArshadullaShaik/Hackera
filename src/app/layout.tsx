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
  title: "GLOBAL HACK // The Hackathon Index",
  description:
    "We scrape the web to find the best hackathons, so you don't have to. Every event, every prize, one dashboard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" class={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body>
        <header class="navbar">
          <div class="nav-container">
            <a href="#" class="brand-logo">
              GLOBAL HACK
            </a>

            <nav class="nav-links">
              <a href="#" class="nav-item active">
                Explore
              </a>
              <a href="#about" class="nav-item">
                Host
              </a>
              <a href="#community" class="nav-item">
                Community
              </a>
              <a href="#help" class="nav-item">
                Help
              </a>
            </nav>

            <div class="nav-actions">
              <button class="btn btn-outline">SIGN IN</button>
              <button class="btn btn-dark">JOIN NOW</button>
            </div>
          </div>
        </header>

        <main class="main-content">{children}</main>

        <footer class="footer">
          <div class="footer-container">
            <div class="footer-brand">
              <span class="footer-logo">GLOBAL HACK</span>
            </div>

            <nav class="footer-nav">
              <a href="#">TERMS</a>
              <a href="#">PRIVACY</a>
              <a href="#">LANGUAGE</a>
              <a href="#">REGION</a>
            </nav>

            <div class="footer-copyright">
              © 2026 GLOBAL HACKATHON. ALL RIGHTS RESERVED.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
