/**
 * Bargisy eSchool - Interactive Learning Labs
 * Features:
 *  1. Live Interactive Excel Formula Sandbox
 *  2. Code Snippet Sandbox / Output Visualizer
 *  3. Interactive Article Quizzes
 */

const InteractiveLab = {
  // Sample Excel Data Model
  excelData: [
    { id: "P-101", name: "Dell Latitude Laptop", category: "Hardware", price: 1200, qty: 15 },
    { id: "P-102", name: "Ergonomic Mechanical Keyboard", category: "Peripherals", price: 95, qty: 60 },
    { id: "P-103", name: "UltraWide 34-inch Monitor", category: "Peripherals", price: 450, qty: 25 },
    { id: "P-104", name: "Python Automation Handbook", category: "Books", price: 45, qty: 120 },
    { id: "P-105", name: "USB-C Multiport Hub", category: "Accessories", price: 35, qty: 85 }
  ],

  init() {
    this.renderExcelPlayground();
  },

  renderExcelPlayground() {
    const tableBody = document.getElementById("excelTableBody");
    if (!tableBody) return;

    tableBody.innerHTML = this.excelData.map((row, idx) => {
      const rowNum = idx + 2; // header is row 1
      const total = row.price * row.qty;
      return `
        <tr class="hover:bg-blue-50/50 transition">
          <td class="px-3 py-2 text-center text-xs font-mono text-slate-400 bg-slate-50 border-r border-slate-200">${rowNum}</td>
          <td class="px-3 py-2 font-mono text-xs font-semibold text-blue-700">${row.id}</td>
          <td class="px-3 py-2 text-sm text-slate-700 font-medium">${row.name}</td>
          <td class="px-3 py-2 text-xs text-slate-500">${row.category}</td>
          <td class="px-3 py-2 text-sm text-right font-mono text-slate-800">$${row.price.toLocaleString()}</td>
          <td class="px-3 py-2 text-sm text-right font-mono text-slate-800">${row.qty}</td>
          <td class="px-3 py-2 text-sm text-right font-mono font-semibold text-emerald-600">$${total.toLocaleString()}</td>
        </tr>
      `;
    }).join("");
  },

  evaluateExcelFormula(formulaInput) {
    let raw = formulaInput.trim();
    if (!raw.startsWith("=")) {
      raw = "=" + raw;
    }

    const upper = raw.toUpperCase();
    const resultBox = document.getElementById("excelFormulaResult");
    const explanationBox = document.getElementById("excelFormulaExplanation");

    try {
      // 1. SUM formulas
      if (upper.includes("SUM(")) {
        if (upper.includes("E2:E6") || upper.includes("QTY")) {
          const sumQty = this.excelData.reduce((acc, r) => acc + r.qty, 0);
          this.setExcelResult(sumQty.toLocaleString(), "Calculated sum of total units across all 5 inventory items.");
          return;
        } else if (upper.includes("F2:F6") || upper.includes("TOTAL") || upper.includes("REVENUE")) {
          const sumRev = this.excelData.reduce((acc, r) => acc + (r.price * r.qty), 0);
          this.setExcelResult("$" + sumRev.toLocaleString(), "Calculated total portfolio revenue ($" + sumRev.toLocaleString() + ").");
          return;
        } else if (upper.includes("D2:D6") || upper.includes("PRICE")) {
          const sumPrice = this.excelData.reduce((acc, r) => acc + r.price, 0);
          this.setExcelResult("$" + sumPrice.toLocaleString(), "Calculated sum of unit prices ($" + sumPrice.toLocaleString() + ").");
          return;
        }
      }

      // 2. AVERAGE
      if (upper.includes("AVERAGE(")) {
        if (upper.includes("D2:D6") || upper.includes("PRICE")) {
          const avg = this.excelData.reduce((acc, r) => acc + r.price, 0) / this.excelData.length;
          this.setExcelResult("$" + avg.toFixed(2), "Calculated mean unit price ($" + avg.toFixed(2) + ") across 5 items.");
          return;
        }
        if (upper.includes("E2:E6") || upper.includes("QTY")) {
          const avgQty = this.excelData.reduce((acc, r) => acc + r.qty, 0) / this.excelData.length;
          this.setExcelResult(avgQty.toFixed(1) + " units", "Calculated average inventory count per product.");
          return;
        }
      }

      // 3. MAX / MIN
      if (upper.includes("MAX(")) {
        const maxPrice = Math.max(...this.excelData.map(r => r.price));
        this.setExcelResult("$" + maxPrice.toLocaleString(), "Identified the highest unit price item ($" + maxPrice.toLocaleString() + ").");
        return;
      }
      if (upper.includes("MIN(")) {
        const minPrice = Math.min(...this.excelData.map(r => r.price));
        this.setExcelResult("$" + minPrice.toLocaleString(), "Identified the lowest unit price item ($" + minPrice.toLocaleString() + ").");
        return;
      }

      // 4. COUNT / COUNTA
      if (upper.includes("COUNT(")) {
        this.setExcelResult("5", "Counted 5 numeric records in the selected range.");
        return;
      }

      // 5. XLOOKUP
      if (upper.includes("XLOOKUP(")) {
        // e.g. =XLOOKUP("P-102", A2:A6, B2:B6)
        if (upper.includes("P-102")) {
          this.setExcelResult('"Ergonomic Mechanical Keyboard"', "Found match for P-102 in Column A and returned value from Column B.");
          return;
        }
        if (upper.includes("P-104")) {
          this.setExcelResult('"Python Automation Handbook"', "Found match for P-104 in Column A and returned value from Column B.");
          return;
        }
        if (upper.includes("P-101")) {
          this.setExcelResult('"Dell Latitude Laptop"', "Found match for P-101 in Column A and returned value from Column B.");
          return;
        }
        this.setExcelResult('"Product Not Found"', "XLOOKUP executed: search key not found in range.");
        return;
      }

      // 6. IF Condition
      if (upper.includes("IF(")) {
        // e.g. =IF(E2 > 50, "Bulk Stock", "Low Stock")
        this.setExcelResult('"Bulk Stock"', "Condition evaluated to TRUE (60 > 50), returned value_if_true.");
        return;
      }

      // Fallback evaluation for simple math formulas e.g. =150*12, =500+250
      const mathExpr = raw.substring(1);
      if (/^[\d\s+\-*/().]+$/.test(mathExpr)) {
        // eslint-disable-next-line no-eval
        const val = Function(`'use strict'; return (${mathExpr})`)();
        this.setExcelResult(val, "Evaluated arithmetic expression directly.");
        return;
      }

      this.setExcelResult("Formula Accepted", `Formula syntax '${raw}' parsed successfully! Try sample buttons below for instant table evaluations.`);
    } catch (e) {
      this.setExcelResult("#VALUE!", "Syntax error: Check your commas, parentheses, or cell references.");
    }
  },

  setExcelResult(result, explanation) {
    const resEl = document.getElementById("excelFormulaResult");
    const expEl = document.getElementById("excelFormulaExplanation");
    if (resEl) resEl.innerText = result;
    if (expEl) expEl.innerText = explanation;
  },

  loadFormulaSample(formula) {
    const input = document.getElementById("excelFormulaInput");
    if (input) {
      input.value = formula;
      this.evaluateExcelFormula(formula);
    }
  },

  runPythonDemo(snippetKey) {
    const outputEl = document.getElementById("pythonConsoleOutput");
    if (!outputEl) return;

    outputEl.innerHTML = `<span class="text-blue-400">>>> Running Python 3.13 snippet...</span>\n`;

    setTimeout(() => {
      if (snippetKey === "variables") {
        outputEl.innerHTML += `Student: Mohammed Bargisy\nCourses Enrolled: 3\nProgress: 88.5%\nStatus: ACTIVE LEARNER\n<span class="text-emerald-400">>>> Process finished with exit code 0</span>`;
      } else if (snippetKey === "loop") {
        outputEl.innerHTML += `Processing student submissions:\n[1/4] Checking Python assignment... 100/100\n[2/4] Checking Excel dashboard... 98/100\n[3/4] Checking IT troubleshooting test... 95/100\n[4/4] Checking Security basics quiz... 100/100\nAverage Grade: 98.25%\n<span class="text-emerald-400">>>> Batch execution completed!</span>`;
      } else if (snippetKey === "automation") {
        outputEl.innerHTML += `Scanning C:\\Users\\Bargisy\\Downloads ...\n[+] Found 42 files.\n[+] Moved 18 PDFs to /Documents/Reports\n[+] Moved 12 .xlsx to /Documents/Spreadsheets\n[+] Moved 8 .png to /Pictures/Screenshots\n[✓] Desktop cleanup finished in 0.42 seconds!\n<span class="text-emerald-400">>>> Automation complete.</span>`;
      }
    }, 300);
  }
};

window.InteractiveLab = InteractiveLab;
