const state = {
  data: null,
  currentPage: document.body.dataset.page || "home",
  newsIndex: 0,
  gamesFilter: "All",
  gamesSearch: "",
  gamesSort: "status",
};

const pageTitles = {
  home: "Home",
  about: "About",
  games: "Games",
  game: "Game Detail",
  history: "History",
  staff: "Staff",
  contact: "Contact",
};

document.addEventListener("DOMContentLoaded", init);

async function init() {
  try {
    const response = await fetch("./data/site-data.json");
    if (!response.ok) throw new Error("Could not load site data.");
    state.data = await response.json();
    renderSharedLayout();
    attachBaseEvents();
    renderPage();
    setupRevealObserver();
  } catch (error) {
    console.error(error);
    document.body.innerHTML = `<main class="section"><div class="container"><div class="empty-state">The site data could not be loaded. Check that <strong>data/site-data.json</strong> exists and GitHub Pages is serving the folder correctly.</div></div></main>`;
  }
}

function renderSharedLayout() {
  renderHeader();
  renderFooter();
  document.title = `${pageTitles[state.currentPage] || "Orda Games"} • ${state.data.studio.name}`;
}

function renderHeader() {
  const header = document.getElementById("site-header");
  if (!header) return;
  const navLinks = state.data.nav
    .map((item) => {
      const pageMatch = item.href.replace(".html", "");
      const currentKey = state.currentPage === "home" ? "index" : state.currentPage;
      const active = (pageMatch === currentKey) || (state.currentPage === "home" && item.href === "index.html");
      return `<a class="nav-link ${active ? "is-active" : ""}" href="${item.href}">${item.label}</a>`;
    })
    .join("");

  const mobileLinks = state.data.nav
    .map((item) => `<a href="${item.href}">${item.label}</a>`)
    .join("");

  header.className = "site-header";
  header.innerHTML = `
    <div class="container nav-shell">
      <a class="brand" href="index.html" aria-label="${escapeHtml(state.data.studio.name)} home">
        <img class="brand-logo" src="${state.data.studio.logos.white}" alt="${escapeHtml(state.data.studio.name)} logo">
      </a>
      <nav class="nav-links" aria-label="Primary navigation">
        ${navLinks}
      </nav>
      <div class="nav-actions">
        <a class="button" href="contact.html">Contact us</a>
        <button class="mobile-toggle" id="mobileToggle" type="button" aria-expanded="false" aria-controls="mobileMenu">☰</button>
      </div>
    </div>
    <div class="container mobile-menu" id="mobileMenu">${mobileLinks}</div>
  `;
}

function renderFooter() {
  const footer = document.getElementById("site-footer");
  if (!footer) return;
  const links = state.data.nav.map((item) => `<a href="${item.href}">${item.label}</a>`).join("");
  footer.className = "site-footer";
  footer.innerHTML = `
    <div class="container">
      <div class="glass-card footer-card reveal">
        <div>
          <div class="footer-brand">
            <img src="${state.data.studio.logos.white}" alt="${escapeHtml(state.data.studio.name)} white logo">
          </div>
          <p class="footer-text">${escapeHtml(state.data.studio.description)}</p>
        </div>
        <div>
          <h3 class="footer-title">Navigate</h3>
          <div class="footer-links">${links}</div>
        </div>
        <div>
          <h3 class="footer-title">Contact</h3>
          <p class="footer-text">${escapeHtml(state.data.contact.altText)}</p>
          <div class="footer-links" style="margin-top:12px">
            <a href="mailto:${escapeHtml(state.data.contact.email)}">${escapeHtml(state.data.contact.email)}</a>
            <a href="${escapeHtml(state.data.contact.githubPagesUrl)}" target="_blank" rel="noreferrer">${escapeHtml(state.data.contact.githubPagesUrl.replace("https://", ""))}</a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© ${new Date().getFullYear()} ${escapeHtml(state.data.studio.name)}. All rights reserved.</span>
        <span>Orda Games</span>
      </div>
    </div>
  `;
}

