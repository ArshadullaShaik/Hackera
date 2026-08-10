import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms & Conditions // HACKERA",
  description: "Terms and Conditions of Service for HACKERA — The Hackathon Index.",
};

export default function TermsPage() {
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
            LEGAL DOCUMENT
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
          TERMS &amp; CONDITIONS
        </h1>

        <p style={{ fontFamily: "var(--font-body)", fontSize: "16px", fontWeight: 500 }}>
          Please read these terms carefully before using HACKERA. By accessing or using our platform,
          you agree to be bound by these terms.
        </p>
      </div>

      {/* Main Content Sections */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "28px",
        }}
      >
        {/* Section 1 */}
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
            Acceptance of Terms
          </h2>
          <p style={{ color: "var(--ink)", lineHeight: 1.6 }}>
            Welcome to <strong>HACKERA</strong> (&quot;the Service&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). By accessing our website, browsing our hackathon directory, or utilizing our APIs, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions and our Privacy Policy. If you do not agree with any part of these terms, you must discontinue use of the Service immediately.
          </p>
        </article>

        {/* Section 2 */}
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
            Service Description &amp; Aggregation Disclaimer
          </h2>
          <p style={{ color: "var(--ink)", lineHeight: 1.6, marginBottom: "12px" }}>
            HACKERA operates as a multi-source hackathon search index and aggregator. We collect, normalize, and display publicly available hackathon listings from third-party platforms (including Devpost, Devfolio, Luma, MLH, Unstop, HackerEarth, HackClub, and others).
          </p>
          <ul
            style={{
              paddingLeft: "24px",
              lineHeight: 1.6,
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <li>
              <strong>Not an Organizer:</strong> Unless explicitly stated otherwise, HACKERA does not organize, sponsor, manage, or host the hackathons listed on our platform.
            </li>
            <li>
              <strong>Information Accuracy:</strong> Event details (such as dates, prize pools, eligibility, and rules) are provided by third-party sources. While we strive to maintain accurate and up-to-date data, HACKERA makes no guarantees regarding the completeness, accuracy, or timeliness of any event listing.
            </li>
            <li>
              <strong>Verification:</strong> Participants are strongly encouraged to verify all event details directly on the official host platform before registering or submitting projects.
            </li>
          </ul>
        </article>

        {/* Section 3 */}
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
            Third-Party Links &amp; External Platforms
          </h2>
          <p style={{ color: "var(--ink)", lineHeight: 1.6 }}>
            Our Service contains outbound links to external third-party websites and platforms. Clicking these links will navigate you away from HACKERA. We have no control over, and assume no responsibility for, the content, privacy policies, terms, or practices of any third-party websites. Accessing external links is strictly at your own risk.
          </p>
        </article>

        {/* Section 4 */}
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
              04
            </span>
            Acceptable Use Policy
          </h2>
          <p style={{ color: "var(--ink)", lineHeight: 1.6, marginBottom: "12px" }}>
            When accessing HACKERA, you agree not to engage in any of the following prohibited activities:
          </p>
          <ul
            style={{
              paddingLeft: "24px",
              lineHeight: 1.6,
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <li>Attempting to overload, DDoS, or disrupt our servers, database, or API infrastructure.</li>
            <li>Using automated bots or web scrapers to aggressively extract database records without written consent or rate-limit adherence.</li>
            <li>Bypassing rate limits, security measures, or authentication checks.</li>
            <li>Misrepresenting your identity or using the Service for unlawful purposes.</li>
          </ul>
        </article>

        {/* Section 5 */}
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
              05
            </span>
            Limitation of Liability
          </h2>
          <p style={{ color: "var(--ink)", lineHeight: 1.6 }}>
            To the maximum extent permitted by law, HACKERA, its creators, and contributors shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from your use of (or inability to use) the Service, including but not limited to cancelled hackathons, unpaid prize money by third-party organizers, loss of data, or technical downtime.
          </p>
        </article>

        {/* Section 6 */}
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
              06
            </span>
            Modifications &amp; Contact
          </h2>
          <p style={{ color: "var(--ink)", lineHeight: 1.6, marginBottom: "16px" }}>
            We reserve the right to modify or replace these Terms &amp; Conditions at any time. Changes will take effect immediately upon posting to this page. Continued use of HACKERA following any changes constitutes acceptance of the new terms.
          </p>

          <div
            style={{
              backgroundColor: "#fce7f3",
              border: "var(--border-thick)",
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div>
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: "14px",
                  textTransform: "uppercase",
                  color: "var(--ink)",
                }}
              >
                Questions or Concerns?
              </span>
              <p style={{ fontSize: "14px", color: "var(--ink-muted)" }}>
                Reach out to our team or join our community discussion on Telegram.
              </p>
            </div>

            <a
              href="https://t.me/Hackeraoffical"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-purple"
              style={{ fontSize: "13px", padding: "8px 16px" }}
            >
              JOIN COMMUNITY
            </a>
          </div>
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
