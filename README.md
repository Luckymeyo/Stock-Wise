![logo](image/STOCKWISE-logo.png)

## Stockwise : Right Stock, Right Time

### About:

**StockWise is a small multi-stack application for managing pizza inventory and predicting stock levels.**
It consists of:

1. backend/ – an Express.js REST API for authentication, inventory, and prediction.
2. backend-ml/ – a FastAPI service handling transaction data stored in CSV.
3. stockwise-fe/ – a Vite-based frontend with vanilla JavaScript and TailwindCSS.

**Team ID**: CC25-CR372

**Project name**: Stock Wise

![cc25-cr372](image/STOCKWISE.png)

| Name                    | Student ID   | Role                           | GitHub                                    | Linkedin                                                                                  |
| ----------------------- | ------------ | ------------------------------ | ----------------------------------------- | ----------------------------------------------------------------------------------------- |
| Lucky Aryaguna Kimtheja | FC005D5Y1875 | Front-End & Back-End Developer | [Luckymeyo](https://github.com/Luckymeyo) | [Lucky Aryaguna Kimtheja](https://www.linkedin.com/in/lucky-aryaguna-kimtheja-0026b8134/) |
| Charles Wijaya          | MC244D5Y1987 | Machine Learning Engineer      | [HeyCW](https://github.com/HeyCW)         | [Charles Wijaya](https://www.linkedin.com/in/charles-wijaya-653955285/)                   |
| Stevan Lukas Siahaan    | MC325D5Y1600 | Machine Learning Engineer      | [lookas15](https://github.com/lookas15)   | [Stevan Lukas Siahaan](https://www.linkedin.com/in/stevan-lukas-siahaan/)                 |

### Features

1. **Inventory Management**: CRUD operations on pizza inventory, with status computed as balanced, understock, or overstock.
2. **Stock Prediction**: Backend compares predefined forecasts with stock counts from qty_data.csv.
3. **Transactions Service**: FastAPI endpoints allow listing and adding transaction entries (CSV).
4. **Dashboard Visualizations**: Bar and pie charts via Chart.js show current stock levels.
5. **IndexedDB Cache**: Inventory data is stored locally for offline access.
6. **PWA Support**: Service worker and manifest enable offline capability.
7. **Routing**: Hash-based SPA navigation for dashboard, inventory, transactions, prediction, distribution, and authentication pages.

### Improvements Made

1. Implemented offline caching of inventory in IndexedDB.
2. Added PWA service worker for offline access and manifest icons.
3. Dashboard pages now use Chart.js for visualizing stock.
4. Separated backend services (Express and FastAPI) for easier maintenance.

### Why This Implementation?

1. Express.js with LowDB provides a lightweight JSON-based REST API—ideal for prototyping.
2. FastAPI integrates well with data processing in Python, enabling CSV operations.
3. Vite + Vanilla JS offer fast builds and minimal bundle size while TailwindCSS speeds up styling.
4. Service Worker ensures basic functionality when offline, which is useful for inventory management scenarios.
