import { renderLayout } from '../components/layout.js';

export function renderRegisterPage() {
  const app = document.getElementById('app');

  const registerContent = `
    <div class="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div class="bg-white shadow-lg rounded-lg overflow-hidden w-full max-w-5xl grid grid-cols-1 md:grid-cols-2">
        <!-- Left: Illustration -->
        <div class="hidden md:block bg-gray-50">
          <img src="/login-illustration.png" alt="Register illustration" class="w-full h-full object-cover" />
        </div>

        <!-- Right: Form -->
        <div class="p-8 flex flex-col justify-center">
          <h1 class="text-2xl font-bold mb-2 text-gray-800">Register</h1>
          <p class="text-sm text-gray-600 mb-6">Manage all your inventory efficiently</p>
          <p class="text-xs text-gray-500 mb-4">Let’s get you all set up so you can verify your personal account and begin setting up your work profile.</p>

          <form id="registerForm" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="firstName" class="block text-sm font-medium text-gray-700">First name</label>
                <input type="text" id="firstName" name="firstName" placeholder="Enter your name"
                  class="w-full mt-1 px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label for="lastName" class="block text-sm font-medium text-gray-700">Last name</label>
                <input type="text" id="lastName" name="lastName" placeholder="Minimum 8 characters"
                  class="w-full mt-1 px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" id="email" name="email" placeholder="Enter your email"
                  class="w-full mt-1 px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label for="phone" class="block text-sm font-medium text-gray-700">Phone no.</label>
                <input type="text" id="phone" name="phone" placeholder="Minimum 8 characters"
                  class="w-full mt-1 px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
              <input type="password" id="password" name="password" placeholder="Enter your password"
                class="w-full mt-1 px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>

            <div class="flex items-center gap-2 text-sm">
              <input type="checkbox" id="terms" class="form-checkbox" />
              <label for="terms" class="text-gray-600">
                I agree to all terms, <a href="#" class="text-indigo-600 underline">privacy policies, and fees</a>
              </label>
            </div>

            <button type="submit"
              class="w-full bg-indigo-900 text-white py-2 rounded-md hover:bg-indigo-800 transition">
              Sign up
            </button>

            <p class="text-sm text-center text-gray-600 mt-2">
              Already have an account?
              <a href="#/login" class="text-indigo-600 hover:underline">Log in</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  `;

  // Prevent navbar
  app.innerHTML = renderLayout(registerContent, '#/register');

  const form = document.getElementById('registerForm');
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = {
    firstName: form.firstName.value.trim(),
    lastName: form.lastName.value.trim(),
    email: form.email.value.trim(),
    phone: form.phone.value.trim(),
    password: form.password.value.trim(),
  };

  try {
   const res = await fetch('https://stock-wise-production.up.railway.app/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await res.json();
    if (res.ok) {
      alert('Registration successful!');
      location.hash = '#/login'; // redirect to login page
    } else {
      alert(result.error || 'Registration failed.');
    }
  } catch (err) {
    console.error(err);
    alert('Something went wrong.');
  }
});
}
