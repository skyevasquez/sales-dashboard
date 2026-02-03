# 📊 Sales Dashboard

A modern, full-featured sales tracking and analytics dashboard built with Next.js, Convex, and Better Auth.

![Next.js](https://img.shields.io/badge/Next.js-16.1.4-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Convex](https://img.shields.io/badge/Convex-Backend-black)
![Better Auth](https://img.shields.io/badge/Better%20Auth-Auth-blue)
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
- Secure email/password authentication via Better Auth (Convex)
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
- A Convex project (free tier available)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd sales-dashboard

# Install dependencies
npm install --legacy-peer-deps

# Start Convex dev (provisions env + backend)
npx convex dev

# Start development server (new terminal)
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
├── convex/                  # Convex schema + functions
├── context/                 # React contexts
│   └── AuthContext.tsx     # Legacy Appwrite auth context
├── lib/                     # Utility libraries
│   ├── auth-client.ts      # Better Auth React client
│   ├── auth-server.ts      # Better Auth server helpers
│   ├── appwrite.ts         # Legacy Appwrite server client
│   └── appwrite-client.ts  # Legacy Appwrite client
├── utils/                   # Utility functions
└── appwrite.json           # Legacy Appwrite schema
```

## 🛠️ Tech Stack

- **Frontend:** Next.js 15.2.4, React 19, TypeScript
- **Styling:** Tailwind CSS, Radix UI, shadcn/ui
- **Charts:** Recharts
- **Backend:** Convex
- **Auth:** Better Auth
- **Forms:** React Hook Form + Zod

## 📖 Documentation

- **[Authentication Guide](./AUTH_README.md)** - Complete auth setup and usage
- **[Quick Auth Guide](./QUICK_AUTH_GUIDE.txt)** - Quick reference
- **[Appwrite Setup (Legacy)](./APPWRITE_SETUP.md)** - Legacy Appwrite configuration

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
NEXT_PUBLIC_CONVEX_URL=your_convex_url
NEXT_PUBLIC_CONVEX_SITE_URL=http://localhost:3000

# Optional override for Better Auth
SITE_URL=http://localhost:3000

# Vercel Blob (optional, for PDF storage)
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Convex](https://docs.convex.dev/)
- [Better Auth](https://www.better-auth.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Recharts](https://recharts.org/)
- [Tailwind CSS](https://tailwindcss.com/)

---

**Built with ❤️ using Next.js, Convex, and WorkOS Authkit**
