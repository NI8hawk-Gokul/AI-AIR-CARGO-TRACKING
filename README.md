# 🛩️ AI Air Cargo Tracking System

An enterprise-grade, AI-powered air cargo tracking platform designed to provide real-time visibility, predictive analytics, and automated operational intelligence for logistics and fleet management.

## 🌟 Overview

The AI Air Cargo Tracking System is a centralized dashboard built for office staff and logistics managers. It integrates live cargo and flight datasets to deliver:
- **Real-Time Tracking:** Pinpoint shipment locations utilizing interactive maps.
- **AI-Driven Delay Predictions:** Proactive forecasting of potential delays based on flight data and historical patterns.
- **Route Optimization:** Advanced analytics for fleet performance, predictive maintenance, and fuel efficiency.
- **Automated Alerts:** Instant operational alerts for anomalies or status changes.

## 🚀 Features

- **Interactive Dashboard:** A rich, responsive UI built with React and Vite.
- **Live Shipment Mapping:** Visual representation of cargo routes and current locations using Leaflet.
- **Data Integration:** Supports direct file uploads, local structured data, and text input to simulate real-world datasets.
- **Role-Based Access Control (RBAC):** Secure access structure for different levels of staff and management.
- **Reporting & Analytics:** Comprehensive tools to manage, track, and monitor shipments from origin to final delivery.

## 🛠️ Technology Stack

- **Frontend Framework:** [React 19](https://react.dev/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Routing:** [React Router v7](https://reactrouter.com/)
- **Maps & Tracking:** [Leaflet](https://leafletjs.com/) & [React-Leaflet](https://react-leaflet.js.org/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Styling:** Custom CSS with modern, responsive design principles.

## 📦 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/ai-air-cargo-tracking.git
   cd ai-air-cargo-tracking
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to the URL provided in your terminal (usually `http://localhost:5173`).

## 🏗️ Project Structure

```text
src/
├── components/     # Reusable UI components (Sidebar, Cards, etc.)
├── context/        # React Context providers (e.g., ThemeContext)
├── pages/          # Main application views (Dashboard, AddShipment, etc.)
├── App.jsx         # Main application routing
└── main.jsx        # Entry point
```

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to check out the issues page if you want to contribute.

## 📝 License

This project is licensed under the MIT License.
