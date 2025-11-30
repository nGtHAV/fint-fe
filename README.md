# Fint - Finance Tracker Frontend

A modern, mobile-first Progressive Web App (PWA) for personal expense tracking with receipt scanning powered by AI.

## 🚀 Features

- **Receipt Scanning**: Full-screen camera capture with AI-powered OCR
- **Smart Categorization**: Automatic expense categorization
- **Dashboard**: Visual spending analytics with charts
- **Offline Support**: PWA with service worker for offline access
- **Dark Mode**: System-aware theme switching
- **Responsive Design**: Mobile-first, works on all devices
- **Configurable APIs**: Switch between backend and AI servers

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Backend API server (fint-be)
- AI OCR server (fint-ai)

## 🛠️ Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_AI_URL=http://localhost:5001
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production

```bash
npm run build
npm start
```

## 📱 Features Overview

### Receipt Capture Flow

1. **Full-Screen Camera**: Tap "Add Receipt" → Camera opens full-screen
2. **Photo Preview**: Review captured image before processing
3. **AI Processing**: Loading animation while OCR extracts data
4. **Edit & Confirm**: Review and correct extracted information
5. **Save Receipt**: Confirm to save to your expense list

### Dashboard

- Total spending overview
- Category breakdown with pie chart
- Recent transactions list
- Monthly spending trends

### Settings

- Profile management
- Password change
- Theme preferences
- API server configuration

## 🔧 Server Configuration

Users can configure API endpoints from the login/register pages:

1. Click the **Server Settings** button (⚙️)
2. Enter your **Backend URL** (e.g., `http://localhost:5000`)
3. Enter your **AI API URL** (e.g., `http://localhost:5001`)
4. Click **Save**

This allows connecting to different server instances for development, staging, or production.

## 📁 Project Structure

```
fint-fe/
├── public/
│   ├── manifest.json    # PWA manifest
│   ├── sw.js            # Service worker
│   └── icons/           # App icons
├── src/
│   ├── app/
│   │   ├── layout.tsx   # Root layout
│   │   ├── page.tsx     # Dashboard page
│   │   ├── login/       # Login page
│   │   ├── register/    # Registration page
│   │   ├── receipts/    # Receipts list page
│   │   └── spending/    # Spending analytics
│   ├── components/
│   │   ├── AddReceiptModal.tsx  # Camera & OCR flow
│   │   ├── Dashboard.tsx        # Main dashboard
│   │   ├── Header.tsx           # App header
│   │   ├── BottomNav.tsx        # Mobile navigation
│   │   ├── PieChart.tsx         # Spending chart
│   │   └── Sidebar.tsx          # Desktop sidebar
│   └── lib/
│       └── api.ts       # API client functions
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## 🎨 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Custom SVG-based
- **PWA**: Service Worker + Manifest

## 📊 API Integration

### Backend API (fint-be)

- Authentication (login, register, password reset)
- Receipt CRUD operations
- Spending statistics
- Category management

### AI API (fint-ai)

- Receipt image scanning
- OCR text extraction
- Automatic field detection (merchant, total, date)
- Category suggestion

## 🐳 Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

## 📱 PWA Installation

### iOS
1. Open in Safari
2. Tap Share button
3. Select "Add to Home Screen"

### Android
1. Open in Chrome
2. Tap "Install" prompt or menu → "Add to Home Screen"

### Desktop
1. Open in Chrome/Edge
2. Click install icon in address bar

## 🔒 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:5000` |
| `NEXT_PUBLIC_AI_URL` | AI OCR service URL | `http://localhost:5001` |

## 📄 License

MIT License
