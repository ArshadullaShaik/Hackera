import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
export const metadata = {
    title: "HACKERA // The Hackathon Index",
    description: "We scrape the web to find the best hackathons, so you don't have to. Every event, every prize, one dashboard.",
};
export default function RootLayout({ children, }) {
    return (_jsx("html", { lang: "en", className: `${inter.variable} ${spaceGrotesk.variable}`, children: _jsxs("body", { children: [_jsx("header", { className: "navbar", children: _jsxs("div", { className: "nav-container", children: [_jsx(Link, { href: "/", className: "brand-logo", children: "HACKERA" }), _jsxs("nav", { className: "nav-links", children: [_jsx(Link, { href: "/", className: "nav-item active", children: "Explore" }), _jsx("a", { href: "https://www.reddit.com/r/Hackera", target: "_blank", rel: "noopener noreferrer", className: "nav-item", children: "Community" }), _jsx(Link, { href: "/help", className: "nav-item", children: "Help" })] })] }) }), _jsx("main", { className: "main-content", children: children }), _jsx("footer", { className: "footer", children: _jsxs("div", { className: "footer-container", children: [_jsx("div", { className: "footer-brand", children: _jsx(Link, { href: "/", className: "footer-logo", children: "HACKERA" }) }), _jsxs("nav", { className: "footer-nav", children: [_jsx(Link, { href: "/terms", children: "TERMS" }), _jsx("span", { style: { fontWeight: 700, opacity: 0.6 }, children: "&" }), _jsx(Link, { href: "/privacy", children: "PRIVACY" })] }), _jsx("div", { className: "footer-copyright", children: "\u00A9 2026 HACKERA. ALL RIGHTS RESERVED." })] }) })] }) }));
}
//# sourceMappingURL=layout.js.map