/**
 * Bargisy eSchool - Main Application Controller (Static & Client-side)
 * Handles SPA hash routing, catalog rendering, search/filters, article reader mode, and toasts.
 */

const App = {
  currentCategory: 'all',
  currentTrack: 'all',
  currentSearch: '',
  allArticles: [],

  init() {
    this.initMarkdown();
    this.bindGlobalEvents();
    this.handleRouting();
    window.addEventListener("hashchange", () => this.handleRouting());
    EditorStudio.init();
    InteractiveLab.init();
    this.loadCatalog();
  },

  initMarkdown() {
    if (window.marked) {
      window.marked.setOptions({
        gfm: true,
        breaks: true,
        headerIds: true,
        mangle: false,
        highlight: function(code) {
          return code;
        }
      });
    }
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
          const val = heroSearch.value.trim();
          if (val) {
            window.location.hash = "#/browse";
            setTimeout(() => {
              const bSearch = document.getElementById("mainSearchInput");
              if (bSearch) {
                bSearch.value = val;
                this.currentSearch = val;
                this.filterAndRenderArticles();
              }
            }, 100);
          }
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

  handleRouting() {
    const hash = window.location.hash || "#/";
    const views = ["viewHome", "viewBrowse", "viewArticle", "viewStudio", "viewLabs"];

    views.forEach(v => {
      const el = document.getElementById(v);
      if (el) el.classList.add("hidden");
    });

    document.querySelectorAll(".nav-link").forEach(link => {
      link.classList.remove("text-blue-600", "font-bold");
      link.classList.add("text-slate-600");
    });

    window.scrollTo({ top: 0, behavior: "smooth" });

    if (hash === "#/" || hash === "" || hash === "#home") {
      document.getElementById("viewHome").classList.remove("hidden");
      this.setActiveNav("navHome");
      this.loadCatalog();
    } else if (hash.startsWith("#/browse") || hash.startsWith("#/courses")) {
      document.getElementById("viewBrowse").classList.remove("hidden");
      this.setActiveNav("navCourses");
      this.setCategoryFilter("all", "all");
    } else if (hash === "#/programming") {
      document.getElementById("viewBrowse").classList.remove("hidden");
      this.setActiveNav("navProgramming");
      this.setCategoryFilter("programming", "all");
    } else if (hash === "#/python") {
      document.getElementById("viewBrowse").classList.remove("hidden");
      this.setActiveNav("navProgramming");
      this.setTrackFilter("python");
    } else if (hash === "#/frontend" || hash === "#/frontend-developer") {
      document.getElementById("viewBrowse").classList.remove("hidden");
      this.setActiveNav("navProgramming");
      this.setTrackFilter("frontend");
    } else if (hash === "#/html") {
      document.getElementById("viewBrowse").classList.remove("hidden");
      this.setActiveNav("navProgramming");
      this.setTrackFilter("html");
    } else if (hash === "#/css") {
      document.getElementById("viewBrowse").classList.remove("hidden");
      this.setActiveNav("navProgramming");
      this.setTrackFilter("css");
    } else if (hash === "#/javascript" || hash === "#/js") {
      document.getElementById("viewBrowse").classList.remove("hidden");
      this.setActiveNav("navProgramming");
      this.setTrackFilter("javascript");
    } else if (hash === "#/computer-skills") {
      document.getElementById("viewBrowse").classList.remove("hidden");
      this.setActiveNav("navComputerSkills");
      this.setCategoryFilter("computer_skills", "all");
    } else if (hash === "#/excel") {
      document.getElementById("viewBrowse").classList.remove("hidden");
      this.setActiveNav("navExcel");
      this.setCategoryFilter("excel", "all");
    } else if (hash.startsWith("#/article/")) {
      const slug = hash.replace("#/article/", "");
      document.getElementById("viewArticle").classList.remove("hidden");
      this.loadAndDisplayArticle(slug);
    } else if (hash === "#/studio") {
      document.getElementById("viewStudio").classList.remove("hidden");
      this.setActiveNav("navStudio");
      EditorStudio.loadArticlesList();
    } else if (hash.startsWith("#/labs") || hash === "#labs") {
      document.getElementById("viewLabs").classList.remove("hidden");
      this.setActiveNav("navLabs");
      if (hash.includes("python")) {
        InteractiveLab.switchLab("python");
      } else if (hash.includes("web") || hash.includes("frontend") || hash.includes("html")) {
        InteractiveLab.switchLab("web");
      } else {
        InteractiveLab.switchLab("excel");
      }
    } else {
      document.getElementById("viewHome").classList.remove("hidden");
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

  setCategoryFilter(category, track = "all") {
    this.currentCategory = category;
    this.currentTrack = track;

    // Reset search input
    const searchInput = document.getElementById("mainSearchInput");
    if (searchInput && this.currentSearch) {
      searchInput.value = "";
      this.currentSearch = "";
    }

    // Ensure viewBrowse is visible
    const browseView = document.getElementById("viewBrowse");
    if (browseView && browseView.classList.contains("hidden")) {
      const views = ["viewHome", "viewBrowse", "viewArticle", "viewStudio", "viewLabs"];
      views.forEach(v => {
        const el = document.getElementById(v);
        if (el) el.classList.add("hidden");
      });
      browseView.classList.remove("hidden");
    }

    document.querySelectorAll(".cat-filter-btn").forEach(btn => {
      btn.className = "cat-filter-btn px-3.5 py-2 rounded-xl text-xs font-medium bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition";
    });

    let targetBtnId = `catBtn_${category}`;
    if (category === "programming") {
      if (track === "python") targetBtnId = "catBtn_python";
      else if (track === "frontend" || track === "html" || track === "css" || track === "javascript") targetBtnId = "catBtn_frontend";
      else targetBtnId = "catBtn_programming";
    }

    const activeBtn = document.getElementById(targetBtnId);
    if (activeBtn) {
      activeBtn.className = "cat-filter-btn px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white transition";
    }

    this.filterAndRenderArticles();
  },

  setTrackFilter(track) {
    this.currentCategory = "programming";
    this.currentTrack = track;

    // Reset search input
    const searchInput = document.getElementById("mainSearchInput");
    if (searchInput && this.currentSearch) {
      searchInput.value = "";
      this.currentSearch = "";
    }

    // Ensure viewBrowse is visible
    const browseView = document.getElementById("viewBrowse");
    if (browseView && browseView.classList.contains("hidden")) {
      const views = ["viewHome", "viewBrowse", "viewArticle", "viewStudio", "viewLabs"];
      views.forEach(v => {
        const el = document.getElementById(v);
        if (el) el.classList.add("hidden");
      });
      browseView.classList.remove("hidden");
    }

    document.querySelectorAll(".cat-filter-btn").forEach(btn => {
      btn.className = "cat-filter-btn px-3.5 py-2 rounded-xl text-xs font-medium bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition";
    });

    let targetBtnId = "catBtn_programming";
    if (track === "python") targetBtnId = "catBtn_python";
    else if (track === "frontend" || track === "html" || track === "css" || track === "javascript") targetBtnId = "catBtn_frontend";

    const activeBtn = document.getElementById(targetBtnId);
    if (activeBtn) {
      activeBtn.className = "cat-filter-btn px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white transition";
    }

    this.filterAndRenderArticles();
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

    if (countBadge) {
      countBadge.innerText = `${filtered.length} tutorials available`;
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

    let headerHtml = "";

    // 1. PROGRAMMING SECTION: DUAL-PATH HERO (PYTHON + FRONT-END)
    if (this.currentCategory === "programming") {
      headerHtml = `
        <div class="col-span-full mb-6 space-y-6">
          
          <!-- Top Programming Hub Banner -->
          <div class="p-8 rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-blue-950 text-white shadow-xl border border-indigo-900/40 relative overflow-hidden">
            <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div>
                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold uppercase tracking-wider mb-2">
                  <i class="fa-solid fa-code"></i> Bargisy eSchool Programming Curricula
                </div>
                <h2 class="text-2xl sm:text-3xl font-black text-white">Programming Tracks & Engineering Paths</h2>
                <p class="text-xs sm:text-sm text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
                  Choose your path below: <strong>Python Path</strong> (100 sequential lessons from easiest to advanced) or the <strong>Front-End Developer Path</strong> (20 HTML, 100 CSS, and 100 JavaScript lessons).
                </p>
              </div>

              <!-- Quick Track Switcher Pills -->
              <div class="flex flex-wrap items-center gap-1.5 bg-slate-900/90 p-2 rounded-2xl border border-slate-800 self-start lg:self-auto">
                <button onclick="App.setTrackFilter('all')" class="px-3 py-1.5 rounded-xl text-xs font-bold transition ${this.currentTrack === 'all' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:text-white'}">
                  All Programming (320)
                </button>
                <button onclick="App.setTrackFilter('python')" class="px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${this.currentTrack === 'python' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:text-white'}">
                  <span>🐍 Python</span>
                  <span class="text-[10px] px-1.5 py-0.5 rounded-full ${this.currentTrack === 'python' ? 'bg-blue-800 text-blue-100' : 'bg-slate-800 text-slate-300'}">100</span>
                </button>
                <button onclick="App.setTrackFilter('frontend')" class="px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${this.currentTrack === 'frontend' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:text-white'}">
                  <span>🌐 Front-End All</span>
                  <span class="text-[10px] px-1.5 py-0.5 rounded-full ${this.currentTrack === 'frontend' ? 'bg-blue-800 text-blue-100' : 'bg-slate-800 text-slate-300'}">220</span>
                </button>
                <button onclick="App.setTrackFilter('html')" class="px-2.5 py-1.5 rounded-xl text-xs font-semibold transition ${this.currentTrack === 'html' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-orange-400'}">
                  HTML (20)
                </button>
                <button onclick="App.setTrackFilter('css')" class="px-2.5 py-1.5 rounded-xl text-xs font-semibold transition ${this.currentTrack === 'css' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-sky-400'}">
                  CSS (100)
                </button>
                <button onclick="App.setTrackFilter('javascript')" class="px-2.5 py-1.5 rounded-xl text-xs font-semibold transition ${this.currentTrack === 'javascript' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-amber-400'}">
                  JS (100)
                </button>
              </div>
            </div>
          </div>

          <!-- THE TWO PRIMARY SECTION CARDS -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <!-- SECTION 1: PYTHON DEVELOPER PATH (100 LESSONS) -->
            <div class="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between mb-4">
                  <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl font-bold">
                    <i class="fa-brands fa-python"></i>
                  </div>
                  <span class="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                    100 Lessons (Ordered 1 to 100)
                  </span>
                </div>
                <h3 class="text-xl font-black text-slate-900">Python Developer Path</h3>
                <p class="text-xs text-slate-600 mt-2 leading-relaxed">
                  Sequenced from easiest fundamentals (print, variables, types, loops) through OOP, decorators, error handling, standard libraries, and capstone automation scripts.
                </p>
              </div>
              <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <button onclick="App.setTrackFilter('python')" class="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                  <span>View Python Lessons (${filtered.filter(x => x.track === 'python').length || 100})</span>
                  <i class="fa-solid fa-arrow-down text-[10px]"></i>
                </button>
                <button onclick="App.navigateToArticle('python-lesson-01-introduction-to-python-skulpt-the-zen-of-python')" class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-sm flex items-center gap-1.5">
                  <span>Start Lesson 01</span>
                  <i class="fa-solid fa-play text-[10px]"></i>
                </button>
              </div>
            </div>

            <!-- SECTION 2: FRONT-END DEVELOPER PATH (220 LESSONS) -->
            <div class="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between mb-4">
                  <div class="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl font-bold">
                    <i class="fa-solid fa-laptop-code"></i>
                  </div>
                  <span class="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                    220 Lessons Total
                  </span>
                </div>
                <h3 class="text-xl font-black text-slate-900">Front-End Developer Path</h3>
                <p class="text-xs text-slate-600 mt-2 leading-relaxed">
                  Comprehensive web engineering path divided into 3 dedicated sub-tracks:
                </p>
                <div class="mt-3 flex flex-wrap gap-2 text-xs">
                  <button onclick="App.setTrackFilter('html')" class="px-2.5 py-1.5 rounded-lg border border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 transition font-semibold flex items-center gap-1">
                    <i class="fa-brands fa-html5"></i> 20 Lessons HTML
                  </button>
                  <button onclick="App.setTrackFilter('css')" class="px-2.5 py-1.5 rounded-lg border border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100 transition font-semibold flex items-center gap-1">
                    <i class="fa-brands fa-css3-alt"></i> 100 Lessons CSS
                  </button>
                  <button onclick="App.setTrackFilter('javascript')" class="px-2.5 py-1.5 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 transition font-semibold flex items-center gap-1">
                    <i class="fa-brands fa-js"></i> 100 Lessons JS
                  </button>
                </div>
              </div>
              <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <button onclick="App.setTrackFilter('frontend')" class="text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1">
                  <span>View All 220 Web Lessons</span>
                  <i class="fa-solid fa-arrow-down text-[10px]"></i>
                </button>
                <button onclick="App.navigateToArticle('html-lesson-01-how-the-web-works-browsers-http-requests-html-structure')" class="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition shadow-sm flex items-center gap-1.5">
                  <span>Start HTML 01</span>
                  <i class="fa-solid fa-play text-[10px]"></i>
                </button>
              </div>
            </div>

          </div>
        </div>
      `;
    } else if (this.currentCategory === "excel") {
      headerHtml = `
        <div class="col-span-full mb-2 p-6 rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white shadow-xl border border-emerald-800/40">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider mb-2">
                <i class="fa-solid fa-graduation-cap"></i> Complete Curriculum: 100 Lessons
              </div>
              <h2 class="text-2xl sm:text-3xl font-black text-white">Excel Masterclass (Ordered 1 to 100)</h2>
              <p class="text-xs sm:text-sm text-emerald-100/90 mt-1.5 max-w-3xl leading-relaxed">
                Carefully ordered from the most simple fundamentals (Ribbon, Cell Referencing, AutoFill, Basic Math) up to complex functions (XLOOKUP, Dynamic Arrays, PivotTables, Power Query & VBA).
              </p>
            </div>
            <div class="flex flex-wrap items-center gap-3">
              <button onclick="App.navigateToArticle('lesson-01-introduction-to-excel-the-ribbon-interface')" class="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-emerald-500/25 flex items-center gap-2">
                <span>Start Lesson 01</span>
                <i class="fa-solid fa-arrow-right"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    } else if (this.currentCategory === "computer_skills") {
      headerHtml = `
        <div class="col-span-full mb-2 p-6 rounded-3xl bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 text-white shadow-xl border border-purple-800/40">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold uppercase tracking-wider mb-2">
                <i class="fa-solid fa-laptop-code"></i> Complete IT Curriculum: 100 Lessons
              </div>
              <h2 class="text-2xl sm:text-3xl font-black text-white">Computer & IT Skills Mastery (Ordered 1 to 100)</h2>
              <p class="text-xs sm:text-sm text-purple-100/90 mt-1.5 max-w-3xl leading-relaxed">
                Professional technical training covering: Operating systems mastery (Windows 11, Linux, macOS), PC hardware diagnostics, networking commands, troubleshooting slow computers, and cybersecurity essentials.
              </p>
            </div>
            <div class="flex flex-wrap items-center gap-3">
              <button onclick="App.navigateToArticle('it-lesson-01-computer-architecture-cpu-memory-hierarchy-bus-architecture-how-os-boots')" class="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition shadow-lg shadow-purple-500/25 flex items-center gap-2">
                <span>Start Lesson 01</span>
                <i class="fa-solid fa-arrow-right"></i>
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
      <div class="course-card bg-white rounded-2xl overflow-hidden flex flex-col group cursor-pointer" onclick="App.navigateToArticle('${a.slug}')">
        <div class="h-3 relative" style="background: ${a.cover_gradient};"></div>
        <div class="p-6 flex-1 flex flex-col">
          <div class="flex items-center justify-between mb-3">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeClass}">
              <i class="fa-solid ${badgeIcon} text-[10px]"></i> ${badgeText}
            </span>
            <span class="text-xs text-slate-400 font-medium flex items-center gap-1">
              <i class="fa-regular fa-clock"></i> ${a.read_time} min read
            </span>
          </div>

          <h3 class="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition line-clamp-2 mb-2">
            ${a.title}
          </h3>

          <p class="text-sm text-slate-600 line-clamp-2 mb-4 flex-1">
            ${a.summary || "Comprehensive tutorial and hands-on guide from Bargisy eSchool."}
          </p>

          <div class="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
                MB
              </div>
              <span class="font-medium text-slate-700">${a.author}</span>
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

    // Increment views
    ArticleStore.incrementViews(a.id);
    const updatedA = ArticleStore.get(a.id);

    if (titleEl) titleEl.innerText = updatedA.title;
    if (metaCategory) metaCategory.innerText = updatedA.category_name || updatedA.category;
    if (metaAuthor) metaAuthor.innerText = updatedA.author;
    if (metaTime) metaTime.innerText = `${updatedA.read_time} min read`;
    if (metaViews) metaViews.innerText = `${updatedA.views} views`;
    if (metaDifficulty) metaDifficulty.innerText = updatedA.difficulty;

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
      parsedHtml = window.marked.parse(updatedA.content);
    } else {
      parsedHtml = `<pre>${updatedA.content}</pre>`;
    }

    // Sequential Navigation for all Curricula (Excel, Python, HTML, CSS, JavaScript)
    let trackInfo = null;
    let lessonNum = updatedA.lesson_number;
    if (!lessonNum) {
      const match = updatedA.title.match(/Lesson\s+(\d+)/i);
      lessonNum = match ? parseInt(match[1], 10) : null;
    }

    if (updatedA.category === 'excel' && lessonNum) {
      trackInfo = {
        name: "Excel Master Curriculum",
        total: 100,
        filter: { category: 'excel' },
        colorClass: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20",
        badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200"
      };
    } else if (updatedA.track === 'python' && lessonNum) {
      trackInfo = {
        name: "Python Developer Path",
        total: 100,
        filter: { track: 'python' },
        colorClass: "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20",
        badgeClass: "bg-blue-100 text-blue-800 border-blue-200"
      };
    } else if (updatedA.track === 'html' && lessonNum) {
      trackInfo = {
        name: "Front-End: HTML Track",
        total: 20,
        filter: { track: 'html' },
        colorClass: "bg-orange-600 hover:bg-orange-700 shadow-orange-500/20",
        badgeClass: "bg-orange-100 text-orange-800 border-orange-200"
      };
    } else if (updatedA.track === 'css' && lessonNum) {
      trackInfo = {
        name: "Front-End: CSS Track",
        total: 100,
        filter: { track: 'css' },
        colorClass: "bg-sky-600 hover:bg-sky-700 shadow-sky-500/20",
        badgeClass: "bg-sky-100 text-sky-800 border-sky-200"
      };
    } else if (updatedA.track === 'javascript' && lessonNum) {
      trackInfo = {
        name: "Front-End: JavaScript Track",
        total: 100,
        filter: { track: 'javascript' },
        colorClass: "bg-amber-600 hover:bg-amber-700 shadow-amber-500/20",
        badgeClass: "bg-amber-100 text-amber-800 border-amber-200"
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
                <button onclick="App.navigateToArticle('${prevLesson.slug}')" class="px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 text-xs font-bold transition flex items-center gap-2 shadow-sm">
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
            </div>

            <div>
              ${nextLesson ? `
                <button onclick="App.navigateToArticle('${nextLesson.slug}')" class="px-4 py-2.5 rounded-xl ${trackInfo.colorClass} text-white text-xs font-bold transition flex items-center gap-2 shadow-md">
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
    container.querySelectorAll("pre").forEach(pre => {
      const wrapper = document.createElement("div");
      wrapper.className = "relative group";
      pre.parentNode.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);

      const copyBtn = document.createElement("button");
      copyBtn.className = "absolute top-3 right-3 text-xs bg-slate-800 text-slate-300 hover:text-white px-2.5 py-1 rounded opacity-0 group-hover:opacity-100 transition border border-slate-700 flex items-center gap-1.5";
      copyBtn.innerHTML = `<i class="fa-regular fa-copy"></i> Copy`;
      copyBtn.addEventListener("click", () => {
        const code = pre.querySelector("code") ? pre.querySelector("code").innerText : pre.innerText;
        navigator.clipboard.writeText(code).then(() => {
          copyBtn.innerHTML = `<i class="fa-solid fa-check text-emerald-400"></i> Copied!`;
          setTimeout(() => {
            copyBtn.innerHTML = `<i class="fa-regular fa-copy"></i> Copy`;
          }, 2000);
        });
      });
      wrapper.appendChild(copyBtn);
    });

    container.querySelectorAll("blockquote").forEach(quote => {
      const text = quote.innerText;
      if (text.includes("[!TIP]")) {
        quote.classList.add("alert-tip");
        quote.innerHTML = quote.innerHTML.replace(/\[!TIP\]/g, "💡 <strong>Tip:</strong>");
      } else if (text.includes("[!WARNING]")) {
        quote.classList.add("alert-warning");
        quote.innerHTML = quote.innerHTML.replace(/\[!WARNING\]/g, "⚠️ <strong>Warning:</strong>");
      } else if (text.includes("[!NOTE]")) {
        quote.innerHTML = quote.innerHTML.replace(/\[!NOTE\]/g, "ℹ️ <strong>Note:</strong>");
      }
    });
  },

  showToast(message, type = "info") {
    const container = document.getElementById("toastContainer");
    if (!container) return;

    const toast = document.createElement("div");
    const colors = {
      success: "bg-emerald-800 text-white border-emerald-700",
      error: "bg-rose-800 text-white border-rose-700",
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
