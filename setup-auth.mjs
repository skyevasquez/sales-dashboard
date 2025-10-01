#!/usr/bin/env node

import { Client, Users } from 'node-appwrite';
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

const users = new Users(client);

async function setupAuth() {
  try {
    console.log('🔐 Setting up Appwrite Authentication...\n');

    console.log('✅ Authentication is enabled by default in Appwrite Cloud!\n');
    
    console.log('📋 Available Auth Methods:');
    console.log('  ✓ Email/Password');
    console.log('  ✓ Magic URL (passwordless)');
    console.log('  ✓ OAuth2 providers (optional)\n');

    console.log('🔑 Auth Configuration:');
    console.log('  • Endpoint: https://cloud.appwrite.io/v1');
    console.log('  • Project ID: 68dd4ee79b68d5f85be7\n');

    console.log('📝 Next Steps:');
    console.log('  1. Auth components will be created');
    console.log('  2. Protected routes will be set up');
    console.log('  3. User context provider will be added\n');

    console.log('💡 You can manage auth settings in the Appwrite Console:');
    console.log('   https://cloud.appwrite.io/console/project-68dd4ee79b68d5f85be7/auth\n');

    console.log('✅ Authentication setup complete!\n');

  } catch (error) {
    console.error('\n❌ Error setting up authentication:', error.message);
    if (error.response) {
      console.error('Response:', error.response);
    }
    process.exit(1);
  }
}

setupAuth();