function attachBaseEvents() {
  const mobileToggle = document.getElementById("mobileToggle");
  const mobileMenu = document.getElementById("mobileMenu");
  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener("click", () => {
      const open = mobileMenu.classList.toggle("is-open");
      mobileToggle.setAttribute("aria-expanded", String(open));
      mobileToggle.textContent = open ? "✕" : "☰";
    });
  }

  window.addEventListener("scroll", () => {
    const header = document.getElementById("site-header");
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 14);
  });

  document.addEventListener("click", (event) => {
    const modal = document.getElementById("siteModal");
    if (!modal) return;
    if (event.target.matches("[data-close-modal]") || event.target === modal) closeModal();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeModal();
  });
}

function renderPage() {
  switch (state.currentPage) {
    case "home":
      renderHomePage();
      break;
    case "about":
      renderAboutPage();
      break;
    case "games":
      renderGamesPage();
      break;
    case "game":
      renderGameDetailPage();
      break;
    case "history":
      renderHistoryPage();
      break;
    case "staff":
      renderStaffPage();
      break;
    case "contact":
      renderContactPage();
      break;
    default:
      renderHomePage();
  }
}

function renderHomePage() {
  const hero = document.getElementById("heroMount");
  const news = document.getElementById("newsMount");
  const featured = document.getElementById("featuredGamesMount");
  const stats = document.getElementById("statsMount");
  const featuredGames = state.data.games.filter((game) => game.featured);

  if (hero) {
    hero.innerHTML = `
      <section class="hero">
        <div class="container hero-grid">
          <div class="hero-panel reveal">
            <span class="section-kicker hero-kicker">Independent studio • Story-driven games • Orda Games</span>
            <h1 class="hero-title">${escapeHtml(state.data.studio.heroTitle)}</h1>
            <p class="hero-description">${escapeHtml(state.data.studio.heroSubtitle)}</p>
            <div class="hero-actions">
              <a class="button" href="games.html">Explore games</a>
              <a class="button button-secondary" href="contact.html">Contact Orda Games</a>
            </div>
            <div class="hero-mini-grid">
              ${state.data.stats.slice(0, 4).map((stat) => `
                <div class="mini-stat">
                  <strong>${escapeHtml(stat.value)}</strong>
                  <span>${escapeHtml(stat.label)}</span>
                </div>
              `).join("")}
            </div>
          </div>

          <div class="hero-side">
            ${featuredGames.slice(0, 1).map((game) => `
              <article class="hero-feature glass-card reveal">
                <div class="hero-feature-media"><img src="${game.poster}" alt="${escapeHtml(game.name)} poster"></div>
                <div class="hero-feature-content">
                  <div class="hero-feature-top">
                    <span class="badge accent">${escapeHtml(game.status)}</span>
                    <span class="badge">${formatDate(game.releaseDate)}</span>
                  </div>
                  <h2 class="card-title">${escapeHtml(game.name)}</h2>
                  <p class="card-text">${escapeHtml(game.shortDescription)}</p>
                  <div class="card-actions">
                    <a class="button" href="game.html?slug=${encodeURIComponent(game.slug)}">Open game page</a>
                    <button class="button button-secondary" type="button" data-open-game="${escapeHtml(game.slug)}">Quick view</button>
                  </div>
                </div>
              </article>
            `).join("")}
          </div>
        </div>
      </section>
    `;
  }

  if (news) {
    news.innerHTML = `
      <section class="section">
        <div class="container">
          <div class="section-title-wrap">
            <div>
              <span class="section-kicker">News & updates</span>
              <h2 class="section-title">Latest from the studio</h2>
            </div>
            <p class="section-text">Feature launch notes, milestone posts, roadmap updates, patch information, and community announcements right on the front page.</p>
          </div>
          <div class="news-wrap">
            <article class="glass-card news-slider reveal" id="newsSlider"></article>
            <div class="news-list">
              ${state.data.news.slice(0, 3).map((item) => `
                <article class="news-item info-card reveal">
                  <span class="badge">${escapeHtml(item.category)}</span>
                  <h3>${escapeHtml(item.title)}</h3>
                  <p>${escapeHtml(item.summary)}</p>
                  <span class="muted small">${formatDate(item.date)}</span>
                </article>
              `).join("")}
            </div>
          </div>
        </div>
      </section>
    `;
    renderNewsSlide();
  }

  if (featured) {
    featured.innerHTML = `
      <section class="section">
        <div class="container">
          <div class="section-title-wrap">
            <div>
              <span class="section-kicker">Featured portfolio</span>
              <h2 class="section-title">Games built for visibility</h2>
            </div>
            <p class="section-text">Explore current and upcoming projects from Orda Games.</p>
          </div>
          <div class="games-grid">
            ${featuredGames.map(renderGameCard).join("")}
          </div>
        </div>
      </section>
    `;
  }

  if (stats) {
    stats.innerHTML = `
      <section class="section-tight">
        <div class="container">
          <div class="card-grid">
            ${state.data.stats.map((item) => `
              <article class="info-card stat-card reveal">
                <strong>${escapeHtml(item.value)}</strong>
                <span>${escapeHtml(item.label)}</span>
              </article>
            `).join("")}
          </div>
        </div>
      </section>
    `;
  }

  ensureModal();
  attachGameTriggers();
}

