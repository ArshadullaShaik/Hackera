import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Link from "next/link";
export const metadata = {
    title: "Help & FAQ // HACKERA",
    description: "Frequently asked questions and support for HACKERA.",
};
export default function HelpPage() {
    const faqs = [
        {
            q: "What is HACKERA?",
            a: "HACKERA is an automated hackathon aggregator that indexes upcoming hackathons across Devfolio, Devpost, Luma, MLH, Unstop, HackerEarth, and Hack Club into a single dashboard.",
        },
        {
            q: "How often are hackathons updated?",
            a: "Our multi-platform scrapers run continuously to fetch live events, updated prize pools, and registration deadlines.",
        },
        {
            q: "Is HACKERA free?",
            a: "Yes! HACKERA is 100% free for hackers and event organizers.",
        },
        {
            q: "How do I join the community?",
            a: "You can visit our official Reddit community at r/Hackera to connect with fellow hackers, find teammates, and share feedback.",
        },
    ];
    return (_jsxs("div", { style: { maxWidth: "800px", margin: "0 auto", padding: "40px 20px" }, children: [_jsx("h1", { style: {
                    fontFamily: "var(--font-display)",
                    fontSize: "2.5rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    borderBottom: "4px solid var(--ink)",
                    paddingBottom: "16px",
                    marginBottom: "32px",
                }, children: "HELP & FAQ" }), _jsx("div", { style: { display: "flex", flexDirection: "column", gap: "24px" }, children: faqs.map((faq, idx) => (_jsxs("div", { style: {
                        background: "#fff",
                        border: "3px solid #000",
                        boxShadow: "4px 4px 0px #000",
                        padding: "24px",
                    }, children: [_jsx("h2", { style: {
                                fontFamily: "var(--font-display)",
                                fontSize: "1.25rem",
                                fontWeight: 700,
                                marginBottom: "12px",
                            }, children: faq.q }), _jsx("p", { style: { lineHeight: 1.6, color: "#333" }, children: faq.a })] }, idx))) }), _jsxs("div", { style: {
                    marginTop: "48px",
                    padding: "24px",
                    background: "#b2f746",
                    border: "3px solid #000",
                    boxShadow: "4px 4px 0px #000",
                    textAlign: "center",
                }, children: [_jsx("h3", { style: { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.2rem", marginBottom: "8px" }, children: "STILL HAVE QUESTIONS?" }), _jsx("p", { style: { marginBottom: "16px" }, children: "Join our community or check our terms." }), _jsxs("div", { style: { display: "flex", gap: "16px", justifyContent: "center" }, children: [_jsx("a", { href: "https://www.reddit.com/r/Hackera", target: "_blank", rel: "noopener noreferrer", className: "btn btn-dark", style: { textDecoration: "none" }, children: "JOIN COMMUNITY" }), _jsx(Link, { href: "/terms", className: "btn btn-outline", style: { textDecoration: "none" }, children: "TERMS & CONDITIONS" })] })] })] }));
}
//# sourceMappingURL=page.js.map