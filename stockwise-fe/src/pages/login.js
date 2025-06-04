import { renderLayout } from '../components/layout.js';

export function renderLoginPage() {
  const app = document.getElementById('app');

  const loginContent = `
    <div class="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div class="bg-white shadow-lg rounded-lg overflow-hidden w-full max-w-4xl grid grid-cols-1 md:grid-cols-2">
        <!-- Left Section: Form -->
        <div class="p-8 flex flex-col justify-center">
          <h1 class="text-3xl font-bold mb-2">Login</h1>
          <p class="text-sm text-gray-500 mb-6">See your growth and get support!</p>

          <form id="loginForm" class="space-y-4">
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700">Email*</label>
              <input type="email" id="email" name="email" placeholder="Enter your email"
                     class="w-full mt-1 px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-gray-700">Password*</label>
              <input type="password" id="password" name="password" placeholder="Minimum 8 characters"
                     class="w-full mt-1 px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
            </div>

            <div class="flex items-center justify-between text-sm text-gray-600">
              <label class="flex items-center gap-2">
                <input type="checkbox" class="form-checkbox" />
                Remember me
              </label>
              <a href="#" class="text-indigo-600 hover:underline">Forgot password?</a>
            </div>

            <button type="submit"
                    class="w-full bg-indigo-900 text-white py-2 rounded-md hover:bg-indigo-800 transition">
              Login
            </button>

            <p class="text-sm text-center text-gray-600 mt-2">
              Not registered yet?
              <a href="#/register" class="text-indigo-600 hover:underline">Create a new account</a>
            </p>
          </form>
        </div>

        <!-- Right Section: Illustration -->
        <div class="hidden md:block bg-gray-50">
          <img src="/login-illustration.png" alt="Login illustration" class="w-full h-full object-cover" />
        </div>
      </div>
    </div>
  `;

  // Pass the current route manually to hide nav bar
  app.innerHTML = renderLayout(loginContent, '#/login');

 const form = document.getElementById('loginForm');
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = {
    email: form.email.value.trim(),
    password: form.password.value.trim(),
  };

  try {
   const res = await fetch('https://stock-wise-production.up.railway.app/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await res.json();
    if (res.ok) {
      alert('Login successful!');
      // You can store user session or redirect
      location.hash = '#/dashboard';
    } else {
      alert(result.error || 'Login failed.');
    }
  } catch (err) {
    console.error(err);
    alert('Something went wrong.');
  }
});

}
