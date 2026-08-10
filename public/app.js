/**
 * Hackera Frontend — "The Hackathon Index" App Logic
 */

document.addEventListener("DOMContentLoaded", () => {
  // State
  let currentPage = 1;
  const limit = 12;
  let totalHackathons = 0;
  let currentSearch = "";
  let currentLocation = "";
  let currentPlatform = "";
  let isAppend = false;

  // DOM Elements
  const gridContainer = document.getElementById("hackathons-grid");
  const searchInput = document.getElementById("search-input");
  const locationSelect = document.getElementById("location-select");
  const platformSelect = document.getElementById("platform-select");
  const filterBtn = document.getElementById("filter-btn");
  const loadMoreBtn = document.getElementById("load-more-btn");
  const loadMoreText = document.getElementById("load-more-text");
  const statusBadge = document.getElementById("status-badge");
  const activeTagsBar = document.getElementById("active-tags-bar");
  const shared = window.HackeraCardUtils || {};

  // Debounce Utility
  function debounce(fn, delay) {
    let timer = null;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  function formatCardDate(value) {
    return shared.formatCardDate ? shared.formatCardDate(value) : null;
  }

  function resolvePrizeText(item) {
    return shared.resolvePrizeText ? shared.resolvePrizeText(item) : "🏆 Prizes Available";
  }

  function resolveTrackBadges(item) {
    return shared.resolveTrackBadges ? shared.resolveTrackBadges(item) : [];
  }

  // Fetch Hackathons from API
  async function fetchHackathons() {
    if (!isAppend) {
      gridContainer.innerHTML = `
        <div class="card skeleton-card"></div>
        <div class="card skeleton-card"></div>
        <div class="card skeleton-card"></div>
      `;
    }

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
      });

      if (currentSearch.trim()) params.append("search", currentSearch.trim());
      if (currentLocation) params.append("locationType", currentLocation);
      if (currentPlatform) params.append("platform", currentPlatform);

      const response = await fetch(`/hackathons?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const data = result.data || [];
      const meta = result.meta || { total: 0, totalPages: 1 };

      totalHackathons = meta.total;
      updateStatusBadge();
      updateActiveTags();

      if (!isAppend) {
        gridContainer.innerHTML = "";
      }

      if (data.length === 0) {
        if (!isAppend) {
          gridContainer.innerHTML = `
            <div class="empty-state">
              <h3>NO HACKATHONS FOUND</h3>
              <p>Try clearing your search query or selecting a different location or platform filter.</p>
            </div>
          `;
        }
        loadMoreBtn.style.display = "none";
        return;
      }

      data.forEach((hackathon) => {
        const cardElement = createHackathonCard(hackathon);
        gridContainer.appendChild(cardElement);
      });

      // Update Load More Button State
      if (currentPage >= meta.totalPages) {
        loadMoreBtn.style.display = "none";
      } else {
        loadMoreBtn.style.display = "inline-flex";
        loadMoreText.textContent = `LOAD MORE (${data.length * currentPage} OF ${meta.total} SHOWN)`;
      }
    } catch (error) {
      console.error("Error fetching hackathons:", error);
      gridContainer.innerHTML = `
        <div class="empty-state">
          <h3>FAILED TO LOAD HACKATHONS</h3>
          <p>Please check your connection or backend server on port 3000.</p>
        </div>
      `;
      loadMoreBtn.style.display = "none";
    }
  }

  // Create Card Element
  function createHackathonCard(item) {
    const card = document.createElement("article");
    card.className = "card";

    // Location Type Badge
    const locType = (item.locationType || "online").toLowerCase();
    let locBadgeClass = "badge-location-online";
    let locBadgeText = "ONLINE";

    if (locType === "in-person") {
      locBadgeClass = "badge-location-person";
      locBadgeText = item.locationName ? `📍 ${item.locationName.split(",")[0].toUpperCase()}` : "IN-PERSON";
    } else if (locType === "hybrid") {
      locBadgeClass = "badge-location-hybrid";
      locBadgeText = "HYBRID";
    }

    // Platform Badge Tag
    const platformName = (item.sourcePlatform || "OTHER").toUpperCase();

    const startDateFormatted = formatCardDate(item.startsAt) || "UPCOMING";
    const registrationStartsFormatted = formatCardDate(item.registrationStartsAt);
    const registrationEndsFormatted = formatCardDate(item.registrationEndsAt);
    const prizeText = resolvePrizeText(item);
    const trackBadges = resolveTrackBadges(item);
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

    // Image Cover
    const imageUrl = item.imageUrl;

    card.innerHTML = `
      <div class="card-header">
        ${
          imageUrl
            ? `<img src="${imageUrl}" alt="${escapeHtml(item.title)}" class="card-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
               <div class="card-img-placeholder" style="display:none;">${escapeHtml(platformName)}</div>`
            : `<div class="card-img-placeholder">${escapeHtml(platformName)}</div>`
        }
        <span class="badge-top-left ${locBadgeClass}">${escapeHtml(locBadgeText)}</span>
        <span class="badge-top-right">⚡ ${escapeHtml(platformName)}</span>
      </div>

      <div class="card-body">
        <div class="card-tags">
          <span class="pill-tag">${escapeHtml(platformName)}</span>
          <span class="pill-tag pill-tag-date">📅 Event starts: ${escapeHtml(startDateFormatted)}</span>
          ${registrationStartsFormatted ? `<span class="pill-tag pill-tag-date">📝 Registration opens: ${escapeHtml(registrationStartsFormatted)}</span>` : ""}
          ${registrationEndsFormatted ? `<span class="pill-tag pill-tag-date">🕒 Registration closes: ${escapeHtml(registrationEndsFormatted)}</span>` : ""}
          ${trackBadges.map((t) => `<span class="pill-tag" style="background: #fef08a; color: #000;">${escapeHtml((trackIcons[t] || "🎯") + " " + t.toUpperCase())}</span>`).join("")}
        </div>

        <h2 class="card-title">${escapeHtml(item.title)}</h2>

        <p class="card-description">
          ${escapeHtml(item.description || "Join this exciting hackathon challenge and build innovative solutions.")}
        </p>

        <div class="card-footer">
          <div class="prize-info">
            <span>${escapeHtml(prizeText)}</span>
          </div>

          <a href="${escapeHtml(item.canonicalUrl)}" target="_blank" rel="noopener noreferrer" class="btn-arrow-icon" title="View Hackathon Page">
            ➔
          </a>
        </div>
      </div>
    `;

    return card;
  }

  // Active Filter Chips
  function updateActiveTags() {
    activeTagsBar.innerHTML = "";

    if (currentSearch) {
      addTagChip(`Search: "${currentSearch}"`, () => {
        currentSearch = "";
        searchInput.value = "";
        triggerFilter();
      });
    }

    if (currentLocation) {
      addTagChip(`Location: ${currentLocation.toUpperCase()}`, () => {
        currentLocation = "";
        locationSelect.value = "";
        triggerFilter();
      });
    }

    if (currentPlatform) {
      addTagChip(`Platform: ${currentPlatform.toUpperCase()}`, () => {
        currentPlatform = "";
        platformSelect.value = "";
        triggerFilter();
      });
    }
  }

  function addTagChip(text, onRemove) {
    const chip = document.createElement("span");
    chip.className = "active-tag-chip";
    chip.innerHTML = `${escapeHtml(text)} ✖`;
    chip.addEventListener("click", onRemove);
    activeTagsBar.appendChild(chip);
  }

  // Update Status Badge
  function updateStatusBadge() {
    if (totalHackathons > 0) {
      statusBadge.textContent = `⚡ ${totalHackathons.toLocaleString()} HACKATHONS INDEXED`;
    } else {
      statusBadge.textContent = `⚡ LIVE AGGREGATED FEED`;
    }
  }

  // Filter Action
  function triggerFilter() {
    currentPage = 1;
    isAppend = false;
    currentSearch = searchInput.value;
    currentLocation = locationSelect.value;
    currentPlatform = platformSelect.value;
    fetchHackathons();
  }

  // Event Listeners
  filterBtn.addEventListener("click", (e) => {
    e.preventDefault();
    triggerFilter();
  });

  searchInput.addEventListener("input", debounce(() => {
    triggerFilter();
  }, 400));

  locationSelect.addEventListener("change", () => {
    triggerFilter();
  });

  platformSelect.addEventListener("change", () => {
    triggerFilter();
  });

  loadMoreBtn.addEventListener("click", () => {
    currentPage++;
    isAppend = true;
    fetchHackathons();
  });

  // Helper HTML Escaper
  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Initial Fetch
  fetchHackathons();
});
