const initialStartups = [
    {
        id: "1",
        title: "NeuralFlow AI",
        category: "AI",
        description: "Automated workflow optimization using real-time predictive neural networks.",
        founder: "Elena Rostova",
        votes: 142,
        timestamp: 1710000000000,
        details: "NeuralFlow eliminates redundant operations for enterprises by auto-mapping employee workflows and applying real-time micro-automations."
    },
    {
        id: "2",
        title: "EcoPulse Tech",
        category: "CleanTech",
        description: "AI-driven grid balancing for distributed urban renewable energy systems.",
        founder: "Marcus Vance",
        votes: 98,
        timestamp: 1710000001000,
        details: "EcoPulse utilizes IoT sensors across solar microgrids to dynamically route power where demand spikes, reducing energy loss by up to 34%."
    },
    {
        id: "3",
        title: "PayQuantum",
        category: "FinTech",
        description: "Zero-latency cross-border transactions using post-quantum cryptography.",
        founder: "Aria Chen",
        votes: 215,
        timestamp: 1710000002000,
        details: "PayQuantum secures financial settlements against future quantum threats while achieving instant clearance for international trade."
    }
];

function getStartups() {
    const stored = localStorage.getItem("pitch_arena_startups");
    return stored ? JSON.parse(stored) : initialStartups;
}

function saveStartups(startups) {
    localStorage.setItem("pitch_arena_startups", JSON.stringify(startups));
}

function getVotedIds() {
    const stored = localStorage.getItem("pitch_arena_voted");
    return stored ? JSON.parse(stored) : [];
}

function saveVotedIds(ids) {
    localStorage.setItem("pitch_arena_voted", JSON.stringify(ids));
}

let activeCategory = "All";
let searchQuery = "";
let currentSort = "votes-desc";
let currentPage = 1;
const ITEMS_PER_PAGE = 3;

