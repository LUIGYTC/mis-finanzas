let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

function render() {
  const list = document.getElementById("list");
  const totalEl = document.getElementById("total");

  list.innerHTML = "";
  let total = 0;

  expenses.forEach(e => {
    total += e.amount;

    const li = document.createElement("li");
    li.textContent = `$${e.amount} - ${e.desc}`;
    list.appendChild(li);
  });

  totalEl.textContent = "$" + total;

  localStorage.setItem("expenses", JSON.stringify(expenses));
}

function addExpense() {
  const amount = parseFloat(document.getElementById("amount").value);
  const desc = document.getElementById("desc").value;

  if (!amount || !desc) return;

  expenses.push({ amount, desc });

  document.getElementById("amount").value = "";
  document.getElementById("desc").value = "";

  render();
}

render();