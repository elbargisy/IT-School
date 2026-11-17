/**
 * Bargisy eSchool - Main Application Controller (Static & Client-side)
 * Handles SPA hash routing, catalog rendering, search/filters, article reader mode, and toasts.
 */

const App = {
  currentCategory: 'all',
  currentTrack: 'all',
  currentSearch: '',
  currentHubSubtrack: 'css',
  allArticles: [],

  init() {
    this.initMarkdown();
    this.bindGlobalEvents();
    if (typeof ArticleStore !== 'undefined' && ArticleStore.init) {
      ArticleStore.init();
    }
    // Initialise the studio and the sandboxes BEFORE routing, so a direct link
    // like #/labs/web finds the editors already filled with a starter project.
    if (typeof EditorStudio !== 'undefined' && EditorStudio.init) {
      EditorStudio.init();
    }
    if (typeof InteractiveLab !== 'undefined' && InteractiveLab.init) {
      InteractiveLab.init();
    }
    this.loadCatalog();
    this.handleRouting();
    window.addEventListener("hashchange", () => this.handleRouting());
  },

  initMarkdown() {
    if (window.marked && typeof window.marked.use === "function") {
      const esc = (t) => App.escapeHtml(t);
      window.marked.use({
        gfm: true,
        breaks: true,
        renderer: {
          // Lessons talk about tags like <style>, <script>, <article>.
          // Show them as text instead of letting the browser create real elements.
          html(token) {
            const raw = typeof token === "string" ? token : (token.raw != null ? token.raw : token.text);
            return esc(raw);
          }
        }
      });
    }
  },

  // Markdown -> HTML, turning ":::solution ... :::" blocks into hidden solution panels
  renderLessonMarkdown(md) {
    if (!window.marked) return `<pre>${this.escapeHtml(md)}</pre>`;
    const solutions = [];
    const withTokens = String(md || "").replace(/^:::solution[ \t]*\r?\n([\s\S]*?)^:::[ \t]*$/gm, (m, inner) => {
      solutions.push(inner);
      return `\n\nBARGISYSOLUTIONTOKEN${solutions.length - 1}\n\n`;
    });
    let html = window.marked.parse(withTokens);
    solutions.forEach((inner, i) => {
      const body = window.marked.parse(inner);
      const block = `<div class="solution-block" data-solution>
        <button type="button" class="solution-toggle" aria-expanded="false" onclick="App.toggleSolution(this)">
          <i class="fa-solid fa-eye"></i><span>Show Solution</span>
        </button>
        <p class="solution-hint">Try the challenge yourself first, then check your answer here.</p>
        <div class="solution-body" hidden>
          <div class="solution-label"><i class="fa-solid fa-circle-check"></i> Solution</div>
          ${body}
        </div>
      </div>`;
      html = html.replace(new RegExp(`<p>BARGISYSOLUTIONTOKEN${i}</p>`), () => block);
    });
    return html;
  },

  toggleSolution(btn) {
    const block = btn.closest("[data-solution]");
    if (!block) return;
    const body = block.querySelector(".solution-body");
    const hint = block.querySelector(".solution-hint");
    const open = body.hasAttribute("hidden");
    if (open) body.removeAttribute("hidden"); else body.setAttribute("hidden", "");
    if (hint) hint.style.display = open ? "none" : "";
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    btn.innerHTML = open
      ? '<i class="fa-solid fa-eye-slash"></i><span>Hide Solution</span>'
      : '<i class="fa-solid fa-eye"></i><span>Show Solution</span>';
    block.classList.toggle("is-open", open);
  },

  escapeHtml(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  },

  // Safe for use inside onclick="...('X')" attributes
  escapeAttrJs(str) {
    return String(str == null ? "" : str).replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/"/g, "&quot;");
  },

  firstSlug(arrName) {
    const arr = window[arrName];
    return (arr && arr[0]) ? this.escapeAttrJs(arr[0].slug) : "";
  },

  runHeroSearch() {
    const heroSearch = document.getElementById("heroSearchInput");
    const val = heroSearch ? heroSearch.value.trim() : "";
    this.currentCategory = "all";
    this.currentTrack = "all";
    window.location.hash = "#/browse";
    setTimeout(() => {
      const bSearch = document.getElementById("mainSearchInput");
      if (bSearch) {
        bSearch.value = val;
        this.currentSearch = val;
        this.filterAndRenderArticles();
      }
    }, 100);
  },

  bindGlobalEvents() {
    const mainSearch = document.getElementById("mainSearchInput");
    if (mainSearch) {
      mainSearch.addEventListener("input", (e) => {
        this.currentSearch = e.target.value;
        this.filterAndRenderArticles();
      });
    }

    const heroSearch = document.getElementById("heroSearchInput");
    if (heroSearch) {
      heroSearch.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          this.runHeroSearch();
        }
      });
    }

    window.addEventListener("scroll", () => {
      const progressBar = document.getElementById("readingProgressBar");
      if (progressBar && !document.getElementById("viewArticle").classList.contains("hidden")) {
        const docElem = document.documentElement;
        const total = docElem.scrollHeight - docElem.clientHeight;
        const progress = total > 0 ? (docElem.scrollTop / total) * 100 : 0;
        progressBar.style.width = `${progress}%`;
      }
    });
  },

  showView(viewId) {
    const views = ["viewHome", "viewBrowse", "viewArticle", "viewStudio", "viewLabs"];
    views.forEach(v => {
      const el = document.getElementById(v);
      if (el) el.classList.toggle("hidden", v !== viewId);
    });
  },

  handleRouting() {
    const hash = window.location.hash || "#/";

    document.querySelectorAll(".nav-link").forEach(link => {
      link.classList.remove("text-blue-600", "font-bold");
      link.classList.add("text-slate-600");
    });

    window.scrollTo({ top: 0, behavior: "smooth" });

    // Close the mobile menu after navigating
    const mobileMenu = document.getElementById("mobileMenu");
    if (mobileMenu) mobileMenu.classList.add("hidden");

    if (hash === "#/" || hash === "" || hash === "#home") {
      this.showView("viewHome");
      this.setActiveNav("navHome");
      this.loadCatalog();
    } else if (hash.startsWith("#/browse") || hash.startsWith("#/courses")) {
      this.setActiveNav("navCourses");
      this.setCategoryFilter("all", "all", false);
    } else if (hash === "#/programming") {
      this.setActiveNav("navProgramming");
      this.setCategoryFilter("programming", "all", false);
    } else if (hash === "#/python") {
      this.setActiveNav("navProgramming");
      this.setTrackFilter("python", false);
    } else if (hash === "#/frontend" || hash === "#/frontend-developer") {
      this.setActiveNav("navProgramming");
      this.setTrackFilter("frontend", false);
    } else if (hash === "#/html") {
      this.setActiveNav("navProgramming");
      this.setTrackFilter("html", false);
    } else if (hash === "#/css") {
      this.setActiveNav("navProgramming");
      this.setTrackFilter("css", false);
    } else if (hash === "#/javascript" || hash === "#/js") {
      this.setActiveNav("navProgramming");
      this.setTrackFilter("javascript", false);
    } else if (hash === "#/computer-skills") {
      this.setActiveNav("navComputerSkills");
      this.setCategoryFilter("computer_skills", "all", false);
    } else if (hash === "#/excel") {
      this.setActiveNav("navExcel");
      this.setCategoryFilter("excel", "all", false);
    } else if (hash.startsWith("#/article/")) {
      const slug = hash.replace("#/article/", "");
      this.showView("viewArticle");
      this.loadAndDisplayArticle(slug);
    } else if (hash === "#/studio") {
      this.showView("viewStudio");
      this.setActiveNav("navStudio");
      if (typeof EditorStudio !== 'undefined') {
        EditorStudio.loadArticlesList();
      }
    } else if (hash.startsWith("#/labs") || hash === "#labs") {
      this.showView("viewLabs");
      this.setActiveNav("navLabs");
      if (typeof InteractiveLab !== 'undefined') {
        if (hash.includes("python")) {
          InteractiveLab.switchLab("python");
        } else if (hash.includes("web") || hash.includes("frontend") || hash.includes("html") || hash.includes("css") || hash.includes("js")) {
          InteractiveLab.switchLab("web");
        } else {
          InteractiveLab.switchLab("excel");
        }
      }
    } else {
      this.showView("viewHome");
    }
  },

  setActiveNav(navId) {
    const el = document.getElementById(navId);
    if (el) {
      el.classList.add("text-blue-600", "font-bold");
      el.classList.remove("text-slate-600");
    }
  },

  loadCatalog() {
    this.allArticles = ArticleStore.list({ status: "published" });
    this.renderHomeFeatured();
    this.filterAndRenderArticles();
  },

  renderHomeFeatured() {
    const container = document.getElementById("homeFeaturedGrid");
    if (!container) return;

    if (this.allArticles.length === 0) {
      container.innerHTML = `<div class="col-span-3 text-center py-12 text-slate-400">No published articles yet. Check the Author Studio to publish drafts!</div>`;
      return;
    }

    const featured = this.allArticles.slice(0, 6);
    container.innerHTML = featured.map(article => this.createArticleCardHtml(article)).join("");
  },

  updateActiveFilterButtons() {
    document.querySelectorAll(".cat-filter-btn").forEach(btn => {
      btn.className = "cat-filter-btn px-3.5 py-2 rounded-xl text-xs font-medium bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition";
    });

    let targetBtnId = "catBtn_all";
    if (this.currentCategory === "programming") {
      if (this.currentTrack === "python") targetBtnId = "catBtn_python";
      else if (this.currentTrack === "html") targetBtnId = "catBtn_html";
      else if (this.currentTrack === "css") targetBtnId = "catBtn_css";
      else if (this.currentTrack === "javascript") targetBtnId = "catBtn_javascript";
      else if (this.currentTrack === "frontend") targetBtnId = "catBtn_frontend";
      else targetBtnId = "catBtn_programming";
    } else if (this.currentCategory === "excel") {
      targetBtnId = "catBtn_excel";
    } else if (this.currentCategory === "computer_skills") {
      targetBtnId = "catBtn_computer_skills";
    }

    const activeBtn = document.getElementById(targetBtnId);
    if (activeBtn) {
      activeBtn.className = "cat-filter-btn px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white shadow-sm transition";
    }
  },

  setCategoryFilter(category, track = "all", updateHash = true) {
    this.currentCategory = category;
    this.currentTrack = track;

    if (updateHash) {
      if (category === "all") window.location.hash = "#/courses";
      else if (category === "excel") window.location.hash = "#/excel";
      else if (category === "computer_skills") window.location.hash = "#/computer-skills";
      else if (category === "programming") {
        if (track === "python") window.location.hash = "#/python";
        else if (track === "html") window.location.hash = "#/html";
        else if (track === "css") window.location.hash = "#/css";
        else if (track === "javascript") window.location.hash = "#/javascript";
        else if (track === "frontend") window.location.hash = "#/frontend";
        else window.location.hash = "#/programming";
      }
    }

    // Reset search input
    const searchInput = document.getElementById("mainSearchInput");
    if (searchInput && this.currentSearch) {
      searchInput.value = "";
      this.currentSearch = "";
    }

    this.showView("viewBrowse");
    this.updateActiveFilterButtons();
    this.filterAndRenderArticles();
  },

  setTrackFilter(track, updateHash = true) {
    this.currentCategory = "programming";
    this.currentTrack = track;

    if (updateHash) {
      if (track === "python") window.location.hash = "#/python";
      else if (track === "html") window.location.hash = "#/html";
      else if (track === "css") window.location.hash = "#/css";
      else if (track === "javascript") window.location.hash = "#/javascript";
      else if (track === "frontend") window.location.hash = "#/frontend";
      else window.location.hash = "#/programming";
    }

    // Reset search input
    const searchInput = document.getElementById("mainSearchInput");
    if (searchInput && this.currentSearch) {
      searchInput.value = "";
      this.currentSearch = "";
    }

    this.showView("viewBrowse");
    this.updateActiveFilterButtons();
    this.filterAndRenderArticles();
  },

  switchHubFrontendSubtrack(subtrack) {
    this.currentHubSubtrack = subtrack;
    ['css', 'javascript', 'html'].forEach(st => {
      const btn = document.getElementById(`hubFeTab_${st}`);
      if (btn) {
        if (st === subtrack) {
          const colors = {
            css: "bg-sky-600 text-white shadow-sm font-bold",
            javascript: "bg-amber-600 text-white shadow-sm font-bold",
            html: "bg-orange-600 text-white shadow-sm font-bold"
          };
          btn.className = `px-3.5 py-1.5 rounded-xl text-xs transition ${colors[st]}`;
        } else {
          btn.className = "px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition";
        }
      }
    });

    const container = document.getElementById("hubFrontendLessonsContainer");
    if (!container) return;

    let subLessons = [];
    if (subtrack === 'css') {
      subLessons = ArticleStore.list({ track: 'css' });
    } else if (subtrack === 'javascript') {
      subLessons = ArticleStore.list({ track: 'javascript' });
    } else if (subtrack === 'html') {
      subLessons = ArticleStore.list({ track: 'html' });
    }

    container.innerHTML = subLessons.map(a => this.createCompactLessonRowHtml(a)).join("");
  },

  createCompactLessonRowHtml(a) {
    let numStr = a.lesson_number ? String(a.lesson_number).padStart(2, '0') : "01";
    let badgeColor = "bg-slate-100 text-slate-700 border-slate-200";
    if (a.track === 'css') badgeColor = "bg-sky-50 text-sky-700 border-sky-200";
    else if (a.track === 'javascript') badgeColor = "bg-amber-50 text-amber-700 border-amber-200";
    else if (a.track === 'html') badgeColor = "bg-orange-50 text-orange-700 border-orange-200";
    else if (a.track === 'python') badgeColor = "bg-blue-50 text-blue-700 border-blue-200";

    return `
      <div onclick="App.navigateToArticle('${this.escapeAttrJs(a.slug)}')" class="p-3 rounded-2xl bg-white hover:bg-blue-50/50 border border-slate-200 hover:border-blue-400 transition cursor-pointer flex items-center justify-between group shadow-2xs">
        <div class="flex items-center gap-3 flex-1 min-w-0 pr-2">
          <span class="px-2.5 py-1 rounded-lg text-xs font-mono font-extrabold border ${badgeColor} shrink-0">
            #${numStr}
          </span>
          <div class="min-w-0 flex-1">
            <h4 class="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition truncate" title="${this.escapeHtml(a.title)}">
              ${this.escapeHtml(a.title)}
            </h4>
            <p class="text-[11px] text-slate-500 truncate mt-0.5">
              ${this.escapeHtml(a.summary || "Practical code tutorial and hands-on challenge.")}
            </p>
          </div>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <span class="text-[10px] text-slate-400 font-medium">
            <i class="fa-regular fa-clock text-[9px]"></i> ${a.read_time || 5}m
          </span>
          <i class="fa-solid fa-arrow-right text-[10px] text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition"></i>
        </div>
      </div>
    `;
  },

  filterAndRenderArticles() {
    const grid = document.getElementById("catalogArticlesGrid");
    const countBadge = document.getElementById("catalogResultsCount");
    if (!grid) return;

    let filtered = ArticleStore.list({
      status: "published",
      category: this.currentCategory,
      track: this.currentTrack,
      search: this.currentSearch
    });

    // Update results counter badge
    if (countBadge) {
      if (this.currentSearch && this.currentSearch.trim()) {
        countBadge.innerText = `${filtered.length} tutorials found`;
      } else if (this.currentTrack === "css") {
        countBadge.innerText = `Showing all ${filtered.length} of 100 CSS Lessons`;
      } else if (this.currentTrack === "javascript") {
        countBadge.innerText = `Showing all ${filtered.length} of 100 JavaScript Lessons`;
      } else if (this.currentTrack === "python") {
        countBadge.innerText = `Showing all ${filtered.length} of 100 Python Lessons`;
      } else if (this.currentTrack === "html") {
        countBadge.innerText = `Showing all ${filtered.length} of 20 HTML Lessons`;
      } else if (this.currentTrack === "frontend") {
        countBadge.innerText = `Showing all ${filtered.length} of 220 Front-End Lessons`;
      } else if (this.currentCategory === "excel") {
        countBadge.innerText = `Showing all ${filtered.length} of 100 Excel Lessons`;
      } else if (this.currentCategory === "computer_skills") {
        countBadge.innerText = `Showing all ${filtered.length} of 100 Computer & IT Lessons`;
      } else if (this.currentCategory === "programming") {
        countBadge.innerText = `Showing all ${filtered.length} Programming Lessons`;
      } else {
        countBadge.innerText = `${filtered.length} tutorials available`;
      }
    }

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full py-16 text-center text-slate-400">
          <i class="fa-solid fa-magnifying-glass text-4xl mb-3 block text-slate-300"></i>
          <h3 class="text-lg font-bold text-slate-700">No lessons matched your criteria</h3>
          <p class="text-sm mt-1">Try another keyword or category filter.</p>
        </div>
      `;
      return;
    }

    // =========================================================================
    // CASE 1: PROGRAMMING HUB (Category === 'programming' and Track === 'all')
    // Divided into 2 distinct sections: Python Path (100) and Front-End Path (220)
    // =========================================================================
    if (this.currentCategory === "programming" && this.currentTrack === "all" && (!this.currentSearch || !this.currentSearch.trim())) {
      const pythonLessons = ArticleStore.list({ track: "python" });
      const cssLessons = ArticleStore.list({ track: "css" });

      grid.innerHTML = `
        <div class="col-span-full mb-6 space-y-6">
          
          <!-- Top Programming Hub Banner -->
          <div class="p-8 rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-blue-950 text-white shadow-xl border border-indigo-900/40 relative overflow-hidden">
            <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div>
                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold uppercase tracking-wider mb-2">
                  <i class="fa-solid fa-code"></i> Bargisy eSchool Programming Curricula (320 Lessons)
                </div>
                <h2 class="text-2xl sm:text-3xl font-black text-white">Programming Tracks & Engineering Paths</h2>
                <p class="text-xs sm:text-sm text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
                  Divided into 2 dedicated paths: <strong>Python Developer Path</strong> (100 sequential lessons from easiest to advanced) on the left, and the <strong>Front-End Developer Path</strong> (20 HTML, 100 CSS, and 100 JavaScript lessons) on the right.
                </p>
              </div>

              <!-- Quick Track Switcher Pills -->
              <div class="flex flex-wrap items-center gap-1.5 bg-slate-900/90 p-2 rounded-2xl border border-slate-800 self-start lg:self-auto">
                <button onclick="App.setCategoryFilter('programming', 'all', true)" class="px-3 py-1.5 rounded-xl text-xs font-bold transition bg-blue-600 text-white shadow-md">
                  All Programming (320)
                </button>
                <button onclick="App.setTrackFilter('python', true)" class="px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 text-slate-300 hover:text-white">
                  <span>🐍 Python</span>
                  <span class="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300">100</span>
                </button>
                <button onclick="App.setTrackFilter('css', true)" class="px-2.5 py-1.5 rounded-xl text-xs font-semibold transition text-slate-300 hover:text-sky-400">
                  <i class="fa-brands fa-css3-alt mr-1 text-sky-400"></i> CSS (100)
                </button>
                <button onclick="App.setTrackFilter('javascript', true)" class="px-2.5 py-1.5 rounded-xl text-xs font-semibold transition text-slate-300 hover:text-amber-400">
                  <i class="fa-brands fa-js mr-1 text-amber-400"></i> JS (100)
                </button>
                <button onclick="App.setTrackFilter('html', true)" class="px-2.5 py-1.5 rounded-xl text-xs font-semibold transition text-slate-300 hover:text-orange-400">
                  HTML (20)
                </button>
                <button onclick="App.setTrackFilter('frontend', true)" class="px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 text-slate-300 hover:text-white">
                  <span>🌐 All Web</span>
                  <span class="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300">220</span>
                </button>
              </div>
            </div>
          </div>

          <!-- THE TWO PRIMARY SECTIONS (DIVIDED AS REQUESTED) -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            <!-- SECTION 1: PYTHON DEVELOPER PATH (100 LESSONS) -->
            <div class="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div class="flex items-center gap-3">
                    <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl font-bold">
                      <i class="fa-brands fa-python"></i>
                    </div>
                    <div>
                      <h3 class="text-xl font-black text-slate-900">Python Developer Path</h3>
                      <span class="text-xs font-bold text-blue-700">100 Sequential Lessons (Beginner to Advanced)</span>
                    </div>
                  </div>
                  <button onclick="App.setTrackFilter('python', true)" class="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition flex items-center gap-1">
                    <span>Full Grid</span>
                    <i class="fa-solid fa-arrow-right text-[10px]"></i>
                  </button>
                </div>

                <p class="text-xs text-slate-600 my-3 leading-relaxed">
                  Sequenced from easiest fundamentals (print, variables, types, loops) through OOP, decorators, error handling, standard libraries, and capstone automation scripts.
                </p>

                <!-- Scrollable Python Lessons List -->
                <div class="max-h-[540px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  ${pythonLessons.map(a => this.createCompactLessonRowHtml(a)).join("")}
                </div>
              </div>

              <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button onclick="App.setTrackFilter('python', true)" class="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                  <span>Browse All 100 Python Lessons</span>
                  <i class="fa-solid fa-arrow-right text-[10px]"></i>
                </button>
                <button onclick="App.navigateToArticle('${App.firstSlug('PYTHON_100_LESSONS')}')" class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-sm flex items-center gap-1.5">
                  <span>Start Lesson 01</span>
                  <i class="fa-solid fa-play text-[10px]"></i>
                </button>
              </div>
            </div>

            <!-- SECTION 2: FRONT-END DEVELOPER PATH (220 LESSONS) -->
            <div class="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div class="flex items-center gap-3">
                    <div class="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl font-bold">
                      <i class="fa-solid fa-laptop-code"></i>
                    </div>
                    <div>
                      <h3 class="text-xl font-black text-slate-900">Front-End Developer Path</h3>
                      <span class="text-xs font-bold text-amber-700">220 Lessons Total (HTML, CSS, JS)</span>
                    </div>
                  </div>
                  <button onclick="App.setTrackFilter('frontend', true)" class="px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs transition flex items-center gap-1">
                    <span>Full Grid</span>
                    <i class="fa-solid fa-arrow-right text-[10px]"></i>
                  </button>
                </div>

                <!-- Sub-track Interactive Switcher -->
                <div class="flex flex-wrap items-center gap-2 my-3">
                  <button id="hubFeTab_css" onclick="App.switchHubFrontendSubtrack('css')" class="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-sky-600 text-white shadow-sm transition flex items-center gap-1.5">
                    <i class="fa-brands fa-css3-alt"></i>
                    <span>100 CSS Lessons</span>
                  </button>
                  <button id="hubFeTab_javascript" onclick="App.switchHubFrontendSubtrack('javascript')" class="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-amber-50 hover:text-amber-700 transition flex items-center gap-1.5">
                    <i class="fa-brands fa-js"></i>
                    <span>100 JS Lessons</span>
                  </button>
                  <button id="hubFeTab_html" onclick="App.switchHubFrontendSubtrack('html')" class="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-orange-50 hover:text-orange-700 transition flex items-center gap-1.5">
                    <i class="fa-brands fa-html5"></i>
                    <span>20 HTML Lessons</span>
                  </button>
                </div>

                <!-- Scrollable Front-End Lessons List -->
                <div id="hubFrontendLessonsContainer" class="max-h-[540px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  ${cssLessons.map(a => this.createCompactLessonRowHtml(a)).join("")}
                </div>
              </div>

              <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <button onclick="App.setTrackFilter('css', true)" class="text-xs font-bold text-sky-700 hover:text-sky-900">
                    Open 100 CSS
                  </button>
                  <span class="text-slate-300">•</span>
                  <button onclick="App.setTrackFilter('javascript', true)" class="text-xs font-bold text-amber-700 hover:text-amber-900">
                    Open 100 JS
                  </button>
                </div>
                <button onclick="App.navigateToArticle('${App.firstSlug('HTML_20_LESSONS')}')" class="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition shadow-sm flex items-center gap-1.5">
                  <span>Start Web 01</span>
                  <i class="fa-solid fa-play text-[10px]"></i>
                </button>
              </div>
            </div>

          </div>
        </div>
      `;
      return;
    }

    // =========================================================================
    // CASE 2: DEDICATED TRACK OR CATEGORY BANNERS
    // =========================================================================
    let headerHtml = "";

    if (this.currentTrack === "css") {
      headerHtml = `
        <div class="col-span-full mb-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-sky-950 via-blue-950 to-slate-900 text-white shadow-xl border border-sky-800/40">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-bold uppercase tracking-wider mb-2">
                <i class="fa-brands fa-css3-alt"></i> Complete CSS Curriculum: 100 Lessons (Ordered 1 to 100)
              </div>
              <h2 class="text-2xl sm:text-3xl font-black text-white">CSS Styling & Modern Web Design Mastery</h2>
              <p class="text-xs sm:text-sm text-sky-100/90 mt-1.5 max-w-3xl leading-relaxed">
                Sequenced from fundamental selectors, box model, and fonts, through Flexbox, CSS Grid, media queries, keyframe animations, CSS variables, and modern SaaS landing pages. All 100 lessons are accessible below.
              </p>
            </div>
            <div class="flex flex-wrap items-center gap-3">
              <button onclick="App.navigateToArticle('${App.firstSlug('CSS_100_LESSONS')}')" class="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-sky-500/25 flex items-center gap-2">
                <span>Start CSS Lesson 01</span>
                <i class="fa-solid fa-arrow-right"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    } else if (this.currentTrack === "javascript") {
      headerHtml = `
        <div class="col-span-full mb-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-950 via-yellow-950 to-slate-900 text-white shadow-xl border border-amber-800/40">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider mb-2">
                <i class="fa-brands fa-js"></i> Complete JavaScript Curriculum: 100 Lessons (Ordered 1 to 100)
              </div>
              <h2 class="text-2xl sm:text-3xl font-black text-white">JavaScript & Interactive Web Mastery</h2>
              <p class="text-xs sm:text-sm text-amber-100/90 mt-1.5 max-w-3xl leading-relaxed">
                Ordered from variables, types, and loops up through DOM manipulation, event listeners, async/await, API fetching, classes, and complete interactive capstone web applications. All 100 lessons are accessible below.
              </p>
            </div>
            <div class="flex flex-wrap items-center gap-3">
              <button onclick="App.navigateToArticle('${App.firstSlug('JS_100_LESSONS')}')" class="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-amber-500/25 flex items-center gap-2">
                <span>Start JS Lesson 01</span>
                <i class="fa-solid fa-arrow-right"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    } else if (this.currentTrack === "html") {
      headerHtml = `
        <div class="col-span-full mb-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-orange-950 via-amber-950 to-slate-900 text-white shadow-xl border border-orange-800/40">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30 text-xs font-bold uppercase tracking-wider mb-2">
                <i class="fa-brands fa-html5"></i> Semantic HTML5 Track: 20 Lessons (Ordered 1 to 20)
              </div>
              <h2 class="text-2xl sm:text-3xl font-black text-white">HTML5 Web Architecture & Semantics</h2>
              <p class="text-xs sm:text-sm text-orange-100/90 mt-1.5 max-w-3xl leading-relaxed">
                Master the structure of the web: semantic tags, document flow, forms, accessibility (ARIA), multimedia, tables, and SEO foundations.
              </p>
            </div>
            <div class="flex flex-wrap items-center gap-3">
              <button onclick="App.navigateToArticle('${App.firstSlug('HTML_20_LESSONS')}')" class="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-orange-500/25 flex items-center gap-2">
                <span>Start HTML Lesson 01</span>
                <i class="fa-solid fa-arrow-right"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    } else if (this.currentTrack === "python") {
      headerHtml = `
        <div class="col-span-full mb-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-900 text-white shadow-xl border border-blue-800/40">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold uppercase tracking-wider mb-2">
                <i class="fa-brands fa-python"></i> Complete Python Curriculum: 100 Lessons (Ordered 1 to 100)
              </div>
              <h2 class="text-2xl sm:text-3xl font-black text-white">Python Developer Path</h2>
              <p class="text-xs sm:text-sm text-blue-100/90 mt-1.5 max-w-3xl leading-relaxed">
                Sequenced from easiest fundamentals (print, variables, types, loops) through OOP, decorators, error handling, standard libraries, and capstone automation scripts.
              </p>
            </div>
            <div class="flex flex-wrap items-center gap-3">
              <button onclick="App.navigateToArticle('${App.firstSlug('PYTHON_100_LESSONS')}')" class="px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-blue-500/25 flex items-center gap-2">
                <span>Start Python Lesson 01</span>
                <i class="fa-solid fa-arrow-right"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    } else if (this.currentTrack === "frontend") {
      headerHtml = `
        <div class="col-span-full mb-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-950 via-sky-950 to-slate-900 text-white shadow-xl border border-indigo-800/40">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold uppercase tracking-wider mb-2">
                <i class="fa-solid fa-laptop-code"></i> Front-End Engineering: 220 Lessons
              </div>
              <h2 class="text-2xl sm:text-3xl font-black text-white">All Front-End Lessons (20 HTML + 100 CSS + 100 JS)</h2>
              <p class="text-xs sm:text-sm text-indigo-100/90 mt-1.5 max-w-3xl leading-relaxed">
                Complete sequential full-stack client curricula: HTML5 semantic structure (20 lessons), CSS3 design & responsive layouts (100 lessons), and JavaScript interactive mastery (100 lessons).
              </p>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <button onclick="App.setTrackFilter('css', true)" class="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition">
                CSS Only (100)
              </button>
              <button onclick="App.setTrackFilter('javascript', true)" class="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition">
                JS Only (100)
              </button>
            </div>
          </div>
        </div>
      `;
    } else if (this.currentCategory === "excel") {
      headerHtml = `
        <div class="col-span-full mb-2 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white shadow-xl border border-emerald-800/40">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider mb-2">
                <i class="fa-solid fa-graduation-cap"></i> Complete Curriculum: 100 Lessons (Ordered 1 to 100)
              </div>
              <h2 class="text-2xl sm:text-3xl font-black text-white">Excel Masterclass (Ordered 1 to 100)</h2>
              <p class="text-xs sm:text-sm text-emerald-100/90 mt-1.5 max-w-3xl leading-relaxed">
                Carefully ordered from the most simple fundamentals (Ribbon, Cell Referencing, AutoFill, Basic Math) up to complex functions (XLOOKUP, Dynamic Arrays, PivotTables, Power Query & VBA).
              </p>
            </div>
            <div class="flex flex-wrap items-center gap-3">
              <button onclick="App.navigateToArticle('${App.firstSlug('EXCEL_100_LESSONS')}')" class="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-emerald-500/25 flex items-center gap-2">
                <span>Start Lesson 01</span>
                <i class="fa-solid fa-arrow-right"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    } else if (this.currentCategory === "computer_skills") {
      headerHtml = `
        <div class="col-span-full mb-2 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 text-white shadow-xl border border-purple-800/40">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold uppercase tracking-wider mb-2">
                <i class="fa-solid fa-laptop-code"></i> Complete IT Curriculum: 100 Lessons (Ordered 1 to 100)
              </div>
              <h2 class="text-2xl sm:text-3xl font-black text-white">Everyday Computer &amp; IT Skills (Ordered 1 to 100)</h2>
              <p class="text-xs sm:text-sm text-purple-100/90 mt-1.5 max-w-3xl leading-relaxed">
                Easy, practical everyday computer skills: Windows basics, files &amp; folders, time-saving shortcuts, internet &amp; email, Word/PowerPoint/PDF, cloud &amp; phone, staying safe from scams, Wi-Fi &amp; printers, and fixing common problems yourself.
              </p>
            </div>
            <div class="flex flex-wrap items-center gap-3">
              <button onclick="App.navigateToArticle('${App.firstSlug('IT_100_LESSONS')}')" class="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition shadow-lg shadow-purple-500/25 flex items-center gap-2">
                <span>Start Lesson 01</span>
                <i class="fa-solid fa-arrow-right"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    } else if (this.currentCategory === "all") {
      headerHtml = `
        <div class="col-span-full mb-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-slate-800">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold uppercase tracking-wider mb-2">
                <i class="fa-solid fa-book-open"></i> Full Curriculum: 520 Lessons Total
              </div>
              <h2 class="text-2xl sm:text-3xl font-black text-white">Complete Learning Catalog</h2>
              <p class="text-xs sm:text-sm text-slate-300 mt-1.5 max-w-3xl leading-relaxed">
                Browse all 520 sequential lessons across 6 comprehensive curricula: 100 Excel, 100 Python, 20 HTML, 100 CSS, 100 JavaScript, and 100 Computer & IT Skills.
              </p>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <button onclick="App.setTrackFilter('css', true)" class="px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition">
                100 CSS
              </button>
              <button onclick="App.setTrackFilter('javascript', true)" class="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition">
                100 JS
              </button>
              <button onclick="App.setTrackFilter('python', true)" class="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition">
                100 Python
              </button>
              <button onclick="App.setCategoryFilter('excel', 'all', true)" class="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition">
                100 Excel
              </button>
            </div>
          </div>
        </div>
      `;
    }

    grid.innerHTML = headerHtml + filtered.map(a => this.createArticleCardHtml(a)).join("");
  },

  createArticleCardHtml(a) {
    let badgeText = "Programming";
    let badgeClass = "bg-blue-50 text-blue-700 border-blue-200";
    let badgeIcon = "fa-code";

    if (a.track === "python") {
      badgeText = "🐍 Python";
      badgeClass = "bg-blue-50 text-blue-700 border-blue-200";
      badgeIcon = "fa-brands fa-python";
    } else if (a.track === "html") {
      badgeText = "📄 HTML5";
      badgeClass = "bg-orange-50 text-orange-700 border-orange-200";
      badgeIcon = "fa-brands fa-html5";
    } else if (a.track === "css") {
      badgeText = "🎨 CSS3";
      badgeClass = "bg-sky-50 text-sky-700 border-sky-200";
      badgeIcon = "fa-brands fa-css3-alt";
    } else if (a.track === "javascript") {
      badgeText = "⚡ JavaScript";
      badgeClass = "bg-amber-50 text-amber-700 border-amber-200";
      badgeIcon = "fa-brands fa-js";
    } else if (a.category === "excel") {
      badgeText = "📊 Excel";
      badgeClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
      badgeIcon = "fa-table-cells";
    } else if (a.category === "computer_skills") {
      badgeText = "🖥️ Computer Skills";
      badgeClass = "bg-purple-50 text-purple-700 border-purple-200";
      badgeIcon = "fa-laptop-code";
    }

    return `
      <div class="course-card bg-white rounded-2xl overflow-hidden flex flex-col group cursor-pointer" onclick="App.navigateToArticle('${this.escapeAttrJs(a.slug)}')">
        <div class="h-3 relative" style="background: ${this.escapeHtml(a.cover_gradient || "linear-gradient(135deg, #1d4ed8, #3b82f6)")};"></div>
        <div class="p-6 flex-1 flex flex-col">
          <div class="flex items-center justify-between mb-3">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeClass}">
              <i class="fa-solid ${badgeIcon} text-[10px]"></i> ${badgeText}
            </span>
            <span class="text-xs text-slate-400 font-medium flex items-center gap-1">
              <i class="fa-regular fa-clock"></i> ${a.read_time || 5} min read
            </span>
          </div>

          <h3 class="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition line-clamp-2 mb-2">
            ${this.escapeHtml(a.title)}
          </h3>

          <p class="text-sm text-slate-600 line-clamp-2 mb-4 flex-1">
            ${this.escapeHtml(a.summary || "Comprehensive tutorial and hands-on guide from Bargisy eSchool.")}
          </p>

          <div class="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
                MB
              </div>
              <span class="font-medium text-slate-700">${this.escapeHtml(a.author || "Mohammed Bargisy")}</span>
            </div>
            <span class="font-semibold text-blue-600 group-hover:translate-x-1 transition inline-flex items-center gap-1">
              Read Lesson <i class="fa-solid fa-arrow-right text-[10px]"></i>
            </span>
          </div>
        </div>
      </div>
    `;
  },

  navigateToArticle(slug) {
    window.location.hash = `#/article/${slug}`;
  },

  loadAndDisplayArticle(slug) {
    const articleContainer = document.getElementById("articleReaderContent");
    const titleEl = document.getElementById("readerArticleTitle");
    const metaCategory = document.getElementById("readerMetaCategory");
    const metaAuthor = document.getElementById("readerMetaAuthor");
    const metaTime = document.getElementById("readerMetaTime");
    const metaViews = document.getElementById("readerMetaViews");
    const metaDifficulty = document.getElementById("readerMetaDifficulty");
    const draftAlert = document.getElementById("readerDraftAlert");
    const editBtn = document.getElementById("readerEditInStudioBtn");

    const a = ArticleStore.get(slug);

    if (!a) {
      if (articleContainer) {
        articleContainer.innerHTML = `
          <div class="py-24 text-center text-slate-500">
            <h2 class="text-xl font-bold text-slate-800 mb-2">Lesson Not Found</h2>
            <p class="text-sm mb-4">The article you requested could not be located or may be a private draft.</p>
            <a href="#/courses" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold">Back to Lessons</a>
          </div>
        `;
      }
      return;
    }

    // Increment view count in session
    a.views = (a.views || 0) + 1;
    const updatedA = ArticleStore.save(a);

    // Populate Reader View
    if (titleEl) titleEl.innerText = updatedA.title;
    if (metaCategory) metaCategory.innerText = updatedA.category_name || updatedA.category;
    if (metaAuthor) metaAuthor.innerText = updatedA.author || "Mohammed Bargisy";
    if (metaTime) metaTime.innerText = `${updatedA.read_time || 5} min read`;
    if (metaViews) metaViews.innerText = `${updatedA.views} views`;
    if (metaDifficulty) metaDifficulty.innerText = updatedA.difficulty || "Beginner";

    if (draftAlert) {
      if (updatedA.status === "draft") {
        draftAlert.classList.remove("hidden");
      } else {
        draftAlert.classList.add("hidden");
      }
    }

    if (editBtn) {
      editBtn.onclick = () => {
        EditorStudio.editArticle(updatedA.id);
      };
    }

    let parsedHtml = "";
    if (window.marked) {
      // The page header already shows the title, so drop a leading "# Title" from the body
      parsedHtml = this.renderLessonMarkdown(String(updatedA.content || "").replace(/^\s*#\s[^\n]*\n/, ""));
    } else {
      parsedHtml = `<pre>${this.escapeHtml(updatedA.content)}</pre>`;
    }

    // Sequential Navigation for all Curricula (Excel, Python, HTML, CSS, JavaScript, IT Skills)
    let trackInfo = null;
    let lessonNum = updatedA.lesson_number;
    if (!lessonNum) {
      const match = updatedA.title.match(/Lesson\s+(\d+)/i);
      lessonNum = match ? parseInt(match[1], 10) : null;
    }

    if (updatedA.category === 'excel' && lessonNum) {
      trackInfo = {
        name: "Excel Master Curriculum (100 Lessons)",
        total: 100,
        filter: { category: 'excel' },
        backHash: "#/excel",
        backLabel: "Back to 100 Excel Lessons",
        colorClass: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20",
        badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200"
      };
    } else if (updatedA.track === 'python' && lessonNum) {
      trackInfo = {
        name: "Python Developer Path (100 Lessons)",
        total: 100,
        filter: { track: 'python' },
        backHash: "#/python",
        backLabel: "Back to 100 Python Lessons",
        colorClass: "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20",
        badgeClass: "bg-blue-100 text-blue-800 border-blue-200"
      };
    } else if (updatedA.track === 'css' && lessonNum) {
      trackInfo = {
        name: "Front-End: CSS Curriculum (100 Lessons)",
        total: 100,
        filter: { track: 'css' },
        backHash: "#/css",
        backLabel: "Back to 100 CSS Lessons",
        colorClass: "bg-sky-600 hover:bg-sky-700 shadow-sky-500/20",
        badgeClass: "bg-sky-100 text-sky-800 border-sky-200"
      };
    } else if (updatedA.track === 'javascript' && lessonNum) {
      trackInfo = {
        name: "Front-End: JavaScript Curriculum (100 Lessons)",
        total: 100,
        filter: { track: 'javascript' },
        backHash: "#/javascript",
        backLabel: "Back to 100 JavaScript Lessons",
        colorClass: "bg-amber-600 hover:bg-amber-700 shadow-amber-500/20",
        badgeClass: "bg-amber-100 text-amber-800 border-amber-200"
      };
    } else if (updatedA.track === 'html' && lessonNum) {
      trackInfo = {
        name: "Front-End: Semantic HTML Track (20 Lessons)",
        total: 20,
        filter: { track: 'html' },
        backHash: "#/html",
        backLabel: "Back to 20 HTML Lessons",
        colorClass: "bg-orange-600 hover:bg-orange-700 shadow-orange-500/20",
        badgeClass: "bg-orange-100 text-orange-800 border-orange-200"
      };
    } else if ((updatedA.category === 'computer_skills' || updatedA.track === 'it_skills') && lessonNum) {
      trackInfo = {
        name: "Computer & IT Skills Mastery (100 Lessons)",
        total: 100,
        filter: { category: 'computer_skills' },
        backHash: "#/computer-skills",
        backLabel: "Back to 100 IT Skills Lessons",
        colorClass: "bg-purple-600 hover:bg-purple-700 shadow-purple-500/20",
        badgeClass: "bg-purple-100 text-purple-800 border-purple-200"
      };
    }

    if (trackInfo && lessonNum) {
      const trackLessons = ArticleStore.list({ ...trackInfo.filter });
      const prevLesson = trackLessons.find(x => (x.lesson_number || parseInt((x.title.match(/Lesson\s+(\d+)/i) || [0, x.id])[1], 10)) === lessonNum - 1);
      const nextLesson = trackLessons.find(x => (x.lesson_number || parseInt((x.title.match(/Lesson\s+(\d+)/i) || [0, x.id])[1], 10)) === lessonNum + 1);

      parsedHtml += `
        <div class="mt-12 pt-8 border-t border-slate-200">
          <div class="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <div>
              ${prevLesson ? `
                <button onclick="App.navigateToArticle('${this.escapeAttrJs(prevLesson.slug)}')" class="px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 text-xs font-bold transition flex items-center gap-2 shadow-sm">
                  <i class="fa-solid fa-arrow-left"></i>
                  <span>Previous: Lesson ${String(lessonNum - 1).padStart(2, '0')}</span>
                </button>
              ` : `<span class="text-xs text-slate-400 font-semibold px-2">First Lesson of Track</span>`}
            </div>

            <div class="text-center">
              <span class="px-3.5 py-1.5 rounded-full ${trackInfo.badgeClass} text-xs font-bold border">
                Lesson ${lessonNum} of ${trackInfo.total}
              </span>
              <div class="text-[11px] text-slate-500 mt-1 font-medium">${trackInfo.name}</div>
              <a href="${trackInfo.backHash}" class="text-[11px] text-blue-600 hover:underline block mt-1 font-semibold">
                ${trackInfo.backLabel}
              </a>
            </div>

            <div>
              ${nextLesson ? `
                <button onclick="App.navigateToArticle('${this.escapeAttrJs(nextLesson.slug)}')" class="px-4 py-2.5 rounded-xl ${trackInfo.colorClass} text-white text-xs font-bold transition flex items-center gap-2 shadow-md">
                  <span>Next: Lesson ${String(lessonNum + 1).padStart(2, '0')}</span>
                  <i class="fa-solid fa-arrow-right"></i>
                </button>
              ` : `<span class="text-xs text-emerald-600 font-bold px-2 flex items-center gap-1.5"><i class="fa-solid fa-circle-check"></i> Track Completed!</span>`}
            </div>
          </div>
        </div>
      `;
    }

    if (articleContainer) {
      articleContainer.innerHTML = parsedHtml;
      this.enhanceArticleContent(articleContainer);
    }
  },

  enhanceArticleContent(container) {
    // Turn "> [!TIP]" / "> [!WARNING]" blockquotes into styled callouts
    container.querySelectorAll("blockquote").forEach(bq => {
      const first = bq.querySelector("p");
      if (!first) return;
      const m = first.innerHTML.match(/^\s*\[!(TIP|NOTE|IMPORTANT|WARNING|CAUTION)\]\s*(<br\s*\/?>)?\s*/i);
      if (!m) return;
      const kind = m[1].toUpperCase();
      first.innerHTML = first.innerHTML.slice(m[0].length);
      const cls = (kind === "WARNING" || kind === "CAUTION") ? "alert-warning" : "alert-tip";
      const icon = (kind === "WARNING" || kind === "CAUTION") ? "fa-triangle-exclamation" : "fa-lightbulb";
      const label = kind.charAt(0) + kind.slice(1).toLowerCase();
      const div = document.createElement("div");
      div.className = cls;
      div.innerHTML = `<div class="alert-title"><i class="fa-solid ${icon}"></i> ${label}</div>` + bq.innerHTML;
      bq.replaceWith(div);
    });

    container.querySelectorAll("pre").forEach(pre => {
      const wrapper = document.createElement("div");
      wrapper.className = "relative group";
      pre.parentNode.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);

      const copyBtn = document.createElement("button");
      copyBtn.className = "absolute top-3 right-3 px-2.5 py-1 text-xs font-semibold rounded-md bg-slate-700/80 hover:bg-slate-600 text-slate-200 opacity-0 group-hover:opacity-100 transition shadow";
      copyBtn.innerHTML = `<i class="fa-regular fa-copy mr-1"></i> Copy`;
      copyBtn.onclick = () => this.copyCode(copyBtn);
      wrapper.appendChild(copyBtn);

      // "Try it" button for languages the sandbox can run
      const codeEl = pre.querySelector("code");
      const langMatch = codeEl && (codeEl.className || "").match(/language-(\w+)/);
      const lang = langMatch ? langMatch[1].toLowerCase() : "";
      const runnable = ["html", "css", "javascript", "js", "python", "py"];
      if (runnable.includes(lang)) {
        const label = { html: "HTML", css: "CSS", javascript: "JavaScript", js: "JavaScript", python: "Python", py: "Python" }[lang];
        const tryBtn = document.createElement("button");
        tryBtn.className = "try-sandbox-btn";
        tryBtn.innerHTML = `<i class="fa-solid fa-play"></i> Try this ${label} in the Sandbox`;
        tryBtn.onclick = () => {
          if (typeof InteractiveLab !== "undefined") InteractiveLab.openInSandbox(lang, codeEl.textContent);
        };
        wrapper.appendChild(tryBtn);
      }
    });
  },

  copyCode(btn) {
    const pre = btn.parentNode.querySelector("pre");
    if (!pre) return;
    const text = pre.innerText;
    navigator.clipboard.writeText(text).then(() => {
      btn.innerHTML = `<i class="fa-solid fa-check text-emerald-400 mr-1"></i> Copied!`;
      setTimeout(() => {
        btn.innerHTML = `<i class="fa-regular fa-copy mr-1"></i> Copy`;
      }, 2000);
    });
  },

  showToast(message, type = "info") {
    const container = document.getElementById("toastContainer");
    if (!container) return;

    const toast = document.createElement("div");
    const colors = {
      success: "bg-emerald-600 text-white border-emerald-500",
      error: "bg-rose-600 text-white border-rose-500",
      warning: "bg-amber-600 text-white border-amber-500",
      info: "bg-slate-900 text-white border-slate-800"
    };
    const icons = {
      success: "fa-solid fa-circle-check",
      error: "fa-solid fa-circle-xmark",
      warning: "fa-solid fa-triangle-exclamation",
      info: "fa-solid fa-circle-info"
    };

    toast.className = `flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border text-sm transform transition duration-300 ease-out translate-y-4 opacity-0 ${colors[type] || colors.info}`;
    toast.innerHTML = `
      <i class="${icons[type] || icons.info}"></i>
      <div class="font-medium">${message}</div>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.remove("translate-y-4", "opacity-0");
    }, 10);

    setTimeout(() => {
      toast.classList.add("opacity-0", "translate-y-2");
      setTimeout(() => toast.remove(), 350);
    }, 4000);
  }
};

window.App = App;
if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", () => App.init());
} else {
  App.init();
}
