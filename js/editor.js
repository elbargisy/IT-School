/**
 * Bargisy eSchool - Client-side Article Store & Author Studio
 * Powered by localStorage with zero server/python requirements.
 * Works 100% in any modern browser by simply opening index.html.
 */

// --- 1. SEED DEFAULT ARTICLES (Programming & Computer Skills) ---
// (Note: The 100 sequential Excel lessons are loaded from js/excel-lessons.js)
const DEFAULT_ARTICLES = [
  {
    id: 101,
    title: "Python for Beginners: From Variables to Real-World Automation",
    slug: "python-for-beginners-variables-automation",
    category: "programming",
    category_name: "Programming & Code",
    summary: "Start your programming journey with Python. Learn core syntax, data structures, loops, and build your first automated file renaming script.",
    content: `# Python for Beginners: From Variables to Real-World Automation

Python is renowned for its readability, expressive syntax, and unmatched versatility — from automating daily desktop chores to artificial intelligence and web development.

---

## 1. Why Start with Python?
- **Human-Readable Syntax**: Python reads almost like plain English.
- **Batteries Included**: Standard library provides tools for files, math, dates, web access, and databases without extra installs.
- **Massive Ecosystem**: Libraries like \`pandas\`, \`requests\`, and \`fastapi\` open doors to any tech discipline.

---

## 2. Core Concepts: Variables & Data Types

In Python, you do not need to declare types explicitly:

\`\`\`python
# Strings (Text)
student_name = "Mohammed"
course_title = "Python Automation"

# Integers and Floats
hours_studied = 15
completion_rate = 94.5

# Boolean
is_certified = True

print(f"Student {student_name} completed {course_title} with {completion_rate}%!")
\`\`\`

---

## 3. Lists and Dictionaries (Your Data Containers)

### Lists (Ordered collections):
\`\`\`python
skills = ["Python", "SQL", "Excel", "Networking"]
skills.append("Cybersecurity")

for skill in skills:
    print(f"Skill unlocked: {skill}")
\`\`\`

### Dictionaries (Key-Value pairs):
\`\`\`python
user_profile = {
    "name": "Sarah",
    "role": "Data Analyst",
    "skills": ["Excel", "Python", "Power BI"],
    "level": "Intermediate"
}

print(user_profile["role"])  # Output: Data Analyst
\`\`\`

---

## 4. Real-World Project: Automated File Organizer Script

Here is an actual script you can run on your computer right now to organize messy downloads:

\`\`\`python
import os
import shutil
from pathlib import Path

# Path to the folder you want to tidy up
target_dir = Path.home() / "Downloads"

extensions_map = {
    "Images": [".jpg", ".png", ".jpeg", ".gif"],
    "Documents": [".pdf", ".docx", ".xlsx", ".pptx", ".txt"],
    "Archives": [".zip", ".rar", ".7z"],
    "Installers": [".exe", ".msi"]
}

for item in target_dir.iterdir():
    if item.is_file():
        file_ext = item.suffix.lower()
        for folder_name, extensions in extensions_map.items():
            if file_ext in extensions:
                destination = target_dir / folder_name
                destination.mkdir(exist_ok=True)
                shutil.move(str(item), str(destination / item.name))
                print(f"Moved {item.name} -> {folder_name}/")
                break
\`\`\`

---

## Key Takeaways
1. Code a little every single day — consistency beats cramming.
2. Build small automation scripts that solve annoying repetitive tasks.
3. Don't fear errors: Python's traceback messages tell you the exact line number!`,
    difficulty: "Beginner",
    tags: "Python, Programming, Automation, Scripts, Coding Basics",
    read_time: 6,
    author: "Mohammed Bargisy",
    status: "published",
    views: 285,
    cover_gradient: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
    updated_at: "2026-11-10 17:30:00"
  },
  {
    id: 102,
    title: "Essential Computer Skills Every Professional Must Master in 2026",
    slug: "essential-computer-skills-every-professional-must-master",
    category: "computer_skills",
    category_name: "Computer & IT Skills",
    summary: "Master keyboard shortcuts, operating system file management, basic networking commands, and cloud storage workflows to double your daily speed.",
    content: `# Essential Computer Skills Every Professional Must Master

In today's workplace, basic computer literacy is no longer just typing emails. Being truly proficient with your computer saves hundreds of hours every year and makes you significantly more effective.

---

## 1. Operating System Navigation & Power Shortcuts

Learning global shortcuts removes friction between your brain and the screen:

| Shortcut (Windows) | Action | Why It Matters |
| :--- | :--- | :--- |
| \`Win + Shift + S\` | Snipping Tool / Screenshot | Instantly capture custom screen regions with annotations |
| \`Win + V\` | Clipboard History | Access previous copied texts, links, and screenshots |
| \`Ctrl + Shift + Esc\` | Direct Task Manager | Instantly view unresponsive programs and kill hanging tasks |
| \`Win + .\` (period) | Emoji & Special Symbols Picker | Quick access to symbols (°, €, ™, arrows) and emojis |
| \`Alt + Tab\` | Window Switcher | Rapid context switching |

---

## 2. Directory Structure & File Management Best Practices

A messy desktop is a productivity killer. Follow these three rules:

1. **The 3-Level Folder Hierarchy**:
   - Level 1: \`Department / Domain\` (e.g., \`Finance\`, \`Marketing\`, \`Training\`)
   - Level 2: \`Project or Client\` (e.g., \`2026-Q1-Reporting\`, \`Bargisy-Portal\`)
   - Level 3: \`Asset Category\` (e.g., \`Drafts\`, \`Final_Deliverables\`, \`Raw_Data\`)

2. **Standardized File Naming**:
   - Use dates first for chronological auto-sorting: \`YYYY-MM-DD_ProjectName_Version.ext\`
   - Good: \`2026-11-10_QuarterlyBudget_v02.xlsx\`
   - Bad: \`Budget_final_v2_NEW_FINAL_REALLY.xlsx\`

---

## 3. Essential Networking Diagnostics for Office Workers

When internet or shared drives drop, knowing these 3 terminal commands pinpoints the issue instantly:

Open PowerShell or Command Prompt:

\`\`\`powershell
# 1. Test connectivity to your local router or Google DNS
ping 8.8.8.8

# 2. View your computer's local IP address and default gateway
ipconfig /all

# 3. Flush DNS cache if website names won't resolve
ipconfig /flushdns
\`\`\`

---

## 4. Cybersecurity Hygiene: Non-Negotiable Habits
- **Never reuse master passwords**: Use a reputable password manager.
- **Always enable Multi-Factor Authentication (MFA)** on email and banking.
- **Hover before clicking**: Always verify the actual destination URL of email links before clicking.`,
    difficulty: "Beginner",
    tags: "Computer Skills, Windows, Productivity, Shortcuts, IT Basics",
    read_time: 5,
    author: "Mohammed Bargisy",
    status: "published",
    views: 310,
    cover_gradient: "linear-gradient(135deg, #7c3aed, #a855f7)",
    updated_at: "2026-11-10 16:45:00"
  },
  {
    id: 103,
    title: "Modern Web Development 101: Understanding HTML, CSS, and JavaScript",
    slug: "modern-web-development-101-html-css-javascript",
    category: "programming",
    category_name: "Programming & Code",
    summary: "How modern websites actually work: the tripartite architecture of structure (HTML), style (CSS), and interactivity (JavaScript).",
    content: `# Modern Web Development 101: HTML, CSS, and JavaScript

Every web page on the internet — from the smallest blog to global platforms — is constructed on three core technologies:

1. **HTML (HyperText Markup Language)**: The skeleton / structure.
2. **CSS (Cascading Style Sheets)**: The skin, styling, and visual layout.
3. **JavaScript**: The brain, behavior, and interactive capability.

---

## 1. HTML: Structural Semantics
HTML provides semantic meaning to content so browsers, screen readers, and search engines understand what is on the page.

\`\`\`html
<article class="lesson-card">
  <span class="badge">Beginner</span>
  <h2>Introduction to Web APIs</h2>
  <p>Learn how applications communicate across the internet using JSON.</p>
  <button id="startLessonBtn">Start Lesson</button>
</article>
\`\`\`

---

## 2. CSS: Modern Flexbox and Grid
Gone are the days of float hacks and table layouts. Modern CSS uses **Flexbox** for 1D alignments and **CSS Grid** for 2D layouts.

\`\`\`css
.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  padding: 2rem;
}
\`\`\`

---

## 3. JavaScript: Making Things Happen
JavaScript reacts to user clicks, fetches data from servers in the background, and dynamically updates the DOM without reloading the page:

\`\`\`javascript
const btn = document.getElementById('startLessonBtn');

btn.addEventListener('click', () => {
  btn.textContent = 'Lesson Started!';
  btn.classList.add('bg-emerald-600');
});
\`\`\``,
    difficulty: "Beginner to Intermediate",
    tags: "Web Dev, HTML, CSS, JavaScript, Frontend",
    read_time: 6,
    author: "Mohammed Bargisy",
    status: "published",
    views: 198,
    cover_gradient: "linear-gradient(135deg, #0284c7, #38bdf8)",
    updated_at: "2026-11-10 15:20:00"
  },
  {
    id: 104,
    title: "Diagnosing Common PC Hardware & Network Problems: Field Guide",
    slug: "diagnosing-pc-hardware-network-problems",
    category: "computer_skills",
    category_name: "Computer & IT Skills",
    summary: "[DRAFT] Systematic diagnostic trees for slow computers, blue screens (BSOD), RAM issues, and Wi-Fi drops.",
    content: `# Diagnosing Common PC Hardware & Network Problems (Work in Progress)

*Author note: Draft article being authored for Bargisy eSchool computer repair syllabus.*

## 1. When the Screen Won't Turn On
- Step 1: Check power cable and wall socket indicator LED.
- Step 2: Listen for beep codes from the motherboard.
- Step 3: Reseat RAM modules (common oxidation on contacts).

## 2. High CPU / Disk Usage at 100%
- Inspecting Windows SysMain and Windows Update service status.
- Checking SSD S.M.A.R.T health metrics with CrystalDiskInfo.

*(Author: Finish steps for network packet loss analysis before publishing).*`,
    difficulty: "Intermediate",
    tags: "Troubleshooting, Hardware, Network, Windows, Maintenance",
    read_time: 4,
    author: "Mohammed Bargisy",
    status: "draft",
    views: 0,
    cover_gradient: "linear-gradient(135deg, #475569, #64748b)",
    updated_at: "2026-11-10 14:10:00"
  }
];

