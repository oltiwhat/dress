const { execFileSync } = require('node:child_process');
const path = require('node:path');

if (process.env.VERCEL_ENV !== 'production') {
  console.log('Skipping production database setup outside Vercel Production.');
  process.exit(0);
}

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be configured for the Vercel Production build.');
}

const prismaCli = path.resolve(__dirname, '../node_modules/prisma/build/index.js');
const schemaPath = path.resolve(__dirname, '../prisma/schema.prisma');
const seedPath = path.resolve(__dirname, 'seed-products.js');

execFileSync(process.execPath, [prismaCli, 'db', 'push', '--schema', schemaPath], {
  stdio: 'inherit',
  env: process.env,
});
execFileSync(process.execPath, [seedPath], {
  stdio: 'inherit',
  env: process.env,
});
