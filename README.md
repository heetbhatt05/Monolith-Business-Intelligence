# Monolith

> 👉 “A Unified AI-Powered Business Intelligence & Inventory System”

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Status](https://img.shields.io/badge/Status-Completed-success?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

---

## 🚀 Hero Description

Traditional business systems are fragmented, forcing organizations to juggle disparate tools for inventory, sales, and analytics. This fragmentation creates blind spots, leading to stockouts, overstocking, and missed revenue opportunities.

**Monolith** solves this by delivering a completely centralized, AI-enhanced business ecosystem. By unifying inventory management, transaction processing, and analytics into a single platform, Monolith eliminates data silos and ensures consistent data flow across the system.

The platform combines **rule-based intelligence with Machine Learning** to analyze business behavior. While the insights engine continuously detects demand spikes, drops, and stock risks in real time, the integrated ML module provides predictive estimates to assist in planning and decision-making.

---

## ✨ Key Features

### 📦 Core System
- **Inventory Management**: Real-time tracking and categorization of all products with stock control and reorder thresholds.
- **Sales & POS**: Streamlined transaction flow with dynamic pricing and automatic profit calculation.
- **Stock Tracking**: Automated low-stock alerts based on predefined reorder levels.

---

### 🧠 AI & Intelligence
- **Demand Spike Detection**: Identifies sudden increases in demand using comparative analysis against historical averages.
- **Demand Drop Alerts**: Detects declining sales trends early to prevent dead stock accumulation.
- **Stock Risk Detection**: Highlights products likely to run out of stock based on sales velocity.
- **Smart Insights Engine**: Generates actionable insights using optimized backend logic (`ArtificialIntelligence.jsx`).

👉 These features are powered by **mathematical and statistical logic**, enabling fast and reliable real-time analysis without heavy computational overhead.

---

### 📈 Machine Learning
- **Demand Forecasting**: Predictive estimation using Linear Regression (`Predictions.jsx`) to assist in future planning.
- **Model Simplicity & Interpretability**: Designed as a lightweight ML layer for demonstration and decision support.
- **Data-Driven Predictions**: Uses internal sales data (quantity, pricing, discounts) for generating outputs.

⚠️ Note:  
This is a **baseline ML implementation**, focused on demonstrating predictive capability rather than full-scale time-series forecasting.

---

### 💹 Financial Analytics
- **Profit & Loss Dashboard**: Real-time financial tracking including revenue, cost, and net profit.
- **Category-wise Analysis**: Detailed breakdown of performance across product segments.

---

### 🛠️ Advanced Tools
- **Time Machine (Simulation)**: Simulate future or past business states using controlled time injection without affecting actual system integrity.
- **Undo Transactions**: Reverse incorrect sales to maintain data accuracy and financial correctness.
- **Demo Data Generator (Hidden Tool)**:  
  A developer-focused feature that generates synthetic historical data for testing analytics, insights, and dashboards instantly.  
  - Works on both empty and existing systems  
  - Generates realistic patterns (spike/drop)  
  - Fully removable and isolated from core logic  

---

## 🏗️ System Architecture

Monolith follows a modular, service-oriented architecture:

- **Frontend (`/frontend`)**: Built using **React + Vite**, delivering a responsive and interactive user interface with data visualization.
- **Backend API (`/backend`)**: Developed using **Node.js + Express**, handling business logic, routing, and system operations.
- **Database**: **MongoDB** provides flexible and scalable data storage for transactional and analytical data.
- **ML Layer (`/ML`)**: A separate **Python-based inference service** using scikit-learn for running prediction models via API communication.

---

## 📸 Screenshots

### Dashboard
![Dashboard](./screenshots/dashboard.png)

### Inventory
![Inventory](./screenshots/inventory.png)

### AI Insights
![AI Insights](./screenshots/ai_insights.png)

### Forecast
![Forecast](./screenshots/forecast.png)

### Profit & Loss
![Profit & Loss](./screenshots/profit_and_loss.png)

---

## 💻 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React, Vite, Recharts, Lucide |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB, Mongoose |
| **Machine Learning** | Python, Scikit-learn |

---

## 🤖 Machine Learning Engine

Monolith incorporates a lightweight Machine Learning layer to assist with predictive analytics.

The system uses **Linear Regression** to estimate future demand based on historical sales patterns. Instead of relying on external datasets, predictions are generated directly from system-generated data, ensuring contextual relevance.

While the current model is intentionally simple for clarity and performance, it serves as a strong foundation for future enhancements such as time-series forecasting and advanced predictive modeling.

---

## ⚙️ Installation Guide

Follow these steps to deploy Monolith locally:

**1. Clone the Repository**
```bash
git clone https://github.com/your-username/Monolith-Business-Intelligence.git
cd Monolith-Business-Intelligence
````

**2. Install & Run Frontend**

```bash
cd frontend
npm install
npm run dev
```

**3. Install & Run Backend**

```bash
cd backend
npm install
node server.js
```

**4. Run the ML Service**

```bash
cd ML
pip install -r requirements.txt
python inference_api.py
```

*The application will be available at `http://localhost:5173`.*

---

## 📁 Project Structure

```text
Monolith-Business-Intelligence/
├── frontend/               # React + Vite frontend application
├── backend/                # Node.js + Express backend
├── ML/                     # Python ML service
├── README.md
```

---

## 🔮 Future Scope

* Role-Based Authentication (RBAC)
* Advanced Time-Series Forecasting Models
* Cloud Deployment (AWS / GCP)
* Automated Reporting & Analytics Export

---

## 👥 Authors

**Heet Bhatt**

* *Lead Developer | Architect*
* [https://github.com/heetbhatt05](https://github.com/heetbhatt05)

**Het Darji**

* *Full-stack Contributor*
* [https://github.com/Het010](https://github.com/Het010)