function renderAboutPage() {
  const mount = document.getElementById("aboutMount");
  if (!mount) return;

  mount.innerHTML = `
    <section class="page-hero">
      <div class="container page-hero-grid">
        <div class="glass-card page-hero-card reveal">
          <span class="section-kicker">About the studio</span>
          <h1 class="page-hero-title">${escapeHtml(state.data.studio.name)}</h1>
          <p class="page-hero-text">${escapeHtml(state.data.studio.description)}</p>
          <div class="pill-row">
            <span class="badge accent">Founded ${escapeHtml(state.data.studio.founded)}</span>
            <span class="badge">${escapeHtml(state.data.studio.location)}</span>
            <span class="badge success">${escapeHtml(state.data.studio.email)}</span>
          </div>
        </div>
        <div class="page-hero-side">
          ${state.data.values.slice(0, 2).map((item) => `
            <article class="glass-card page-hero-card reveal">
              <h2 class="card-title">${escapeHtml(item.title)}</h2>
              <p class="card-text">${escapeHtml(item.text)}</p>
            </article>
          `).join("")}
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-title-wrap">
          <div>
            <span class="section-kicker">Core values</span>
            <h2 class="section-title">How Orda Games wants to build</h2>
          </div>
          <p class="section-text">These values shape how we design, build, and deliver our games.</p>
        </div>
        <div class="games-grid">
          ${state.data.values.map((value) => `
            <article class="game-card info-card reveal">
              <div class="game-card-content">
                <span class="badge purple">Studio value</span>
                <h3 class="game-card-title">${escapeHtml(value.title)}</h3>
                <p class="card-text">${escapeHtml(value.text)}</p>
              </div>
            </article>
          `).join("")}
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-title-wrap">
          <div>
            <span class="section-kicker">Workflow</span>
            <h2 class="section-title">From concept to community</h2>
          </div>
          <p class="section-text">Our approach to building games, from early concept to final release.</p>
        </div>
        <div class="timeline">
          ${state.data.workflow.map((item) => `
            <article class="timeline-card reveal">
              <div class="timeline-year">${escapeHtml(item.step)}</div>
              <div>
                <h3>${escapeHtml(item.title)}</h3>
                <p>${escapeHtml(item.text)}</p>
              </div>
            </article>
          `).join("")}
        </div>
      </div>
    </section>
  `;
}