document.addEventListener("DOMContentLoaded", () => {
    const startupGrid = document.getElementById("startupGrid");
    const searchInput = document.getElementById("searchInput");
    const sortSelect = document.getElementById("sortSelect");
    const categoryContainer = document.getElementById("categoryContainer");
    
    const themeToggleBtn = document.getElementById("themeToggleBtn");
    const prevPageBtn = document.getElementById("prevPageBtn");
    const nextPageBtn = document.getElementById("nextPageBtn");
    const pageIndicator = document.getElementById("pageIndicator");

    const modalOverlay = document.getElementById("modalOverlay");
    const modalBody = document.getElementById("modalBody");
    const modalClose = document.getElementById("modalClose");

    const submitModalOverlay = document.getElementById("submitModalOverlay");
    const openSubmitModalBtn = document.getElementById("openSubmitModalBtn");
    const submitModalClose = document.getElementById("submitModalClose");
    const submitStartupForm = document.getElementById("submitStartupForm");

    // Dynamic Light / Dark Mode Toggle
    const savedTheme = localStorage.getItem("pitch_arena_theme") || "dark";
    if (savedTheme === "light") {
        document.body.classList.add("light-theme");
        themeToggleBtn.textContent = "☀️ Light";
    }

    themeToggleBtn.onclick = () => {
        document.body.classList.toggle("light-theme");
        const isLight = document.body.classList.contains("light-theme");
        themeToggleBtn.textContent = isLight ? "☀️ Light" : "🌙 Dark";
        localStorage.setItem("pitch_arena_theme", isLight ? "light" : "dark");
    };

    // Real-Time Analytics Bar
    function updateAnalytics(startups) {
        document.getElementById("totalStartupsStat").textContent = startups.length;
        const totalVotes = startups.reduce((acc, curr) => acc + curr.votes, 0);
        document.getElementById("totalVotesStat").textContent = totalVotes;

        const catCounts = {};
        startups.forEach(s => catCounts[s.category] = (catCounts[s.category] || 0) + 1);
        const topCat = Object.keys(catCounts).reduce((a, b) => catCounts[a] > catCounts[b] ? a : b, "-");
        document.getElementById("topCategoryStat").textContent = topCat;
    }

    // Render Function with Sorting & Pagination
    function renderGrid() {
        const startups = getStartups();
        updateAnalytics(startups);

        let filtered = startups.filter(s => {
            const matchesCategory = (activeCategory === "All") || (s.category === activeCategory);
            const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                  s.description.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });

        if (currentSort === "votes-desc") filtered.sort((a, b) => b.votes - a.votes);
        else if (currentSort === "newest") filtered.sort((a, b) => b.timestamp - a.timestamp);
        else if (currentSort === "oldest") filtered.sort((a, b) => a.timestamp - b.timestamp);

        const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
        if (currentPage > totalPages) currentPage = totalPages;

        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const paginatedItems = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

        pageIndicator.textContent = `Page ${currentPage} of ${totalPages}`;
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages;

        if (paginatedItems.length === 0) {
            startupGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 3rem 0; font-weight:600;">No startups found.</p>`;
            return;
        }

        const votedIds = getVotedIds();
        startupGrid.innerHTML = paginatedItems.map(startup => {
            const hasVoted = votedIds.includes(startup.id);
            return `
                <div class="startup-card" onclick="openDetailModal('${startup.id}')">
                    <div>
                        <span class="category-badge">${startup.category}</span>
                        <h3 class="card-title">${startup.title}</h3>
                        <p class="card-description">${startup.description}</p>
                    </div>
                    <div class="card-footer">
                        <span class="founder-info">By ${startup.founder}</span>
                        <button 
                            class="vote-btn ${hasVoted ? 'voted' : ''}" 
                            onclick="handleVote(event, '${startup.id}')"
                            ${hasVoted ? 'disabled' : ''}>
                            ♥ <span>${startup.votes}</span>
                        </button>
                    </div>
                </div>
            `;
        }).join("");
    }

    prevPageBtn.onclick = () => { if (currentPage > 1) { currentPage--; renderGrid(); } };
    nextPageBtn.onclick = () => { currentPage++; renderGrid(); };

    window.handleVote = function(event, id) {
        event.stopPropagation();
        let startups = getStartups();
        let votedIds = getVotedIds();

        if (votedIds.includes(id)) return;

        startups = startups.map(s => s.id === id ? { ...s, votes: s.votes + 1 } : s);
        votedIds.push(id);

        saveStartups(startups);
        saveVotedIds(votedIds);
        renderGrid();
    };

    window.openDetailModal = function(id) {
        const startups = getStartups();
        const startup = startups.find(s => s.id === id);
        if (!startup) return;

        const pitchUrl = window.location.href;
        const emailSubject = encodeURIComponent(`Pitch Details: ${startup.title}`);
        const emailBody = encodeURIComponent(`Check out ${startup.title} by ${startup.founder} on Pitch Arena!`);

        modalBody.innerHTML = `
            <span class="category-badge">${startup.category}</span>
            <h2 style="font-size: 1.8rem; margin: 0.5rem 0; color: var(--text-primary); font-weight: 800;">${startup.title}</h2>
            <p style="color: var(--text-muted); margin-bottom: 0.75rem; font-weight: 600;">Founded by <strong style="color:var(--text-primary);">${startup.founder}</strong></p>
            <p style="font-size: 1rem; color: var(--text-secondary); line-height: 1.6; margin-bottom: 1rem;">${startup.details}</p>
            
            <div style="text-align: center; margin-top: 1rem;">
                <p style="font-size: 0.8rem; color: var(--text-muted); font-weight:700; margin-bottom: 0.5rem;">Scan QR to share</p>
                <div class="qr-container" id="qrcode"></div>
            </div>

            <div class="action-buttons-group">
                <a class="action-btn btn-email" href="mailto:?subject=${emailSubject}&body=${emailBody}">📧 Share Email</a>
                <button class="action-btn btn-calendar" onclick="downloadCalendarEvent('${startup.title}')">📅 Calendar Reminder</button>
            </div>
        `;

        modalOverlay.classList.add("active");

        setTimeout(() => {
            document.getElementById("qrcode").innerHTML = "";
            new QRCode(document.getElementById("qrcode"), {
                text: pitchUrl,
                width: 110,
                height: 110
            });
        }, 50);
    };

    window.downloadCalendarEvent = function(title) {
        const icsData = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:Pitch Review: ${title}\nDESCRIPTION:Reminder to review pitch details for ${title}.\nDTSTART:20261001T100000Z\nDTEND:20261001T110000Z\nEND:VEVENT\nEND:VCALENDAR`;
        const blob = new Blob([icsData], { type: "text/calendar;charset=utf-8" });
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.setAttribute("download", `${title.replace(/\s+/g, '_')}_reminder.ics`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (modalClose) modalClose.onclick = () => modalOverlay.classList.remove("active");
    if (modalOverlay) modalOverlay.onclick = (e) => { if (e.target === modalOverlay) modalOverlay.classList.remove("active"); };

    if (openSubmitModalBtn) openSubmitModalBtn.onclick = () => submitModalOverlay.classList.add("active");
    if (submitModalClose) submitModalClose.onclick = () => submitModalOverlay.classList.remove("active");
    if (submitModalOverlay) submitModalOverlay.onclick = (e) => { if (e.target === submitModalOverlay) submitModalOverlay.classList.remove("active"); };

    if (submitStartupForm) {
        submitStartupForm.onsubmit = function(e) {
            e.preventDefault();
            const startups = getStartups();

            const newStartup = {
                id: Date.now().toString(),
                title: document.getElementById("inputTitle").value.trim(),
                category: document.getElementById("inputCategory").value,
                description: document.getElementById("inputDesc").value.trim(),
                founder: document.getElementById("inputFounder").value.trim(),
                details: document.getElementById("inputDetails").value.trim(),
                votes: 0,
                timestamp: Date.now()
            };

            startups.unshift(newStartup);
            saveStartups(startups);
            currentPage = 1;
            renderGrid();

            submitStartupForm.reset();
            submitModalOverlay.classList.remove("active");
        };
    }

    if (searchInput) {
        searchInput.oninput = (e) => {
            searchQuery = e.target.value;
            currentPage = 1;
            renderGrid();
        };
    }

    if (sortSelect) {
        sortSelect.onchange = (e) => {
            currentSort = e.target.value;
            renderGrid();
        };
    }

    if (categoryContainer) {
        categoryContainer.onclick = (e) => {
            if (e.target.classList.contains("category-btn")) {
                document.querySelectorAll(".category-btn").forEach(btn => btn.classList.remove("active"));
                e.target.classList.add("active");
                activeCategory = e.target.dataset.category;
                currentPage = 1;
                renderGrid();
            }
        };
    }

    renderGrid();
});
