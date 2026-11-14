/**
 * Bargisy eSchool - Main Application Controller (Static & Client-side)
 * Handles SPA hash routing, catalog rendering, search/filters, article reader mode, and toasts.
 */

const App = {
  currentCategory: 'all',
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
      this.loadCatalog();
    } else if (hash === "#/programming") {
      document.getElementById("viewBrowse").classList.remove("hidden");
      this.setActiveNav("navProgramming");
      this.setCategoryFilter("programming");
    } else if (hash === "#/computer-skills") {
      document.getElementById("viewBrowse").classList.remove("hidden");
      this.setActiveNav("navComputerSkills");
      this.setCategoryFilter("computer_skills");
    } else if (hash === "#/excel") {
      document.getElementById("viewBrowse").classList.remove("hidden");
      this.setActiveNav("navExcel");
      this.setCategoryFilter("excel");
    } else if (hash.startsWith("#/article/")) {
      const slug = hash.replace("#/article/", "");
      document.getElementById("viewArticle").classList.remove("hidden");
      this.loadAndDisplayArticle(slug);
    } else if (hash === "#/studio") {
      document.getElementById("viewStudio").classList.remove("hidden");
      this.setActiveNav("navStudio");
      EditorStudio.loadArticlesList();
    } else if (hash === "#/labs") {
      document.getElementById("viewLabs").classList.remove("hidden");
      this.setActiveNav("navLabs");
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

  setCategoryFilter(category) {
    this.currentCategory = category;

    document.querySelectorAll(".cat-filter-btn").forEach(btn => {
      btn.classList.remove("bg-blue-600", "text-white", "font-semibold");
      btn.classList.add("bg-white", "text-slate-700", "border-slate-200");
    });
    const activeBtn = document.getElementById(`catBtn_${category}`);
    if (activeBtn) {
      activeBtn.classList.add("bg-blue-600", "text-white", "font-semibold");
      activeBtn.classList.remove("bg-white", "text-slate-700");
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
    if (this.currentCategory === "excel") {
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
    }

    grid.innerHTML = headerHtml + filtered.map(a => this.createArticleCardHtml(a)).join("");
  },

  createArticleCardHtml(a) {
    const categoryBadges = {
      programming: { text: "Programming", bg: "bg-blue-50 text-blue-700 border-blue-200", icon: "fa-code" },
      computer_skills: { text: "Computer Skills", bg: "bg-purple-50 text-purple-700 border-purple-200", icon: "fa-laptop-code" },
      excel: { text: "Excel & Data", bg: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: "fa-table-cells" },
      general: { text: "Tech Essentials", bg: "bg-cyan-50 text-cyan-700 border-cyan-200", icon: "fa-graduation-cap" }
    };
    const cat = categoryBadges[a.category] || categoryBadges.general;

    return `
      <div class="course-card bg-white rounded-2xl overflow-hidden flex flex-col group cursor-pointer" onclick="App.navigateToArticle('${a.slug}')">
        <div class="h-3 relative" style="background: ${a.cover_gradient};"></div>
        <div class="p-6 flex-1 flex flex-col">
          <div class="flex items-center justify-between mb-3">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cat.bg}">
              <i class="fa-solid ${cat.icon} text-[10px]"></i> ${cat.text}
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

    // Check if it's an Excel lesson to render Next / Previous Lesson Navigation
    const match = updatedA.title.match(/Lesson\s+(\d+)/i);
    const lessonNum = match ? parseInt(match[1], 10) : (updatedA.category === 'excel' && typeof updatedA.id === 'number' && updatedA.id <= 100 ? updatedA.id : null);

    if (updatedA.category === 'excel' && lessonNum) {
      const excelLessons = ArticleStore.list({ category: 'excel' });
      const prevLesson = excelLessons.find(x => {
        const m = x.title.match(/Lesson\s+(\d+)/i);
        const n = m ? parseInt(m[1], 10) : x.id;
        return n === lessonNum - 1;
      });
      const nextLesson = excelLessons.find(x => {
        const m = x.title.match(/Lesson\s+(\d+)/i);
        const n = m ? parseInt(m[1], 10) : x.id;
        return n === lessonNum + 1;
      });

      parsedHtml += `
        <div class="mt-12 pt-8 border-t border-slate-200">
          <div class="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <div>
              ${prevLesson ? `
                <button onclick="App.navigateToArticle('${prevLesson.slug}')" class="px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 text-xs font-bold transition flex items-center gap-2 shadow-sm">
                  <i class="fa-solid fa-arrow-left"></i>
                  <span>Previous: Lesson ${String(lessonNum - 1).padStart(2, '0')}</span>
                </button>
              ` : `<span class="text-xs text-slate-400 font-semibold px-2">First Lesson</span>`}
            </div>

            <div class="text-center">
              <span class="px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
                Lesson ${lessonNum} of 100
              </span>
              <div class="text-[11px] text-slate-500 mt-1">Excel Master Curriculum</div>
            </div>

            <div>
              ${nextLesson ? `
                <button onclick="App.navigateToArticle('${nextLesson.slug}')" class="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-2 shadow-md shadow-emerald-500/20">
                  <span>Next: Lesson ${String(lessonNum + 1).padStart(2, '0')}</span>
                  <i class="fa-solid fa-arrow-right"></i>
                </button>
              ` : `<span class="text-xs text-emerald-600 font-bold px-2">🎉 Final Lesson Completed!</span>`}
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
window.addEventListener("DOMContentLoaded", () => App.init());
