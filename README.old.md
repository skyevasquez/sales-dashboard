# Sales Performance Dashboard

A comprehensive sales dashboard built with Next.js, React, and Appwrite for persistent cloud storage. Track store performance, KPIs, and generate detailed reports.

## Features

- 📊 **Multi-Store Management**: Track multiple stores in one dashboard
- 📈 **Custom KPIs**: Define and monitor your own Key Performance Indicators
- 💾 **Cloud Persistence**: Data synced across all devices using Appwrite
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- 📄 **PDF Reports**: Generate and download professional sales reports
- 📊 **Data Visualization**: Interactive charts and trend analysis
- 📤 **CSV Import/Export**: Bulk data management capabilities
- 🎨 **Customizable Dashboard**: Personalize your view and preferences

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI Components**: Radix UI, Tailwind CSS
- **Database**: Appwrite Cloud
- **Charts**: Recharts
- **PDF Generation**: jsPDF
- **File Storage**: Vercel Blob

## Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- An Appwrite account (free at [cloud.appwrite.io](https://cloud.appwrite.io))
- A Vercel account (optional, for blob storage)

## Setup Instructions

### 1. Clone and Install

```bash
cd "sales-dashboard (2)"
npm install --legacy-peer-deps
```

### 2. Set Up Appwrite

#### Option A: Automated Setup (Recommended - 2 minutes!)

The easiest way to get started is using our automated setup script:

```bash
./setup-appwrite.sh
```

This single command will:
- Log you into Appwrite Cloud
- Create/configure your project
- Deploy all database collections
- Generate API keys
- Create your `.env.local` file

Then skip to step 3! ✨

#### Option B: Manual Setup (15-20 minutes)

#### Create an Appwrite Project

1. Go to [Appwrite Console](https://cloud.appwrite.io)
2. Create a new project
3. Note down your **Project ID**

#### Create API Key

1. In your Appwrite project, go to **Settings** → **API Keys**
2. Click **Create API Key**
3. Name it "Sales Dashboard Server"
4. Set scopes:
   - `databases.read`
   - `databases.write`
5. Copy the API key (you'll only see this once!)

#### Create Database and Collections

1. Go to **Databases** → **Create Database**
2. Name it "SalesDashboard" and note the **Database ID**

Now create the following collections:

##### Collection 1: Stores
- **Collection Name**: `stores`
- **Attributes**:
  - `name` (string, required, size: 255)

##### Collection 2: KPIs
- **Collection Name**: `kpis`
- **Attributes**:
  - `name` (string, required, size: 255)

##### Collection 3: Sales Data
- **Collection Name**: `sales_data`
- **Attributes**:
  - `storeId` (string, required, size: 255)
  - `kpiId` (string, required, size: 255)
  - `monthlyGoal` (double, required)
  - `mtdSales` (double, required)
- **Indexes** (for better performance):
  - Index key: `storeId_kpiId`, Type: unique
    - Attributes: `storeId` (ASC), `kpiId` (ASC)

##### Collection 4: Reports
- **Collection Name**: `reports`
- **Attributes**:
  - `name` (string, required, size: 255)
  - `createdAt` (string, required, size: 255)
  - `url` (string, required, size: 1000)
  - `storeIds` (string[], required)

##### Collection 5: Snapshots
- **Collection Name**: `snapshots`
- **Attributes**:
  - `timestamp` (string, required, size: 255)
  - `data` (string, required, size: 100000)

#### Set Collection Permissions

For each collection, set the following permissions:
1. Go to **Settings** → **Permissions**
2. Add role: **Any**
3. Enable: Read, Create, Update, Delete

> **Note**: This allows public access. For production, implement authentication and user-specific permissions.

### 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Appwrite details:

```env
# Appwrite Configuration
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your_project_id_here
APPWRITE_API_KEY=your_api_key_here

NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id_here

# Database and Collection IDs (from Appwrite Console)
APPWRITE_DATABASE_ID=your_database_id
APPWRITE_COLLECTION_STORES_ID=stores_collection_id
APPWRITE_COLLECTION_KPIS_ID=kpis_collection_id
APPWRITE_COLLECTION_SALES_ID=sales_data_collection_id
APPWRITE_COLLECTION_REPORTS_ID=reports_collection_id
APPWRITE_COLLECTION_SNAPSHOTS_ID=snapshots_collection_id

NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_database_id
NEXT_PUBLIC_APPWRITE_COLLECTION_STORES_ID=stores_collection_id
NEXT_PUBLIC_APPWRITE_COLLECTION_KPIS_ID=kpis_collection_id
NEXT_PUBLIC_APPWRITE_COLLECTION_SALES_ID=sales_data_collection_id
NEXT_PUBLIC_APPWRITE_COLLECTION_REPORTS_ID=reports_collection_id
NEXT_PUBLIC_APPWRITE_COLLECTION_SNAPSHOTS_ID=snapshots_collection_id

# Vercel Blob (optional, for PDF storage)
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage Guide

### Adding Stores and KPIs

1. Click **Add Store** to create a new store location
2. Click **Add KPI** to define metrics to track (e.g., "Revenue", "Units Sold")

### Entering Data

1. Go to the **Data Entry** tab
2. Input monthly goals and month-to-date sales for each KPI
3. Data is automatically saved to Appwrite

### Generating Reports

1. Click **Generate Report**
2. Select stores to include
3. Download the PDF report
4. Reports are saved in the **Reports** tab

### Importing/Exporting Data

- **Export CSV**: Download all data as CSV
- **Import CSV**: Bulk upload data from a CSV file

## Project Structure

```
sales-dashboard/
├── app/
│   ├── actions/
│   │   └── report-actions.ts    # Server actions for reports
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── sales-dashboard.tsx      # Main dashboard component
│   ├── ui/                      # Reusable UI components
│   └── ...                      # Other dashboard components
├── lib/
│   ├── appwrite.ts              # Appwrite server client
│   ├── appwrite-client.ts       # Appwrite browser client
│   └── db-service.ts            # Database CRUD operations
└── utils/                       # Utility functions
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project to Vercel
3. Add all environment variables from `.env.local`
4. Deploy!

### Set Up Vercel Blob (for PDF storage)

1. In Vercel, go to your project → **Storage**
2. Create a new **Blob** store
3. Copy the token to `BLOB_READ_WRITE_TOKEN`

## Data Persistence

All data is stored in Appwrite Cloud and synchronized across devices:

- **Stores**: Store locations and names
- **KPIs**: Performance metrics being tracked
- **Sales Data**: Goals and actual sales figures
- **Reports**: Generated PDF reports metadata
- **Snapshots**: Historical data for trend analysis

## Troubleshooting

### "Failed to load data from database"

- Check your Appwrite credentials in `.env.local`
- Verify collection IDs match your Appwrite console
- Ensure collection permissions allow read/write

### "Failed to add store/KPI"

- Check API key has proper scopes
- Verify collection attributes are set correctly

### PDF Generation Fails

- Ensure `BLOB_READ_WRITE_TOKEN` is set
- Check Vercel Blob storage is configured

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

MIT License - feel free to use this project for your own purposes.

## Support

For issues and questions:
- Check the [Appwrite Documentation](https://appwrite.io/docs)
- Open an issue on GitHub
- Contact the development team

---

Built with ❤️ using Next.js and Appwrite
