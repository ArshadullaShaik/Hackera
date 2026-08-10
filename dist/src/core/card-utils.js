const cardDateOptions = {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
};
function sanitizePrizeValue(value) {
    return String(value ?? "").replace(/<[^>]*>?/gm, "").trim();
}
function extractPrizeFromArray(prizes) {
    if (!Array.isArray(prizes)) {
        return null;
    }
    for (const prize of prizes) {
        if (typeof prize === "string") {
            const clean = sanitizePrizeValue(prize);
            if (clean) {
                return clean;
            }
            continue;
        }
        if (prize && typeof prize === "object") {
            const record = prize;
            for (const field of [record.cash, record.amount, record.value, record.prize, record.title, record.name, record.description]) {
                const clean = sanitizePrizeValue(field);
                if (clean) {
                    return clean;
                }
            }
        }
    }
    return null;
}
export function formatCardDate(value) {
    if (!value) {
        return null;
    }
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString("en-US", cardDateOptions);
}
export function resolvePrizeText(item) {
    const rawDescription = item.description || "";
    const prizePoolMatch = rawDescription.match(/Prize Pool:\s*([^\]|]+)/i);
    if (prizePoolMatch?.[1]?.trim()) {
        return `🏆 ${prizePoolMatch[1].trim()}`;
    }
    const sourcePayload = item.rawSourcePayload || {};
    const prizeAmount = sanitizePrizeValue(sourcePayload.prize_amount);
    if (prizeAmount) {
        return `🏆 ${prizeAmount}`;
    }
    const prizeMoney = sanitizePrizeValue(sourcePayload.prize_money);
    if (prizeMoney) {
        return `🏆 ${prizeMoney.startsWith("$") || prizeMoney.startsWith("₹") ? prizeMoney : `₹${prizeMoney}`}`;
    }
    const prizeArrayValue = extractPrizeFromArray(sourcePayload.prizes);
    if (prizeArrayValue) {
        return `🏆 ${prizeArrayValue}`;
    }
    const searchText = `${rawDescription} ${item.title}`;
    const usdMatch = searchText.match(/(\$\s*\d[\d,]*\s*(?:k|m|million|thousand)?)/i);
    if (usdMatch?.[1]) {
        return `🏆 ${usdMatch[1].replace(/\s+/g, "")}`;
    }
    const inrMatch = searchText.match(/(₹\s*\d[\d,]*\s*(?:lakh|l|k|crore)?|inr\s*\d[\d,]*|rs\.?\s*\d[\d,]*)/i);
    if (inrMatch?.[1]) {
        return `🏆 ${inrMatch[1].replace(/inr\s*/i, "₹").replace(/rs\.?\s*/i, "₹").replace(/\s+/g, "")}`;
    }
    return "🏆 Prizes Available";
}
export function resolveTrackBadges(item) {
    const rawDescription = item.description || "";
    const trackBadges = [];
    const matchTrack = rawDescription.match(/Tracks:\s*([^\]|]+)/i);
    if (matchTrack) {
        return matchTrack[1]
            .split(",")
            .map((track) => track.trim())
            .filter(Boolean);
    }
    const combined = `${item.title} ${rawDescription}`.toLowerCase();
    if (/\b(game|gaming|unity|unreal|roblox|arcade|gamedev)\b/i.test(combined))
        trackBadges.push("Game Dev");
    if (/\b(ai|ml|machine learning|artificial intelligence|llm|genai|gpt|deep learning|neural|nlp|computer vision|chatgpt)\b/i.test(combined))
        trackBadges.push("AI / ML");
    if (/\b(web3|crypto|blockchain|ethereum|solana|defi|nft|smart contract|dao|bitcoin|dapp)\b/i.test(combined))
        trackBadges.push("Web3 / Blockchain");
    if (/\b(mobile|ios|android|flutter|react native|app dev|app building)\b/i.test(combined))
        trackBadges.push("Mobile");
    if (/\b(cyber|security|ctf|privacy|cryptography|infosec|hacking)\b/i.test(combined))
        trackBadges.push("Cybersecurity");
    if (/\b(fintech|finance|payment|banking|trading|quant|defi)\b/i.test(combined))
        trackBadges.push("Fintech");
    if (/\b(health|bio|medical|healthcare|medtech)\b/i.test(combined))
        trackBadges.push("Healthtech");
    return trackBadges;
}
//# sourceMappingURL=card-utils.js.map