function renderGamesPage() {
  const mount = document.getElementById("gamesMount");
  if (!mount) return;

  const statuses = ["All", ...new Set(state.data.games.map((game) => game.status))];

  mount.innerHTML = `
    <section class="page-hero">
      <div class="container page-hero-grid">
        <div class="glass-card page-hero-card reveal">
          <span class="section-kicker">Portfolio</span>
          <h1 class="page-hero-title">Games, prototypes, and future reveals</h1>
          <p class="page-hero-text">Search, sort, and filter the Orda Games lineup. Browse all current and upcoming projects from the studio.</strong>.</p>
          <div class="pill-row">
            <span class="badge accent">${state.data.games.length} total projects</span>
            <span class="badge">Dynamic filters</span>
            <span class="badge success">Quick view modal</span>
          </div>
        </div>
        <div class="page-hero-side">
          <article class="glass-card metric reveal"><strong>${state.data.games.filter((game) => game.status === "Released").length.toString().padStart(2, "0")}</strong><span>Released games</span></article>
          <article class="glass-card metric reveal"><strong>${state.data.games.filter((game) => /Development|Prototype|Pre-Production|Coming Soon/i.test(game.status)).length.toString().padStart(2, "0")}</strong><span>Upcoming or active projects</span></article>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="control-panel" style="padding:22px">
          <div class="controls-grid">
            <input class="search-input" id="gameSearch" type="search" placeholder="Search by title, genre, tag, or engine">
            <select class="select-input" id="gameSort">
              <option value="status">Sort by status</option>
              <option value="release-desc">Newest release date</option>
              <option value="release-asc">Oldest release date</option>
              <option value="name-asc">Name A–Z</option>
            </select>
            <a class="button button-secondary" href="contact.html">Pitch & contact</a>
          </div>
          <div class="filter-row" id="gamesFilters">
            ${statuses.map((status) => `<button class="filter-button ${status === "All" ? "is-active" : ""}" type="button" data-filter="${escapeHtml(status)}">${escapeHtml(status)}</button>`).join("")}
          </div>
        </div>

        <div class="games-grid" id="gamesGrid"></div>
      </div>
    </section>
  `;

  document.getElementById("gameSearch")?.addEventListener("input", (event) => {
    state.gamesSearch = event.target.value.trim().toLowerCase();
    renderFilteredGames();
  });

  document.getElementById("gameSort")?.addEventListener("change", (event) => {
    state.gamesSort = event.target.value;
    renderFilteredGames();
  });

  document.getElementById("gamesFilters")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-filter]");
    if (!button) return;
    state.gamesFilter = button.dataset.filter;
    document.querySelectorAll("#gamesFilters .filter-button").forEach((item) => item.classList.toggle("is-active", item === button));
    renderFilteredGames();
  });

  renderFilteredGames();
  ensureModal();
}

function renderFilteredGames() {
  const grid = document.getElementById("gamesGrid");
  if (!grid) return;

  let filtered = [...state.data.games];

  if (state.gamesFilter !== "All") {
    filtered = filtered.filter((game) => game.status === state.gamesFilter);
  }

  if (state.gamesSearch) {
    filtered = filtered.filter((game) => {
      const haystack = [
        game.name,
        game.tagline,
        game.shortDescription,
        game.genre,
        game.engine,
        ...(game.tags || [])
      ].join(" ").toLowerCase();
      return haystack.includes(state.gamesSearch);
    });
  }

  filtered.sort((a, b) => sortGames(a, b, state.gamesSort));

  grid.innerHTML = filtered.length
    ? filtered.map(renderGameCard).join("")
    : `<div class="empty-state">No games match this filter. Try another status or search term.</div>`;

  attachGameTriggers();
  setupRevealObserver();
}

function sortGames(a, b, mode) {
  if (mode === "release-desc") return new Date(b.releaseDate) - new Date(a.releaseDate);
  if (mode === "release-asc") return new Date(a.releaseDate) - new Date(b.releaseDate);
  if (mode === "name-asc") return a.name.localeCompare(b.name);
  return a.status.localeCompare(b.status) || a.name.localeCompare(b.name);
}

