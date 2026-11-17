/**
 * Bargisy eSchool - Complete Interactive Learning Laboratory
 * Divided into 3 dedicated sections:
 *  1. 📊 Excel Formula Lab (Interactive spreadsheet with live formula evaluator)
 *  2. 🐍 Python Code Lab (Real in-browser Python execution terminal)
 *  3. 🌐 Web Dev Lab (Live HTML / CSS / JavaScript Code Playground)
 */

const InteractiveLab = {
  currentTab: 'excel', // 'excel', 'python', 'web'
  activeWebTab: 'html', // 'html', 'css', 'js'
  autoRunWeb: true,
  webDebounceTimer: null,

  // ==========================================
  // PART 1: EXCEL FORMULA LAB ENGINE & DATA
  // ==========================================
  defaultExcelData: [
    { id: "P-101", name: "Dell Latitude Laptop", category: "Hardware", price: 1200, qty: 15 },
    { id: "P-102", name: "Ergonomic Mechanical Keyboard", category: "Peripherals", price: 95, qty: 60 },
    { id: "P-103", name: "UltraWide 34-inch Monitor", category: "Peripherals", price: 450, qty: 25 },
    { id: "P-104", name: "Python Automation Handbook", category: "Books", price: 45, qty: 120 },
    { id: "P-105", name: "USB-C Multiport Hub", category: "Accessories", price: 35, qty: 85 }
  ],
  excelData: [],

  init() {
    this.excelData = JSON.parse(JSON.stringify(this.defaultExcelData));
    this.renderExcelPlayground();
    this.initPythonLab();
    this.initWebLab();
    this.bindEvents();
  },

  bindEvents() {
    // Excel formula input enter key
    const formulaInput = document.getElementById("excelFormulaInput");
    if (formulaInput) {
      formulaInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          this.evaluateExcelFormula(formulaInput.value);
        }
      });
    }

    // Web lab editors input listeners
    ['webHtmlInput', 'webCssInput', 'webJsInput'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener("input", () => {
          if (this.autoRunWeb) {
            clearTimeout(this.webDebounceTimer);
            this.webDebounceTimer = setTimeout(() => this.runWebPreview(), 600);
          }
        });

        // Tab key support
        el.addEventListener("keydown", (e) => {
          if (e.key === "Tab") {
            e.preventDefault();
            const start = el.selectionStart;
            const end = el.selectionEnd;
            el.value = el.value.substring(0, start) + "  " + el.value.substring(end);
            el.selectionStart = el.selectionEnd = start + 2;
            if (this.autoRunWeb) {
              clearTimeout(this.webDebounceTimer);
              this.webDebounceTimer = setTimeout(() => this.runWebPreview(), 600);
            }
          }
        });
      }
    });

    // Python editor tab key support
    const pyInput = document.getElementById("pythonCodeInput");
    if (pyInput) {
      pyInput.addEventListener("keydown", (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
          e.preventDefault();
          this.runPythonCode();
          return;
        }
        if (e.key === "Tab") {
          e.preventDefault();
          const start = pyInput.selectionStart;
          const end = pyInput.selectionEnd;
          pyInput.value = pyInput.value.substring(0, start) + "    " + pyInput.value.substring(end);
          pyInput.selectionStart = pyInput.selectionEnd = start + 4;
        }
      });
    }
  },

  switchLab(tabKey) {
    this.currentTab = tabKey;

    // Update tab button styles
    ['excel', 'python', 'web'].forEach(k => {
      const btn = document.getElementById(`labTabBtn_${k}`);
      const pane = document.getElementById(`labPane_${k}`);
      if (btn) {
        if (k === tabKey) {
          btn.className = "px-5 py-2.5 rounded-xl font-bold text-xs bg-blue-600 text-white shadow-md shadow-blue-500/20 transition flex items-center gap-2";
        } else {
          btn.className = "px-5 py-2.5 rounded-xl font-semibold text-xs bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 transition flex items-center gap-2";
        }
      }
      if (pane) {
        pane.classList.toggle("hidden", k !== tabKey);
      }
    });

    // Lazy initialization triggers
    if (tabKey === 'excel') {
      this.renderExcelPlayground();
    } else if (tabKey === 'web') {
      this.runWebPreview();
    } else if (tabKey === 'python') {
      // Start downloading the Python engine in the background
      this.loadPyodideEngine().catch(() => {});
    }
  },

  // --- EXCEL LAB LOGIC ---
  renderExcelPlayground() {
    const tableBody = document.getElementById("excelTableBody");
    if (!tableBody) return;

    tableBody.innerHTML = this.excelData.map((row, idx) => {
      const rowNum = idx + 2; // Row 1 is header
      const total = (row.price || 0) * (row.qty || 0);
      return `
        <tr class="hover:bg-blue-50/40 transition group">
          <td class="px-3 py-2 text-center text-xs font-mono text-slate-400 bg-slate-50 border-r border-slate-200 select-none">${rowNum}</td>
          
          <td class="px-2 py-1 font-mono text-xs font-bold text-blue-700">
            <input type="text" value="${row.id}" onchange="InteractiveLab.updateExcelCell(${idx}, 'id', this.value)" 
                   class="w-full bg-transparent px-1.5 py-1 rounded focus:bg-white focus:ring-1 focus:ring-blue-500 font-mono text-xs text-blue-700 border-transparent hover:border-slate-200 border">
          </td>
          
          <td class="px-2 py-1 text-sm text-slate-800">
            <input type="text" value="${row.name}" onchange="InteractiveLab.updateExcelCell(${idx}, 'name', this.value)" 
                   class="w-full bg-transparent px-1.5 py-1 rounded focus:bg-white focus:ring-1 focus:ring-blue-500 text-xs text-slate-800 border-transparent hover:border-slate-200 border font-medium">
          </td>
          
          <td class="px-2 py-1 text-xs text-slate-500">
            <input type="text" value="${row.category}" onchange="InteractiveLab.updateExcelCell(${idx}, 'category', this.value)" 
                   class="w-full bg-transparent px-1.5 py-1 rounded focus:bg-white focus:ring-1 focus:ring-blue-500 text-xs text-slate-600 border-transparent hover:border-slate-200 border">
          </td>
          
          <td class="px-2 py-1 text-right font-mono text-xs text-slate-800">
            <input type="number" value="${row.price}" onchange="InteractiveLab.updateExcelCell(${idx}, 'price', parseFloat(this.value)||0)" 
                   class="w-full text-right bg-transparent px-1.5 py-1 rounded focus:bg-white focus:ring-1 focus:ring-blue-500 text-xs font-mono border-transparent hover:border-slate-200 border">
          </td>
          
          <td class="px-2 py-1 text-right font-mono text-xs text-slate-800">
            <input type="number" value="${row.qty}" onchange="InteractiveLab.updateExcelCell(${idx}, 'qty', parseInt(this.value, 10)||0)" 
                   class="w-full text-right bg-transparent px-1.5 py-1 rounded focus:bg-white focus:ring-1 focus:ring-blue-500 text-xs font-mono border-transparent hover:border-slate-200 border">
          </td>
          
          <td class="px-3 py-2 text-sm text-right font-mono font-bold text-emerald-600 bg-emerald-50/30">
            $${total.toLocaleString()}
          </td>

          <td class="px-2 py-1 text-center">
            <button onclick="InteractiveLab.deleteExcelRow(${idx})" class="text-slate-300 hover:text-rose-600 transition p-1 text-xs" title="Delete Row">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </td>
        </tr>
      `;
    }).join("");
  },

  updateExcelCell(idx, field, value) {
    if (this.excelData && this.excelData[idx]) {
      this.excelData[idx][field] = value;
      this.renderExcelPlayground();
      // Re-evaluate active formula if present
      const formulaInput = document.getElementById("excelFormulaInput");
      if (formulaInput && formulaInput.value) {
        try {
          this.evaluateExcelFormula(formulaInput.value);
        } catch (err) {
          console.warn("Formula evaluation after cell edit:", err);
        }
      }
    }
  },

  addExcelRow() {
    if (!Array.isArray(this.excelData)) {
      this.excelData = JSON.parse(JSON.stringify(this.defaultExcelData));
    }

    const samplePool = [
      { name: "Wireless Bluetooth Mouse", category: "Peripherals", price: 45, qty: 50 },
      { name: "4K Web Camera Pro", category: "Peripherals", price: 110, qty: 30 },
      { name: "Fast SSD NVMe 1TB", category: "Hardware", price: 85, qty: 40 },
      { name: "USB-C Fast Charger 65W", category: "Accessories", price: 30, qty: 75 },
      { name: "Noise Cancelling Headset", category: "Accessories", price: 120, qty: 25 },
      { name: "Excel Advanced Formulas Guide", category: "Books", price: 40, qty: 90 },
      { name: "Smart Standing Desk Mat", category: "Peripherals", price: 55, qty: 35 }
    ];

    const currentLen = this.excelData.length;
    const oldLastRowNum = currentLen + 1; // Row 1 is header, so row 6 with 5 items
    const poolIdx = (currentLen - 5) % samplePool.length;
    const sample = samplePool[poolIdx >= 0 ? poolIdx : 0];
    const newId = `P-${101 + currentLen}`;

    const newRow = {
      id: newId,
      name: sample.name,
      category: sample.category,
      price: sample.price,
      qty: sample.qty
    };

    this.excelData.push(newRow);
    const newLastRowNum = this.excelData.length + 1;

    this.renderExcelPlayground();

    // Auto-expand formula ranges that ended at the previous bottom row (e.g. F2:F6 -> F2:F7)
    const formulaInput = document.getElementById("excelFormulaInput");
    if (formulaInput) {
      let currentVal = formulaInput.value || "";
      const rangeRegex = new RegExp(`:([A-F])${oldLastRowNum}\\b`, "i");
      if (rangeRegex.test(currentVal)) {
        currentVal = currentVal.replace(rangeRegex, `:$1${newLastRowNum}`);
        formulaInput.value = currentVal;
      }
      try {
        this.evaluateExcelFormula(formulaInput.value);
      } catch (err) {
        console.warn("Formula evaluation error after add row:", err);
      }
    }

    if (window.App && typeof App.showToast === "function") {
      App.showToast(`✓ Row ${newLastRowNum} added (${newRow.id}: ${newRow.name})`, "success");
    }
  },

  resetExcelData() {
    this.excelData = JSON.parse(JSON.stringify(this.defaultExcelData));
    this.renderExcelPlayground();
    this.loadFormulaPreset("=SUM(F2:F6)");
    if (window.App && typeof App.showToast === "function") {
      App.showToast("Spreadsheet reset to default 5 rows", "info");
    }
  },

  deleteExcelRow(idx) {
    if (!Array.isArray(this.excelData)) return;
    if (this.excelData.length <= 1) {
      if (window.App && typeof App.showToast === "function") {
        App.showToast("At least one data row is required in the spreadsheet.", "warning");
      } else {
        alert("At least one data row is required in the spreadsheet.");
      }
      return;
    }

    const oldLastRowNum = this.excelData.length + 1;
    const removed = this.excelData.splice(idx, 1);
    const newLastRowNum = this.excelData.length + 1;

    this.renderExcelPlayground();

    const formulaInput = document.getElementById("excelFormulaInput");
    if (formulaInput) {
      let currentVal = formulaInput.value || "";
      const rangeRegex = new RegExp(`:([A-F])${oldLastRowNum}\\b`, "i");
      if (rangeRegex.test(currentVal)) {
        currentVal = currentVal.replace(rangeRegex, `:$1${newLastRowNum}`);
        formulaInput.value = currentVal;
      }
      try {
        this.evaluateExcelFormula(formulaInput.value);
      } catch (err) {
        console.warn("Formula evaluation error after delete row:", err);
      }
    }

    if (window.App && typeof App.showToast === "function" && removed[0]) {
      App.showToast(`Deleted row ${removed[0].id} (${removed[0].name})`, "info");
    }
  },

  getCellValue(coord) {
    // coord e.g. "D2", "E3", "F4", "A2", "B5"
    const match = coord.trim().toUpperCase().match(/^([A-F])(\d+)$/);
    if (!match) return null;
    const col = match[1];
    const rowNum = parseInt(match[2], 10);
    const idx = rowNum - 2; // header is row 1, data starts row 2

    if (idx < 0 || idx >= this.excelData.length) return null;
    const r = this.excelData[idx];

    switch (col) {
      case "A": return r.id;
      case "B": return r.name;
      case "C": return r.category;
      case "D": return r.price;
      case "E": return r.qty;
      case "F": return (r.price || 0) * (r.qty || 0);
      default: return null;
    }
  },

  getRangeValues(rangeStr) {
    // e.g. "D2:D7" or "E2:E6"
    const parts = rangeStr.trim().toUpperCase().split(":");
    if (parts.length !== 2) return [];

    const mStart = parts[0].match(/^([A-F])(\d+)$/);
    const mEnd = parts[1].match(/^([A-F])(\d+)$/);
    if (!mStart || !mEnd) return [];

    const colStart = mStart[1].charCodeAt(0);
    const colEnd = mEnd[1].charCodeAt(0);
    const rowStart = parseInt(mStart[2], 10);
    const rowEnd = parseInt(mEnd[2], 10);

    const values = [];
    for (let c = Math.min(colStart, colEnd); c <= Math.max(colStart, colEnd); c++) {
      const colLetter = String.fromCharCode(c);
      for (let r = Math.min(rowStart, rowEnd); r <= Math.max(rowStart, rowEnd); r++) {
        const val = this.getCellValue(`${colLetter}${r}`);
        if (val !== null && val !== undefined) {
          values.push(val);
        }
      }
    }
    return values;
  },

  evaluateExcelFormula(formulaInput) {
    let raw = (formulaInput || "").trim();
    if (!raw.startsWith("=")) {
      raw = "=" + raw;
    }

    const expr = raw.substring(1).trim();
    const upper = expr.toUpperCase();

    try {
      // 1. SUM function
      if (upper.startsWith("SUM(")) {
        const inner = expr.substring(expr.indexOf("(") + 1, expr.lastIndexOf(")")).trim();
        let nums = [];
        if (inner.includes(":")) {
          nums = this.getRangeValues(inner).map(v => parseFloat(v) || 0);
        } else {
          nums = inner.split(",").map(s => {
            const trimmed = s.trim();
            const cellVal = this.getCellValue(trimmed);
            return cellVal !== null ? (parseFloat(cellVal) || 0) : (parseFloat(trimmed) || 0);
          });
        }
        const total = nums.reduce((a, b) => a + b, 0);
        const isMoney = /([DF]\d+)/i.test(inner);
        const prefix = isMoney ? "$" : "";
        this.setExcelResult(
          `${prefix}${total.toLocaleString()}`,
          `Summed ${nums.length} values from range [${inner}]: (${nums.slice(0, 8).join(" + ")}${nums.length > 8 ? " + ..." : ""}) = ${prefix}${total.toLocaleString()}`
        );
        return;
      }

      // 2. AVERAGE function
      if (upper.startsWith("AVERAGE(")) {
        const inner = expr.substring(expr.indexOf("(") + 1, expr.lastIndexOf(")")).trim();
        const nums = this.getRangeValues(inner).map(v => parseFloat(v) || 0);
        if (nums.length === 0) throw new Error("Empty range");
        const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
        const isMoney = /([DF]\d+)/i.test(inner);
        const prefix = isMoney ? "$" : "";
        this.setExcelResult(
          `${prefix}${avg.toFixed(2)}`,
          `Calculated arithmetic mean across ${nums.length} cells in range [${inner}]: ${prefix}${avg.toFixed(2)}`
        );
        return;
      }

      // 3. COUNT / COUNTA
      if (upper.startsWith("COUNT(")) {
        const inner = expr.substring(expr.indexOf("(") + 1, expr.lastIndexOf(")")).trim();
        const nums = this.getRangeValues(inner).filter(v => typeof v === "number" || (!isNaN(parseFloat(v)) && isFinite(v)));
        this.setExcelResult(nums.length.toString(), `Counted ${nums.length} numeric values in [${inner}].`);
        return;
      }
      if (upper.startsWith("COUNTA(")) {
        const inner = expr.substring(expr.indexOf("(") + 1, expr.lastIndexOf(")")).trim();
        const items = this.getRangeValues(inner).filter(v => v !== null && v !== "");
        this.setExcelResult(items.length.toString(), `Counted ${items.length} non-empty entries in [${inner}].`);
        return;
      }

      // 4. MAX / MIN
      if (upper.startsWith("MAX(")) {
        const inner = expr.substring(expr.indexOf("(") + 1, expr.lastIndexOf(")")).trim();
        const nums = this.getRangeValues(inner).map(v => parseFloat(v) || 0);
        const maxVal = Math.max(...nums);
        const isMoney = /([DF]\d+)/i.test(inner);
        const prefix = isMoney ? "$" : "";
        this.setExcelResult(`${prefix}${maxVal.toLocaleString()}`, `Found maximum value in [${inner}]: ${prefix}${maxVal.toLocaleString()}`);
        return;
      }
      if (upper.startsWith("MIN(")) {
        const inner = expr.substring(expr.indexOf("(") + 1, expr.lastIndexOf(")")).trim();
        const nums = this.getRangeValues(inner).map(v => parseFloat(v) || 0);
        const minVal = Math.min(...nums);
        const isMoney = /([DF]\d+)/i.test(inner);
        const prefix = isMoney ? "$" : "";
        this.setExcelResult(`${prefix}${minVal.toLocaleString()}`, `Found minimum value in [${inner}]: ${prefix}${minVal.toLocaleString()}`);
        return;
      }

      // 5. IF Function
      if (upper.startsWith("IF(")) {
        // e.g. IF(E2 > 50, "Bulk Stock", "Low Stock")
        const inner = expr.substring(expr.indexOf("(") + 1, expr.lastIndexOf(")")).trim();
        const parts = inner.split(",").map(p => p.trim());
        if (parts.length >= 2) {
          const conditionStr = parts[0].replace(/([A-F]\d+)/gi, (match) => {
            const v = this.getCellValue(match);
            return typeof v === "number" ? v : `"${v}"`;
          });
          // Evaluate condition safely
          // eslint-disable-next-line no-eval
          const condResult = Boolean(Function(`'use strict'; return (${conditionStr})`)());
          const trueVal = parts[1].replace(/^["']|["']$/g, "");
          const falseVal = parts[2] ? parts[2].replace(/^["']|["']$/g, "") : "";
          const result = condResult ? trueVal : falseVal;
          this.setExcelResult(
            `"${result}"`,
            `Evaluated logical condition [${parts[0]}] -> ${condResult ? "TRUE" : "FALSE"}. Returned: "${result}"`
          );
          return;
        }
      }

      // 6. XLOOKUP Function
      if (upper.startsWith("XLOOKUP(")) {
        // e.g. XLOOKUP("P-102", A2:A6, B2:B6)
        const inner = expr.substring(expr.indexOf("(") + 1, expr.lastIndexOf(")")).trim();
        const args = inner.split(",").map(a => a.trim());
        const lookupVal = args[0].replace(/^["']|["']$/g, "");
        const searchRange = this.getRangeValues(args[1] || `A2:A${this.excelData.length + 1}`);
        const returnRange = this.getRangeValues(args[2] || `B2:B${this.excelData.length + 1}`);

        const foundIndex = searchRange.findIndex(v => String(v).toUpperCase() === lookupVal.toUpperCase());
        if (foundIndex !== -1 && returnRange[foundIndex] !== undefined) {
          const res = returnRange[foundIndex];
          this.setExcelResult(
            `"${res}"`,
            `Found match for "${lookupVal}" at row ${foundIndex + 2}. Retrieved value: "${res}"`
          );
          return;
        } else {
          const fallback = args[3] ? args[3].replace(/^["']|["']$/g, "") : "#N/A";
          this.setExcelResult(fallback, `XLOOKUP: Match not found for "${lookupVal}".`);
          return;
        }
      }

      // 7. Text Functions (CONCAT, UPPER, LOWER, LEN, PROPER)
      if (upper.startsWith("UPPER(")) {
        const inner = expr.substring(expr.indexOf("(") + 1, expr.lastIndexOf(")")).trim();
        const val = this.getCellValue(inner) || inner.replace(/^["']|["']$/g, "");
        this.setExcelResult(`"${String(val).toUpperCase()}"`, `Converted text in ${inner} to uppercase.`);
        return;
      }
      if (upper.startsWith("LOWER(")) {
        const inner = expr.substring(expr.indexOf("(") + 1, expr.lastIndexOf(")")).trim();
        const val = this.getCellValue(inner) || inner.replace(/^["']|["']$/g, "");
        this.setExcelResult(`"${String(val).toLowerCase()}"`, `Converted text in ${inner} to lowercase.`);
        return;
      }
      if (upper.startsWith("PROPER(")) {
        const inner = expr.substring(expr.indexOf("(") + 1, expr.lastIndexOf(")")).trim();
        const val = String(this.getCellValue(inner) || inner.replace(/^["']|["']$/g, ""));
        const proper = val.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
        this.setExcelResult(`"${proper}"`, `Converted text in ${inner} to proper title case.`);
        return;
      }
      if (upper.startsWith("LEN(")) {
        const inner = expr.substring(expr.indexOf("(") + 1, expr.lastIndexOf(")")).trim();
        const val = this.getCellValue(inner) || inner.replace(/^["']|["']$/g, "");
        this.setExcelResult(String(val).length.toString(), `Calculated character count of string.`);
        return;
      }

      // 8. General Arithmetic & Cell coordinate math (e.g. =D2*E2, =D2+10, =(D2+D3)/2)
      let mathParsed = expr.replace(/([A-F]\d+)/gi, (match) => {
        const val = this.getCellValue(match);
        return typeof val === "number" ? val : (parseFloat(val) || 0);
      });

      if (/^[\d\s+\-*/().%]+$/.test(mathParsed)) {
        // Replace percentages e.g. 15% -> (15/100)
        mathParsed = mathParsed.replace(/(\d+(?:\.\d+)?)%/g, '($1/100)');
        // eslint-disable-next-line no-eval
        const calc = Function(`'use strict'; return (${mathParsed})`)();
        const isMoney = /([DF]\d+)/i.test(expr);
        const prefix = isMoney ? "$" : "";
        const formatted = typeof calc === "number" && !Number.isInteger(calc) ? calc.toFixed(2) : calc.toLocaleString();
        this.setExcelResult(
          `${prefix}${formatted}`,
          `Evaluated cell math: [${expr}] -> (${mathParsed}) = ${prefix}${formatted}`
        );
        return;
      }

      this.setExcelResult("Formula Parsed", `Formula ${raw} parsed. Try using cell coordinates like =D2*E2 or =SUM(F2:F6).`);
    } catch (e) {
      console.error(e);
      this.setExcelResult("#VALUE!", `Formula Error: Invalid syntax or unrecognized cell parameter. (${e.message})`);
    }
  },

  setExcelResult(val, explanation) {
    const resEl = document.getElementById("excelFormulaResult");
    const expEl = document.getElementById("excelFormulaExplanation");
    if (resEl) resEl.innerText = val;
    if (expEl) expEl.innerText = explanation;
  },

  loadFormulaPreset(formula) {
    const input = document.getElementById("excelFormulaInput");
    if (input) {
      input.value = formula;
      this.evaluateExcelFormula(formula);
    }
  },

  // ==========================================
  // PART 2: REAL PYTHON CODE LAB ENGINE
  // ==========================================
  pyTemplates: {
    variables: `# 1. Variables, Math & String Formatting
student_name = "Mohammed Bargisy"
enrolled_courses = ["Python Automation", "Advanced Excel", "Network Essentials"]
gpa = 3.92

print(f"--- Student Record: {student_name} ---")
print(f"Total Enrolled Courses: {len(enrolled_courses)}")
for idx, course in enumerate(enrolled_courses, 1):
    print(f"  [{idx}] {course}")

print(f"Cumulative GPA: {gpa} (Honors Distinction)")
`,
    grades: `# 2. Logic & Grade Classifier
scores = [95, 82, 74, 58, 88, 100]

print("Processing Exam Submissions:")
for s in scores:
    if s >= 90:
        grade = "A (Excellent)"
    elif s >= 80:
        grade = "B (Very Good)"
    elif s >= 70:
        grade = "C (Good)"
    else:
        grade = "F (Needs Review)"
    print(f"Score {s}/100 -> {grade}")

avg = sum(scores) / len(scores)
print(f"\\nClass Average: {avg:.1f}%")
`,
    loops: `# 3. Loops, Math & Aggregations
print("Calculating Weekly Sales Commission:")
sales_records = [12000, 8500, 15400, 4200, 21000]
total_sales = 0
total_bonus = 0

for i, sale in enumerate(sales_records, 1):
    total_sales += sale
    commission = sale * 0.05 if sale >= 10000 else sale * 0.02
    total_bonus += commission
    print(f"Deal #{i}: \${sale:,} -> Commission: \${commission:,.2f}")

print("-" * 40)
print(f"Total Revenue Generated: \${total_sales:,}")
print(f"Total Commission Payout: \${total_bonus:,.2f}")
`,
    dict: `# 4. Dictionaries & Data Lookups
inventory = {
    "P-101": {"name": "Dell Latitude Laptop", "price": 1200, "stock": 15},
    "P-102": {"name": "Mechanical Keyboard", "price": 95, "stock": 60},
    "P-103": {"name": "34-inch UltraWide Monitor", "price": 450, "stock": 25}
}

search_sku = "P-102"
item = inventory.get(search_sku)

if item:
    total_value = item["price"] * item["stock"]
    print(f"Found SKU: {search_sku}")
    print(f"Product: {item['name']}")
    print(f"Unit Price: \${item['price']}")
    print(f"In Stock: {item['stock']} units")
    print(f"Inventory Worth: \${total_value:,}")
else:
    print(f"SKU {search_sku} not found in database.")
`,
    functions: `# 5. Reusable Functions
def calculate_vat(subtotal, vat_rate=0.15):
    tax = subtotal * vat_rate
    grand_total = subtotal + tax
    return tax, grand_total

orders = [150.0, 450.0, 1250.0]
for idx, amount in enumerate(orders, 1):
    tax, final_price = calculate_vat(amount)
    print(f"Order #{idx}: Subtotal=\${amount:.2f} | 15% VAT=\${tax:.2f} | Total=\${final_price:.2f}")
`
  },

  initPythonLab() {
    this.loadPythonTemplate('variables');
  },

  loadPythonTemplate(key) {
    const input = document.getElementById("pythonCodeInput");
    if (input && this.pyTemplates[key]) {
      input.value = this.pyTemplates[key];
    }
  },

  clearPythonConsole() {
    const out = document.getElementById("pythonConsoleOutput");
    if (out) out.innerHTML = `<span class="text-slate-500 font-mono text-xs">Console output cleared. Click 'Run Python Code' to execute.</span>`;
  },

  resetPythonCode() {
    this.loadPythonTemplate('variables');
    this.clearPythonConsole();
  },

  // ---------- Python engine ----------
  // Primary: Pyodide (real CPython 3.12 compiled to WebAssembly - full standard library:
  // json, re, csv, datetime, functools, pathlib, unittest, files...). Loaded on first use.
  // Fallback: Skulpt (small, already on the page) if Pyodide cannot be downloaded.
  PYODIDE_VERSION: "0.27.7",
  pyodide: null,
  pyodideLoading: null,

  loadPyodideEngine() {
    if (this.pyodide) return Promise.resolve(this.pyodide);
    if (this.pyodideLoading) return this.pyodideLoading;
    const base = `https://cdn.jsdelivr.net/pyodide/v${this.PYODIDE_VERSION}/full/`;
    this.pyodideLoading = new Promise((resolve, reject) => {
      const start = () => {
        window.loadPyodide({ indexURL: base }).then(async (py) => {
          // input() -> browser prompt; echo the answer like a real terminal
          await py.runPythonAsync([
            "import builtins, js",
            "def _bargisy_input(prompt=''):",
            "    r = js.prompt(str(prompt))",
            "    v = '' if r is None else str(r)",
            "    print(f'{prompt}{v}')",
            "    return v",
            "builtins.input = _bargisy_input",
            "import os",
            "os.makedirs('/home/pyodide/lab', exist_ok=True)",
            "os.chdir('/home/pyodide/lab')"
          ].join("\n"));
          this.pyodide = py;
          resolve(py);
        }).catch(reject);
      };
      if (window.loadPyodide) return start();
      const sc = document.createElement("script");
      sc.src = base + "pyodide.js";
      sc.onload = start;
      sc.onerror = () => reject(new Error("Could not download the Python engine"));
      document.head.appendChild(sc);
    });
    this.pyodideLoading.catch(() => { this.pyodideLoading = null; });
    return this.pyodideLoading;
  },

  async runPythonCode() {
    const input = document.getElementById("pythonCodeInput");
    const outputEl = document.getElementById("pythonConsoleOutput");
    if (!input || !outputEl) return;
    const code = input.value;
    if (this._pyRunning) return;
    this._pyRunning = true;

    const firstLoad = !this.pyodide;
    outputEl.innerHTML = firstLoad
      ? `<span class="text-blue-400">>>> Loading the Python 3 engine (first run only, a few seconds)...</span>\n`
      : `<span class="text-blue-400">>>> Running...</span>\n`;

    let py = null;
    try {
      py = await this.loadPyodideEngine();
    } catch (e) {
      py = null;
    }

    try {
      if (py) {
        await this.runWithPyodide(py, code, outputEl);
      } else if (typeof Sk !== "undefined" && Sk.misceval) {
        await this.runWithSkulpt(code, outputEl, true);
      } else {
        outputEl.innerHTML = `<span class="text-amber-400 font-bold">>>> Python engine not available</span>\n\n` +
          `The in-browser Python runtime could not be loaded.\n` +
          `Check your internet connection or ad-blocker, then reload the page and try again.`;
      }
    } finally {
      this._pyRunning = false;
    }
  },

  async runWithPyodide(py, code, outputEl) {
    let out = "";
    py.setStdout({ batched: (s) => { out += s + "\n"; } });
    py.setStderr({ batched: (s) => { out += s + "\n"; } });

    // A fresh namespace for every run, plus a 10-second guard against infinite loops
    // A real, fresh __main__ module, so unittest.main(), pickle, etc. can find user code
    const ns = py.runPython([
      "import sys as _s, types as _ty",
      "_m = _ty.ModuleType('__main__')",
      "_m.__dict__['__builtins__'] = __builtins__",
      "_s.modules['__main__'] = _m",
      "_m.__dict__"
    ].join("\n"), { globals: py.globals.get("dict")() });
    const guard = [
      "import sys as _s, time as _t",
      "_bargisy_deadline = _t.time() + 10",
      "def _bargisy_trace(frame, event, arg):",
      "    if _t.time() > _bargisy_deadline:",
      "        _s.settrace(None)",
      "        raise TimeoutError('Stopped: the code ran for more than 10 seconds (infinite loop?)')",
      "    return _bargisy_trace",
      "_s.settrace(_bargisy_trace)"
    ].join("\n");

    const t0 = performance.now();
    try {
      await py.runPythonAsync(guard, { globals: ns });
      await py.runPythonAsync(code, { globals: ns, filename: "main.py" });
      await py.runPythonAsync("import sys as _s\n_s.settrace(None)", { globals: ns });
      const ms = (performance.now() - t0).toFixed(1);
      outputEl.innerHTML = `<span class="text-emerald-400 font-bold">>>> Python 3 finished in ${ms} ms:</span>\n\n` +
        this.escapeHtml(out || "(no output - use print() to show results)\n") +
        `\n<span class="text-emerald-500 font-semibold">>>> Process exited with code 0</span>`;
    } catch (err) {
      try { await py.runPythonAsync("import sys as _s\n_s.settrace(None)"); } catch (e) {}
      outputEl.innerHTML = (out ? this.escapeHtml(out) + "\n" : "") +
        `<span class="text-rose-400 font-bold">>>> Python Traceback Error:</span>\n\n` +
        `<span class="text-rose-300">${this.escapeHtml(this.cleanPythonTraceback(String(err && err.message ? err.message : err)))}</span>\n` +
        `\n<span class="text-rose-500 font-semibold">>>> Process finished with exit code 1</span>`;
    } finally {
      try { ns.destroy(); } catch (e) {}
    }
  },

  // Keep only the part of the traceback that belongs to the student's code
  cleanPythonTraceback(msg) {
    let lines = msg.split("\n");
    // Hide frames from the sandbox's own helper code
    const kept = [];
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('File "<exec>"')) {
        while (i + 1 < lines.length && /^\s{4,}/.test(lines[i + 1])) i++;
        continue;
      }
      kept.push(lines[i]);
    }
    lines = kept;
    const idx = lines.findIndex(l => l.includes('File "main.py"'));
    if (idx > -1) return ["Traceback (most recent call last):"].concat(lines.slice(idx)).join("\n").trim();
    return msg.trim();
  },

  runWithSkulpt(code, outputEl, isFallback) {
    let outputBuffer = "";
    Sk.execLimit = 10000;
    Sk.configure({
      __future__: Sk.python3,
      execLimit: 10000,
      inputfunTakesPrompt: true,
      inputfun: function(promptText) {
        const answer = window.prompt(promptText || "Python input():", "");
        outputBuffer += (promptText || "") + (answer || "") + "\n";
        return answer === null ? "" : answer;
      },
      output: function(text) { outputBuffer += text; },
      read: function(x) {
        if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined) {
          throw new Error("File not found: '" + x + "'");
        }
        return Sk.builtinFiles["files"][x];
      }
    });
    const note = isFallback ? `<span class="text-amber-300">(Lite mode: the full Python engine could not be loaded, some modules are unavailable)</span>\n` : "";
    const t0 = performance.now();
    return Sk.misceval.asyncToPromise(() => Sk.importMainWithBody("<stdin>", false, code, true))
      .then(() => {
        const ms = (performance.now() - t0).toFixed(1);
        outputEl.innerHTML = note + `<span class="text-emerald-400 font-bold">>>> Python finished in ${ms} ms:</span>\n\n` +
          this.escapeHtml(outputBuffer) +
          `\n<span class="text-emerald-500 font-semibold">>>> Process exited with code 0</span>`;
      })
      .catch(err => {
        outputEl.innerHTML = note + this.escapeHtml(outputBuffer) + `<span class="text-rose-400 font-bold">>>> Python Traceback Error:</span>\n\n` +
          `<span class="text-rose-300">${this.escapeHtml(err.toString())}</span>\n` +
          `\n<span class="text-rose-500 font-semibold">>>> Process finished with exit code 1</span>`;
      });
  },

  executePythonFallback(code, outputEl) {
    let outputBuffer = "";
    const lines = code.split("\n");
    const scope = {};

    try {
      lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) return;

        // Match print(...)
        if (trimmed.startsWith("print(")) {
          let content = trimmed.substring(6, trimmed.lastIndexOf(")"));
          // Handle f-strings
          if (content.startsWith('f"') || content.startsWith("f'")) {
            content = content.substring(2, content.length - 1);
            content = content.replace(/\{([^}]+)\}/g, (match, expr) => {
              // Try evaluating expr in scope
              return expr;
            });
            outputBuffer += content + "\n";
          } else {
            // normal print
            const clean = content.replace(/^["']|["']$/g, "");
            outputBuffer += clean + "\n";
          }
        }
      });

      if (!outputBuffer.trim()) {
        outputBuffer = "Script ran successfully with 0 output.\n";
      }

      outputEl.innerHTML = `<span class="text-emerald-400 font-bold">>>> Python Simulator execution finished:</span>\n\n` +
        this.escapeHtml(outputBuffer) +
        `\n<span class="text-emerald-500 font-semibold">>>> Process exited with code 0</span>`;
    } catch (err) {
      outputEl.innerHTML = `<span class="text-rose-400 font-bold">>>> Execution Error:</span>\n\n` +
        this.escapeHtml(err.message);
    }
  },

  // ==========================================
  // PART 3: FRONT-END WEB DEV LAB (HTML/CSS/JS)
  // ==========================================
  webTemplates: {
    counter: {
      html: `<!-- Modern Interactive Counter -->
<div class="app-card">
  <div class="badge">Bargisy eSchool Lab</div>
  <h2>Interactive Counter</h2>
  <div class="count-display" id="counterValue">0</div>
  
  <div class="btn-group">
    <button class="btn btn-dec" id="btnDecrement">- Decrement</button>
    <button class="btn btn-reset" id="btnReset">Reset</button>
    <button class="btn btn-inc" id="btnIncrement">+ Increment</button>
  </div>
</div>`,
      css: `body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #0f172a, #1e293b);
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  margin: 0;
  color: #f8fafc;
}

.app-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 2.5rem;
  border-radius: 24px;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}

.badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  background: #2563eb;
  color: white;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 12px;
}

h2 { margin: 0 0 1rem 0; font-size: 1.5rem; }

.count-display {
  font-size: 4rem;
  font-weight: 900;
  color: #38bdf8;
  margin: 1.5rem 0;
  font-family: monospace;
}

.btn-group {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.btn {
  padding: 10px 18px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 14px;
  border: none;
  cursor: pointer;
  transition: transform 0.15s, background 0.15s;
}

.btn:hover { transform: translateY(-2px); }
.btn-inc { background: #10b981; color: white; }
.btn-dec { background: #f43f5e; color: white; }
.btn-reset { background: #475569; color: white; }`,
      js: `let count = 0;
const display = document.getElementById('counterValue');

document.getElementById('btnIncrement').addEventListener('click', () => {
  count++;
  updateDisplay();
  console.log('Incremented count to:', count);
});

document.getElementById('btnDecrement').addEventListener('click', () => {
  count--;
  updateDisplay();
  console.log('Decremented count to:', count);
});

document.getElementById('btnReset').addEventListener('click', () => {
  count = 0;
  updateDisplay();
  console.log('Counter reset to 0');
});

function updateDisplay() {
  display.textContent = count;
  display.style.color = count > 0 ? '#34d399' : (count < 0 ? '#f87171' : '#38bdf8');
}`
    },

    card: {
      html: `<!-- Course Showcase Card -->
<div class="card">
  <div class="tag">Programming Track</div>
  <h3>Python & Web API Masterclass</h3>
  <p>Learn to design RESTful architectures, connect SQLite databases, and automate tasks.</p>
  
  <div class="footer">
    <div class="instructor">Instructor: Mohammed Bargisy</div>
    <button id="enrollBtn">Enroll Now</button>
  </div>
</div>`,
      css: `body {
  font-family: system-ui, sans-serif;
  background: #f1f5f9;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  margin: 0;
}

.card {
  background: white;
  padding: 24px;
  border-radius: 16px;
  max-width: 320px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
}

.tag {
  background: #eff6ff;
  color: #2563eb;
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 700;
  border-radius: 8px;
  display: inline-block;
  margin-bottom: 12px;
}

h3 { margin: 0 0 8px 0; color: #0f172a; }
p { font-size: 13px; color: #64748b; line-height: 1.5; }

.footer {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.instructor { font-size: 11px; font-weight: 600; color: #334155; }

button {
  background: #2563eb;
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 12px;
  cursor: pointer;
}

button:hover { background: #1d4ed8; }`,
      js: `const btn = document.getElementById('enrollBtn');

btn.addEventListener('click', () => {
  btn.textContent = 'Enrolled! ✓';
  btn.style.background = '#10b981';
  console.log('Student successfully enrolled in Python Masterclass.');
  alert('Welcome to Bargisy eSchool Python Masterclass!');
});`
    },

    todo: {
      html: `<!-- Quick Task Manager -->
<div class="todo-box">
  <h2>Daily Tasks</h2>
  <div class="input-row">
    <input type="text" id="todoInput" placeholder="Add a new lesson or chore...">
    <button id="addTodoBtn">Add</button>
  </div>
  <ul id="todoList">
    <li>Complete Excel XLOOKUP Practice</li>
    <li>Review Python Dictionary loops</li>
  </ul>
</div>`,
      css: `body {
  font-family: sans-serif;
  background: #0f172a;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  margin: 0;
}

.todo-box {
  background: #1e293b;
  padding: 24px;
  border-radius: 16px;
  width: 320px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.input-row { display: flex; gap: 8px; margin-bottom: 16px; }

input {
  flex: 1;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #334155;
  background: #0f172a;
  color: white;
}

button {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
}

ul { list-style: none; padding: 0; margin: 0; }

li {
  background: #334155;
  padding: 10px 12px;
  border-radius: 8px;
  margin-bottom: 8px;
  font-size: 13px;
  cursor: pointer;
  transition: 0.2s;
}

li:hover { opacity: 0.8; text-decoration: line-through; }`,
      js: `const addBtn = document.getElementById('addTodoBtn');
const input = document.getElementById('todoInput');
const list = document.getElementById('todoList');

addBtn.addEventListener('click', () => {
  const text = input.value.trim();
  if (!text) return;

  const li = document.createElement('li');
  li.textContent = text;
  li.addEventListener('click', () => {
    li.style.textDecoration = 'line-through';
    li.style.opacity = '0.5';
    console.log('Task completed:', text);
  });

  list.appendChild(li);
  input.value = '';
  console.log('Added new task:', text);
});`
    }
  },

  initWebLab() {
    this.loadWebTemplate('counter');
  },

  switchWebTab(tabName) {
    this.activeWebTab = tabName;
    ['html', 'css', 'js'].forEach(t => {
      const btn = document.getElementById(`webTabBtn_${t}`);
      const editor = document.getElementById(`webEditorContainer_${t}`);
      if (btn) {
        if (t === tabName) {
          btn.className = "px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white transition";
        } else {
          btn.className = "px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-400 hover:text-white transition";
        }
      }
      if (editor) {
        editor.classList.toggle("hidden", t !== tabName);
      }
    });
  },

  loadWebTemplate(key) {
    const tpl = this.webTemplates[key];
    if (!tpl) return;

    const htmlEl = document.getElementById("webHtmlInput");
    const cssEl = document.getElementById("webCssInput");
    const jsEl = document.getElementById("webJsInput");

    if (htmlEl) htmlEl.value = tpl.html;
    if (cssEl) cssEl.value = tpl.css;
    if (jsEl) jsEl.value = tpl.js;

    this.clearWebConsole();
    this.runWebPreview();
  },

  clearWebConsole() {
    const out = document.getElementById("webConsoleOutput");
    if (out) out.innerHTML = `<span data-placeholder class="text-slate-500 font-mono text-[11px]">Console ready. console.log statements appear here.</span>`;
  },

  runWebPreview() {
    const html = document.getElementById("webHtmlInput") ? document.getElementById("webHtmlInput").value : "";
    const css = document.getElementById("webCssInput") ? document.getElementById("webCssInput").value : "";
    const js = document.getElementById("webJsInput") ? document.getElementById("webJsInput").value : "";
    const iframe = document.getElementById("webLabPreviewIframe");
    if (!iframe) return;

    // Prevent user code from closing our <style>/<script> wrappers early
    const safeCss = css.replace(/<\/style/gi, "<\\/style");
    const safeJs = js.replace(/<\/script/gi, "<\\/script");

    // Console bridge: forwards console.* and runtime errors to the parent page
    const bridge = [
      "(function(){",
      "  function fmt(a){ try { return (a !== null && typeof a === 'object') ? JSON.stringify(a) : String(a); } catch(e){ return String(a); } }",
      "  function send(level, args){ try { parent.postMessage({ type: 'WEB_LAB_CONSOLE', level: level, error: level === 'error', message: Array.prototype.map.call(args, fmt).join(' ') }, '*'); } catch(e){} }",
      "  ['log','info','warn','error'].forEach(function(level){",
      "    var orig = console[level];",
      "    console[level] = function(){ try { orig.apply(console, arguments); } catch(e){} send(level, arguments); };",
      "  });",
      "  window.addEventListener('error', function(e){ send('error', ['Error: ' + e.message + (e.lineno ? ' (line ' + e.lineno + ')' : '')]); });",
      "  // The preview is sandboxed (no access to the main site), so provide in-memory storage for lessons that use it",
      "  ['localStorage','sessionStorage'].forEach(function(name){",
      "    var ok = false; try { ok = !!window[name]; } catch(e) {}",
      "    if (ok) return;",
      "    var data = {};",
      "    var store = { getItem: function(k){ k = String(k); return Object.prototype.hasOwnProperty.call(data, k) ? data[k] : null; }, setItem: function(k, v){ data[String(k)] = String(v); }, removeItem: function(k){ delete data[String(k)]; }, clear: function(){ data = {}; }, key: function(i){ return Object.keys(data)[i] || null; } };",
      "    Object.defineProperty(store, 'length', { get: function(){ return Object.keys(data).length; } });",
      "    try { Object.defineProperty(window, name, { value: store, configurable: true }); } catch(e) {}",
      "  });",
      "  window.addEventListener('unhandledrejection', function(e){ send('error', ['Unhandled promise rejection: ' + (e.reason && e.reason.message ? e.reason.message : e.reason)]); });",
      "})();"
    ].join("\n");

    const payload = "<!DOCTYPE html>\n<html>\n<head>\n<meta charset=\"utf-8\">\n" +
      "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n" +
      "<script>" + bridge + "<\/script>\n" +
      "<style>\n" + safeCss + "\n</style>\n</head>\n<body>\n" +
      html +
      "\n<script>\n" + safeJs + "\n<\/script>\n</body>\n</html>";

    // Swap in a fresh iframe each run: re-assigning srcdoc while a previous
    // render is still loading can leave the preview blank in some browsers,
    // and a fresh frame also clears old timers/listeners from the last run.
    const fresh = iframe.cloneNode(false);
    fresh.removeAttribute("src");
    fresh.srcdoc = payload;
    iframe.replaceWith(fresh);

    const status = document.getElementById("webLabStatus");
    if (status) {
      status.textContent = "Updated " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
  },

  openWebPreviewInNewTab() {
    const iframe = document.getElementById("webLabPreviewIframe");
    if (!iframe || !iframe.srcdoc) return;
    const blob = new Blob([iframe.srcdoc], { type: "text/html" });
    window.open(URL.createObjectURL(blob), "_blank");
  },

  // Load a code snippet (from a lesson) into the matching sandbox
  openInSandbox(lang, code) {
    lang = (lang || "").toLowerCase();
    if (lang === "python" || lang === "py") {
      window.location.hash = "#/labs/python";
      setTimeout(() => {
        const input = document.getElementById("pythonCodeInput");
        if (input) input.value = code;
        this.runPythonCode();
      }, 50);
      return;
    }

    let target = "html";
    if (lang === "css") target = "css";
    else if (lang === "javascript" || lang === "js") target = "js";
    // Some lessons label HTML markup as css/js; send real markup to the HTML tab
    if (target !== "html" && /^\s*<(!--|!doctype|[a-z])/i.test(code)) target = "html";

    window.location.hash = "#/labs/web";
    setTimeout(() => {
      const htmlEl = document.getElementById("webHtmlInput");
      const cssEl = document.getElementById("webCssInput");
      const jsEl = document.getElementById("webJsInput");
      if (target === "html") {
        // A full document goes in the HTML tab; clear the others so they don't interfere
        if (htmlEl) htmlEl.value = code;
        if (cssEl) cssEl.value = "";
        if (jsEl) jsEl.value = "";
      } else if (target === "css") {
        if (cssEl) cssEl.value = code;
        if (htmlEl && !htmlEl.value.trim()) htmlEl.value = "<h1>Hello CSS</h1>\n<p>Edit the HTML tab to see your styles applied.</p>";
        if (jsEl) jsEl.value = "";
      } else {
        if (jsEl) jsEl.value = code;
        if (htmlEl) htmlEl.value = "<h2>JavaScript Sandbox</h2>\n<p>Open the console below to see the output.</p>";
        if (cssEl) cssEl.value = "body { font-family: system-ui, sans-serif; padding: 24px; color: #0f172a; }";
      }
      this.switchWebTab(target);
      this.clearWebConsole();
      this.runWebPreview();
    }, 50);
  },

  escapeHtml(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
};

// Listen for Web Lab console logs sent from sandboxed iframe
window.addEventListener("message", (e) => {
  if (e.data && e.data.type === 'WEB_LAB_CONSOLE') {
    const consoleBox = document.getElementById("webConsoleOutput");
    if (!consoleBox) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const isErr = e.data.error;
    const isWarn = e.data.level === 'warn';
    const msg = String(e.data.message);

    // Drop the "Console ready" placeholder on the first real message
    const placeholder = consoleBox.querySelector("[data-placeholder]");
    if (placeholder) placeholder.remove();

    const line = document.createElement("div");
    line.className = isErr ? "text-rose-400 font-mono text-xs mt-1" : (isWarn ? "text-amber-300 font-mono text-xs mt-1" : "text-emerald-400 font-mono text-xs mt-1");
    line.innerHTML = `<span class="text-slate-500">[${time}]</span> ${InteractiveLab.escapeHtml(msg)}`;
    consoleBox.appendChild(line);
    consoleBox.scrollTop = consoleBox.scrollHeight;
  }
});

window.InteractiveLab = InteractiveLab;
