# Quick Start Guide - Appwrite CLI Setup

This guide will get your Sales Dashboard up and running in **under 5 minutes** using the Appwrite CLI! 🚀

## Prerequisites

- ✅ Appwrite CLI installed (you already have this!)
- ✅ An Appwrite Cloud account ([sign up free](https://cloud.appwrite.io))

## Automated Setup (Recommended)

### One Command Setup

Simply run the automated setup script:

```bash
./setup-appwrite.sh
```

This script will:
1. ✅ Log you into Appwrite Cloud
2. ✅ Create/select a project
3. ✅ Deploy the database and all 5 collections
4. ✅ Create an API key with proper permissions
5. ✅ Generate your `.env.local` file automatically

**That's it!** The script handles everything for you.

### What Happens During Setup?

```
🚀 Sales Dashboard - Appwrite Setup
====================================

Step 1: Login to Appwrite Cloud
--------------------------------
[Opens browser for authentication]

Step 2: Initialize Appwrite Project
------------------------------------
[Creates/selects project]

Step 3: Configure Database Schema
----------------------------------
[Updates configuration with your project]

Step 4: Deploy Database & Collections
--------------------------------------
[Creates all 5 collections with attributes and indexes]

Step 5: Create API Key
----------------------
[Generates API key with database permissions]

Step 6: Generate Environment Variables
---------------------------------------
[Creates .env.local with all your credentials]

🎉 Setup Complete!
```

## After Setup

Once the setup completes, you can immediately start the app:

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser!

## Manual Setup (Alternative)

If you prefer to set things up manually, follow these steps:

### 1. Login to Appwrite

```bash
appwrite login
```

### 2. Initialize Project

```bash
appwrite init project
```

Select "Create a new Appwrite project" and follow the prompts.

### 3. Deploy Database

```bash
appwrite deploy database
```

This reads from `appwrite.json` and creates:
- SalesDashboard database
- 5 collections (stores, kpis, sales_data, reports, snapshots)
- All attributes and indexes
- Permissions

### 4. Create API Key

```bash
appwrite projects createKey \
  --name "Sales Dashboard Server" \
  --scopes "databases.read" "databases.write"
```

Copy the API key from the output.

### 5. Configure Environment Variables

Create `.env.local` and add:

```env
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your_project_id_here
APPWRITE_API_KEY=your_api_key_here

NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id_here

# Use these exact IDs (they match appwrite.json)
APPWRITE_DATABASE_ID=sales-dashboard-db
APPWRITE_COLLECTION_STORES_ID=stores
APPWRITE_COLLECTION_KPIS_ID=kpis
APPWRITE_COLLECTION_SALES_ID=sales_data
APPWRITE_COLLECTION_REPORTS_ID=reports
APPWRITE_COLLECTION_SNAPSHOTS_ID=snapshots

NEXT_PUBLIC_APPWRITE_DATABASE_ID=sales-dashboard-db
NEXT_PUBLIC_APPWRITE_COLLECTION_STORES_ID=stores
NEXT_PUBLIC_APPWRITE_COLLECTION_KPIS_ID=kpis
NEXT_PUBLIC_APPWRITE_COLLECTION_SALES_ID=sales_data
NEXT_PUBLIC_APPWRITE_COLLECTION_REPORTS_ID=reports
NEXT_PUBLIC_APPWRITE_COLLECTION_SNAPSHOTS_ID=snapshots
```

## Database Schema

The setup creates these collections:

| Collection | Attributes | Purpose |
|------------|------------|---------|
| **stores** | name (string) | Store locations |
| **kpis** | name (string) | Key Performance Indicators |
| **sales_data** | storeId, kpiId, monthlyGoal, mtdSales | Sales figures |
| **reports** | name, createdAt, url, storeIds[] | Report metadata |
| **snapshots** | timestamp, data | Historical data |

## Verifying Setup

Check that everything is working:

```bash
# List databases
appwrite databases list

# List collections
appwrite databases listCollections --databaseId sales-dashboard-db

# View a collection's attributes
appwrite databases listAttributes --databaseId sales-dashboard-db --collectionId stores
```

## Useful CLI Commands

```bash
# View project info
appwrite projects get --projectId [YOUR_PROJECT_ID]

# List all API keys
appwrite projects listKeys --projectId [YOUR_PROJECT_ID]

# View database
appwrite databases get --databaseId sales-dashboard-db

# Pull remote config (if you make changes in console)
appwrite pull database
```

## Troubleshooting

### "Command not found: appwrite"

Install the CLI:
```bash
npm install -g appwrite-cli
```

### "Not logged in"

Run:
```bash
appwrite login
```

### "Project not found"

Make sure you've run:
```bash
appwrite init project
```

### Script permission denied

Make it executable:
```bash
chmod +x setup-appwrite.sh
```

### Database already exists

If you want to start fresh:
1. Go to [Appwrite Console](https://cloud.appwrite.io)
2. Delete the "SalesDashboard" database
3. Run the setup script again

## Next Steps

After setup is complete:

1. **Start the app**: `npm run dev`
2. **Add your first store**: Click "Add Store" button
3. **Add KPIs**: Click "Add KPI" button (e.g., "Revenue", "Units Sold")
4. **Enter data**: Go to "Data Entry" tab and input your numbers
5. **Generate reports**: Click "Generate Report" to create a PDF

## Support

- 📚 [Appwrite Documentation](https://appwrite.io/docs)
- 💬 [Appwrite Discord](https://appwrite.io/discord)
- 🐙 [Project Repository](https://github.com/yourusername/sales-dashboard)

---

**Pro Tip**: The `appwrite.json` file in this project defines your entire database schema. You can modify it and redeploy with `appwrite deploy database` to update your schema!