function renderGameCard(game) {
  return `
    <article class="game-card card reveal">
      <div class="game-card-media"><img src="${game.poster}" alt="${escapeHtml(game.name)} poster"></div>
      <div class="game-card-content">
        <div class="game-card-title-row">
          <div>
            <h3 class="game-card-title">${escapeHtml(game.name)}</h3>
            <span class="muted small">${escapeHtml(game.genre)}</span>
          </div>
          <span class="badge accent">${escapeHtml(game.status)}</span>
        </div>
        <p class="card-text">${escapeHtml(game.shortDescription)}</p>
        <div class="card-meta">
          <span class="badge">${formatDate(game.releaseDate)}</span>
          <span class="badge">${escapeHtml(game.engine)}</span>
        </div>
        <div class="chip-list">
          ${(game.tags || []).slice(0, 4).map((tag) => `<span class="badge">${escapeHtml(tag)}</span>`).join("")}
        </div>
        <div class="card-actions">
          <a class="button" href="game.html?slug=${encodeURIComponent(game.slug)}">Open page</a>
          <button class="button button-secondary" type="button" data-open-game="${escapeHtml(game.slug)}">Quick view</button>
        </div>
      </div>
    </article>
  `;
}

function renderGameDetailPage() {
  const mount = document.getElementById("gameDetailMount");
  if (!mount) return;

  const slug = new URLSearchParams(window.location.search).get("slug");
  const game = state.data.games.find((item) => item.slug === slug) || state.data.games[0];
  const related = state.data.games.filter((item) => item.slug !== game.slug).slice(0, 3);

  mount.innerHTML = `
    <section class="page-hero">
      <div class="container detail-hero">
        <div class="detail-poster reveal">
          <img src="${game.poster}" alt="${escapeHtml(game.name)} poster">
        </div>
        <div class="glass-card detail-panel reveal">
          <span class="section-kicker">${escapeHtml(game.status)}</span>
          <h1 class="detail-title">${escapeHtml(game.name)}</h1>
          <p class="detail-text">${escapeHtml(game.description)}</p>
          <div class="meta-grid">
            <div class="meta-box"><strong>Release date</strong><span>${formatDate(game.releaseDate)}</span></div>
            <div class="meta-box"><strong>Genre</strong><span>${escapeHtml(game.genre)}</span></div>
            <div class="meta-box"><strong>Platforms</strong><span>${escapeHtml((game.platforms || []).join(", "))}</span></div>
            <div class="meta-box"><strong>Engine / build</strong><span>${escapeHtml(game.engine)}</span></div>
          </div>
          <div class="chip-list">
            ${(game.tags || []).map((tag) => `<span class="badge">${escapeHtml(tag)}</span>`).join("")}
          </div>
          <div class="card-actions" style="margin-top:22px">
            <a class="button" href="games.html">Back to games</a>
            <a class="button button-secondary" href="contact.html">Contact the studio</a>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-title-wrap">
          <div>
            <span class="section-kicker">Related projects</span>
            <h2 class="section-title">More from Orda Games</h2>
          </div>
          <p class="section-text"></p>
        </div>
        <div class="related-grid">
          ${related.map((item) => `
            <article class="info-card reveal">
              <div class="featured-card-media"><img src="${item.poster}" alt="${escapeHtml(item.name)} poster"></div>
              <div class="featured-card-content">
                <span class="badge">${escapeHtml(item.status)}</span>
                <h3 class="card-title">${escapeHtml(item.name)}</h3>
                <p class="card-text">${escapeHtml(item.shortDescription)}</p>
                <a class="button" href="game.html?slug=${encodeURIComponent(item.slug)}">Open project</a>
              </div>
            </article>
          `).join("")}
        </div>
      </div>
    </section>
  `;
}

