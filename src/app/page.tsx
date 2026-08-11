"use client";

import { useState, useEffect, useCallback, ChangeEvent } from "react";
import { formatCardDate, resolvePrizeText, resolveTrackBadges, resolveEventDateText } from "../core/card-utils";

interface HackathonItem {
  id: string;
  sourceId: string;
  sourcePlatform: string;
  title: string;
  description?: string;
  startsAt: string;
  endsAt?: string;
  registrationStartsAt?: string;
  registrationEndsAt?: string;
  locationType: "in-person" | "online" | "hybrid";
  locationName?: string;
  canonicalUrl: string;
  imageUrl?: string;
  rawSourcePayload?: any;
}

export default function Home() {
  const [hackathons, setHackathons] = useState<HackathonItem[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [locationType, setLocationType] = useState("");
  const [platform, setPlatform] = useState("");

  const limit = 12;

  const fetchHackathons = useCallback(
    async (targetPage: number, isAppend: boolean = false) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: targetPage.toString(),
          limit: limit.toString(),
        });

        if (search.trim()) params.append("search", search.trim());
        if (locationType) params.append("locationType", locationType);
        if (platform) params.append("platform", platform);

        const res = await fetch(`/api/hackathons?${params.toString()}`);
        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          throw new Error(errJson.error?.message || "Failed to fetch hackathons");
        }

        const json = await res.json();
        const data: HackathonItem[] = json.data || [];
        const meta = json.meta || { total: 0, totalPages: 1 };

        setTotal(meta.total);
        setTotalPages(meta.totalPages);

        if (isAppend) {
          setHackathons((prev) => [...prev, ...data]);
        } else {
          setHackathons(data);
        }
      } catch (err) {
        console.error("Error fetching hackathons:", err);
      } finally {
        setLoading(false);
      }
    },
    [search, locationType, platform]
  );

  useEffect(() => {
    setPage(1);
    fetchHackathons(1, false);
  }, [search, locationType, platform, fetchHackathons]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchHackathons(nextPage, true);
  };

  const clearFilter = (type: "search" | "location" | "platform") => {
    if (type === "search") setSearch("");
    if (type === "location") setLocationType("");
    if (type === "platform") setPlatform("");
  };

  return (
    <>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-text">
          <h1 className="hero-title">
            THE HACKATHON <span className="highlight-purple">INDEX.</span>
          </h1>
          <div className="hero-badge-lime">
            <p>
              We scrape the web to find the best hackathons, so you don&apos;t
              have to. Every event, every prize, one dashboard.
            </p>
          </div>
        </div>

        {/* Doodle Frame Illustration */}
        <div className="doodle-frame">
          <svg
            viewBox="0 0 450 220"
            className="doodle-svg"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="5"
              y="5"
              width="440"
              height="210"
              rx="8"
              fill="#ffffff"
              stroke="#000000"
              strokeWidth="3"
            />
            <rect
              x="15"
              y="15"
              width="420"
              height="190"
              fill="#fdfbf7"
              stroke="#000000"
              strokeWidth="2"
            />
            <path
              d="M 30,130 Q 80,40 180,90 T 350,50 T 420,160"
              fill="none"
              stroke="#e0e7ff"
              strokeWidth="24"
              opacity="0.6"
            />
            <path
              d="M 50,180 Q 120,80 250,150 T 400,90"
              fill="none"
              stroke="#fef08a"
              strokeWidth="20"
              opacity="0.7"
            />

            <g transform="translate(30, 30)">
              <rect x="0" y="0" width="60" height="40" rx="4" fill="#000000" />
              <rect x="4" y="4" width="52" height="32" rx="2" fill="#8455ef" />
              <path d="M -10,40 L 70,40 L 60,48 L -0,48 Z" fill="#000000" />
            </g>

            <g transform="translate(140, 25)">
              <rect
                x="0"
                y="0"
                width="70"
                height="45"
                rx="6"
                fill="#b2f746"
                stroke="#000000"
                strokeWidth="3"
              />
              <text
                x="35"
                y="32"
                fontFamily="Space Grotesk"
                fontWeight="700"
                fontSize="28"
                textAnchor="middle"
                fill="#000000"
              >
                &lt;/&gt;
              </text>
            </g>

            <g transform="translate(100, 85)">
              <rect
                x="0"
                y="0"
                width="240"
                height="44"
                rx="4"
                fill="#ffffff"
                stroke="#000000"
                strokeWidth="3"
                filter="drop-shadow(3px 3px 0px #000)"
              />
              <text
                x="120"
                y="28"
                fontFamily="Space Grotesk"
                fontWeight="700"
                fontSize="20"
                letterSpacing="1"
                textAnchor="middle"
                fill="#000000"
              >
                GLOBAL HACKATHON
              </text>
            </g>

            <g transform="translate(350, 25)">
              <circle
                cx="25"
                cy="25"
                r="22"
                fill="#ec4899"
                stroke="#000000"
                strokeWidth="3"
              />
              <path
                d="M 3,25 H 47 M 25,3 V 47 M 8,14 Q 25,25 8,36 M 42,14 Q 25,25 42,36"
                stroke="#000000"
                strokeWidth="2"
                fill="none"
              />
            </g>

            <g transform="translate(340, 125)">
              <rect x="0" y="0" width="60" height="40" rx="4" fill="#000000" />
              <rect x="4" y="4" width="52" height="32" rx="2" fill="#b2f746" />
              <path d="M -10,40 L 70,40 L 60,48 L -0,48 Z" fill="#000000" />
            </g>

            <g transform="translate(60, 135)">
              <rect
                x="0"
                y="0"
                width="55"
                height="36"
                rx="4"
                fill="#ec4899"
                stroke="#000000"
                strokeWidth="2"
              />
              <text
                x="27"
                y="25"
                fontFamily="Space Grotesk"
                fontWeight="700"
                fontSize="20"
                textAnchor="middle"
                fill="#ffffff"
              >
                &lt;/&gt;
              </text>
            </g>

            <path
              d="M 110,20 L 114,28 L 122,30 L 115,36 L 118,44 L 110,38 L 102,44 L 105,36 L 98,30 L 106,28 Z"
              fill="#ff761c"
              stroke="#000000"
              strokeWidth="1.5"
            />
            <path
              d="M 310,25 L 313,31 L 320,32 L 315,37 L 317,43 L 310,39 L 303,43 L 305,37 L 300,32 L 307,31 Z"
              fill="#b2f746"
              stroke="#000000"
              strokeWidth="1.5"
            />
            <path
              d="M 230,140 Q 260,170 300,150"
              fill="none"
              stroke="#000000"
              strokeWidth="3"
              strokeDasharray="6,4"
            />
            <path
              d="M 295,142 L 305,150 L 295,158"
              fill="none"
              stroke="#000000"
              strokeWidth="3"
            />
          </svg>
        </div>
      </section>

      {/* Filter Section */}
      <section className="filter-section">
        <div className="status-bar-wrapper">
          <span className="status-badge">
            ⚡ {platform
              ? `${total.toLocaleString()} ${platform.toUpperCase()} HACKATHONS`
              : total > 0 ? `${total.toLocaleString()} HACKATHONS INDEXED` : "LIVE AGGREGATED FEED"}
          </span>
        </div>

        <div className="filter-card">
          <div className="filter-form">
            <div className="input-group search-input-group">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search aggregated events, themes, or tech..."
                value={search}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              />
            </div>

            <div className="select-group">
              <select
                value={locationType}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setLocationType(e.target.value)}
              >
                <option value="">LOCATION: ALL</option>
                <option value="online">ONLINE</option>
                <option value="in-person">IN-PERSON</option>
                <option value="hybrid">HYBRID</option>
              </select>
            </div>

            <div className="select-group">
              <select
                value={platform}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setPlatform(e.target.value)}
              >
                <option value="">PLATFORM: ALL</option>
                <option value="luma">LUMA</option>
                <option value="devfolio">DEVFOLIO</option>
                <option value="mlh">MLH</option>
                <option value="unstop">UNSTOP</option>
                <option value="devpost">DEVPOST</option>
                <option value="hackerearth">HACKEREARTH</option>
                <option value="hackclub">HACK CLUB</option>
              </select>
            </div>

            <button className="btn btn-purple" onClick={() => fetchHackathons(1, false)}>
              FILTER
            </button>
          </div>
        </div>
      </section>

      {/* Active Tags */}
      {(search || locationType || platform) && (
        <div className="active-tags-bar">
          {search && (
            <span className="active-tag-chip" onClick={() => clearFilter("search")}>
              Search: &quot;{search}&quot; ✖
            </span>
          )}
          {locationType && (
            <span className="active-tag-chip" onClick={() => clearFilter("location")}>
              Location: {locationType.toUpperCase()} ✖
            </span>
          )}
          {platform && (
            <span className="active-tag-chip" onClick={() => clearFilter("platform")}>
              Platform: {platform.toUpperCase()} ✖
            </span>
          )}
        </div>
      )}

      {/* Hackathons Grid */}
      <section className="grid-section">
        <div className="hackathons-grid">
          {loading && hackathons.length === 0 ? (
            <>
              <div className="card skeleton-card"></div>
              <div className="card skeleton-card"></div>
              <div className="card skeleton-card"></div>
            </>
          ) : hackathons.length === 0 ? (
            <div className="empty-state">
              <h3>NO HACKATHONS FOUND</h3>
              <p>
                Try clearing your search query or selecting a different location or platform filter.
              </p>
            </div>
          ) : (
            hackathons.map((item) => {
              const locType = (item.locationType || "online").toLowerCase();
              let locBadgeClass = "badge-location-online";
              let locBadgeText = "ONLINE";

              if (locType === "in-person") {
                locBadgeClass = "badge-location-person";
                locBadgeText = item.locationName
                  ? `📍 ${item.locationName.split(",")[0].toUpperCase()}`
                  : "IN-PERSON";
              } else if (locType === "hybrid") {
                locBadgeClass = "badge-location-hybrid";
                locBadgeText = "HYBRID";
              }

              const platformName = (item.sourcePlatform || "OTHER").toUpperCase();
              const eventDateText = resolveEventDateText(item);
              const registrationStartsFormatted = formatCardDate(item.registrationStartsAt);
              const registrationEndsFormatted = formatCardDate(item.registrationEndsAt);
              const prizeText = resolvePrizeText(item);
              const rawDesc = item.description || "";

              // Extract or Detect Tracks
              let trackBadges: string[] = [];
              const matchTrack = rawDesc.match(/Tracks:\s*([^\]|]+)/i);
              if (matchTrack) {
                trackBadges = matchTrack[1]
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean);
              } else {
                const combined = `${item.title} ${rawDesc}`.toLowerCase();
                if (/\b(game|gaming|unity|unreal|roblox|arcade|gamedev)\b/i.test(combined)) trackBadges.push("Game Dev");
                if (/\b(ai|ml|machine learning|artificial intelligence|llm|genai|gpt)\b/i.test(combined)) trackBadges.push("AI / ML");
                if (/\b(web3|crypto|blockchain|ethereum|solana|defi)\b/i.test(combined)) trackBadges.push("Web3");
                if (/\b(mobile|ios|android|flutter)\b/i.test(combined)) trackBadges.push("Mobile");
              }

              const trackIcons: Record<string, string> = {
                "Game Dev": "🎮",
                "AI / ML": "🤖",
                "Web3 / Blockchain": "⛓️",
                "Web3": "⛓️",
                "Mobile": "📱",
                "Cybersecurity": "🛡️",
                "Fintech": "💳",
                "Healthtech": "🩺",
              };

              return (
                <article key={item.id} className="card">
                  <div className="card-header">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="card-img"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                          const next = (e.target as HTMLElement).nextElementSibling;
                          if (next) (next as HTMLElement).style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div
                      className="card-img-placeholder"
                      style={{ display: item.imageUrl ? "none" : "flex" }}
                    >
                      {platformName}
                    </div>
                    <span className={`badge-top-left ${locBadgeClass}`}>
                      {locBadgeText}
                    </span>
                    <span className="badge-top-right">⚡ {platformName}</span>
                  </div>

                  <div className="card-body">
                    <div className="card-tags">
                      <span className="pill-tag">{platformName}</span>
                      <span className="pill-tag pill-tag-date">📅 {eventDateText}</span>
                      {registrationStartsFormatted && (
                        <span className="pill-tag pill-tag-date">📝 Registration opens: {registrationStartsFormatted}</span>
                      )}
                      {registrationEndsFormatted && (
                        <span className="pill-tag pill-tag-date">🕒 Registration closes: {registrationEndsFormatted}</span>
                      )}
                      {trackBadges.map((t) => (
                        <span key={t} className="pill-tag" style={{ background: "#fef08a", color: "#000" }}>
                          {trackIcons[t] || "🎯"} {t.toUpperCase()}
                        </span>
                      ))}
                    </div>

                    <h2 className="card-title">{item.title}</h2>

                    <p className="card-description">
                      {item.description ||
                        "Join this exciting hackathon challenge and build innovative solutions."}
                    </p>

                    <div className="card-footer">
                      <div className="prize-info">
                        <span>{prizeText}</span>
                      </div>

                      <a
                        href={item.canonicalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-arrow-icon"
                        title="View Hackathon Page"
                      >
                        ➔
                      </a>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>

      {/* CTA Button */}
      {page < totalPages && (
        <section className="cta-section">
          <button className="btn-cta-banner" onClick={handleLoadMore}>
            <span>
              LOAD MORE ({hackathons.length} OF {total} SHOWN)
            </span>
            <span className="arrow">➔</span>
          </button>
        </section>
      )}
    </>
  );
}
