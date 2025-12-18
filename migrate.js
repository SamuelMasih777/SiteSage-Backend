const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigrations() {
  if (!process.env.DATABASE_URL) {
    console.error('✗ DATABASE_URL environment variable is not set');
    console.error('Please set it in your .env file');
    process.exit(1);
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('neon') || process.env.DATABASE_URL.includes('amazonaws')
      ? { rejectUnauthorized: false }
      : false,
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('✓ Connected to database');

    // Migration 1: Users table
    console.log('\n1. Creating users table...');
    const migration1 = fs.readFileSync(
      path.join(__dirname, 'src/db/migrations/001_users_table.sql'),
      'utf8'
    );
    await client.query(migration1);
    console.log('✓ Users table created successfully');

    // Migration 2: Audits schema
    console.log('\n2. Creating audits schema...');
    const migration2 = fs.readFileSync(
      path.join(__dirname, 'src/db/migrations/002_audits_schema.sql'),
      'utf8'
    );
    await client.query(migration2);
    console.log('✓ Audits schema created successfully');

    console.log('\n✓ All migrations completed successfully!');
    console.log('\nYou can now start the server with: npm run dev');
  } catch (error) {
    console.error('\n✗ Migration failed:');
    console.error('Error:', error.message);
    if (error.code) {
      console.error('Code:', error.code);
    }
    if (error.detail) {
      console.error('Detail:', error.detail);
    }
    console.error('\nFull error:');
    console.error(error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrations();