function renderHistoryPage() {
  const mount = document.getElementById("historyMount");
  if (!mount) return;

  mount.innerHTML = `
    <section class="page-hero">
      <div class="container page-hero-grid">
        <div class="glass-card page-hero-card reveal">
          <span class="section-kicker">Studio history</span>
          <h1 class="page-hero-title">The story and direction of Orda Games</h1>
          <p class="page-hero-text">The journey behind Orda Games and the direction we are building toward.</p>
        </div>
        <div class="page-hero-side">
          <article class="glass-card page-hero-card reveal">
            <h2 class="card-title">Why this page matters</h2>
            <p class="card-text">Every studio starts with a vision. This is how ours began.</p>
          </article>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="timeline">
          ${state.data.milestones.map((item) => `
            <article class="timeline-card reveal">
              <div class="timeline-year">${escapeHtml(item.year)}</div>
              <div>
                <h3>${escapeHtml(item.title)}</h3>
                <p>${escapeHtml(item.text)}</p>
              </div>
            </article>
          `).join("")}
        </div>
      </div>
    </section>
  `;
}

function renderStaffPage() {
  const mount = document.getElementById("staffMount");
  if (!mount) return;

  mount.innerHTML = `
    <section class="page-hero">
      <div class="container page-hero-grid">
        <div class="glass-card page-hero-card reveal">
          <span class="section-kicker">Team</span>
          <h1 class="page-hero-title">People behind the studio</h1>
          <p class="page-hero-text">The people shaping the vision and development of Orda Games.</p>
        </div>
        <div class="page-hero-side">
          <article class="glass-card metric reveal">
            <strong>${state.data.staff.length.toString().padStart(2, "0")}</strong>
            <span>Visible team profiles</span>
          </article>
          <article class="glass-card metric reveal">
            <strong>${new Set(state.data.staff.flatMap((person) => person.specialties || [])).size.toString().padStart(2, "0")}</strong>
            <span>Specialties showcased</span>
          </article>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="staff-grid">
          ${state.data.staff.map((person) => `
            <article class="staff-card card reveal">
              <img src="${person.image}" alt="${escapeHtml(person.name)} portrait">
              <div class="staff-card-content">
                <span class="badge">${escapeHtml(person.role)}</span>
                <h3>${escapeHtml(person.name)}</h3>
                <p class="card-text">${escapeHtml(person.bio)}</p>
                <div class="chip-list">${(person.specialties || []).map((tag) => `<span class="badge">${escapeHtml(tag)}</span>`).join("")}</div>
                <div class="card-actions">
                  <button class="button" type="button" data-open-staff="${escapeHtml(person.name)}">View profile</button>
                </div>
              </div>
            </article>
          `).join("")}
        </div>
      </div>
    </section>
  `;
  ensureModal();
  attachStaffTriggers();
}

