import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy // HACKERA",
  description: "Privacy Policy for HACKERA — The Hackathon Index.",
};

export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: "860px", margin: "0 auto", padding: "20px 0" }}>
      {/* Header Banner */}
      <div
        style={{
          backgroundColor: "var(--secondary)",
          border: "var(--border-heavy)",
          boxShadow: "var(--shadow-lg)",
          padding: "32px",
          marginBottom: "40px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "12px",
              letterSpacing: "0.05em",
              backgroundColor: "var(--ink)",
              color: "var(--white)",
              padding: "4px 10px",
              textTransform: "uppercase",
            }}
          >
            PRIVACY &amp; DATA
          </span>
          <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--ink-muted)" }}>
            Effective Date: August 9, 2026
          </span>
        </div>

        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "42px",
            fontWeight: 700,
            lineHeight: 1.1,
            textTransform: "uppercase",
            marginBottom: "12px",
          }}
        >
          PRIVACY POLICY
        </h1>

        <p style={{ fontFamily: "var(--font-body)", fontSize: "16px", fontWeight: 500 }}>
          HACKERA values your privacy. Learn how we handle data, cookies, and aggregated hackathon information.
        </p>
      </div>

      {/* Main Content Sections */}
      <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
        <article
          style={{
            backgroundColor: "var(--card-bg)",
            border: "var(--border-thick)",
            boxShadow: "var(--shadow-md)",
            padding: "28px",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "22px",
              fontWeight: 700,
              textTransform: "uppercase",
              marginBottom: "14px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span
              style={{
                backgroundColor: "var(--primary)",
                color: "var(--white)",
                padding: "2px 10px",
                fontSize: "16px",
              }}
            >
              01
            </span>
            Information We Collect
          </h2>
          <p style={{ color: "var(--ink)", lineHeight: 1.6, marginBottom: "12px" }}>
            HACKERA is designed with privacy in mind. We do not require account registration to browse our hackathon index.
          </p>
          <ul style={{ paddingLeft: "24px", lineHeight: 1.6, display: "flex", flexDirection: "column", gap: "8px" }}>
            <li><strong>Aggregated Hackathon Data:</strong> Publicly available event information collected from partner sites and public APIs.</li>
            <li><strong>Technical &amp; Analytics Data:</strong> Standard server access logs (IP address, browser user agent, referral page) collected to prevent DDoS and monitor system health.</li>
          </ul>
        </article>

        <article
          style={{
            backgroundColor: "var(--card-bg)",
            border: "var(--border-thick)",
            boxShadow: "var(--shadow-md)",
            padding: "28px",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "22px",
              fontWeight: 700,
              textTransform: "uppercase",
              marginBottom: "14px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span
              style={{
                backgroundColor: "var(--primary)",
                color: "var(--white)",
                padding: "2px 10px",
                fontSize: "16px",
              }}
            >
              02
            </span>
            Cookies &amp; Local Storage
          </h2>
          <p style={{ color: "var(--ink)", lineHeight: 1.6 }}>
            We use minimal local storage / session storage solely to preserve your active search filters, view preferences, and page state. We do not use invasive cross-site tracking cookies.
          </p>
        </article>

        <article
          style={{
            backgroundColor: "var(--card-bg)",
            border: "var(--border-thick)",
            boxShadow: "var(--shadow-md)",
            padding: "28px",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "22px",
              fontWeight: 700,
              textTransform: "uppercase",
              marginBottom: "14px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span
              style={{
                backgroundColor: "var(--primary)",
                color: "var(--white)",
                padding: "2px 10px",
                fontSize: "16px",
              }}
            >
              03
            </span>
            Third-Party Services
          </h2>
          <p style={{ color: "var(--ink)", lineHeight: 1.6 }}>
            When you click on a hackathon listing to view or register on Devpost, Devfolio, Luma, MLH, Unstop, HackerEarth, or HackClub, you are governed by that third party&apos;s respective privacy policy. We recommend reviewing their policies before providing personal data or submitting entries.
          </p>
        </article>
      </div>

      {/* Back to Home Button */}
      <div style={{ marginTop: "40px", textAlign: "center" }}>
        <Link href="/" className="btn btn-dark" style={{ padding: "12px 28px" }}>
          ← BACK TO HACKATHONS
        </Link>
      </div>
    </div>
  );
}
