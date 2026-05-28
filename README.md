# Codelore UI

The sleek, high-performance frontend for **Codelore**, the autonomous AI codebase analysis and architecture mapping platform. 

This repository contains the decoupled React frontend designed to visualize complex project architectures, render deep AI insights, and provide interactive 3D repository exploration.

## 🚀 Tech Stack

- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS + Custom CSS (Vibrant dark mode aesthetics)
- **UI Components**: Radix UI + Custom animated primitives
- **Visualizations**: 
  - `react-force-graph-3d` & `three.js` for real-time 3D file tree rendering
  - `recharts` for performance and complexity analytics
- **Animations**: `framer-motion` & `tw-animate-css`
- **Routing**: React Router

## 🛠️ Local Development

### Prerequisites
Make sure you have Node.js 18+ installed.

### Installation

```bash
# Clone the repository
git clone https://github.com/theshantanujoshi/codelore-ui.git
cd codelore-ui

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

### Backend Connection
This frontend requires the Codelore backend API to function. By default, API calls point to `/api`. If you are running the backend on a different port locally (e.g. `http://localhost:3000`), you will need to update the base URL in `src/app/services/api.ts` or set up a proxy in `vite.config.ts`.

## 📦 Deployment

The application is fully optimized for static hosting platforms like Vercel, Netlify, or Cloudflare Pages.

```bash
# Build the production bundle
npm run build

# Preview the production build locally
npm run preview
```

## ✨ Features

- **Interactive 3D File Explorer**: Navigate codebase structures spatially using WebGL.
- **AI execution visualizer**: Real-time terminal simulation tracking AI context pruning and processing.
- **Repository Insights**: Interactive dashboards scoring Architecture, Security, Code Quality, and Performance.
- **AI Codebase Chat**: Ask context-aware questions about the loaded repository geometry and logic.
- **Glassmorphism Design**: Sleek, immersive UI built with bespoke Tailwind configurations and animated micro-interactions.

## 📄 License
This project is open-source. See the `ATTRIBUTIONS.md` file for details regarding third-party packages used in the UI.