function renderContactPage() {
  const mount = document.getElementById("contactMount");
  if (!mount) return;

  mount.innerHTML = `
    <section class="page-hero">
      <div class="container page-hero-grid">
        <div class="glass-card page-hero-card reveal">
          <span class="section-kicker">Contact</span>
          <h1 class="page-hero-title">Let’s build something with impact</h1>
          <p class="page-hero-text">For business, press, and collaboration inquiries, get in touch with the studio.</p>
        </div>
        <div class="page-hero-side">
          <article class="glass-card page-hero-card reveal">
            <h2 class="card-title">Static hosting note</h2>
            <p class="card-text">This form will open your default email client with a prepared message to the studio.</p>
          </article>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container contact-grid">
        <div class="contact-stack">
          <article class="glass-card contact-card reveal">
            <h3>Studio contact</h3>
            <p>${escapeHtml(state.data.contact.altText)}</p>
            <div class="contact-list">
              <div class="contact-item">
                <span class="contact-label">Email</span>
                <a href="mailto:${escapeHtml(state.data.contact.email)}">${escapeHtml(state.data.contact.email)}</a>
              </div>
              <div class="contact-item">
                <span class="contact-label">Website</span>
                <a href="${escapeHtml(state.data.contact.githubPagesUrl)}" target="_blank" rel="noreferrer">${escapeHtml(state.data.contact.githubPagesUrl)}</a>
              </div>
              <div class="contact-item">
                <span class="contact-label">Studio</span>
                <span>${escapeHtml(state.data.studio.name)} • ${escapeHtml(state.data.studio.location)}</span>
              </div>
            </div>
          </article>

          <article class="glass-card contact-card reveal">
            <h3>FAQ</h3>
            <div class="faq-list">
              ${state.data.faq.map((item) => `
                <div class="faq-item">
                  <h3>${escapeHtml(item.question)}</h3>
                  <p>${escapeHtml(item.answer)}</p>
                </div>
              `).join("")}
            </div>
          </article>
        </div>

        <article class="glass-card form-card reveal">
          <h3>Send a message</h3>
          <p>Fill in the form and your default email app will open a prepared draft addressed to ${escapeHtml(state.data.contact.email)}.</p>
          <form id="contactForm" class="form-grid" novalidate>
            <div>
              <label class="contact-label" for="name">Name</label>
              <input class="text-input" id="name" name="name" type="text" placeholder="Your name" required>
            </div>
            <div>
              <label class="contact-label" for="email">Email</label>
              <input class="text-input" id="email" name="email" type="email" placeholder="you@example.com" required>
            </div>
            <div class="span-2">
              <label class="contact-label" for="subject">Subject</label>
              <input class="text-input" id="subject" name="subject" type="text" placeholder="Collaboration, publishing, press, hiring..." required>
            </div>
            <div class="span-2">
              <label class="contact-label" for="message">Message</label>
              <textarea class="textarea-input" id="message" name="message" placeholder="Tell Orda Games about your project, request, or opportunity." required></textarea>
            </div>
            <div class="span-2">
              <button class="button full" type="submit">Prepare email draft</button>
              <div class="form-status" id="formStatus" aria-live="polite"></div>
            </div>
          </form>
        </article>
      </div>
    </section>
  `;

  document.getElementById("contactForm")?.addEventListener("submit", handleContactSubmit);
}

function handleContactSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const status = document.getElementById("formStatus");
  const formData = new FormData(form);
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const subject = String(formData.get("subject") || "").trim();
  const message = String(formData.get("message") || "").trim();

  if (!name || !email || !subject || !message) {
    status.textContent = "Please fill in every field before sending.";
    status.className = "form-status error";
    return;
  }

  const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailIsValid) {
    status.textContent = "Please enter a valid email address.";
    status.className = "form-status error";
    return;
  }

  const composedSubject = `[Orda Games Website] ${subject}`;
  const composedBody = [
    `Name: ${name}`,
    `Email: ${email}`,
    ``,
    `${message}`,
    ``,
    `Sent from the Orda Games website contact form.`
  ].join("\n");

  const href = `mailto:${encodeURIComponent(state.data.contact.email)}?subject=${encodeURIComponent(composedSubject)}&body=${encodeURIComponent(composedBody)}`;
  window.location.href = href;
  status.textContent = "Your email draft was prepared in your default mail app.";
  status.className = "form-status";
  form.reset();
}

function renderNewsSlide() {
  const slider = document.getElementById("newsSlider");
  if (!slider) return;
  const item = state.data.news[state.newsIndex];
  slider.innerHTML = `
    <div>
      <span class="badge accent">${escapeHtml(item.category)}</span>
      <div class="news-date">${formatDate(item.date)}</div>
      <h2 class="news-title">${escapeHtml(item.title)}</h2>
      <p class="news-summary">${escapeHtml(item.summary)}</p>
    </div>
    <div class="slider-controls">
      <button class="icon-button" type="button" id="newsPrev" aria-label="Previous news">←</button>
      <button class="icon-button" type="button" id="newsNext" aria-label="Next news">→</button>
    </div>
  `;
  document.getElementById("newsPrev")?.addEventListener("click", () => {
    state.newsIndex = (state.newsIndex - 1 + state.data.news.length) % state.data.news.length;
    renderNewsSlide();
  });
  document.getElementById("newsNext")?.addEventListener("click", () => {
    state.newsIndex = (state.newsIndex + 1) % state.data.news.length;
    renderNewsSlide();
  });
}

