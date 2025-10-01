#!/usr/bin/env node

import { Client, Databases } from 'node-appwrite';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject('68dd4ee79b68d5f85be7')
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function listDatabases() {
  try {
    const result = await databases.list();
    console.log('📦 Existing databases:\n');
    if (result.databases.length === 0) {
      console.log('No databases found');
    } else {
      result.databases.forEach(db => {
        console.log(`  • ${db.name} (ID: ${db.$id})`);
      });
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

listDatabases();
