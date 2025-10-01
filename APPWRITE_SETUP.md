# Appwrite Database Setup Guide

This guide will walk you through setting up your Appwrite database for the Sales Dashboard.

## Quick Setup Checklist

- [ ] Create Appwrite account
- [ ] Create new project
- [ ] Generate API key
- [ ] Create database
- [ ] Create 5 collections (stores, kpis, sales_data, reports, snapshots)
- [ ] Set permissions for each collection
- [ ] Copy IDs to `.env.local`

## Detailed Instructions

### Step 1: Create Appwrite Account & Project

1. Visit [https://cloud.appwrite.io](https://cloud.appwrite.io)
2. Sign up or log in
3. Click **"Create Project"**
4. Enter project name: **"Sales Dashboard"**
5. **Copy your Project ID** - you'll need this later

### Step 2: Generate API Key

1. In your project, click **"Settings"** in the left sidebar
2. Click **"API Keys"** tab
3. Click **"Create API Key"**
4. Fill in:
   - **Name**: `Sales Dashboard Server`
   - **Expiration**: Never (or set your preferred expiration)
5. Under **Scopes**, check:
   - ✅ `databases.read`
   - ✅ `databases.write`
6. Click **"Create"**
7. **Copy the API Key immediately** (you won't see it again!)

### Step 3: Create Database

1. Click **"Databases"** in the left sidebar
2. Click **"Create database"**
3. Name it: **"SalesDashboard"**
4. Click **"Create"**
5. **Copy the Database ID** from the URL or settings

### Step 4: Create Collections

Now create 5 collections. For each collection:

---

#### Collection 1: **stores**

**Create Collection:**
1. Click **"Create collection"**
2. Collection ID: `stores` (or leave blank for auto-generated)
3. Collection Name: `stores`
4. Click **"Create"**

**Add Attributes:**
1. Click **"Attributes"** tab
2. Click **"Create attribute"**
3. Select **"String"**
4. Fill in:
   - Attribute Key: `name`
   - Size: `255`
   - Required: ✅ Yes
   - Default: (leave empty)
5. Click **"Create"**

**Set Permissions:**
1. Click **"Settings"** tab
2. Under **"Permissions"**, click **"Add a role"**
3. Select **"Any"**
4. Check all boxes: ✅ Create, ✅ Read, ✅ Update, ✅ Delete
5. Click **"Update"**

**Copy Collection ID** - save it as `APPWRITE_COLLECTION_STORES_ID`

---

#### Collection 2: **kpis**

**Create Collection:**
1. Click **"Create collection"**
2. Collection ID: `kpis`
3. Collection Name: `kpis`
4. Click **"Create"**

**Add Attributes:**
1. Click **"Attributes"** tab
2. Click **"Create attribute"** → **"String"**
3. Fill in:
   - Attribute Key: `name`
   - Size: `255`
   - Required: ✅ Yes
4. Click **"Create"**

**Set Permissions:**
1. Click **"Settings"** tab
2. Add role **"Any"** with all permissions (Create, Read, Update, Delete)

**Copy Collection ID** - save it as `APPWRITE_COLLECTION_KPIS_ID`

---

#### Collection 3: **sales_data**

**Create Collection:**
1. Click **"Create collection"**
2. Collection ID: `sales_data`
3. Collection Name: `sales_data`
4. Click **"Create"**

**Add Attributes:**

1. **Attribute 1:**
   - Type: String
   - Key: `storeId`
   - Size: `255`
   - Required: ✅ Yes

2. **Attribute 2:**
   - Type: String
   - Key: `kpiId`
   - Size: `255`
   - Required: ✅ Yes

3. **Attribute 3:**
   - Type: Double
   - Key: `monthlyGoal`
   - Required: ✅ Yes
   - Min: (leave empty)
   - Max: (leave empty)

4. **Attribute 4:**
   - Type: Double
   - Key: `mtdSales`
   - Required: ✅ Yes

**Create Index (Optional but recommended):**
1. Click **"Indexes"** tab
2. Click **"Create index"**
3. Fill in:
   - Key: `storeId_kpiId`
   - Type: **Unique**
   - Attributes: 
     - Add `storeId` (Order: ASC)
     - Add `kpiId` (Order: ASC)
4. Click **"Create"**

**Set Permissions:**
1. Add role **"Any"** with all permissions

**Copy Collection ID** - save it as `APPWRITE_COLLECTION_SALES_ID`

---

#### Collection 4: **reports**

**Create Collection:**
1. Click **"Create collection"**
2. Collection ID: `reports`
3. Collection Name: `reports`
4. Click **"Create"**

**Add Attributes:**

1. **Attribute 1:**
   - Type: String
   - Key: `name`
   - Size: `255`
   - Required: ✅ Yes

2. **Attribute 2:**
   - Type: String
   - Key: `createdAt`
   - Size: `255`
   - Required: ✅ Yes

3. **Attribute 3:**
   - Type: String
   - Key: `url`
   - Size: `1000`
   - Required: ✅ Yes

4. **Attribute 4:**
   - Type: String (Array)
   - Key: `storeIds`
   - Size: `255`
   - Required: ✅ Yes
   - Array: ✅ Yes
   - Array size: (leave empty or set to 100)

**Set Permissions:**
1. Add role **"Any"** with all permissions

**Copy Collection ID** - save it as `APPWRITE_COLLECTION_REPORTS_ID`

---

#### Collection 5: **snapshots**

**Create Collection:**
1. Click **"Create collection"**
2. Collection ID: `snapshots`
3. Collection Name: `snapshots`
4. Click **"Create"**

**Add Attributes:**

1. **Attribute 1:**
   - Type: String
   - Key: `timestamp`
   - Size: `255`
   - Required: ✅ Yes

2. **Attribute 2:**
   - Type: String
   - Key: `data`
   - Size: `100000`
   - Required: ✅ Yes

**Set Permissions:**
1. Add role **"Any"** with all permissions

**Copy Collection ID** - save it as `APPWRITE_COLLECTION_SNAPSHOTS_ID`

---

### Step 5: Configure Environment Variables

Now that you have all your IDs, create your `.env.local` file:

```bash
# Copy the example file
cp .env.example .env.local
```

Edit `.env.local` and fill in your values:

```env
# Appwrite Configuration
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=<YOUR_PROJECT_ID>
APPWRITE_API_KEY=<YOUR_API_KEY>

NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=<YOUR_PROJECT_ID>

# Database and Collection IDs
APPWRITE_DATABASE_ID=<YOUR_DATABASE_ID>
APPWRITE_COLLECTION_STORES_ID=<YOUR_STORES_COLLECTION_ID>
APPWRITE_COLLECTION_KPIS_ID=<YOUR_KPIS_COLLECTION_ID>
APPWRITE_COLLECTION_SALES_ID=<YOUR_SALES_DATA_COLLECTION_ID>
APPWRITE_COLLECTION_REPORTS_ID=<YOUR_REPORTS_COLLECTION_ID>
APPWRITE_COLLECTION_SNAPSHOTS_ID=<YOUR_SNAPSHOTS_COLLECTION_ID>

NEXT_PUBLIC_APPWRITE_DATABASE_ID=<YOUR_DATABASE_ID>
NEXT_PUBLIC_APPWRITE_COLLECTION_STORES_ID=<YOUR_STORES_COLLECTION_ID>
NEXT_PUBLIC_APPWRITE_COLLECTION_KPIS_ID=<YOUR_KPIS_COLLECTION_ID>
NEXT_PUBLIC_APPWRITE_COLLECTION_SALES_ID=<YOUR_SALES_DATA_COLLECTION_ID>
NEXT_PUBLIC_APPWRITE_COLLECTION_REPORTS_ID=<YOUR_REPORTS_COLLECTION_ID>
NEXT_PUBLIC_APPWRITE_COLLECTION_SNAPSHOTS_ID=<YOUR_SNAPSHOTS_COLLECTION_ID>

# Vercel Blob (optional, for PDF storage)
BLOB_READ_WRITE_TOKEN=<YOUR_VERCEL_BLOB_TOKEN>
```

### Step 6: Test Your Setup

Run the development server:

```bash
npm run dev
```

Visit `http://localhost:3000` and try:
1. Adding a store
2. Adding a KPI
3. Entering some sales data

If everything works, congratulations! Your database is set up correctly! 🎉

## Troubleshooting

### Can't create attributes
- Make sure you're on the "Attributes" tab
- Wait for previous attributes to finish creating before adding new ones

### Permission denied errors
- Double-check that "Any" role has Create, Read, Update, and Delete permissions
- In production, you'll want to add proper authentication and user-specific permissions

### API key errors
- Regenerate your API key if you lost it
- Make sure it has `databases.read` and `databases.write` scopes

### Environment variables not working
- Restart your dev server after changing `.env.local`
- Make sure there are no quotes around your values
- Check for typos in variable names

## Security Notes

⚠️ **Important**: The current setup uses "Any" role permissions, which means anyone can access your data. This is fine for development and personal use, but for production:

1. Implement Appwrite Authentication
2. Change permissions to user-specific roles
3. Add API rate limiting
4. Consider using sessions instead of API keys for client access

## Next Steps

Once your database is set up:
1. ✅ Start adding stores and KPIs
2. ✅ Import existing data via CSV
3. ✅ Generate your first report
4. ✅ Customize your dashboard view

Happy tracking! 📊
