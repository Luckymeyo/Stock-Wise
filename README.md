StockWise is a small multi-stack application for managing pizza inventory and predicting stock levels.
It consists of:
backend/ – an Express.js REST API for authentication, inventory, and prediction.
backend-ml/ – a FastAPI service handling transaction data stored in CSV.
stockwise-fe/ – a Vite-based frontend with vanilla JavaScript and TailwindCSS.

Features
Inventory Management: CRUD operations on pizza inventory, with status computed as balanced, understock, or overstock.
Stock Prediction: Backend compares predefined forecasts with stock counts from qty_data.csv.
Transactions Service: FastAPI endpoints allow listing and adding transaction entries (CSV).
Dashboard Visualizations: Bar and pie charts via Chart.js show current stock levels.
IndexedDB Cache: Inventory data is stored locally for offline access.
PWA Support: Service worker and manifest enable offline capability.
Routing: Hash-based SPA navigation for dashboard, inventory, transactions, prediction, distribution, and authentication pages.

Improvements Made
Implemented offline caching of inventory in IndexedDB.
Added PWA service worker for offline access and manifest icons.
Dashboard pages now use Chart.js for visualizing stock.
Separated backend services (Express and FastAPI) for easier maintenance.

Why This Implementation?
Express.js with LowDB provides a lightweight JSON-based REST API—ideal for prototyping.
FastAPI integrates well with data processing in Python, enabling CSV operations.
Vite + Vanilla JS offer fast builds and minimal bundle size while TailwindCSS speeds up styling.
Service Worker ensures basic functionality when offline, which is useful for inventory management scenarios.