// --- 2. ARTICLE STORE (LOCALSTORAGE DATABASE) ---
const ArticleStore = {
  STORAGE_KEY: "bargisy_eschool_articles_v2",

  init() {
    const excelLessons = (typeof window !== "undefined" && window.EXCEL_100_LESSONS) ? window.EXCEL_100_LESSONS : [];
    const stored = localStorage.getItem(this.STORAGE_KEY);
    
    // Combine 100 Excel lessons with the programming and IT tracks
    const allSeeds = [
      ...excelLessons,
      ...DEFAULT_ARTICLES
    ];

    if (!stored) {
      this.saveAll(allSeeds);
    } else {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.length < 50 && excelLessons.length > 0) {
          this.saveAll(allSeeds);
        }
      } catch (e) {
        this.saveAll(allSeeds);
      }
    }
  },

  getAllRaw() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      const excelLessons = (typeof window !== "undefined" && window.EXCEL_100_LESSONS) ? window.EXCEL_100_LESSONS : [];
      return data ? JSON.parse(data) : [...excelLessons, ...DEFAULT_ARTICLES];
    } catch (e) {
      console.error("Error reading localStorage:", e);
      return DEFAULT_ARTICLES;
    }
  },

  saveAll(articles) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(articles));
    } catch (e) {
      console.error("Error writing to localStorage:", e);
    }
  },

  list({ status = null, category = "all", search = "" } = {}) {
    let list = this.getAllRaw();

    if (status) {
      list = list.filter(a => a.status === status);
    }

    if (category && category !== "all") {
      list = list.filter(a => a.category === category);
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(a =>
        a.title.toLowerCase().includes(q) ||
        (a.summary && a.summary.toLowerCase().includes(q)) ||
        (a.tags && a.tags.toLowerCase().includes(q))
      );
    }

    // When viewing Excel lessons, sort strictly in ascending lesson order (Lesson 01 to Lesson 100)
    if (category === "excel") {
      return list.sort((a, b) => {
        const numA = parseInt((a.title.match(/Lesson\s+(\d+)/i) || [0, a.id])[1], 10) || a.id || 0;
        const numB = parseInt((b.title.match(/Lesson\s+(\d+)/i) || [0, b.id])[1], 10) || b.id || 0;
        return numA - numB;
      });
    }

    // Default sort by updated_at descending
    return list.sort((a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0));
  },

  get(idOrSlug) {
    const list = this.getAllRaw();
    return list.find(a => String(a.id) === String(idOrSlug) || a.slug === String(idOrSlug)) || null;
  },

  slugify(text) {
    return text.toString().toLowerCase().trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '') || "article";
  },

  save(data) {
    const list = this.getAllRaw();
    const now = new Date().toISOString().replace("T", " ").substring(0, 19);

    const categoryNames = {
      programming: "Programming & Code",
      computer_skills: "Computer & IT Skills",
      excel: "Excel & Spreadsheets",
      general: "General Tech"
    };

    const gradients = {
      programming: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
      excel: "linear-gradient(135deg, #059669, #10b981)",
      computer_skills: "linear-gradient(135deg, #7c3aed, #a855f7)",
      general: "linear-gradient(135deg, #0284c7, #38bdf8)"
    };

    if (data.id) {
      // Update existing
      const idx = list.findIndex(a => String(a.id) === String(data.id));
      if (idx !== -1) {
        list[idx] = {
          ...list[idx],
          title: data.title || list[idx].title,
          category: data.category || list[idx].category,
          category_name: categoryNames[data.category] || list[idx].category_name,
          difficulty: data.difficulty || list[idx].difficulty,
          summary: data.summary !== undefined ? data.summary : list[idx].summary,
          tags: data.tags !== undefined ? data.tags : list[idx].tags,
          read_time: parseInt(data.read_time, 10) || list[idx].read_time,
          author: data.author || list[idx].author,
          content: data.content !== undefined ? data.content : list[idx].content,
          status: data.status || list[idx].status,
          cover_gradient: gradients[data.category] || list[idx].cover_gradient,
          updated_at: now
        };
        this.saveAll(list);
        return list[idx];
      }
    }

    // Create New
    const newId = list.length > 0 ? Math.max(...list.map(a => a.id || 0)) + 1 : 1;
    let slug = this.slugify(data.title || "article");
    if (list.some(a => a.slug === slug)) {
      slug = `${slug}-${newId}`;
    }

    const newArticle = {
      id: newId,
      title: data.title || "Untitled Article",
      slug: slug,
      category: data.category || "programming",
      category_name: categoryNames[data.category] || "Programming & Code",
      summary: data.summary || "",
      content: data.content || "",
      difficulty: data.difficulty || "Beginner",
      tags: data.tags || "",
      read_time: parseInt(data.read_time, 10) || 5,
      author: data.author || "Mohammed Bargisy",
      status: data.status || "draft", // Defaults to Draft!
      views: 0,
      cover_gradient: gradients[data.category] || gradients.programming,
      created_at: now,
      updated_at: now
    };

    list.unshift(newArticle);
    this.saveAll(list);
    return newArticle;
  },

  togglePublish(id) {
    const list = this.getAllRaw();
    const idx = list.findIndex(a => String(a.id) === String(id));
    if (idx !== -1) {
      const current = list[idx].status;
      list[idx].status = current === "published" ? "draft" : "published";
      list[idx].updated_at = new Date().toISOString().replace("T", " ").substring(0, 19);
      this.saveAll(list);
      return list[idx];
    }
    return null;
  },

  delete(id) {
    let list = this.getAllRaw();
    list = list.filter(a => String(a.id) !== String(id));
    this.saveAll(list);
    return true;
  },

  incrementViews(idOrSlug) {
    const list = this.getAllRaw();
    const article = list.find(a => String(a.id) === String(idOrSlug) || a.slug === String(idOrSlug));
    if (article) {
      article.views = (article.views || 0) + 1;
      this.saveAll(list);
    }
  },

  getStats() {
    const list = this.getAllRaw();
    const total = list.length;
    const published = list.filter(a => a.status === "published").length;
    const drafts = list.filter(a => a.status === "draft").length;
    const totalViews = list.reduce((acc, a) => acc + (a.views || 0), 0);
    return {
      total_articles: total,
      published_articles: published,
      draft_articles: drafts,
      total_views: totalViews
    };
  },

  exportJSON() {
    const list = this.getAllRaw();
    const dataStr = JSON.stringify({
      school: "Bargisy eSchool",
      exported_at: new Date().toISOString(),
      articles: list
    }, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bargisy_eschool_articles_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  importJSON(jsonText) {
    try {
      const parsed = JSON.parse(jsonText);
      const importedArticles = Array.isArray(parsed) ? parsed : (parsed.articles || []);
      if (!Array.isArray(importedArticles)) {
        throw new Error("Invalid file format");
      }
      this.saveAll(importedArticles);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
};

// Initialize storage immediately
ArticleStore.init();


// --- 3. AUTHOR STUDIO UI CONTROLLER ---
const EditorStudio = {
  currentArticleId: null,
  activeFilter: 'all', // 'all', 'draft', 'published'
  editorMode: 'split', // 'edit', 'preview', 'split'
  autoSaveTimer: null,
  isDirty: false,

  init() {
    this.bindEvents();
    this.loadArticlesList();
  },

  bindEvents() {
    const contentTextarea = document.getElementById("articleContentInput");
    if (contentTextarea) {
      contentTextarea.addEventListener("input", () => {
        this.isDirty = true;
        this.updateWordCount();
        this.updatePreview();
        this.scheduleAutoSave();
      });

      contentTextarea.addEventListener("keydown", (e) => {
        if (e.key === "Tab") {
          e.preventDefault();
          const start = contentTextarea.selectionStart;
          const end = contentTextarea.selectionEnd;
          contentTextarea.value = contentTextarea.value.substring(0, start) + "  " + contentTextarea.value.substring(end);
          contentTextarea.selectionStart = contentTextarea.selectionEnd = start + 2;
          this.updatePreview();
        }
      });
    }

    const titleInput = document.getElementById("articleTitleInput");
    if (titleInput) {
      titleInput.addEventListener("input", () => {
        this.isDirty = true;
        this.updatePreview();
        this.scheduleAutoSave();
      });
    }

    const categorySelect = document.getElementById("articleCategoryInput");
    if (categorySelect) {
      categorySelect.addEventListener("change", () => {
        this.isDirty = true;
        this.updatePreview();
      });
    }
  },

  scheduleAutoSave() {
    clearTimeout(this.autoSaveTimer);
    const indicator = document.getElementById("autosaveIndicator");
    if (indicator) {
      indicator.innerHTML = `<span class="text-amber-500"><i class="fa-solid fa-pen"></i> Editing...</span>`;
    }

    this.autoSaveTimer = setTimeout(() => {
      this.autoSaveToDraft();
    }, 2000);
  },

  autoSaveToDraft() {
    const title = document.getElementById("articleTitleInput").value.trim();
    const content = document.getElementById("articleContentInput").value.trim();

    if (!title && !content) return;

    const payload = this.collectFormData("draft");
    const saved = ArticleStore.save(payload);
    this.currentArticleId = saved.id;
    document.getElementById("editorArticleId").value = saved.id;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const indicator = document.getElementById("autosaveIndicator");
    if (indicator) {
      indicator.innerHTML = `<span class="text-emerald-600 font-medium"><i class="fa-solid fa-cloud-check"></i> Draft auto-saved at ${timeStr}</span>`;
    }
    this.isDirty = false;
    this.loadArticlesList(false);
  },

  collectFormData(enforcedStatus = null) {
    const id = document.getElementById("editorArticleId").value;
    const title = document.getElementById("articleTitleInput").value.trim() || "Untitled Article";
    const category = document.getElementById("articleCategoryInput").value;
    const difficulty = document.getElementById("articleDifficultyInput").value;
    const summary = document.getElementById("articleSummaryInput").value.trim();
    const tags = document.getElementById("articleTagsInput").value.trim();
    const readTime = parseInt(document.getElementById("articleReadTimeInput").value, 10) || 5;
    const author = document.getElementById("articleAuthorInput").value.trim() || "Mohammed Bargisy";
    const content = document.getElementById("articleContentInput").value;

    let status = enforcedStatus;
    if (!status) {
      status = document.getElementById("editorCurrentStatus").value || "draft";
    }

    return {
      id: id ? parseInt(id, 10) : null,
      title,
      category,
      difficulty,
      summary,
      tags,
      read_time: readTime,
      author,
      content,
      status
    };
  },

  updateWordCount() {
    const content = document.getElementById("articleContentInput").value;
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    const chars = content.length;
    const estTime = Math.max(1, Math.ceil(words / 180));

    const wordEl = document.getElementById("editorWordCount");
    if (wordEl) wordEl.innerText = `${words} words (${chars} chars)`;

    const readTimeInput = document.getElementById("articleReadTimeInput");
    if (readTimeInput && (!readTimeInput.value || readTimeInput.dataset.autoCalc === "true")) {
      readTimeInput.value = estTime;
      readTimeInput.dataset.autoCalc = "true";
    }
  },

  updatePreview() {
    const previewEl = document.getElementById("editorLivePreview");
    if (!previewEl) return;

    const title = document.getElementById("articleTitleInput").value.trim() || "Article Title Preview";
    const category = document.getElementById("articleCategoryInput").value;
    const content = document.getElementById("articleContentInput").value;

    const categoryNames = {
      programming: "Programming & Code",
      computer_skills: "Computer & IT Skills",
      excel: "Excel & Spreadsheets",
      general: "General Tech"
    };

    let renderedMarkdown = "";
    if (window.marked) {
      renderedMarkdown = window.marked.parse(content || "*Start writing your lesson content in the editor to see the live preview here...*");
    } else {
      renderedMarkdown = `<pre>${content}</pre>`;
    }

    previewEl.innerHTML = `
      <div class="mb-4 pb-3 border-b border-slate-200">
        <span class="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
          ${categoryNames[category] || category}
        </span>
        <h1 class="text-2xl font-extrabold text-slate-900 mt-2">${title}</h1>
      </div>
      <div class="article-content">
        ${renderedMarkdown}
      </div>
    `;
  },

  insertMarkdown(prefix, suffix = "") {
    const textarea = document.getElementById("articleContentInput");
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end) || "text";

    const replacement = prefix + selectedText + suffix;
    textarea.value = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
    textarea.selectionStart = start + prefix.length;
    textarea.selectionEnd = start + prefix.length + selectedText.length;
    textarea.focus();

    this.isDirty = true;
    this.updateWordCount();
    this.updatePreview();
    this.scheduleAutoSave();
  },

  insertTemplate(templateType) {
    let snippet = "";
    switch (templateType) {
      case "code":
        snippet = "\n```python\n# Write your Python or code snippet here\ndef calculate_total(items):\n    return sum(item['price'] for item in items)\n```\n";
        break;
      case "excel":
        snippet = "\n```excel\n-- Core Formula Example\n=XLOOKUP(A2, Products!A:A, Products!C:C, \"Not Found\")\n```\n";
        break;
      case "tip":
        snippet = "\n> [!TIP]\n> **Pro Tip**: Use keyboard shortcut `Ctrl + Shift + L` to immediately toggle AutoFilter in Excel!\n";
        break;
      case "warning":
        snippet = "\n> [!WARNING]\n> Always keep a backup copy of your dataset before running automated macros or batch scripts.\n";
        break;
      case "table":
        snippet = "\n| Function | Purpose | Example |\n| :--- | :--- | :--- |\n| `=SUM()` | Sums numerical range | `=SUM(B2:B20)` |\n| `=AVERAGE()` | Computes arithmetic mean | `=AVERAGE(C2:C20)` |\n| `=IF()` | Logical branch | `=IF(A2>100, \"Pass\", \"Fail\")` |\n";
        break;
    }
    this.insertMarkdown(snippet, "");
  },

  setEditorLayout(mode) {
    this.editorMode = mode;
    const editContainer = document.getElementById("editorTextContainer");
    const previewContainer = document.getElementById("editorPreviewContainer");

    document.querySelectorAll(".editor-view-toggle").forEach(btn => {
      btn.classList.remove("bg-blue-600", "text-white");
      btn.classList.add("bg-slate-100", "text-slate-600");
    });
    const activeBtn = document.getElementById(`btnMode_${mode}`);
    if (activeBtn) {
      activeBtn.classList.add("bg-blue-600", "text-white");
      activeBtn.classList.remove("bg-slate-100", "text-slate-600");
    }

    if (mode === "edit") {
      editContainer.classList.remove("hidden");
      editContainer.classList.add("w-full");
      editContainer.classList.remove("lg:w-1/2");
      previewContainer.classList.add("hidden");
    } else if (mode === "preview") {
      editContainer.classList.add("hidden");
      previewContainer.classList.remove("hidden");
      previewContainer.classList.add("w-full");
      previewContainer.classList.remove("lg:w-1/2");
      this.updatePreview();
    } else {
      editContainer.classList.remove("hidden", "w-full");
      editContainer.classList.add("lg:w-1/2");
      previewContainer.classList.remove("hidden", "w-full");
      previewContainer.classList.add("lg:w-1/2");
      this.updatePreview();
    }
  },

  loadArticlesList(showNotification = false) {
    const articles = ArticleStore.list();
    const stats = ArticleStore.getStats();

    this.renderStudioStats(stats);
    this.renderArticlesTable(articles);

    if (showNotification && window.App) {
      window.App.showToast("Studio refreshed successfully", "success");
    }
  },

  renderStudioStats(stats) {
    const totalEl = document.getElementById("studioStatTotal");
    const publishedEl = document.getElementById("studioStatPublished");
    const draftsEl = document.getElementById("studioStatDrafts");
    const viewsEl = document.getElementById("studioStatViews");
    const draftBadge = document.getElementById("navDraftBadge");

    if (totalEl) totalEl.innerText = stats.total_articles;
    if (publishedEl) publishedEl.innerText = stats.published_articles;
    if (draftsEl) draftsEl.innerText = stats.draft_articles;
    if (viewsEl) viewsEl.innerText = stats.total_views.toLocaleString();

    if (draftBadge) {
      if (stats.draft_articles > 0) {
        draftBadge.innerText = `${stats.draft_articles} Drafts`;
        draftBadge.classList.remove("hidden");
      } else {
        draftBadge.classList.add("hidden");
      }
    }
  },

  filterTable(filterType) {
    this.activeFilter = filterType;
    document.querySelectorAll(".studio-filter-tab").forEach(tab => {
      tab.classList.remove("border-blue-600", "text-blue-600", "font-bold");
      tab.classList.add("border-transparent", "text-slate-500");
    });
    const activeTab = document.getElementById(`tabFilter_${filterType}`);
    if (activeTab) {
      activeTab.classList.add("border-blue-600", "text-blue-600", "font-bold");
      activeTab.classList.remove("border-transparent", "text-slate-500");
    }
    this.loadArticlesList();
  },

  renderArticlesTable(articles) {
    const tbody = document.getElementById("studioArticlesTableBody");
    if (!tbody) return;

    let filtered = articles;
    if (this.activeFilter === "draft") {
      filtered = articles.filter(a => a.status === "draft");
    } else if (this.activeFilter === "published") {
      filtered = articles.filter(a => a.status === "published");
    }

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="px-6 py-12 text-center text-slate-400">
            <i class="fa-regular fa-folder-open text-4xl mb-3 block"></i>
            No ${this.activeFilter === "draft" ? "draft" : ""} articles found. Click "Write New Article" to create one!
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map(a => {
      const isDraft = a.status === "draft";
      const statusBadge = isDraft
        ? `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
             <i class="fa-solid fa-pen-ruler text-[10px]"></i> Draft (Work in Progress)
           </span>`
        : `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
             <i class="fa-solid fa-circle-check text-[10px]"></i> Live on Site
           </span>`;

      const categoryLabels = {
        programming: "Programming",
        computer_skills: "Computer Skills",
        excel: "Excel & Spreadsheets",
        general: "General"
      };

      const dateStr = a.updated_at ? a.updated_at.split(" ")[0] : "Recently";

      return `
        <tr class="hover:bg-slate-50/80 transition">
          <td class="px-6 py-4">
            <div class="font-semibold text-slate-900 line-clamp-1">${a.title}</div>
            <div class="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
              <span><i class="fa-regular fa-clock"></i> ${a.read_time} min read</span>
              <span>•</span>
              <span><i class="fa-regular fa-eye"></i> ${a.views || 0} views</span>
              <span>•</span>
              <span>Updated: ${dateStr}</span>
            </div>
          </td>
          <td class="px-6 py-4 text-sm text-slate-600">
            <span class="px-2 py-1 rounded bg-slate-100 font-medium text-xs">
              ${categoryLabels[a.category] || a.category}
            </span>
          </td>
          <td class="px-6 py-4">
            ${statusBadge}
          </td>
          <td class="px-6 py-4 text-sm text-slate-500">
            ${a.author}
          </td>
          <td class="px-6 py-4 text-right">
            <div class="inline-flex items-center gap-2">
              <button onclick="EditorStudio.editArticle(${a.id})" class="px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition" title="Edit Article">
                <i class="fa-solid fa-pen-to-square"></i> Edit
              </button>
              
              <button onclick="EditorStudio.togglePublish(${a.id})" class="px-3 py-1.5 text-xs font-medium ${isDraft ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'} rounded-lg transition" title="${isDraft ? 'Publish to live website' : 'Revert to draft'}">
                <i class="fa-solid ${isDraft ? 'fa-rocket' : 'fa-box-archive'}"></i> ${isDraft ? 'Publish' : 'Unpublish'}
              </button>

              <button onclick="App.navigateToArticle('${a.slug}')" class="p-1.5 text-slate-400 hover:text-slate-700 transition" title="View Preview">
                <i class="fa-solid fa-arrow-up-right-from-square"></i>
              </button>

              <button onclick="EditorStudio.deleteArticle(${a.id}, '${a.title.replace(/'/g, "\\'")}')" class="p-1.5 text-rose-400 hover:text-rose-600 transition" title="Delete">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join("");
  },

  newArticle() {
    this.currentArticleId = null;
    document.getElementById("editorArticleId").value = "";
    document.getElementById("editorCurrentStatus").value = "draft";
    document.getElementById("articleTitleInput").value = "";
    document.getElementById("articleCategoryInput").value = "programming";
    document.getElementById("articleDifficultyInput").value = "Beginner";
    document.getElementById("articleSummaryInput").value = "";
    document.getElementById("articleTagsInput").value = "";
    document.getElementById("articleReadTimeInput").value = "5";
    document.getElementById("articleAuthorInput").value = "Mohammed Bargisy";
    document.getElementById("articleContentInput").value = `# Lesson Title\n\nWelcome to this Bargisy eSchool tutorial!\n\n## 1. Introduction\nExplain the core concept here...\n\n\`\`\`python\n# Add your code or Excel formulas\nprint("Hello from Bargisy eSchool")\n\`\`\`\n\n> [!TIP]\n> Practical note for learners.\n`;

    document.getElementById("editorModalTitle").innerText = "Write New Article / Lesson";
    document.getElementById("publishBtnText").innerText = "Publish to Website";
    document.getElementById("autosaveIndicator").innerHTML = `<span class="text-slate-400"><i class="fa-regular fa-clock"></i> Not saved yet</span>`;

    this.updateWordCount();
    this.updatePreview();
    this.openEditorModal();
  },

  editArticle(id) {
    const a = ArticleStore.get(id);
    if (!a) {
      if (window.App) window.App.showToast("Article not found", "error");
      return;
    }

    this.currentArticleId = a.id;
    document.getElementById("editorArticleId").value = a.id;
    document.getElementById("editorCurrentStatus").value = a.status;
    document.getElementById("articleTitleInput").value = a.title;
    document.getElementById("articleCategoryInput").value = a.category;
    document.getElementById("articleDifficultyInput").value = a.difficulty;
    document.getElementById("articleSummaryInput").value = a.summary || "";
    document.getElementById("articleTagsInput").value = a.tags || "";
    document.getElementById("articleReadTimeInput").value = a.read_time || 5;
    document.getElementById("articleAuthorInput").value = a.author || "Mohammed Bargisy";
    document.getElementById("articleContentInput").value = a.content;

    document.getElementById("editorModalTitle").innerText = `Edit: ${a.title}`;
    document.getElementById("publishBtnText").innerText = a.status === "published" ? "Save & Keep Published" : "Publish to Website";

    const indicator = document.getElementById("autosaveIndicator");
    if (indicator) {
      indicator.innerHTML = `<span class="text-slate-500 font-medium"><i class="fa-solid fa-info-circle"></i> Status: <strong>${a.status.toUpperCase()}</strong></span>`;
    }

    this.updateWordCount();
    this.updatePreview();
    this.openEditorModal();
  },

  openEditorModal() {
    const modal = document.getElementById("editorModal");
    if (modal) {
      modal.classList.remove("hidden");
      document.body.style.overflow = "hidden";
      this.setEditorLayout("split");
    }
  },

  closeEditorModal() {
    if (this.isDirty) {
      if (!confirm("You have unsaved changes. Do you want to close the editor? (Any auto-saved draft remains safe)")) {
        return;
      }
    }
    const modal = document.getElementById("editorModal");
    if (modal) {
      modal.classList.add("hidden");
      document.body.style.overflow = "";
    }
    this.loadArticlesList();
  },

  saveAsDraft() {
    const title = document.getElementById("articleTitleInput").value.trim();
    if (!title) {
      if (window.App) window.App.showToast("Please enter a title for your draft", "warning");
      document.getElementById("articleTitleInput").focus();
      return;
    }

    const payload = this.collectFormData("draft");
    const saved = ArticleStore.save(payload);
    this.currentArticleId = saved.id;
    this.isDirty = false;

    if (window.App) window.App.showToast("Draft saved successfully! Kept private until published.", "success");
    this.closeEditorModal();
    this.loadArticlesList();
    if (window.App) window.App.loadCatalog();
  },

  publishArticle() {
    const title = document.getElementById("articleTitleInput").value.trim();
    const content = document.getElementById("articleContentInput").value.trim();

    if (!title) {
      if (window.App) window.App.showToast("Please enter an article title", "warning");
      document.getElementById("articleTitleInput").focus();
      return;
    }
    if (!content) {
      if (window.App) window.App.showToast("Please write some content before publishing", "warning");
      document.getElementById("articleContentInput").focus();
      return;
    }

    const payload = this.collectFormData("published");
    const saved = ArticleStore.save(payload);
    this.currentArticleId = saved.id;
    this.isDirty = false;

    if (window.App) window.App.showToast("🎉 Article successfully published to Bargisy eSchool!", "success");
    this.closeEditorModal();
    this.loadArticlesList();
    if (window.App) window.App.loadCatalog();
  },

  togglePublish(id) {
    const updated = ArticleStore.togglePublish(id);
    if (!updated) return;

    const newStatus = updated.status;
    const msg = newStatus === "published"
      ? "🚀 Article is now LIVE on Bargisy eSchool!"
      : "📥 Article reverted to Draft (hidden from students until republished)";

    if (window.App) window.App.showToast(msg, newStatus === "published" ? "success" : "info");
    this.loadArticlesList();
    if (window.App) window.App.loadCatalog();
  },

  deleteArticle(id, title) {
    if (!confirm(`Are you sure you want to permanently delete "${title}"?`)) {
      return;
    }
    ArticleStore.delete(id);
    if (window.App) window.App.showToast("Article deleted", "info");
    this.loadArticlesList();
    if (window.App) window.App.loadCatalog();
  },

  exportBackup() {
    ArticleStore.exportJSON();
    if (window.App) window.App.showToast("Backup exported successfully!", "success");
  }
};

window.ArticleStore = ArticleStore;
window.EditorStudio = EditorStudio;
