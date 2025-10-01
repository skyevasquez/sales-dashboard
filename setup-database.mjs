#!/usr/bin/env node

import { Client, Databases, Permission, Role } from 'node-appwrite';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

if (!process.env.APPWRITE_API_KEY) {
  console.error('❌ APPWRITE_API_KEY is not set in .env.local');
  process.exit(1);
}

const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject('68dd4ee79b68d5f85be7')
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

const DATABASE_ID = 'sales-dashboard-db';

async function setupDatabase() {
  try {
    console.log('🚀 Setting up Appwrite collections...\n');

    // Database already exists, skip creation
    console.log('📦 Using existing database: SalesDashboard\n');

    // Step 2: Create stores collection
    console.log('📋 Creating stores collection...');
    try {
      await databases.createCollection(
        DATABASE_ID,
        'stores',
        'stores',
        [
          Permission.read(Role.any()),
          Permission.create(Role.any()),
          Permission.update(Role.any()),
          Permission.delete(Role.any()),
        ]
      );
      
      await databases.createStringAttribute(
        DATABASE_ID,
        'stores',
        'name',
        255,
        true
      );
      console.log('✓ Stores collection created\n');
    } catch (error) {
      if (error.code === 409) {
        console.log('ℹ Stores collection already exists\n');
      } else {
        throw error;
      }
    }

    // Step 3: Create KPIs collection
    console.log('📋 Creating kpis collection...');
    try {
      await databases.createCollection(
        DATABASE_ID,
        'kpis',
        'kpis',
        [
          Permission.read(Role.any()),
          Permission.create(Role.any()),
          Permission.update(Role.any()),
          Permission.delete(Role.any()),
        ]
      );
      
      await databases.createStringAttribute(
        DATABASE_ID,
        'kpis',
        'name',
        255,
        true
      );
      console.log('✓ KPIs collection created\n');
    } catch (error) {
      if (error.code === 409) {
        console.log('ℹ KPIs collection already exists\n');
      } else {
        throw error;
      }
    }

    // Step 4: Create sales_data collection
    console.log('📋 Creating sales_data collection...');
    try {
      await databases.createCollection(
        DATABASE_ID,
        'sales_data',
        'sales_data',
        [
          Permission.read(Role.any()),
          Permission.create(Role.any()),
          Permission.update(Role.any()),
          Permission.delete(Role.any()),
        ]
      );
      
      await databases.createStringAttribute(DATABASE_ID, 'sales_data', 'storeId', 255, true);
      await databases.createStringAttribute(DATABASE_ID, 'sales_data', 'kpiId', 255, true);
      await databases.createFloatAttribute(DATABASE_ID, 'sales_data', 'monthlyGoal', true);
      await databases.createFloatAttribute(DATABASE_ID, 'sales_data', 'mtdSales', true);
      
      // Wait for attributes to be created before creating index
      console.log('  Waiting for attributes to be ready...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      await databases.createIndex(
        DATABASE_ID,
        'sales_data',
        'storeId_kpiId',
        'unique',
        ['storeId', 'kpiId']
      );
      console.log('✓ Sales data collection created with unique index\n');
    } catch (error) {
      if (error.code === 409) {
        console.log('ℹ Sales data collection already exists\n');
      } else {
        throw error;
      }
    }

    // Step 5: Create reports collection
    console.log('📋 Creating reports collection...');
    try {
      await databases.createCollection(
        DATABASE_ID,
        'reports',
        'reports',
        [
          Permission.read(Role.any()),
          Permission.create(Role.any()),
          Permission.update(Role.any()),
          Permission.delete(Role.any()),
        ]
      );
      
      await databases.createStringAttribute(DATABASE_ID, 'reports', 'name', 255, true);
      await databases.createStringAttribute(DATABASE_ID, 'reports', 'createdAt', 255, true);
      await databases.createStringAttribute(DATABASE_ID, 'reports', 'url', 1000, true);
      await databases.createStringAttribute(DATABASE_ID, 'reports', 'storeIds', 255, true, undefined, true);
      console.log('✓ Reports collection created\n');
    } catch (error) {
      if (error.code === 409) {
        console.log('ℹ Reports collection already exists\n');
      } else {
        throw error;
      }
    }

    // Step 6: Create snapshots collection
    console.log('📋 Creating snapshots collection...');
    try {
      await databases.createCollection(
        DATABASE_ID,
        'snapshots',
        'snapshots',
        [
          Permission.read(Role.any()),
          Permission.create(Role.any()),
          Permission.update(Role.any()),
          Permission.delete(Role.any()),
        ]
      );
      
      await databases.createStringAttribute(DATABASE_ID, 'snapshots', 'timestamp', 255, true);
      await databases.createStringAttribute(DATABASE_ID, 'snapshots', 'data', 100000, true);
      console.log('✓ Snapshots collection created\n');
    } catch (error) {
      if (error.code === 409) {
        console.log('ℹ Snapshots collection already exists\n');
      } else {
        throw error;
      }
    }

    console.log('\n✅ Database setup complete!');
    console.log('\nCollections created:');
    console.log('  • stores');
    console.log('  • kpis');
    console.log('  • sales_data (with unique storeId_kpiId index)');
    console.log('  • reports');
    console.log('  • snapshots');
    console.log('\n🎉 You can now start using your application!');
    
  } catch (error) {
    console.error('\n❌ Error setting up database:', error.message);
    if (error.response) {
      console.error('Response:', error.response);
    }
    process.exit(1);
  }
}

setupDatabase();
