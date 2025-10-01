# 📊 Sales Dashboard

A modern, full-featured sales tracking and analytics dashboard built with Next.js and Appwrite.

![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Appwrite](https://img.shields.io/badge/Appwrite-Cloud-f02e65?logo=appwrite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwind-css)

## ✨ Features

### 📈 Dashboard & Analytics
- Real-time sales tracking by store and KPI
- Interactive charts and visualizations (Recharts)
- Goal vs Actual performance metrics
- Trend analysis and forecasting
- Month-over-month comparisons
- Customizable dashboard layouts

### 🔐 Authentication
- Secure email/password authentication via Appwrite
- User registration and login
- Protected routes
- Session management
- User profile with logout

### 🏪 Store Management
- Add and manage multiple stores
- Track individual store performance
- Compare stores side-by-side

### 🎯 KPI Tracking
- Custom KPI definitions
- Monthly goals and actuals
- Percentage to goal calculations
- Historical snapshots

### 📄 Reports
- Generate PDF reports
- Export data snapshots
- Historical data preservation

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- An Appwrite Cloud account (free tier available)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd sales-dashboard

# Install dependencies
npm install --legacy-peer-deps

# Copy environment variables template
cp .env.example .env.local

# Edit .env.local with your Appwrite credentials
# Then set up the database
node setup-database.mjs

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
sales-dashboard/
├── app/                      # Next.js app directory
│   ├── actions/             # Server actions
│   ├── auth/               # Authentication pages
│   └── layout.tsx          # Root layout
├── components/              # React components
│   ├── auth/               # Auth components
│   ├── ui/                 # UI components (shadcn/ui)
│   └── sales-dashboard.tsx # Main dashboard
├── context/                 # React contexts
│   └── AuthContext.tsx     # Auth state management
├── lib/                     # Utility libraries
│   ├── appwrite.ts         # Server-side Appwrite client
│   └── appwrite-client.ts  # Client-side Appwrite client
├── utils/                   # Utility functions
└── appwrite.json           # Appwrite schema
```

## 🛠️ Tech Stack

- **Frontend:** Next.js 15.2.4, React 19, TypeScript
- **Styling:** Tailwind CSS, Radix UI, shadcn/ui
- **Charts:** Recharts
- **Backend:** Appwrite Cloud (Database + Auth)
- **Forms:** React Hook Form + Zod

## 📖 Documentation

- **[Authentication Guide](./AUTH_README.md)** - Complete auth setup and usage
- **[Quick Auth Guide](./QUICK_AUTH_GUIDE.txt)** - Quick reference
- **[Appwrite Setup](./APPWRITE_SETUP.md)** - Appwrite configuration

## 🔒 Security

- Environment variables are never committed
- API keys are server-side only
- Password minimum length enforced (8+ chars)
- Session-based authentication
- Protected routes and API endpoints

## 🎨 Key Features

### Dashboard Customization
- Drag-and-drop chart reordering
- Show/hide charts
- Resize chart cards
- Persistent preferences

### Data Visualization
- Store metrics overview
- Performance pie charts
- Goal vs Actual comparisons
- Trend analysis
- Sales forecasting

## 🚧 Development

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run linter
```

## 📝 Environment Variables

Create a `.env.local` file with:

```env
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your_project_id
APPWRITE_API_KEY=your_api_key

NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id

APPWRITE_DATABASE_ID=sales-dashboard-db
APPWRITE_COLLECTION_STORES_ID=stores
APPWRITE_COLLECTION_KPIS_ID=kpis
APPWRITE_COLLECTION_SALES_ID=sales_data
APPWRITE_COLLECTION_REPORTS_ID=reports
APPWRITE_COLLECTION_SNAPSHOTS_ID=snapshots

# Add NEXT_PUBLIC_ versions of database IDs as well
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Appwrite](https://appwrite.io/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Recharts](https://recharts.org/)
- [Tailwind CSS](https://tailwindcss.com/)

---

**Built with ❤️ using Next.js and Appwrite**
