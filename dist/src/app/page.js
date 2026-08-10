"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from "react";
import { formatCardDate, resolvePrizeText } from "../core/card-utils.js";
export default function Home() {
    const [hackathons, setHackathons] = useState([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    // Filters
    const [search, setSearch] = useState("");
    const [locationType, setLocationType] = useState("");
    const [platform, setPlatform] = useState("");
    const limit = 12;
    const fetchHackathons = useCallback(async (targetPage, isAppend = false) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: targetPage.toString(),
                limit: limit.toString(),
            });
            if (search.trim())
                params.append("search", search.trim());
            if (locationType)
                params.append("locationType", locationType);
            if (platform)
                params.append("platform", platform);
            const res = await fetch(`/api/hackathons?${params.toString()}`);
            if (!res.ok) {
                const errJson = await res.json().catch(() => ({}));
                throw new Error(errJson.error?.message || "Failed to fetch hackathons");
            }
            const json = await res.json();
            const data = json.data || [];
            const meta = json.meta || { total: 0, totalPages: 1 };
            setTotal(meta.total);
            setTotalPages(meta.totalPages);
            if (isAppend) {
                setHackathons((prev) => [...prev, ...data]);
            }
            else {
                setHackathons(data);
            }
        }
        catch (err) {
            console.error("Error fetching hackathons:", err);
        }
        finally {
            setLoading(false);
        }
    }, [search, locationType, platform]);
    useEffect(() => {
        setPage(1);
        fetchHackathons(1, false);
    }, [search, locationType, platform, fetchHackathons]);
    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchHackathons(nextPage, true);
    };
    const clearFilter = (type) => {
        if (type === "search")
            setSearch("");
        if (type === "location")
            setLocationType("");
        if (type === "platform")
            setPlatform("");
    };
    return (_jsxs(_Fragment, { children: [_jsxs("section", { className: "hero-section", children: [_jsxs("div", { className: "hero-text", children: [_jsxs("h1", { className: "hero-title", children: ["THE HACKATHON ", _jsx("span", { className: "highlight-purple", children: "INDEX." })] }), _jsx("div", { className: "hero-badge-lime", children: _jsx("p", { children: "We scrape the web to find the best hackathons, so you don't have to. Every event, every prize, one dashboard." }) })] }), _jsx("div", { className: "doodle-frame", children: _jsxs("svg", { viewBox: "0 0 450 220", className: "doodle-svg", xmlns: "http://www.w3.org/2000/svg", children: [_jsx("rect", { x: "5", y: "5", width: "440", height: "210", rx: "8", fill: "#ffffff", stroke: "#000000", strokeWidth: "3" }), _jsx("rect", { x: "15", y: "15", width: "420", height: "190", fill: "#fdfbf7", stroke: "#000000", strokeWidth: "2" }), _jsx("path", { d: "M 30,130 Q 80,40 180,90 T 350,50 T 420,160", fill: "none", stroke: "#e0e7ff", strokeWidth: "24", opacity: "0.6" }), _jsx("path", { d: "M 50,180 Q 120,80 250,150 T 400,90", fill: "none", stroke: "#fef08a", strokeWidth: "20", opacity: "0.7" }), _jsxs("g", { transform: "translate(30, 30)", children: [_jsx("rect", { x: "0", y: "0", width: "60", height: "40", rx: "4", fill: "#000000" }), _jsx("rect", { x: "4", y: "4", width: "52", height: "32", rx: "2", fill: "#8455ef" }), _jsx("path", { d: "M -10,40 L 70,40 L 60,48 L -0,48 Z", fill: "#000000" })] }), _jsxs("g", { transform: "translate(140, 25)", children: [_jsx("rect", { x: "0", y: "0", width: "70", height: "45", rx: "6", fill: "#b2f746", stroke: "#000000", strokeWidth: "3" }), _jsx("text", { x: "35", y: "32", fontFamily: "Space Grotesk", fontWeight: "700", fontSize: "28", textAnchor: "middle", fill: "#000000", children: "</>" })] }), _jsxs("g", { transform: "translate(100, 85)", children: [_jsx("rect", { x: "0", y: "0", width: "240", height: "44", rx: "4", fill: "#ffffff", stroke: "#000000", strokeWidth: "3", filter: "drop-shadow(3px 3px 0px #000)" }), _jsx("text", { x: "120", y: "28", fontFamily: "Space Grotesk", fontWeight: "700", fontSize: "20", letterSpacing: "1", textAnchor: "middle", fill: "#000000", children: "GLOBAL HACKATHON" })] }), _jsxs("g", { transform: "translate(350, 25)", children: [_jsx("circle", { cx: "25", cy: "25", r: "22", fill: "#ec4899", stroke: "#000000", strokeWidth: "3" }), _jsx("path", { d: "M 3,25 H 47 M 25,3 V 47 M 8,14 Q 25,25 8,36 M 42,14 Q 25,25 42,36", stroke: "#000000", strokeWidth: "2", fill: "none" })] }), _jsxs("g", { transform: "translate(340, 125)", children: [_jsx("rect", { x: "0", y: "0", width: "60", height: "40", rx: "4", fill: "#000000" }), _jsx("rect", { x: "4", y: "4", width: "52", height: "32", rx: "2", fill: "#b2f746" }), _jsx("path", { d: "M -10,40 L 70,40 L 60,48 L -0,48 Z", fill: "#000000" })] }), _jsxs("g", { transform: "translate(60, 135)", children: [_jsx("rect", { x: "0", y: "0", width: "55", height: "36", rx: "4", fill: "#ec4899", stroke: "#000000", strokeWidth: "2" }), _jsx("text", { x: "27", y: "25", fontFamily: "Space Grotesk", fontWeight: "700", fontSize: "20", textAnchor: "middle", fill: "#ffffff", children: "</>" })] }), _jsx("path", { d: "M 110,20 L 114,28 L 122,30 L 115,36 L 118,44 L 110,38 L 102,44 L 105,36 L 98,30 L 106,28 Z", fill: "#ff761c", stroke: "#000000", strokeWidth: "1.5" }), _jsx("path", { d: "M 310,25 L 313,31 L 320,32 L 315,37 L 317,43 L 310,39 L 303,43 L 305,37 L 300,32 L 307,31 Z", fill: "#b2f746", stroke: "#000000", strokeWidth: "1.5" }), _jsx("path", { d: "M 230,140 Q 260,170 300,150", fill: "none", stroke: "#000000", strokeWidth: "3", strokeDasharray: "6,4" }), _jsx("path", { d: "M 295,142 L 305,150 L 295,158", fill: "none", stroke: "#000000", strokeWidth: "3" })] }) })] }), _jsxs("section", { className: "filter-section", children: [_jsx("div", { className: "status-bar-wrapper", children: _jsxs("span", { className: "status-badge", children: ["\u26A1 ", platform
                                    ? `${total.toLocaleString()} ${platform.toUpperCase()} HACKATHONS`
                                    : total > 0 ? `${total.toLocaleString()} HACKATHONS INDEXED` : "LIVE AGGREGATED FEED"] }) }), _jsx("div", { className: "filter-card", children: _jsxs("div", { className: "filter-form", children: [_jsxs("div", { className: "input-group search-input-group", children: [_jsx("span", { className: "search-icon", children: "\uD83D\uDD0D" }), _jsx("input", { type: "text", placeholder: "Search aggregated events, themes, or tech...", value: search, onChange: (e) => setSearch(e.target.value) })] }), _jsx("div", { className: "select-group", children: _jsxs("select", { value: locationType, onChange: (e) => setLocationType(e.target.value), children: [_jsx("option", { value: "", children: "LOCATION: ALL" }), _jsx("option", { value: "online", children: "ONLINE" }), _jsx("option", { value: "in-person", children: "IN-PERSON" }), _jsx("option", { value: "hybrid", children: "HYBRID" })] }) }), _jsx("div", { className: "select-group", children: _jsxs("select", { value: platform, onChange: (e) => setPlatform(e.target.value), children: [_jsx("option", { value: "", children: "PLATFORM: ALL" }), _jsx("option", { value: "luma", children: "LUMA" }), _jsx("option", { value: "devfolio", children: "DEVFOLIO" }), _jsx("option", { value: "mlh", children: "MLH" }), _jsx("option", { value: "unstop", children: "UNSTOP" }), _jsx("option", { value: "devpost", children: "DEVPOST" }), _jsx("option", { value: "hackerearth", children: "HACKEREARTH" }), _jsx("option", { value: "hackclub", children: "HACK CLUB" })] }) }), _jsx("button", { className: "btn btn-purple", onClick: () => fetchHackathons(1, false), children: "FILTER" })] }) })] }), (search || locationType || platform) && (_jsxs("div", { className: "active-tags-bar", children: [search && (_jsxs("span", { className: "active-tag-chip", onClick: () => clearFilter("search"), children: ["Search: \"", search, "\" \u2716"] })), locationType && (_jsxs("span", { className: "active-tag-chip", onClick: () => clearFilter("location"), children: ["Location: ", locationType.toUpperCase(), " \u2716"] })), platform && (_jsxs("span", { className: "active-tag-chip", onClick: () => clearFilter("platform"), children: ["Platform: ", platform.toUpperCase(), " \u2716"] }))] })), _jsx("section", { className: "grid-section", children: _jsx("div", { className: "hackathons-grid", children: loading && hackathons.length === 0 ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "card skeleton-card" }), _jsx("div", { className: "card skeleton-card" }), _jsx("div", { className: "card skeleton-card" })] })) : hackathons.length === 0 ? (_jsxs("div", { className: "empty-state", children: [_jsx("h3", { children: "NO HACKATHONS FOUND" }), _jsx("p", { children: "Try clearing your search query or selecting a different location or platform filter." })] })) : (hackathons.map((item) => {
                        const locType = (item.locationType || "online").toLowerCase();
                        let locBadgeClass = "badge-location-online";
                        let locBadgeText = "ONLINE";
                        if (locType === "in-person") {
                            locBadgeClass = "badge-location-person";
                            locBadgeText = item.locationName
                                ? `📍 ${item.locationName.split(",")[0].toUpperCase()}`
                                : "IN-PERSON";
                        }
                        else if (locType === "hybrid") {
                            locBadgeClass = "badge-location-hybrid";
                            locBadgeText = "HYBRID";
                        }
                        const platformName = (item.sourcePlatform || "OTHER").toUpperCase();
                        const startDateFormatted = formatCardDate(item.startsAt) || "UPCOMING";
                        const registrationStartsFormatted = formatCardDate(item.registrationStartsAt);
                        const registrationEndsFormatted = formatCardDate(item.registrationEndsAt);
                        const prizeText = resolvePrizeText(item);
                        const rawDesc = item.description || "";
                        // Extract or Detect Tracks
                        let trackBadges = [];
                        const matchTrack = rawDesc.match(/Tracks:\s*([^\]|]+)/i);
                        if (matchTrack) {
                            trackBadges = matchTrack[1]
                                .split(",")
                                .map((t) => t.trim())
                                .filter(Boolean);
                        }
                        else {
                            const combined = `${item.title} ${rawDesc}`.toLowerCase();
                            if (/\b(game|gaming|unity|unreal|roblox|arcade|gamedev)\b/i.test(combined))
                                trackBadges.push("Game Dev");
                            if (/\b(ai|ml|machine learning|artificial intelligence|llm|genai|gpt)\b/i.test(combined))
                                trackBadges.push("AI / ML");
                            if (/\b(web3|crypto|blockchain|ethereum|solana|defi)\b/i.test(combined))
                                trackBadges.push("Web3");
                            if (/\b(mobile|ios|android|flutter)\b/i.test(combined))
                                trackBadges.push("Mobile");
                        }
                        const trackIcons = {
                            "Game Dev": "🎮",
                            "AI / ML": "🤖",
                            "Web3 / Blockchain": "⛓️",
                            "Web3": "⛓️",
                            "Mobile": "📱",
                            "Cybersecurity": "🛡️",
                            "Fintech": "💳",
                            "Healthtech": "🩺",
                        };
                        return (_jsxs("article", { className: "card", children: [_jsxs("div", { className: "card-header", children: [item.imageUrl ? (_jsx("img", { src: item.imageUrl, alt: item.title, className: "card-img", onError: (e) => {
                                                e.target.style.display = "none";
                                                const next = e.target.nextElementSibling;
                                                if (next)
                                                    next.style.display = "flex";
                                            } })) : null, _jsx("div", { className: "card-img-placeholder", style: { display: item.imageUrl ? "none" : "flex" }, children: platformName }), _jsx("span", { className: `badge-top-left ${locBadgeClass}`, children: locBadgeText }), _jsxs("span", { className: "badge-top-right", children: ["\u26A1 ", platformName] })] }), _jsxs("div", { className: "card-body", children: [_jsxs("div", { className: "card-tags", children: [_jsx("span", { className: "pill-tag", children: platformName }), _jsxs("span", { className: "pill-tag pill-tag-date", children: ["\uD83D\uDCC5 Event starts: ", startDateFormatted] }), registrationStartsFormatted && (_jsxs("span", { className: "pill-tag pill-tag-date", children: ["\uD83D\uDCDD Registration opens: ", registrationStartsFormatted] })), registrationEndsFormatted && (_jsxs("span", { className: "pill-tag pill-tag-date", children: ["\uD83D\uDD52 Registration closes: ", registrationEndsFormatted] })), trackBadges.map((t) => (_jsxs("span", { className: "pill-tag", style: { background: "#fef08a", color: "#000" }, children: [trackIcons[t] || "🎯", " ", t.toUpperCase()] }, t)))] }), _jsx("h2", { className: "card-title", children: item.title }), _jsx("p", { className: "card-description", children: item.description ||
                                                "Join this exciting hackathon challenge and build innovative solutions." }), _jsxs("div", { className: "card-footer", children: [_jsx("div", { className: "prize-info", children: _jsx("span", { children: prizeText }) }), _jsx("a", { href: item.canonicalUrl, target: "_blank", rel: "noopener noreferrer", className: "btn-arrow-icon", title: "View Hackathon Page", children: "\u2794" })] })] })] }, item.id));
                    })) }) }), page < totalPages && (_jsx("section", { className: "cta-section", children: _jsxs("button", { className: "btn-cta-banner", onClick: handleLoadMore, children: [_jsxs("span", { children: ["LOAD MORE (", hackathons.length, " OF ", total, " SHOWN)"] }), _jsx("span", { className: "arrow", children: "\u2794" })] }) }))] }));
}
//# sourceMappingURL=page.js.map