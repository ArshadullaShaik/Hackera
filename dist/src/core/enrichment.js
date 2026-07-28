/**
 * Helper utilities for location type classification, track detection, and prize pool extraction.
 */
/**
 * Determine location type accurately based on scrapers' raw signals.
 */
export function determineLocationType(params) {
    const locStr = [
        params.locationName,
        params.city,
        params.address,
        params.country,
        params.region,
        params.formatType,
    ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
    const isExplicitHybrid = params.isHybrid === true ||
        params.formatType?.toLowerCase() === "hybrid" ||
        locStr.includes("hybrid") ||
        (locStr.includes("online") && (Boolean(params.city) || Boolean(params.address) || locStr.includes("in-person")));
    if (isExplicitHybrid) {
        return "hybrid";
    }
    const isExplicitOnline = params.isVirtual === true ||
        params.isOnline === true ||
        params.formatType?.toLowerCase() === "virtual" ||
        params.formatType?.toLowerCase() === "digital" ||
        params.region?.toLowerCase() === "online" ||
        (locStr.includes("online") && !params.city && !params.address) ||
        locStr.includes("worldwide") ||
        locStr.includes("virtual");
    if (isExplicitOnline) {
        return "online";
    }
    // If it has physical attributes (city/address/venue) or region is offline/in-person, it is in-person
    return "in-person";
}
/**
 * Detect hackathon tracks based on title, description, and raw payload tags/themes.
 */
export function detectTracks(title, description = "", rawPayload = {}) {
    const text = `${title} ${description} ${JSON.stringify(rawPayload || {})}`.toLowerCase();
    const tracks = [];
    if (/\b(game|gaming|unity|unreal|roblox|arcade|gamedev|indie game|3d)\b/i.test(text)) {
        tracks.push("Game Dev");
    }
    if (/\b(ai|ml|machine learning|artificial intelligence|llm|genai|gpt|deep learning|neural|nlp|computer vision|chatgpt)\b/i.test(text)) {
        tracks.push("AI / ML");
    }
    if (/\b(web3|crypto|blockchain|ethereum|solana|defi|nft|smart contract|dao|bitcoin|dapp)\b/i.test(text)) {
        tracks.push("Web3 / Blockchain");
    }
    if (/\b(mobile|ios|android|flutter|react native|app dev|app building)\b/i.test(text)) {
        tracks.push("Mobile");
    }
    if (/\b(cyber|security|ctf|privacy|cryptography|infosec|hacking)\b/i.test(text)) {
        tracks.push("Cybersecurity");
    }
    if (/\b(fintech|finance|payment|banking|trading|quant|defi)\b/i.test(text)) {
        tracks.push("Fintech");
    }
    if (/\b(health|bio|medical|healthcare|medtech)\b/i.test(text)) {
        tracks.push("Healthtech");
    }
    if (/\b(hardware|iot|embedded|robotics|raspberry pi|arduino)\b/i.test(text)) {
        tracks.push("Hardware & IoT");
    }
    if (tracks.length === 0) {
        tracks.push("Open Innovation");
    }
    return tracks;
}
/**
 * Extract formatted prize pool ($ or ₹) from raw payload or text.
 */
export function extractPrizePool(rawPayload = {}, textContent = "") {
    if (rawPayload?.prize_amount) {
        const clean = String(rawPayload.prize_amount).replace(/<[^>]*>?/gm, "").trim();
        if (clean)
            return clean;
    }
    if (rawPayload?.prize_money) {
        const clean = String(rawPayload.prize_money).replace(/<[^>]*>?/gm, "").trim();
        if (clean)
            return clean.startsWith("$") || clean.startsWith("₹") ? clean : `₹${clean}`;
    }
    if (typeof rawPayload?.prizes === "string") {
        return rawPayload.prizes;
    }
    if (Array.isArray(rawPayload?.prizes) && rawPayload.prizes.length > 0) {
        const first = rawPayload.prizes[0];
        if (first.cash)
            return String(first.cash);
        if (first.amount)
            return `$${first.amount}`;
    }
    const text = `${textContent} ${JSON.stringify(rawPayload || {})}`;
    // Match USD prize format ($10,000, $50k, $1,000,000)
    const usdMatch = text.match(/(\$\s*\d[\d,]*\s*(?:k|m|million|thousand)?)/i);
    if (usdMatch) {
        return usdMatch[1].replace(/\s+/g, "");
    }
    // Match INR prize format (₹50,000, ₹1 Lakh, INR 1,000,000, Rs. 50,000)
    const inrMatch = text.match(/(₹\s*\d[\d,]*\s*(?:lakh|l|k|crore)?|inr\s*\d[\d,]*|rs\.?\s*\d[\d,]*)/i);
    if (inrMatch) {
        return inrMatch[1]
            .replace(/inr\s*/i, "₹")
            .replace(/rs\.?\s*/i, "₹")
            .replace(/\s+/g, "");
    }
    return "Prizes Available";
}
/**
 * Format a rich description including tracks and prize pool.
 */
export function formatDescription(baseDescription = "", tracks = [], prizePool = "Prizes Available") {
    const cleanBase = baseDescription.replace(/<[^>]*>?/gm, "").trim();
    const trackStr = tracks.length > 0 ? `Tracks: ${tracks.join(", ")}` : "";
    const prizeStr = prizePool !== "Prizes Available" ? `Prize Pool: ${prizePool}` : "";
    const metadataParts = [trackStr, prizeStr].filter(Boolean);
    if (metadataParts.length === 0) {
        return cleanBase || "Join this hackathon challenge and build innovative solutions.";
    }
    const metaHeader = `[${metadataParts.join(" | ")}]`;
    return cleanBase ? `${metaHeader} ${cleanBase}` : metaHeader;
}
//# sourceMappingURL=enrichment.js.map