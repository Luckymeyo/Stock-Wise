
import { renderLayout } from '../components/layout.js';
import { pizzaList } from '../utils/pizzaList.js';
import swal from 'sweetalert';
import { saveToDB as saveInventoryToDB, getFromDB as getInventoryFromDB } from '../utils/db.js';

export function renderInventoryPage() {
  const app = document.getElementById('app');

  async function fetchInventory() {
    try {
      const res = await fetch('https://stock-wise-production.up.railway.app/api/inventory');
      const data = await res.json();
      await saveInventoryToDB('inventory',data);
      return data;
    } catch (err) {
      console.warn("Network failed, loading from IndexedDB", err);
      const cached = await 
      getInventoryFromDB('inventory');
      if (!cached || cached.length === 0) {
        swal("Offline Error", "No cached inventory data found.", "error");
      }
      return cached;
    }
  }

  async function renderTable() {
    const inventory = await fetchInventory();

    const rows = inventory.map(item => {
      const statusColor = item.status === 'understock' ? 'text-red-600' :
                          item.status === 'overstock' ? 'text-yellow-600' :
                          item.status === 'balanced' ? 'text-green-600' : 'text-gray-600';

      return `
        <tr class="border-t" data-id="${item.id}">
          <td class="py-2">${item.name}</td>
          <td class="py-2">${item.predicted}</td>
          <td class="py-2">${item.actual}</td>
          <td class="py-2 ${statusColor}">${item.status}</td>
        </tr>
      `;
    }).join('');

    const html = `
      <h1 class="text-3xl font-semibold mb-4">Inventory</h1>
      <div class="bg-white shadow rounded-lg p-4">
        <h2 class="text-lg font-semibold mb-4">Inventory Table</h2>
        <table class="w-full text-sm text-left mb-4">
          <thead class="border-b text-gray-600">
            <tr>
              <th class="py-2">Pizza</th>
              <th class="py-2">Predicted</th>
              <th class="py-2">Actual</th>
              <th class="py-2">Status</th>
            </tr>
          </thead>
          <tbody id="inventory-body">
            ${rows}
          </tbody>
        </table>
        <div class="flex gap-4 mt-4">
          <button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600" id="add-btn">Add</button>
          <button class="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600" id="edit-btn">Edit</button>
          <button class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600" id="remove-btn">Remove</button>
        </div>
      </div>
    `;
    app.innerHTML = renderLayout(html);

    document.getElementById('add-btn').onclick = async () => {
      const wrapper = createForm(['name', 'predicted', 'actual']);

      const result = await swal({
        text: 'Enter Pizza Name, Predicted, Actual',
        content: wrapper,
        buttons: true,
        closeOnClickOutside: false
      });

      const inputs = wrapper.querySelectorAll('input');
      const formValues = Array.from(inputs).map(i => i.value.trim());

      if (!formValues || formValues.length < 3 || formValues.some(val => val === '')) {
        return swal("Error", "All fields are required", "error");
      }

      const [name, predicted, actual] = formValues;

      if (!pizzaList.includes(name)) {
        return swal("Invalid Pizza", `Must be one of:\n${pizzaList.join(', ')}`, "error");
      }

      const res = await fetch('https://stock-wise-production.up.railway.app/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, predicted: +predicted, actual: +actual }),
      });

      if (!res.ok) {
        const { error } = await res.json();
        return swal("Error", error || "Failed to add item", "error");
      }

      await swal("Success", "Pizza has been added!", "success");
      await renderTable();
    };

    document.getElementById('edit-btn').onclick = async () => {
      const inventory = await fetchInventory();

      const wrapper = document.createElement("div");
      const select = document.createElement("select");
      select.className = "swal-content__select";
      select.innerHTML = inventory.map(item =>
        `<option value="${item.name}">${item.name}</option>`).join('');
      wrapper.appendChild(select);

      const selectedPrompt = await swal({
        text: "Select a pizza to edit:",
        content: wrapper,
        buttons: true,
      });

      const selectedName = select.value;
      const item = inventory.find(i => i.name === selectedName);
      if (!item) return swal("Error", "Pizza not found", "error");

      const editWrapper = createForm(['predicted', 'actual'], item);

      const result = await swal({
        text: 'Update Predicted and Actual values:',
        content: editWrapper,
        buttons: true,
        closeOnClickOutside: false
      });

      const inputs = editWrapper.querySelectorAll('input');
      const formValues = Array.from(inputs).map(i => i.value.trim());

      if (!formValues || formValues.length < 2 || formValues.some(val => val === '')) {
        return swal("Error", "All fields are required", "error");
      }

      const [predicted, actual] = formValues;

      const res = await fetch(`https://stock-wise-production.up.railway.app/api/inventory/name/${encodeURIComponent(selectedName)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ predicted: +predicted, actual: +actual }),
      });

      if (!res.ok) {
        const { error } = await res.json();
        return swal("Error", error || "Failed to update item", "error");
      }

      await swal("Success", "Pizza has been updated!", "success");
      await renderTable();
    };

    document.getElementById('remove-btn').onclick = async () => {
      const inventory = await fetchInventory();

      const wrapper = document.createElement("div");
      const select = document.createElement("select");
      select.className = "swal-content__select";
      select.innerHTML = inventory.map(item =>
        `<option value="${item.name}">${item.name}</option>`).join('');
      wrapper.appendChild(select);

      const { value: confirmed } = await swal({
        text: "Select a pizza to delete:",
        content: wrapper,
        buttons: true,
        dangerMode: true
      });

      const selectedName = select.value;
      if (!selectedName) return swal("Error", "No pizza selected", "error");

    await fetch(`https://stock-wise-production.up.railway.app/api/inventory/name/${encodeURIComponent(selectedName)}`, {
  method: 'DELETE'
});

      await swal("Success", "Pizza has been deleted!", "success");
      await renderTable();
    };
  }

  function createForm(fields, data = {}) {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = fields.map(field => `
      <input type="text" name="${field}" placeholder="${field}" value="${data[field] || ''}"
        class="swal-content__input mb-2">
    `).join('');
    return wrapper;
  }

  renderTable();
}
