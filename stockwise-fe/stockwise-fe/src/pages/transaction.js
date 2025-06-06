import { renderLayout } from '../components/layout.js';

export async function renderTransactionPage() {
  const app = document.getElementById('app');

  let transactions = [];
  let sortKey = 'order_id';
  let sortAsc = true;
  let filterPizza = '';

  async function fetchTransactions() {
    try {
      const res = await fetch('https://backend-ml-production-9065.up.railway.app/transactions');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      transactions = await res.json();
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      transactions = [];
    }
  }

  function sortData(data) {
    return data.slice().sort((a, b) => {
      let valA = a[sortKey];
      let valB = b[sortKey];
      if (sortKey === 'order_date') {
        valA = new Date(valA);
        valB = new Date(valB);
      }
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }

  function renderTable(filteredData) {
    const sortedData = sortData(filteredData);
    function arrow(key) {
      if (key !== sortKey) return '';
      return sortAsc ? '▲' : '▼';
    }

    const tableRows = sortedData.map(t => `
      <tr class="border-t hover:bg-gray-100 cursor-default">
        <td class="py-2 px-4">${t.order_id}</td>
        <td class="py-2 px-4">${t.pizza_name}</td>
        <td class="py-2 px-4 text-center">${t.quantity}</td>
        <td class="py-2 px-4">${t.order_date}</td>
        <td class="py-2 px-4 text-right">${t.unit_price.toLocaleString()}</td>
      </tr>
    `).join('');

    return `
      <table class="w-full text-sm text-left bg-white shadow rounded-lg overflow-hidden mt-4">
        <thead class="bg-gray-200 text-gray-600 border-b select-none">
          <tr>
            <th class="py-3 px-4 cursor-pointer" data-key="order_id">Order ID ${arrow('order_id')}</th>
            <th class="py-3 px-4 cursor-pointer" data-key="pizza_name">Pizza Name ${arrow('pizza_name')}</th>
            <th class="py-3 px-4 text-center cursor-pointer" data-key="quantity">Quantity ${arrow('quantity')}</th>
            <th class="py-3 px-4 cursor-pointer" data-key="order_date">Order Date ${arrow('order_date')}</th>
            <th class="py-3 px-4 text-right cursor-pointer" data-key="unit_price">Unit Price ${arrow('unit_price')}</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows || `<tr><td colspan="5" class="text-center py-4 text-gray-500">No transactions found.</td></tr>`}
        </tbody>
      </table>
    `;
  }

  function getFilteredTransactions() {
    if (!filterPizza.trim()) return transactions;
    return transactions.filter(t =>
      t.pizza_name.toLowerCase().includes(filterPizza.toLowerCase())
    );
  }

  function renderPage() {
    const filteredData = getFilteredTransactions();

    const content = `
      <div class="min-h-screen bg-gray-100 text-gray-800 p-6">
        <h1 class="text-2xl font-bold mb-6">Transaction History & Input</h1>

        <!-- Form Tambah Transaksi -->
        <form id="transaction-form" class="mb-6 bg-white p-4 rounded shadow max-w-md mx-auto">
          <div class="mb-4">
            <label for="order_id" class="block font-medium mb-1">Order ID</label>
            <input type="text" id="order_id" name="order_id" required class="w-full border rounded px-3 py-2" />
          </div>
          <div class="mb-4">
            <label for="pizza_name" class="block font-medium mb-1">Pizza Name</label>
            <input type="text" id="pizza_name" name="pizza_name" required class="w-full border rounded px-3 py-2" />
          </div>
          <div class="mb-4">
            <label for="quantity" class="block font-medium mb-1">Quantity</label>
            <input type="number" id="quantity" name="quantity" required min="1" class="w-full border rounded px-3 py-2" />
          </div>
          <div class="mb-4">
            <label for="order_date" class="block font-medium mb-1">Order Date</label>
            <input type="date" id="order_date" name="order_date" required class="w-full border rounded px-3 py-2" />
          </div>
          <div class="mb-4">
            <label for="unit_price" class="block font-medium mb-1">Unit Price</label>
            <input type="number" id="unit_price" name="unit_price" required min="0" class="w-full border rounded px-3 py-2" />
          </div>
          <button type="submit" class="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Add Transaction</button>
        </form>

        <!-- Filter -->
        <div class="max-w-4xl mx-auto mb-4 flex items-center gap-2">
          <input type="text" id="searchInput" placeholder="Search pizza name..." class="flex-1 border px-3 py-2 rounded" />
          <button id="searchBtn" class="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800">Search</button>
        </div>

        <div class="max-w-4xl mx-auto">
          ${renderTable(filteredData)}
        </div>
      </div>
    `;

    app.innerHTML = renderLayout(content);

    // Tambah transaksi
    const form = document.getElementById('transaction-form');
    form.addEventListener('submit', async e => {
        e.preventDefault();

        const newTransaction = {
            order_id: form.order_id.value.trim(),
            pizza_name: form.pizza_name.value.trim(),
            quantity: Number(form.quantity.value),
            order_date: form.order_date.value,
            unit_price: Number(form.unit_price.value)
        };

        try {
            const res = await fetch('https://backend-ml-production-9065.up.railway.app/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTransaction)
            });

            if (!res.ok) {
            const error = await res.text();
            throw new Error(`Failed to add transaction: ${error}`);
            }

            // Tambahkan transaksi baru ke array tanpa fetch ulang
            transactions.push(newTransaction);

            form.reset();
            renderPage();

        } catch (err) {
            console.error(err);
            alert('Gagal menambahkan transaksi.');
        }
        });

    // Sorting
    const headers = app.querySelectorAll('th[data-key]');
    headers.forEach(th => {
      th.addEventListener('click', () => {
        const key = th.getAttribute('data-key');
        if (sortKey === key) {
          sortAsc = !sortAsc;
        } else {
          sortKey = key;
          sortAsc = true;
        }
        renderPage();
      });
    });

    // Search handler
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    searchInput.value = filterPizza;

    searchBtn.addEventListener('click', () => {
      filterPizza = searchInput.value.trim();
      renderPage();
    });
  }

  await fetchTransactions();
  renderPage();
}
