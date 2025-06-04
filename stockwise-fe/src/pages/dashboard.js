import { renderLayout } from '../components/layout.js';
import swal from 'sweetalert';
import Chart from 'chart.js/auto';
import { getFromDB, saveToDB } from '../utils/db.js';

export async function renderDashboardPage() {
  const app = document.getElementById('app');
  let inventoryData = [];

  try {
    const res = await fetch('https://stock-wise-production.up.railway.app/api/inventory');
    inventoryData = await res.json();
    if (Array.isArray(inventoryData)) {
      await saveToDB('inventory', inventoryData);
    } else {
      throw new Error("Inventory data is not an array");
    }
  } catch (err) {
    console.warn("Offline mode: loading from DB");
    const cached = await getFromDB('inventory');
    if (!Array.isArray(cached) || cached.length === 0) {
      return swal("Offline Mode", "No cached inventory found.", "error");
    }
    inventoryData = cached;
    swal("Offline Mode", "Using cached inventory data", "warning");
  }

  const showStockAlert = () => {
    const understocked = inventoryData.filter(item => item.status === 'understock');
    if (understocked.length > 0) {
      const alertList = understocked.map(item => `• ${item.name}`).join('\n');
      swal({
        title: "Stock Alert 🚨",
        text: `The following pizzas are understocked:\n\n${alertList}`,
        icon: "warning",
        button: "Got it"
      });
    }
  };

  const stockAlertRows = inventoryData
    .filter(item => item.status === 'understock')
    .map(item => `
      <tr class="border-t">
        <td class="py-2">${item.name}</td>
        <td class="py-2">${item.predicted}</td>
        <td class="py-2">${item.actual}</td>
        <td class="py-2 text-red-600">${item.status}</td>
      </tr>
    `).join('');

  const totalStockRows = inventoryData.map(item => `
    <tr class="border-t">
      <td class="py-2">${item.name}</td>
      <td class="py-2">${item.actual}</td>
    </tr>
  `).join('');

  const predictionRows = inventoryData.map(item => {
    const color = item.status === 'understock' ? 'red' :
                  item.status === 'overstock' ? 'yellow' : 'green';
    return `
      <tr class="border-t">
        <td class="py-2">${item.name}</td>
        <td class="py-2">${item.predicted}</td>
        <td class="py-2">${item.actual}</td>
        <td class="py-2 text-${color}-600">${item.status}</td>
      </tr>
    `;
  }).join('');

  const dashboardContent = `
    <div class="min-h-screen bg-gray-100 text-gray-800 p-6">
      <header class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Dashboard</h1>
        <div class="flex items-center gap-4">
          <button id="alert-btn" class="text-gray-600 hover:text-gray-800" title="Stock Alert">🔔</button>
          <button id="logout-btn" class="text-gray-600 hover:text-gray-800" title="Logout">🚪 Logout</button>
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 bg-gray-400 rounded-full"></div>
            <span class="text-sm text-gray-700">Admin</span>
          </div>
        </div>
      </header>

     <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
  <div class="bg-white shadow rounded-lg p-4 h-64">
    <h2 class="text-lg font-semibold mb-2">Stock Overview (Bar)</h2>
    <canvas id="barChart" class="w-full h-full"></canvas>
  </div>
  <div class="bg-white shadow rounded-lg p-4 h-[22rem]"> <!-- Increased height -->
    <h2 class="text-lg font-semibold mb-2">Stock Distribution (Pie)</h2>
    <div class="relative w-full h-[17rem]"> <!-- Ensures full sizing -->
      <canvas id="pieChart" class="w-full h-full"></canvas>
    </div>
  </div>
</div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div class="bg-white shadow rounded-lg p-4">
          <h2 class="text-lg font-semibold mb-4">Stock Alert</h2>
          <table class="w-full text-sm text-left">
            <thead class="border-b text-gray-600">
              <tr>
                <th class="py-2">Pizza</th>
                <th class="py-2">Predicted</th>
                <th class="py-2">Actual</th>
                <th class="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              ${stockAlertRows || `<tr><td colspan="4" class="py-2 text-center text-gray-500">No understock alerts.</td></tr>`}
            </tbody>
          </table>
        </div>

        <div class="bg-white shadow rounded-lg p-4">
          <h2 class="text-lg font-semibold mb-4">Total Stocks</h2>
          <table class="w-full text-sm text-left">
            <thead class="border-b text-gray-600">
              <tr>
                <th class="py-2">Pizza</th>
                <th class="py-2">Quantity</th>
              </tr>
            </thead>
            <tbody>
              ${totalStockRows}
            </tbody>
          </table>
        </div>
      </div>

      <div class="bg-white shadow rounded-lg p-4 mt-6">
        <h2 class="text-lg font-semibold mb-4">Prediction vs Stock</h2>
        <table class="w-full text-sm text-left">
          <thead class="border-b text-gray-600">
            <tr>
              <th class="py-2">Pizza</th>
              <th class="py-2">Predicted</th>
              <th class="py-2">Actual</th>
              <th class="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            ${predictionRows || `<tr><td colspan="4" class="py-2 text-center text-gray-500">No data available.</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>
  `;

  app.innerHTML = renderLayout(dashboardContent);

  document.getElementById('alert-btn').onclick = showStockAlert;
  document.getElementById('logout-btn').onclick = () => {
    localStorage.removeItem('authToken');
    location.href = '/#/login';
  };

  if (inventoryData.length === 0) return;

  // ✅ Fix chart rendering: delay until DOM is ready
  requestAnimationFrame(() => {
    const labels = inventoryData.map(i => i.name);
    const actuals = inventoryData.map(i => i.actual);

    const barCanvas = document.getElementById('barChart');
    const pieCanvas = document.getElementById('pieChart');

    if (!barCanvas || !pieCanvas) {
      console.error("Canvas not found for charts.");
      return;
    }

    new Chart(barCanvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Stock Quantity',
          data: actuals,
          backgroundColor: 'rgba(59, 130, 246, 0.6)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
      }
    });

    new Chart(pieCanvas, {
      type: 'pie',
      data: {
        labels,
        datasets: [{
          label: 'Stock Distribution',
          data: actuals,
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
            'rgba(255, 159, 64, 0.6)'
          ]
        }]
      },
      options: { responsive: true }
    });
  });
}
