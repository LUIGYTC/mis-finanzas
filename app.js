/* ================= DATOS ================= */

let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let incomes = JSON.parse(localStorage.getItem("incomes")) || [];
let chart;
let currentMode = "month";

/* ================= GASTOS ================= */

function render() {
  const list = document.getElementById("list");
  const totalEl = document.getElementById("total");

  if (!list || !totalEl) return;

  list.innerHTML = "";
  let total = 0;

  expenses.forEach((e, index) => {
    total += e.amount;

    const li = document.createElement("li");
    const formattedDate = new Date(e.date).toLocaleDateString();

    li.innerHTML = `
      ${e.category} - ${e.desc} - $${e.amount} (${formattedDate})
      <button onclick="deleteExpense(${index})">❌</button>
    `;

    list.appendChild(li);
  });

  totalEl.textContent = "$" + total;

  localStorage.setItem("expenses", JSON.stringify(expenses));
}

function addExpense() {
  const amount = parseFloat(document.getElementById("amount").value);
  const desc = document.getElementById("desc").value;
  const category = document.getElementById("category").value;

  if (!amount || !desc || !category) return;

  const today = new Date().toISOString();

  expenses.push({ amount, desc, category, date: today });

  document.getElementById("amount").value = "";
  document.getElementById("desc").value = "";
  document.getElementById("category").value = "";

  render();
  updateMainBalance();
}

function deleteExpense(index) {
  if (!confirm("¿Seguro que quieres borrar este gasto?")) return;

  expenses.splice(index, 1);
  render();
  updateMainBalance();
}

/* ================= INGRESOS ================= */

function addIncome() {
  const source = document.getElementById("incomeSource").value;
  const amount = parseFloat(document.getElementById("incomeAmount").value);

  if (!source || !amount) return;

  const today = new Date().toISOString();

  incomes.push({ source, amount, date: today });

  document.getElementById("incomeSource").value = "";
  document.getElementById("incomeAmount").value = "";

  renderIncomes();
  updateMainBalance();
}

function renderIncomes() {
  const list = document.getElementById("incomeList");
  if (!list) return;

  list.innerHTML = "";

  incomes.forEach((i, index) => {
    const li = document.createElement("li");
    const formattedDate = new Date(i.date).toLocaleDateString();

    li.innerHTML = `
      ${i.source} - $${i.amount} (${formattedDate})
      <button onclick="deleteIncome(${index})">❌</button>
    `;

    list.appendChild(li);
  });

  localStorage.setItem("incomes", JSON.stringify(incomes));
}

function deleteIncome(index) {
  if (!confirm("¿Seguro que quieres borrar este ingreso?")) return;

  incomes.splice(index, 1);
  renderIncomes();
  updateMainBalance();
}

/* ================= BALANCE ================= */

function updateMainBalance() {
  const el = document.getElementById("mainBalance");
  if (!el) return;

  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

  el.textContent = "$" + (totalIncome - totalExpense);
}

/* ================= STATS ================= */

function setMode(mode) {
  currentMode = mode;

  if (mode === "month") {
    renderChartByMonth();
  } else if (mode === "year") {
    renderChartByYear();
  } else {
    renderChartTotal();
  }

  renderStatsByMode();
}

function renderStatsByMode() {
  let incomeTotal = 0;
  let expenseTotal = 0;

  if (currentMode === "month") {
    const selectedMonth = document.getElementById("monthFilter").value;

    incomes.forEach(i => {
      const m = new Date(i.date).toISOString().slice(0, 7);
      if (m === selectedMonth) incomeTotal += i.amount;
    });

    expenses.forEach(e => {
      const m = new Date(e.date).toISOString().slice(0, 7);
      if (m === selectedMonth) expenseTotal += e.amount;
    });

  } else if (currentMode === "year") {
    const year = new Date().getFullYear();

    incomes.forEach(i => {
      if (new Date(i.date).getFullYear() === year) {
        incomeTotal += i.amount;
      }
    });

    expenses.forEach(e => {
      if (new Date(e.date).getFullYear() === year) {
        expenseTotal += e.amount;
      }
    });

  } else {
    incomeTotal = incomes.reduce((sum, i) => sum + i.amount, 0);
    expenseTotal = expenses.reduce((sum, e) => sum + e.amount, 0);
  }

  const balance = incomeTotal - expenseTotal;

  document.getElementById("totalIncome").textContent = "Ingresos: $" + incomeTotal;
  document.getElementById("totalExpense").textContent = "Gastos: $" + expenseTotal;
  document.getElementById("balance").textContent = "Balance: $" + balance;
}

/* ================= GRÁFICAS ================= */

function renderChartByMonth() {
  const selectedMonth = document.getElementById("monthFilter").value;
  if (!selectedMonth) return;

  const data = {};

  expenses.forEach(e => {
    const m = new Date(e.date).toISOString().slice(0, 7);
    if (m === selectedMonth) {
      if (!data[e.category]) data[e.category] = 0;
      data[e.category] += e.amount;
    }
  });

  drawChart(data);
}

function renderChartByYear() {
  const year = new Date().getFullYear();
  const data = {};

  expenses.forEach(e => {
    if (new Date(e.date).getFullYear() === year) {
      if (!data[e.category]) data[e.category] = 0;
      data[e.category] += e.amount;
    }
  });

  drawChart(data);
}

function renderChartTotal() {
  const data = {};

  expenses.forEach(e => {
    if (!data[e.category]) data[e.category] = 0;
    data[e.category] += e.amount;
  });

  drawChart(data);
}

function drawChart(data) {
  const labels = Object.keys(data);
  const values = Object.values(data);

  if (chart) chart.destroy();

  chart = new Chart(document.getElementById("myChart"), {
    type: "pie",
    data: {
      labels: labels,
      datasets: [{
        data: values,
        backgroundColor: [
          "#22c55e",
          "#3b82f6",
          "#f59e0b",
          "#ef4444",
          "#8b5cf6"
        ]
      }]
    }
  });
}

/* ================= NAVEGACIÓN ================= */

function showScreen(screen) {
  document.querySelectorAll(".screen").forEach(s => {
    s.classList.remove("active", "animate");
  });

  const target = document.getElementById(screen);
  target.classList.add("active");

  setTimeout(() => {
    target.classList.add("animate");
  }, 100);

  if (screen === "stats") {
    const today = new Date().toISOString().slice(0, 7);
    const input = document.getElementById("monthFilter");

    if (input) input.value = today;

    setMode("month"); // 🔥 inicia mensual
  }
}

function goMenu() {
  document.querySelectorAll(".screen").forEach(s => {
    s.classList.remove("active", "animate");
  });

  const menu = document.getElementById("menu");
  menu.classList.add("active");

  updateMainBalance();

  setTimeout(() => {
    menu.classList.add("animate");
  }, 100);
}

/* ================= INIT ================= */

window.addEventListener("load", () => {
  updateMainBalance();

  setTimeout(() => {
    document.getElementById("menu").classList.add("animate");
  }, 200);
});

render();
renderIncomes();