function ensureModal() {
  if (document.getElementById("siteModal")) return;
  const modal = document.createElement("div");
  modal.id = "siteModal";
  modal.className = "modal";
  modal.innerHTML = `<div class="modal-dialog" id="siteModalDialog"></div>`;
  document.body.appendChild(modal);
}

function attachGameTriggers() {
  document.querySelectorAll("[data-open-game]").forEach((button) => {
    button.addEventListener("click", () => {
      const slug = button.dataset.openGame;
      const game = state.data.games.find((item) => item.slug === slug);
      if (!game) return;
      openModal(renderGameModal(game));
    });
  });
}

function attachStaffTriggers() {
  document.querySelectorAll("[data-open-staff]").forEach((button) => {
    button.addEventListener("click", () => {
      const name = button.dataset.openStaff;
      const person = state.data.staff.find((item) => item.name === name);
      if (!person) return;
      openModal(renderStaffModal(person));
    });
  });
}

function renderGameModal(game) {
  return `
    <div class="modal-grid">
      <div class="modal-media"><img src="${game.poster}" alt="${escapeHtml(game.name)} poster"></div>
      <div class="modal-content">
        <div class="modal-top">
          <div>
            <span class="badge accent">${escapeHtml(game.status)}</span>
            <h2 class="modal-title">${escapeHtml(game.name)}</h2>
          </div>
          <button class="modal-close" type="button" data-close-modal aria-label="Close modal">✕</button>
        </div>
        <p>${escapeHtml(game.description)}</p>
        <div class="meta-grid">
          <div class="meta-box"><strong>Release date</strong><span>${formatDate(game.releaseDate)}</span></div>
          <div class="meta-box"><strong>Genre</strong><span>${escapeHtml(game.genre)}</span></div>
          <div class="meta-box"><strong>Platforms</strong><span>${escapeHtml((game.platforms || []).join(", "))}</span></div>
          <div class="meta-box"><strong>Engine</strong><span>${escapeHtml(game.engine)}</span></div>
        </div>
        <div class="chip-list">${(game.tags || []).map((tag) => `<span class="badge">${escapeHtml(tag)}</span>`).join("")}</div>
        <div class="card-actions" style="margin-top:22px">
          <a class="button" href="game.html?slug=${encodeURIComponent(game.slug)}">Open full page</a>
          <button class="button button-secondary" type="button" data-close-modal>Close</button>
        </div>
      </div>
    </div>
  `;
}

function renderStaffModal(person) {
  return `
    <div class="modal-grid">
      <div class="modal-media"><img src="${person.image}" alt="${escapeHtml(person.name)} portrait"></div>
      <div class="modal-content">
        <div class="modal-top">
          <div>
            <span class="badge accent">${escapeHtml(person.role)}</span>
            <h2 class="modal-title">${escapeHtml(person.name)}</h2>
          </div>
          <button class="modal-close" type="button" data-close-modal aria-label="Close modal">✕</button>
        </div>
        <p>${escapeHtml(person.bio)}</p>
        <div class="chip-list">${(person.specialties || []).map((tag) => `<span class="badge">${escapeHtml(tag)}</span>`).join("")}</div>
        <div class="card-actions" style="margin-top:22px">
          <a class="button" href="contact.html">Work with the studio</a>
          <button class="button button-secondary" type="button" data-close-modal>Close</button>
        </div>
      </div>
    </div>
  `;
}

function openModal(content) {
  const modal = document.getElementById("siteModal");
  const dialog = document.getElementById("siteModalDialog");
  if (!modal || !dialog) return;
  dialog.innerHTML = content;
  modal.classList.add("is-open");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  const modal = document.getElementById("siteModal");
  if (!modal) return;
  modal.classList.remove("is-open");
  document.body.style.overflow = "";
}

function setupRevealObserver() {
  const revealItems = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.16 });
  revealItems.forEach((item) => observer.observe(item));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}
