#!/usr/bin/env node

// Script to clear Next.js cache for a fresh start when troubleshooting Supabase issues
console.log('🧹 Cleaning up Next.js cache and temporary files...');

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Clear Next.js cache directories
const cacheDirs = [
  '.next',
  '.vercel',
  'node_modules/.cache'
];

cacheDirs.forEach(dir => {
  const fullPath = path.join(process.cwd(), dir);
  if (fs.existsSync(fullPath)) {
    console.log(`Clearing ${dir}...`);
    try {
      // For Windows compatibility, use rimraf pattern
      execSync(`npx rimraf ${dir}`);
    } catch (error) {
      console.error(`Error clearing ${dir}: ${error.message}`);
    }
  }
});

console.log('\n🔍 Supabase Connection Troubleshooting Tips:');
console.log('-------------------------------------------');
console.log('1. Verify your .env.local file has these variables set:');
console.log('   - NEXT_PUBLIC_SUPABASE_URL');
console.log('   - NEXT_PUBLIC_SUPABASE_ANON_KEY');
console.log('   - SUPABASE_SERVICE_ROLE_KEY');
console.log('2. Run "npm run check-supabase" to test your Supabase connection');
console.log('3. Check the Supabase Project Dashboard to confirm tables exist');
console.log('4. Ensure your database has the proper migrations applied');
console.log('5. In browser developer tools, clear localStorage to reset client state');
console.log('-------------------------------------------\n');

console.log('✅ Cleanup complete. Starting dev server with fresh cache...\n'); 